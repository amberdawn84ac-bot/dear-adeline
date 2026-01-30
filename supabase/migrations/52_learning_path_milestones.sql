-- Update student_learning_paths to store milestones instead of flat standards
ALTER TABLE student_learning_paths
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS design_reasoning TEXT,
ADD COLUMN IF NOT EXISTS current_milestone_id TEXT;

-- Migrate old pathData to milestones (if any exist)
-- This is a one-way migration - old format won't work after this

-- Add index for faster milestone queries
CREATE INDEX IF NOT EXISTS idx_learning_paths_student_status
ON student_learning_paths(student_id, status);

-- Add index for JSONB milestone queries
CREATE INDEX IF NOT EXISTS idx_learning_paths_milestones
ON student_learning_paths USING gin(milestones);
