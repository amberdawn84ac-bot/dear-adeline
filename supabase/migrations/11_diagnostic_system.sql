-- Diagnostic System
-- Stores diagnostic assessments and results for tracking student progress

CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Assessment Data
  questions_answered JSONB NOT NULL,
  subject_assessments JSONB NOT NULL,
  two_week_plan TEXT NOT NULL,
  
  -- Metadata
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_student ON diagnostic_results(student_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_completed ON diagnostic_results(completed_at);

-- Enable RLS
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own diagnostics" ON diagnostic_results;
DROP POLICY IF EXISTS "Students can create own diagnostics" ON diagnostic_results;
DROP POLICY IF EXISTS "Teachers can view student diagnostics" ON diagnostic_results;

-- Students can view their own diagnostics
CREATE POLICY "Students can view own diagnostics"
  ON diagnostic_results FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create their own diagnostics
CREATE POLICY "Students can create own diagnostics"
  ON diagnostic_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Teachers can view diagnostics of their students
CREATE POLICY "Teachers can view student diagnostics"
  ON diagnostic_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );
