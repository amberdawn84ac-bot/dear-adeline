-- Enhance opportunities table with scope, age_group, and category columns

ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'national' CHECK (scope IN ('local', 'national', 'international')),
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'all';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_scope ON opportunities(scope);
CREATE INDEX IF NOT EXISTS idx_opportunities_age_group ON opportunities(age_group);

-- Add comments
COMMENT ON COLUMN opportunities.scope IS 'Geographic scope: local, national, or international';
COMMENT ON COLUMN opportunities.age_group IS 'Target age group: elementary, middle, high, college, or all';
COMMENT ON COLUMN opportunities.category IS 'Subject category: art, writing, science, history, etc.';
