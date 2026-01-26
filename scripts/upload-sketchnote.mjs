#!/usr/bin/env node
/**
 * SKETCHNOTE UPLOAD SCRIPT
 * 
 * Upload PDF or image sketchnotes to Supabase Storage and catalog them.
 * 
 * USAGE:
 *   node scripts/upload-sketchnote.mjs <file-path> "<title>" [options]
 * 
 * OPTIONS:
 *   --topic <topic>       Learning topic (e.g., "fractions", "photosynthesis")
 *   --subject <subject>   Subject area (e.g., "math", "science")
 *   --grades <grades>     Comma-separated grade levels (e.g., "K,1,2" or "6,7,8")
 *   --description <desc>  Optional description
 *   --lesson <file>       Path to a .txt or .md file with the lesson presentation
 * 
 * EXAMPLES:
 *   node scripts/upload-sketchnote.mjs ./fractions.jpg "Fractions Fun" --topic fractions --subject math --grades K,1,2
 *   node scripts/upload-sketchnote.mjs ./photosynthesis.pdf "How Plants Make Food" --topic photosynthesis --subject science
 * 
 * SETUP:
 *   1. Create a 'sketchnotes' bucket in Supabase Storage (public: yes)
 *   2. Run the 46_sketchnotes.sql migration
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('\n❌ Missing environment variables!');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY\n');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const result = {
        filePath: null,
        title: null,
        topic: null,
        subject: null,
        grades: null,
        description: null,
        lesson: null
    };

    let i = 0;
    while (i < args.length) {
        const arg = args[i];

        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = args[i + 1];

            if (key === 'topic') result.topic = value;
            else if (key === 'subject') result.subject = value;
            else if (key === 'grades') result.grades = value?.split(',').map(g => g.trim());
            else if (key === 'description') result.description = value;
            else if (key === 'lesson') result.lesson = value;

            i += 2;
        } else if (!result.filePath) {
            result.filePath = arg;
            i++;
        } else if (!result.title) {
            result.title = arg;
            i++;
        } else {
            i++;
        }
    }

    return result;
}

// Get MIME type from file extension
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

async function uploadSketchnote() {
    const args = parseArgs();

    if (!args.filePath || !args.title) {
        console.log('\n❌ Usage: node scripts/upload-sketchnote.mjs <file-path> "<title>" [options]');
        console.log('\nOptions:');
        console.log('  --topic <topic>       Learning topic (e.g., "fractions")');
        console.log('  --subject <subject>   Subject area (e.g., "math")');
        console.log('  --grades <grades>     Comma-separated grades (e.g., "K,1,2")');
        console.log('  --description <desc>  Optional description');
        console.log('  --lesson <file>       Path to lesson text file (.txt or .md)');
        console.log('\nExample:');
        console.log('  node scripts/upload-sketchnote.mjs ./fractions.jpg "Fractions Fun" --topic fractions --subject math --grades K,1,2 --lesson ./fractions-lesson.txt\n');
        process.exit(1);
    }

    // Check file exists
    if (!fs.existsSync(args.filePath)) {
        console.error(`\n❌ File not found: ${args.filePath}\n`);
        process.exit(1);
    }

    const fileName = path.basename(args.filePath);
    const mimeType = getMimeType(args.filePath);
    const timestamp = Date.now();
    const storagePath = `${timestamp}-${fileName}`;

    console.log('\n📋 Uploading Sketchnote');
    console.log('========================');
    console.log(`Title:   ${args.title}`);
    console.log(`File:    ${fileName}`);
    console.log(`Type:    ${mimeType}`);
    if (args.topic) console.log(`Topic:   ${args.topic}`);
    if (args.subject) console.log(`Subject: ${args.subject}`);
    if (args.grades) console.log(`Grades:  ${args.grades.join(', ')}`);
    if (args.lesson) console.log(`Lesson:  ${args.lesson}`);
    console.log('');

    // Read lesson content if provided
    let presentationContent = null;
    if (args.lesson) {
        if (!fs.existsSync(args.lesson)) {
            console.error(`❌ Lesson file not found: ${args.lesson}\n`);
            process.exit(1);
        }
        presentationContent = fs.readFileSync(args.lesson, 'utf-8');
        console.log(`📖 Loaded lesson (${presentationContent.length} chars)`);
    }

    // Read file
    const fileBuffer = fs.readFileSync(args.filePath);

    // Upload to Supabase Storage
    console.log('📤 Uploading to storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sketchnotes')
        .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: false
        });

    if (uploadError) {
        console.error('❌ Upload failed:', uploadError.message);
        if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
            console.log('\n💡 Did you create the "sketchnotes" bucket in Supabase Storage?');
            console.log('   Go to: Supabase Dashboard → Storage → New bucket → Name: "sketchnotes" (public: yes)\n');
        }
        process.exit(1);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('sketchnotes')
        .getPublicUrl(storagePath);

    const fileUrl = urlData.publicUrl;
    console.log('✅ Uploaded to storage');

    // Insert into database
    console.log('📝 Adding to catalog...');
    const { data: sketchnote, error: dbError } = await supabase
        .from('sketchnotes')
        .insert({
            title: args.title,
            topic: args.topic,
            subject: args.subject,
            grade_levels: args.grades,
            description: args.description,
            presentation_content: presentationContent,
            file_url: fileUrl,
            file_name: fileName
        })
        .select()
        .single();

    if (dbError) {
        console.error('❌ Database insert failed:', dbError.message);
        if (dbError.message.includes('does not exist')) {
            console.log('\n💡 Did you run the migration?');
            console.log('   Run: node scripts/run-migrations-fixed.mjs\n');
        }
        process.exit(1);
    }

    console.log('✅ Added to catalog');
    console.log('\n🎉 Success!');
    console.log('========================');
    console.log(`ID:  ${sketchnote.id}`);
    console.log(`URL: ${fileUrl}`);
    console.log('\nAdeline can now share this sketchnote with students!\n');
}

uploadSketchnote().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
