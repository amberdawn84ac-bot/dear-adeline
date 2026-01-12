/**
 * LIBRARY TEST SCRIPT
 * 
 * Tests The Hippocampus (library RAG) functionality:
 * - Database connection
 * - Embedding generation
 * - Semantic search
 * - Library stats
 * 
 * USAGE:
 *   node scripts/test-library.js
 */

const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize clients
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test queries
const TEST_QUERIES = [
    "education reform",
    "medical industry",
    "corporate control",
    "biblical principles"
];

async function runTests() {
    console.log('\n🧪 TESTING THE HIPPOCAMPUS\n');
    console.log('='.repeat(50) + '\n');

    // Test 1: Environment Check
    console.log('📋 Test 1: Environment Variables');
    if (!GOOGLE_API_KEY) {
        console.log('   ❌ GOOGLE_API_KEY missing!');
        process.exit(1);
    }
    if (!SUPABASE_URL) {
        console.log('   ❌ SUPABASE_URL missing!');
        process.exit(1);
    }
    if (!SUPABASE_SERVICE_KEY) {
        console.log('   ❌ SUPABASE_SERVICE_KEY missing!');
        process.exit(1);
    }
    console.log('   ✅ All environment variables present\n');

    // Test 2: Database Connection
    console.log('🔌 Test 2: Database Connection');
    try {
        const { count, error } = await supabase
            .from('library')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        console.log(`   ✅ Connected! Found ${count || 0} chunks in library\n`);

        if (count === 0) {
            console.log('   ⚠️  Library is empty. Upload a document first:');
            console.log('      node scripts/upload-pdf.js ./document.pdf "Document Title"\n');
            return;
        }
    } catch (error) {
        console.log('   ❌ Database connection failed:', error.message);
        process.exit(1);
    }

    // Test 3: Get Library Stats
    console.log('📊 Test 3: Library Statistics');
    try {
        const { data, error } = await supabase
            .from('library')
            .select('content, metadata, created_at');

        if (error) throw error;

        const uniqueTitles = [...new Set(data.map(d => d.metadata?.title || 'Unknown'))];
        const totalChars = data.reduce((sum, d) => sum + (d.content?.length || 0), 0);

        console.log('   📚 Documents:', uniqueTitles.length);
        console.log('   📄 Total Chunks:', data.length);
        console.log('   📝 Total Characters:', totalChars.toLocaleString());
        console.log('   \n   Documents in library:');
        uniqueTitles.forEach(title => {
            const chunks = data.filter(d => d.metadata?.title === title).length;
            console.log(`      - "${title}" (${chunks} chunks)`);
        });
        console.log('');
    } catch (error) {
        console.log('   ❌ Stats failed:', error.message);
    }

    // Test 4: Embedding Generation
    console.log('🧬 Test 4: Embedding Generation');
    try {
        const testText = "This is a test query";
        const result = await embedModel.embedContent(testText);
        const embedding = result.embedding.values;
        
        if (embedding && embedding.length === 768) {
            console.log('   ✅ Embeddings working! (768 dimensions)\n');
        } else {
            console.log('   ❌ Unexpected embedding dimensions:', embedding?.length);
        }
    } catch (error) {
        console.log('   ❌ Embedding generation failed:', error.message);
    }

    // Test 5: Semantic Search
    console.log('🔍 Test 5: Semantic Search');
    for (const query of TEST_QUERIES) {
        console.log(`\n   Query: "${query}"`);
        try {
            // Generate query embedding
            const result = await embedModel.embedContent(query);
            const queryEmbedding = result.embedding.values;

            // Search library
            const { data: matches, error } = await supabase.rpc('match_library', {
                query_embedding: queryEmbedding,
                match_threshold: 0.7,
                match_count: 3
            });

            if (error) throw error;

            if (matches && matches.length > 0) {
                console.log(`   ✅ Found ${matches.length} matches:`);
                matches.forEach((match, idx) => {
                    const title = match.metadata?.title || 'Unknown';
                    const similarity = (match.similarity * 100).toFixed(1);
                    const preview = match.content.substring(0, 80) + '...';
                    console.log(`      ${idx + 1}. [${similarity}%] "${title}"`);
                    console.log(`         ${preview}`);
                });
            } else {
                console.log('   ⚠️  No matches found (threshold too high?)');
            }

        } catch (error) {
            console.log('   ❌ Search failed:', error.message);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Tests Complete!\n');
}

// Run tests
runTests().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
