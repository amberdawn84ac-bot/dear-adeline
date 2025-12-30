-- Game Projects System
-- Enables AI-generated HTML5 Canvas educational games
-- with community library sharing

CREATE TABLE IF NOT EXISTS game_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Game Code
  game_code TEXT NOT NULL,
  instructions TEXT NOT NULL,
  controls TEXT NOT NULL,
  
  -- Learning
  learning_objectives JSONB DEFAULT '[]'::jsonb,
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
  concepts_taught TEXT[] DEFAULT '{}',
  
  -- Metadata
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_play_time TEXT,
  is_public BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_projects_student ON game_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_game_projects_public ON game_projects(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_game_projects_track ON game_projects(primary_track);

-- Enable RLS
ALTER TABLE game_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view public games" ON game_projects;
DROP POLICY IF EXISTS "Students can view own games" ON game_projects;
DROP POLICY IF EXISTS "Students can create own games" ON game_projects;
DROP POLICY IF EXISTS "Students can update own games" ON game_projects;

-- Students can view public games or their own games
CREATE POLICY "Students can view public games"
  ON game_projects FOR SELECT
  USING (is_public = true OR auth.uid() = student_id);

-- Students can create their own games
CREATE POLICY "Students can create own games"
  ON game_projects FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own games
CREATE POLICY "Students can update own games"
  ON game_projects FOR UPDATE
  USING (auth.uid() = student_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_game_projects_updated_at ON game_projects;

CREATE TRIGGER update_game_projects_updated_at
  BEFORE UPDATE ON game_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
