/**
 * PDF UPLOAD SCRIPT
 * 
 * This script ingests PDF documents into The Hippocampus (Adeline's private library).
 * 
 * USAGE:
 *   node scripts/upload-pdf.mjs <path-to-pdf> <document-title>
 * 
 * EXAMPLES:
 *   node scripts/upload-pdf.mjs ./flexner-report.pdf "The Flexner Report"
 *   node scripts/upload-pdf.mjs ./underground-education.pdf "Underground History of American Education"
 * 
 * REQUIREMENTS:
 *   npm install pdf-parse
 * 
 * NOTE: This uses Google embeddings (768 dims) to match your current setup.
 */

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize clients
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Configuration
const CHUNK_SIZE = 1000;      // Characters per chunk
const CHUNK_OVERLAP = 200;     // Overlap between chunks
const BATCH_SIZE = 10;         // Process N chunks at a time

/**
 * Split text into overlapping chunks
 */
function splitIntoChunks(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    let start = 0;
    
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end);
        
        if (chunk.trim().length > 0) {
            chunks.push(chunk.trim());
        }
        
        start += chunkSize - overlap;
    }
    
    return chunks;
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
    try {
        const result = await embedModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Embedding error:', error);
        return null;
    }
}

/**
 * Main upload function
 */
async function uploadPDF() {
    // Parse arguments
    const filePath = process.argv[2];
    const title = process.argv[3];

    if (!filePath || !title) {
        console.log('\n❌ Usage: node scripts/upload-pdf.mjs <path-to-pdf> <document-title>');
        console.log('\nExample:');
        console.log('  node scripts/upload-pdf.mjs ./flexner-report.pdf "The Flexner Report"\n');
        process.exit(1);
    }

    if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.log('\n❌ Missing environment variables!');
        console.log('Required: GOOGLE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY\n');
        process.exit(1);
    }

    console.log('\n📖 Reading PDF: ' + title);
    console.log('📁 File: ' + filePath + '\n');

    // Read PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    console.log(`📄 Extracted ${text.length} characters from ${pdfData.numpages} pages`);

    // Split into chunks
    const chunks = splitIntoChunks(text);
    console.log(`✂️  Split into ${chunks.length} chunks\n`);

    // Process in batches
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        console.log(`Processing chunks ${i + 1}-${Math.min(i + BATCH_SIZE, chunks.length)} of ${chunks.length}...`);

        // Process batch
        const promises = batch.map(async (chunk, batchIndex) => {
            const chunkNumber = i + batchIndex + 1;
            
            try {
                // Generate embedding
                const embedding = await generateEmbedding(chunk);
                
                if (!embedding) {
                    console.log(`  ⚠️  Chunk ${chunkNumber}: Embedding failed, skipping`);
                    return false;
                }

                // Save to Supabase
                const { error } = await supabase.from('library').insert({
                    content: chunk,
                    metadata: {
                        title: title,
                        chunk: chunkNumber,
                        total_chunks: chunks.length,
                        source: path.basename(filePath)
                    },
                    embedding: embedding
                });

                if (error) {
                    console.log(`  ❌ Chunk ${chunkNumber}: Save failed -`, error.message);
                    return false;
                }

                return true;

            } catch (error) {
                console.log(`  ❌ Chunk ${chunkNumber}: Processing failed -`, error.message);
                return false;
            }
        });

        // Wait for batch to complete
        const results = await Promise.all(promises);
        successCount += results.filter(r => r === true).length;
        errorCount += results.filter(r => r === false).length;

        // Rate limiting pause
        if (i + BATCH_SIZE < chunks.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n✅ Upload Complete!');
    console.log(`   Success: ${successCount} chunks`);
    console.log(`   Failed:  ${errorCount} chunks`);
    console.log(`\n📚 "${title}" is now in The Hippocampus!\n`);
}

// Run it
uploadPDF().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
