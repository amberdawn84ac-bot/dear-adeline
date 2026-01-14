import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
    console.error('SERVICE_KEY:', SERVICE_KEY ? '✅' : '❌');
    process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📡 Supabase URL:', SUPABASE_URL);

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});


async function runMigrations() {
    const migrations = [
        'supabase/migrations/20260111_spaced_repetition_system.sql',
        'supabase/migrations/20260111_adaptive_difficulty_engine.sql'
    ];

    console.log('\n🚀 Starting migrations...\n');

    for (const migrationPath of migrations) {
        console.log(`📄 Running: ${migrationPath}`);

        const fullPath = path.resolve(__dirname, '..', migrationPath);

        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`);
            continue;
        }

        const sql = fs.readFileSync(fullPath, 'utf8');

        try {
            // Split SQL into individual statements (basic approach)
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            console.log(`   Found ${statements.length} SQL statements`);

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement.length === 0) continue;

                try {
                    // Execute each statement using Supabase's query method
                    // Note: This requires proper setup in Supabase
                    const { error } = await supabase.rpc('exec_sql', {
                        query: statement + ';'
                    });

                    if (error) {
                        console.error(`   ⚠️ Statement ${i + 1} failed:`, error.message);
                        // Continue with other statements
                    }
                } catch (stmtError) {
                    console.error(`   ⚠️ Statement ${i + 1} error:`, stmtError.message);
                }
            }

            console.log(`✅ Completed: ${migrationPath}\n`);
        } catch (error) {
            console.error(`❌ Failed: ${migrationPath}`);
            console.error(`   Error: ${error.message}\n`);
        }
    }

    console.log('🎉 Migration run complete!');
    console.log('\n⚠️  Note: If you see errors above, you may need to run migrations via Supabase Dashboard SQL Editor.');
}

runMigrations().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
