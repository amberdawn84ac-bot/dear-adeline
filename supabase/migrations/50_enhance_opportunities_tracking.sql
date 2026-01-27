-- migration: 50_enhance_opportunities_tracking.sql

-- 0. Ensure saved_opportunities exists (Repair missing migration)
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, opportunity_id)
);

-- Re-enable RLS just in case
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- Re-apply policies if missing (using DO block to avoid errors if they exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_opportunities' AND policyname = 'Users can view their own saved opportunities.'
    ) THEN
        CREATE POLICY "Users can view their own saved opportunities." ON public.saved_opportunities FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_opportunities' AND policyname = 'Users can insert their own saved opportunities.'
    ) THEN
        CREATE POLICY "Users can insert their own saved opportunities." ON public.saved_opportunities FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_opportunities' AND policyname = 'Users can delete their own saved opportunities.'
    ) THEN
        CREATE POLICY "Users can delete their own saved opportunities." ON public.saved_opportunities FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- Trigger for updated_at (check if trigger exists first? or DROP IF EXISTS)
DROP TRIGGER IF EXISTS update_saved_opportunities_updated_at ON public.saved_opportunities;
CREATE TRIGGER update_saved_opportunities_updated_at
  BEFORE UPDATE ON public.saved_opportunities
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();


-- 1. Enhance saved_opportunities to be a "Tracker"
ALTER TABLE saved_opportunities
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'in_progress', 'submitted', 'completed', 'won', 'lost')),
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS next_step_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reflection TEXT; /* For post-opportunity reflection */

-- 2. Enhance opportunities with more learning metadata
ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS estimated_time TEXT, /* e.g., "10-20 hours" */
ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[]; /* Array of strings describing what is learned */

-- 3. Add indexes
CREATE INDEX IF NOT EXISTS idx_saved_opportunities_status ON saved_opportunities(status);
