-- Personalized Lessons Schema
-- Stores AI-generated lessons tailored to student interests

CREATE TABLE IF NOT EXISTS personalized_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Lesson Content
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT, -- e.g., "Science", "History", "Math"
  difficulty_level TEXT, -- e.g., "Beginner", "Intermediate", "Advanced"
  
  -- Structured Content
  content JSONB NOT NULL, -- The full JSON content of the lesson (steps, materials, etc.)
  
  -- Metadata
  generated_from_interests JSONB DEFAULT '[]'::jsonb, -- Which interests triggered this
  status TEXT DEFAULT 'draft', -- 'draft', 'in_progress', 'completed'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_personalized_lessons_student ON personalized_lessons(student_id);

-- Enable RLS
ALTER TABLE personalized_lessons ENABLE ROW LEVEL SECURITY;

-- Policies

-- Students can view their own lessons
CREATE POLICY "Students can view own lessons"
  ON personalized_lessons FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert/create their own lessons (e.g. saving a generated one)
CREATE POLICY "Students can insert own lessons"
  ON personalized_lessons FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own lessons (e.g. marking as complete)
CREATE POLICY "Students can update own lessons"
  ON personalized_lessons FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can view their students' lessons
CREATE POLICY "Teachers can view student lessons"
  ON personalized_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_personalized_lessons_updated_at_trigger ON personalized_lessons;

CREATE TRIGGER update_personalized_lessons_updated_at_trigger
  BEFORE UPDATE ON personalized_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_student_interests_updated_at(); -- Reusing the function if compatible, or creating new one

-- Comments
COMMENT ON TABLE personalized_lessons IS 'Stores AI-generated personalized lessons';
