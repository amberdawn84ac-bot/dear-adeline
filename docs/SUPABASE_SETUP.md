# Supabase Database Setup

## Linking to Your Supabase Project

To apply the database migrations, you need to link your local project to your Supabase project.

### Step 1: Get Your Project Reference

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **General**
4. Copy your **Project Reference ID** (looks like: `abcdefghijklmnop`)

### Step 2: Link the Project

Run this command with your project ref:

```bash
.\bin\supabase.exe link --project-ref YOUR_PROJECT_REF
```

You'll be prompted for your database password (found in Settings → Database → Connection string).

### Step 3: Push Migrations

Once linked, push all migrations to your database:

```bash
npm run db:push
```

This will apply:
- Migration 28: State standards tracking system
- All previous migrations (if not already applied)

### Alternative: Manual Migration

If you prefer to apply the migration manually:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/28_add_standards_tracking.sql`
4. Paste and run in the SQL Editor

## Verifying the Migration

After applying the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'state_standards',
    'learning_components',
    'skill_standard_mappings',
    'student_standards_progress'
  );
```

You should see all 4 tables listed.

## Local Development

To use the local Supabase instance:

1. Start Docker Desktop
2. Start local Supabase:
   ```bash
   npm run db:start
   ```

3. Check status:
   ```bash
   npm run db:status
   ```

4. Apply migrations locally:
   ```bash
   npm run db:reset
   ```

## Troubleshooting

### "Cannot find project ref"
- You need to run `.\bin\supabase.exe link` first
- Make sure you have the correct project ref from your dashboard

### "Docker not running"
- Start Docker Desktop
- Wait for it to fully start
- Try the command again

### "Permission denied"
- Make sure your database password is correct
- Check that your IP is whitelisted in Supabase dashboard (Settings → Database → Connection pooling)

## Next Steps

Once the migration is applied:

1. The standards tracking system is ready to use
2. Activity logging will automatically track state standards
3. Students need `state_standards` field set in their profile (e.g., "Oklahoma", "Texas")
4. See `docs/STATE_STANDARDS_TRACKING.md` for full documentation
