-- COMPLETE MIGRATION - SPACED REPETITION + ADAPTIVE DIFFICULTY
-- Run this single file to set up everything
-- Date: 2026-01-11

-- ==============================================
-- STEP 1: CLEANUP - Drop all existing policies
-- ==============================================

-- Drop flashcard policies
DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can create their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcards;

-- Drop card review policies
DROP POLICY IF EXISTS "Users can view their own card reviews" ON card_reviews;
DROP POLICY IF EXISTS "Users can create their own card reviews" ON card_reviews;
DROP POLICY IF EXISTS "Users can update their own card reviews" ON card_reviews;

-- Drop review history policies
DROP POLICY IF EXISTS "Users can view their own review history" ON review_history;
DROP POLICY IF EXISTS "Users can create their own review history" ON review_history;

-- Drop difficulty history policies
DROP POLICY IF EXISTS "Users can view their own difficulty history" ON difficulty_history;
DROP POLICY IF EXISTS "Users can create their own difficulty history" ON difficulty_history;

-- Drop difficulty profile policies
DROP POLICY IF EXISTS "Users can view their own difficulty profiles" ON student_difficulty_profiles;
DROP POLICY IF EXISTS "Users can create their own difficulty profiles" ON student_difficulty_profiles;
DROP POLICY IF EXISTS "Users can update their own difficulty profiles" ON student_difficulty_profiles;

-- Drop performance session policies
DROP POLICY IF EXISTS "Users can view their own performance sessions" ON performance_sessions;
DROP POLICY IF EXISTS "Users can create their own performance sessions" ON performance_sessions;
DROP POLICY IF EXISTS "Users can update their own performance sessions" ON performance_sessions;

-- Drop triggers
DROP TRIGGER IF EXISTS flashcards_updated_at ON flashcards;
DROP TRIGGER IF EXISTS difficulty_history_update_profile ON difficulty_history;
DROP TRIGGER IF EXISTS student_difficulty_profiles_updated_at ON student_difficulty_profiles;

-- ==============================================
-- STEP 2: SPACED REPETITION TABLES
-- ==============================================

-- Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('concept', 'scripture', 'vocab', 'fact')),
  subject TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card Reviews Table (SM-2 state tracking)
CREATE TABLE IF NOT EXISTS card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  easiness_factor DECIMAL(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  next_review TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Review History Table
CREATE TABLE IF NOT EXISTS review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
  easiness_factor DECIMAL(3,2) NOT NULL,
  interval INTEGER NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- STEP 3: ADAPTIVE DIFFICULTY TABLES
-- ==============================================

-- Difficulty History Table
CREATE TABLE IF NOT EXISTS difficulty_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  accuracy DECIMAL(3,2),
  response_time INTEGER,
  engagement_score DECIMAL(3,2),
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

-- Performance Sessions Table
CREATE TABLE IF NOT EXISTS performance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  difficulty_level INTEGER NOT NULL,
  questions_asked INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  average_response_time INTEGER,
  engagement_score DECIMAL(3,2),
  flow_state_detected BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER
);

-- ==============================================
-- STEP 4: INDEXES
-- ==============================================

-- Flashcard indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_type ON flashcards(type);
CREATE INDEX IF NOT EXISTS idx_card_reviews_user ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_next_review ON card_reviews(next_review);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card ON card_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_review_history_user ON review_history(user_id);
CREATE INDEX IF NOT EXISTS idx_review_history_card ON review_history(card_id);

-- Difficulty indexes
CREATE INDEX IF NOT EXISTS idx_difficulty_history_user ON difficulty_history(user_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_history_subject ON difficulty_history(subject);
CREATE INDEX IF NOT EXISTS idx_difficulty_history_tracked_at ON difficulty_history(tracked_at);
CREATE INDEX IF NOT EXISTS idx_student_difficulty_profiles_user ON student_difficulty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_user ON performance_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_sessions_started_at ON performance_sessions(started_at);

-- ==============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_difficulty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_sessions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 6: CREATE POLICIES (FRESH)
-- ==============================================

-- Flashcard policies
CREATE POLICY "Users can view their own flashcards"
  ON flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own flashcards"
  ON flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
  ON flashcards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
  ON flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- Card review policies
CREATE POLICY "Users can view their own card reviews"
  ON card_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own card reviews"
  ON card_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card reviews"
  ON card_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Review history policies
CREATE POLICY "Users can view their own review history"
  ON review_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own review history"
  ON review_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Difficulty history policies
CREATE POLICY "Users can view their own difficulty history"
  ON difficulty_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own difficulty history"
  ON difficulty_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Difficulty profile policies
CREATE POLICY "Users can view their own difficulty profiles"
  ON student_difficulty_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own difficulty profiles"
  ON student_difficulty_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own difficulty profiles"
  ON student_difficulty_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Performance session policies
CREATE POLICY "Users can view their own performance sessions"
  ON performance_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own performance sessions"
  ON performance_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own performance sessions"
  ON performance_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================
-- STEP 7: FUNCTIONS AND TRIGGERS
-- ==============================================

-- Updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Difficulty profile update function
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

-- Create triggers
CREATE TRIGGER flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER difficulty_history_update_profile
  AFTER INSERT ON difficulty_history
  FOR EACH ROW
  EXECUTE FUNCTION update_difficulty_profile();

CREATE TRIGGER student_difficulty_profiles_updated_at
  BEFORE UPDATE ON student_difficulty_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- STEP 8: COMMENTS
-- ==============================================

COMMENT ON TABLE flashcards IS 'Spaced repetition flashcards for optimal memory retention';
COMMENT ON TABLE card_reviews IS 'SM-2 algorithm state tracking for each flashcard';
COMMENT ON TABLE review_history IS 'Historical log of all card reviews for analytics';
COMMENT ON TABLE difficulty_history IS 'Historical log of difficulty adjustments and performance metrics';
COMMENT ON TABLE student_difficulty_profiles IS 'Current difficulty level per subject, auto-adjusted based on performance';
COMMENT ON TABLE performance_sessions IS 'Detailed session tracking for analytics';
