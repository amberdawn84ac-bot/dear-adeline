-- Academic Missions System
-- Enables conversion of conversations into trackable academic projects
-- with Oklahoma standards alignment and 8 Tracks categorization

CREATE TABLE IF NOT EXISTS academic_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- 8 Tracks Categorization
  primary_track TEXT NOT NULL CHECK (primary_track IN (
    'creation_science',
    'health_naturopathy',
    'food_systems',
    'government_economics',
    'justice',
    'discipleship',
    'history',
    'english_literature'
  )),
  secondary_tracks TEXT[] DEFAULT '{}',
  
  -- Oklahoma Standards Alignment
  credit_areas TEXT[] NOT NULL DEFAULT '{}',
  oklahoma_standards TEXT[] DEFAULT '{}',
  estimated_credits DECIMAL(4,2) DEFAULT 0,
  
  -- Learning Structure
  learning_objectives JSONB DEFAULT '[]'::jsonb,
  action_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills_checklist JSONB DEFAULT '[]'::jsonb,
  evidence_prompts JSONB DEFAULT '[]'::jsonb,
  evidence_submissions JSONB DEFAULT '[]'::jsonb,
  
  -- Progress Tracking
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'completed', 'archived')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  conversation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_academic_missions_student ON academic_missions(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_missions_status ON academic_missions(status);
CREATE INDEX IF NOT EXISTS idx_academic_missions_track ON academic_missions(primary_track);

-- Enable RLS
ALTER TABLE academic_missions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view own missions" ON academic_missions;
DROP POLICY IF EXISTS "Students can create own missions" ON academic_missions;
DROP POLICY IF EXISTS "Students can update own missions" ON academic_missions;
DROP POLICY IF EXISTS "Teachers can view student missions" ON academic_missions;

-- Students can view their own missions
CREATE POLICY "Students can view own missions"
  ON academic_missions FOR SELECT
  USING (auth.uid() = student_id);

-- Students can create their own missions
CREATE POLICY "Students can create own missions"
  ON academic_missions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own missions
CREATE POLICY "Students can update own missions"
  ON academic_missions FOR UPDATE
  USING (auth.uid() = student_id);

-- Teachers can view missions of their students
CREATE POLICY "Teachers can view student missions"
  ON academic_missions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'teacher'
    )
  );

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_academic_missions_updated_at ON academic_missions;

CREATE TRIGGER update_academic_missions_updated_at
  BEFORE UPDATE ON academic_missions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed some example missions for testing
INSERT INTO academic_missions (
  student_id,
  title,
  description,
  primary_track,
  secondary_tracks,
  credit_areas,
  oklahoma_standards,
  estimated_credits,
  learning_objectives,
  action_plan,
  skills_checklist,
  evidence_prompts,
  status
) VALUES (
  (SELECT id FROM profiles WHERE role = 'student' LIMIT 1),
  'Building a Backyard Garden Ecosystem',
  'Design and implement a sustainable garden that demonstrates principles of ecology, food systems, and stewardship of God''s creation.',
  'food_systems',
  ARRAY['creation_science', 'discipleship'],
  ARRAY['science', 'social_studies'],
  ARRAY['OK.SCI.HS.LS2.1', 'OK.SCI.HS.LS2.6', 'OK.SCI.HS.ESS3.3'],
  2.5,
  '["Understand ecosystem relationships", "Apply permaculture principles", "Document biodiversity", "Calculate resource efficiency"]'::jsonb,
  '[
    {"order": 1, "title": "Research Local Ecosystem", "description": "Study native plants and beneficial insects in your region", "estimated_time": "3 hours", "completed": false},
    {"order": 2, "title": "Design Garden Layout", "description": "Create a permaculture design considering sun, water, and companion planting", "estimated_time": "2 hours", "completed": false},
    {"order": 3, "title": "Prepare Soil", "description": "Test soil pH and amend with compost", "estimated_time": "4 hours", "completed": false},
    {"order": 4, "title": "Plant & Document", "description": "Plant seeds/seedlings and create observation journal", "estimated_time": "3 hours", "completed": false},
    {"order": 5, "title": "Monitor & Maintain", "description": "Weekly observations of growth, pests, and ecosystem interactions", "estimated_time": "1 hour/week for 8 weeks", "completed": false}
  ]'::jsonb,
  '[
    {"skill_name": "Ecological Systems Thinking", "track": "creation_science", "description": "Understanding interconnected relationships in nature", "mastery_level": "developing", "evidence_required": true},
    {"skill_name": "Sustainable Agriculture", "track": "food_systems", "description": "Applying permaculture and regenerative practices", "mastery_level": "developing", "evidence_required": true},
    {"skill_name": "Scientific Documentation", "track": "creation_science", "description": "Systematic observation and data recording", "mastery_level": "developing", "evidence_required": true}
  ]'::jsonb,
  '[
    {"prompt": "Take photos of your garden layout design with labels", "evidence_type": "photo", "required": true},
    {"prompt": "Document weekly observations in a journal with photos", "evidence_type": "document", "required": true},
    {"prompt": "Create a video explaining your ecosystem observations", "evidence_type": "video", "required": false},
    {"prompt": "Write a reflection on stewardship and God''s design in creation", "evidence_type": "reflection", "required": true}
  ]'::jsonb,
  'proposed'
) ON CONFLICT DO NOTHING;
