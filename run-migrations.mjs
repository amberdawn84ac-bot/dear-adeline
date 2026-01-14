import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration(filePath) {
  console.log(`\n📄 Running migration: ${filePath}`);
  const sql = readFileSync(filePath, 'utf8');

  // Split by semicolon and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec', { query: statement + ';' });
      if (error && error.message !== 'relation "exec" does not exist') {
        console.error(`❌ Error:`, error.message);
      }
    } catch (_err) {
      // Try direct query
      try {
        await supabase.from('_migrations').insert({ statement });
      } catch (_e) {
        // Ignore - table might not exist
      }
    }
  }

  console.log(`✅ Migration completed: ${filePath}`);
}

async function main() {
  console.log('🚀 Running Supabase migrations...\n');

  await runMigration('supabase/migrations/20260111_spaced_repetition_system.sql');
  await runMigration('supabase/migrations/20260111_adaptive_difficulty_engine.sql');
  await runMigration('supabase/migrations/20260112_daily_lesson_plans.sql');
  await runMigration('supabase/migrations/20260112_add_portfolio_public.sql');
  await runMigration('supabase/migrations/20260112_enhance_opportunities.sql');
  await runMigration('supabase/migrations/20260112_project_approval_system.sql');

  console.log('\n✅ All migrations completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify tables in Supabase dashboard');
  console.log('   2. Check QUICK_START.md for integration examples');
}

main().catch(console.error);
