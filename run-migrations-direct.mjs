#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_KEY ? '✅' : '❌');
    process.exit(1);
}

console.log('✅ Environment loaded');
console.log('📡 Supabase URL:', SUPABASE_URL);

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    db: {
        schema: 'public'
    }
});

async function executeSqlFile(filePath) {
    console.log(`\n📄 Reading: ${filePath}`);

    const fullPath = path.resolve(__dirname, filePath);
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ File not found: ${fullPath}`);
        return false;
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log(`   File size: ${sql.length} characters`);

    // Use Supabase REST API to execute raw SQL via pg_dump
    try {
        // Execute the SQL using the Postgres REST API
        const { error } = await supabase.rpc('exec', {
            sql: sql
        });

        if (error) {
            // The exec function might not exist, try alternative approach
            console.log('   ℹ️  exec() RPC not available, using direct SQL execution...');

            // Split and execute statements individually
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            console.log(`   Found ${statements.length} SQL statements to execute`);

            let successCount = 0;
            let errorCount = 0;

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (!statement || statement.length === 0) continue;

                try {
                    // Execute using Supabase's from().sql() or direct query
                    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SERVICE_KEY,
                            'Authorization': `Bearer ${SERVICE_KEY}`,
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ query: statement + ';' })
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        const errorText = await response.text();
                        console.error(`   ⚠️  Statement ${i + 1} failed: ${errorText}`);
                        errorCount++;
                    }
                } catch (err) {
                    console.error(`   ⚠️  Statement ${i + 1} error: ${err.message}`);
                    errorCount++;
                }
            }

            console.log(`   ✅ Success: ${successCount} statements`);
            if (errorCount > 0) {
                console.log(`   ⚠️  Errors: ${errorCount} statements`);
            }

            return errorCount === 0;
        }

        console.log('✅ Success!');
        return true;

    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function runMigrations() {
    console.log('\n🚀 Starting database migrations...\n');
    console.log('═'.repeat(60));

    const migrationFile = 'supabase/migrations/20260111_complete_migration.sql';

    const success = await executeSqlFile(migrationFile);

    console.log('\n' + '═'.repeat(60));

    if (success) {
        console.log('\n✅ Migration completed successfully!');
        console.log('\n📊 Verify tables in Supabase Dashboard:');
        console.log('   - flashcards');
        console.log('   - card_reviews');
        console.log('   - review_history');
        console.log('   - difficulty_history');
        console.log('   - student_difficulty_profiles');
        console.log('   - performance_sessions');
    } else {
        console.log('\n⚠️  Migration completed with errors.');
        console.log('   You may need to run the SQL manually via Supabase Dashboard.');
        console.log('   Go to: SQL Editor → New Query → Paste SQL → Run');
    }
}

runMigrations().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
