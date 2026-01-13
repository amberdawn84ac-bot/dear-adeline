-- Career Discovery Assessments Migration
-- Stores student responses to career quizzes and activities

-- Career Assessment Responses Table
CREATE TABLE IF NOT EXISTS career_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Interest Categories (multiple choice)
  interest_areas JSONB DEFAULT '[]'::jsonb, -- Array of selected interests

  -- Work Style Preferences
  work_style JSONB DEFAULT '{}'::jsonb, -- Object with preferences

  -- Values Assessment
  core_values JSONB DEFAULT '[]'::jsonb, -- Top 5 values ranked

  -- Strengths & Skills Self-Assessment
  strengths JSONB DEFAULT '[]'::jsonb, -- Self-identified strengths

  -- Dream Scenarios (open-ended)
  dream_day TEXT, -- "Describe your ideal workday"
  dream_impact TEXT, -- "What change do you want to see in the world?"
  dream_legacy TEXT, -- "What do you want to be remembered for?"

  -- Personality Type Indicators
  personality_traits JSONB DEFAULT '{}'::jsonb,

  -- Completion tracking
  completed_sections JSONB DEFAULT '[]'::jsonb, -- Which sections are done
  is_complete BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id)
);

-- Enable RLS
ALTER TABLE career_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own career assessments"
  ON career_assessments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own career assessments"
  ON career_assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own career assessments"
  ON career_assessments FOR UPDATE
  USING (auth.uid() = student_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_career_assessments_student ON career_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_career_assessments_complete ON career_assessments(is_complete);

-- Updated_at trigger
CREATE TRIGGER career_assessments_updated_at
  BEFORE UPDATE ON career_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE career_assessments IS 'Stores student responses to career discovery quizzes and activities';
COMMENT ON COLUMN career_assessments.interest_areas IS 'Array of interest categories student selected';
COMMENT ON COLUMN career_assessments.work_style IS 'Work environment and style preferences';
COMMENT ON COLUMN career_assessments.core_values IS 'Student top 5 core values ranked by importance';
COMMENT ON COLUMN career_assessments.completed_sections IS 'Array of completed assessment section names';
