-- Student Interests and Preferences Schema
-- Stores information gathered through conversational diagnostic

CREATE TABLE IF NOT EXISTS student_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic Interests
  interests JSONB DEFAULT '[]'::jsonb, -- Array of interest strings: ["robotics", "gardening", "art"]
  hobbies JSONB DEFAULT '[]'::jsonb, -- Array of hobby strings
  favorite_subjects JSONB DEFAULT '[]'::jsonb,
  
  -- Learning Preferences
  learning_style TEXT, -- 'hands-on', 'visual', 'reading', 'mixed'
  preferred_modalities JSONB DEFAULT '[]'::jsonb, -- ["builder", "artist", "scholar", "orator"]
  
  -- Conversational Diagnostic Observations
  writing_level TEXT, -- Observed writing quality
  communication_style TEXT, -- How they express themselves
  maturity_indicators JSONB DEFAULT '{}'::jsonb, -- Various maturity observations
  
  -- Strengths and Growth Areas
  observed_strengths JSONB DEFAULT '[]'::jsonb,
  growth_areas JSONB DEFAULT '[]'::jsonb,
  
  -- Estimated Levels
  estimated_grade_level INTEGER,
  confidence_level TEXT, -- 'high', 'medium', 'low'
  
  -- Recent Projects/Creations
  recent_projects JSONB DEFAULT '[]'::jsonb, -- Things they've made/built
  
  -- Favorites
  favorite_books JSONB DEFAULT '[]'::jsonb,
  favorite_shows JSONB DEFAULT '[]'::jsonb,
  favorite_activities JSONB DEFAULT '[]'::jsonb,
  
  -- Goals and Aspirations
  learning_goals JSONB DEFAULT '[]'::jsonb,
  dream_projects JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  diagnostic_completed BOOLEAN DEFAULT FALSE,
  diagnostic_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_student_interests_student ON student_interests(student_id);

-- Enable RLS
ALTER TABLE student_interests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own interests" ON student_interests;
DROP POLICY IF EXISTS "Students can update own interests" ON student_interests;
DROP POLICY IF EXISTS "Students can insert own interests" ON student_interests;
DROP POLICY IF EXISTS "Teachers can view student interests" ON student_interests;
DROP POLICY IF EXISTS "Parents can view child interests" ON student_interests;

-- Students can view their own interests
CREATE POLICY "Students can view own interests"
  ON student_interests FOR SELECT
  USING (auth.uid() = student_id);

-- Students can update their own interests
CREATE POLICY "Students can update own interests"
  ON student_interests FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Students can insert their own interests
CREATE POLICY "Students can insert own interests"
  ON student_interests FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Teachers can view all student interests
CREATE POLICY "Teachers can view student interests"
  ON student_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Parents can view their children's interests (if we add parent role later)
CREATE POLICY "Parents can view child interests"
  ON student_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'parent'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_interests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_interests_updated_at_trigger ON student_interests;

CREATE TRIGGER update_student_interests_updated_at_trigger
  BEFORE UPDATE ON student_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_student_interests_updated_at();

-- Add helpful comments
COMMENT ON TABLE student_interests IS 'Stores student interests, preferences, and conversational diagnostic observations';
COMMENT ON COLUMN student_interests.interests IS 'Array of general interests discovered through conversation';
COMMENT ON COLUMN student_interests.learning_style IS 'Preferred learning style: hands-on, visual, reading, or mixed';
COMMENT ON COLUMN student_interests.writing_level IS 'Observed writing quality from conversational diagnostic';
COMMENT ON COLUMN student_interests.estimated_grade_level IS 'Estimated academic level based on conversation';
COMMENT ON COLUMN student_interests.diagnostic_completed IS 'Whether initial conversational diagnostic is complete';
