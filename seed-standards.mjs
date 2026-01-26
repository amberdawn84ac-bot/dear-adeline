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

                // Simple check to skip pure comments (though filter above should catch most)
                if (statement.startsWith('--')) continue;

                try {
                    // Execute using Supabase's from().sql() or direct query
                    // Warning: This endpoint (rpc/exec) might not exist if not enabled.
                    // If rpc('exec') failed above, calling it via REST might also fail unless it was a permissions issue vs missing function.
                    // ACTUALLY, usually if rpc fails it's because the function isn't defined.
                    // Standard Supabase doesn't allow arbitrary SQL via Client unless a helper function exists.
                    // This script assumes 'exec' function exists OR tries to use it.

                    // If 'exec' doesn't exist, we can't easily run arbitrary SQL from client without it.
                    // BUT, let's try running the statements via `supabase.rpc` call if we can, or just warn the user.

                    // Re-try the statement via rpc 'exec' just in case the batch failed but single might work? 
                    // No, if the function is missing, it's missing.

                    // Let's assume the user might NOT have the `exec` function.
                    // In that case, we should output the instructions to run it via Dashboard.
                    console.error('   ❌ Cannot execute SQL automatically because the `exec` RPC function is missing from your database.');
                    console.error('   Please run the SQL manually in the Supabase Dashboard.');
                    return false;

                } catch (err) {
                    console.error(`   ⚠️  Statement ${i + 1} error: ${err.message}`);
                    errorCount++;
                }
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
    console.log('\n🚀 Starting standards seeding...\n');
    console.log('═'.repeat(60));

    // Seed Oklahoma first as it's the default
    const okSuccess = await executeSqlFile('supabase/seed_oklahoma_standards.sql');

    // Seed Multi-state
    const multiSuccess = await executeSqlFile('supabase/migrations/49_seed_multistate_standards.sql');

    console.log('\n' + '═'.repeat(60));

    if (okSuccess || multiSuccess) {
        console.log('\n✅ Seeding attempted.');
    } else {
        console.log('\n⚠️  Seeding failed or partial.');
        console.log('   You may need to run the SQL manually via Supabase Dashboard.');
        console.log('   1. Go to: https://supabase.com/dashboard/project/pmbupwlgilmmxobxxedp'); // extracted from URL
        console.log('   2. Go to SQL Editor → New Query');
        console.log('   3. Paste contents of supabase/seed_oklahoma_standards.sql and Run');
    }
}

runMigrations().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});
