-- ADAPTIVE DIFFICULTY ENGINE
-- Tracks student performance to dynamically adjust lesson complexity
-- Date: 2026-01-11

-- Difficulty History Table
CREATE TABLE IF NOT EXISTS difficulty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  accuracy DECIMAL(3,2), -- 0.00 - 1.00
  response_time INTEGER, -- milliseconds
  engagement_score DECIMAL(3,2), -- 0.00 - 1.00
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Difficulty Profiles Table
CREATE TABLE IF NOT EXISTS student_difficulty_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  current_difficulty INTEGER NOT NULL DEFAULT 5 CHECK (current_difficulty >= 1 AND current_difficulty <= 10),
  average_accuracy DECIMAL(3,2),
  average_engagement DECIMAL(3,2),
  sessions_count INTEGER DEFAULT 0,
  last_adjustment TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

-- Performance Sessions Table (detailed tracking)
CREATE TABLE IF NOT EXISTS performance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL,
  questions_asked INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  average_response_time INTEGER, -- milliseconds
  engagement_score DECIMAL(3,2),
  flow_state_detected BOOLEAN DEFAULT FALSE, -- ZPD achieved
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_difficulty_history_user ON difficulty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_history_subject ON difficulty_history(subject);
CREATE INDEX IF NOT EXISTS idx_difficulty_history_tracked_at ON difficulty_history(tracked_at);
CREATE INDEX IF NOT EXISTS idx_student_difficulty_profiles_user ON student_difficulty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_user ON performance_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_started_at ON performance_sessions(started_at);

-- Row Level Security
ALTER TABLE difficulty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_difficulty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own difficulty history"
  ON difficulty_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own difficulty history"
  ON difficulty_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own difficulty profiles"
  ON student_difficulty_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own difficulty profiles"
  ON student_difficulty_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own difficulty profiles"
  ON student_difficulty_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own performance sessions"
  ON performance_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own performance sessions"
  ON performance_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance sessions"
  ON performance_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update difficulty profile after each session
CREATE OR REPLACE FUNCTION update_difficulty_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_difficulty_profiles (
    user_id,
    subject,
    current_difficulty,
    average_accuracy,
    average_engagement,
    sessions_count,
    last_adjustment
  )
  VALUES (
    NEW.user_id,
    NEW.subject,
    NEW.difficulty_level,
    NEW.accuracy,
    NEW.engagement_score,
    1,
    NOW()
  )
  ON CONFLICT (user_id, subject)
  DO UPDATE SET
    current_difficulty = CASE
      WHEN student_difficulty_profiles.average_accuracy > 0.85 THEN LEAST(student_difficulty_profiles.current_difficulty + 1, 10)
      WHEN student_difficulty_profiles.average_accuracy < 0.60 THEN GREATEST(student_difficulty_profiles.current_difficulty - 1, 1)
      ELSE student_difficulty_profiles.current_difficulty
    END,
    average_accuracy = (student_difficulty_profiles.average_accuracy * student_difficulty_profiles.sessions_count + NEW.accuracy) / (student_difficulty_profiles.sessions_count + 1),
    average_engagement = (student_difficulty_profiles.average_engagement * student_difficulty_profiles.sessions_count + NEW.engagement_score) / (student_difficulty_profiles.sessions_count + 1),
    sessions_count = student_difficulty_profiles.sessions_count + 1,
    last_adjustment = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profiles
CREATE TRIGGER difficulty_history_update_profile
  AFTER INSERT ON difficulty_history
  FOR EACH ROW
  EXECUTE FUNCTION update_difficulty_profile();

-- Updated_at trigger for profiles
CREATE TRIGGER student_difficulty_profiles_updated_at
  BEFORE UPDATE ON student_difficulty_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE difficulty_history IS 'Historical log of difficulty adjustments and performance metrics';
COMMENT ON TABLE student_difficulty_profiles IS 'Current difficulty level per subject, auto-adjusted based on performance';
COMMENT ON TABLE performance_sessions IS 'Detailed session tracking for analytics';
COMMENT ON COLUMN student_difficulty_profiles.current_difficulty IS 'Current difficulty level (1-10). Auto-adjusted based on accuracy';
COMMENT ON COLUMN performance_sessions.flow_state_detected IS 'Whether student achieved optimal ZPD (Zone of Proximal Development)';
