-- migration: 50_enhance_opportunities_tracking.sql

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
