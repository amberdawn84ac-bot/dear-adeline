-- Add blueprint persistence to career_assessments table
-- This allows us to save generated blueprints and avoid regenerating on every page load

ALTER TABLE career_assessments
ADD COLUMN IF NOT EXISTS blueprint JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS blueprint_generated_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN career_assessments.blueprint IS 'The AI-generated career blueprint JSON object';
COMMENT ON COLUMN career_assessments.blueprint_generated_at IS 'Timestamp when the blueprint was generated';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_career_assessments_blueprint_generated
ON career_assessments(student_id)
WHERE blueprint IS NOT NULL;
