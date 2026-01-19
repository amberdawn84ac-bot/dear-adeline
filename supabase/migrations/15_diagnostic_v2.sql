-- Diagnostic System v2: Chat-Based Assessment
-- Update schema to support one-question-at-a-time flow

-- Add new columns for session tracking
ALTER TABLE diagnostic_results 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress',
ADD COLUMN IF NOT EXISTS current_track TEXT,
ADD COLUMN IF NOT EXISTS current_question_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();

-- Make some columns nullable for in-progress sessions
ALTER TABLE diagnostic_results 
ALTER COLUMN subject_assessments DROP NOT NULL,
ALTER COLUMN two_week_plan DROP NOT NULL;

-- Add index for in-progress sessions
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_status ON diagnostic_results(student_id, status);

-- Add constraint for status values
ALTER TABLE diagnostic_results 
DROP CONSTRAINT IF EXISTS diagnostic_results_status_check;

ALTER TABLE diagnostic_results 
ADD CONSTRAINT diagnostic_results_status_check 
CHECK (status IN ('in_progress', 'completed', 'abandoned'));

-- Update RLS policies to allow updates for in-progress sessions
DROP POLICY IF EXISTS "Students can update own diagnostics" ON diagnostic_results;

CREATE POLICY "Students can update own diagnostics"
  ON diagnostic_results FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Add comment explaining the new structure
COMMENT ON COLUMN diagnostic_results.questions_answered IS 
'JSONB array of question/answer pairs: [{"track": "creation_science", "question": "...", "options": {...}, "studentAnswer": "A", "correctAnswer": "A", "isCorrect": true, "difficulty": 9, "timestamp": "..."}]';

COMMENT ON COLUMN diagnostic_results.status IS 
'Session status: in_progress, completed, or abandoned';

COMMENT ON COLUMN diagnostic_results.current_track IS 
'Current track being assessed (for resuming sessions)';

COMMENT ON COLUMN diagnostic_results.current_question_index IS 
'Index of current question (for progress tracking)';
