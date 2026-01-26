-- SPACED REPETITION SYSTEM (SRS)
-- Implements SM-2 algorithm for optimal memory retention
-- Date: 2026-01-11

-- Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('concept', 'scripture', 'vocab', 'fact')),
  subject TEXT,
  source TEXT, -- e.g., "Genesis 1:1", "Photosynthesis lesson"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Card Reviews Table (SM-2 state tracking)
CREATE TABLE IF NOT EXISTS card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  easiness_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 easiness (1.3 - 2.5)
  interval INTEGER DEFAULT 0, -- Days until next review
  repetitions INTEGER DEFAULT 0, -- Number of successful reviews
  next_review TIMESTAMPTZ DEFAULT NOW(), -- When to show this card next
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Review History Table (analytics)
CREATE TABLE IF NOT EXISTS review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4), -- 1=Again, 2=Hard, 3=Good, 4=Easy
  easiness_factor DECIMAL(3,2) NOT NULL,
  interval INTEGER NOT NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_type ON flashcards(type);
CREATE INDEX IF NOT EXISTS idx_card_reviews_user ON card_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_card_reviews_next_review ON card_reviews(next_review);
CREATE INDEX IF NOT EXISTS idx_card_reviews_card ON card_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_review_history_user ON review_history(user_id);
CREATE INDEX IF NOT EXISTS idx_review_history_card ON review_history(card_id);

-- Row Level Security (RLS)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own cards
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

CREATE POLICY "Users can view their own card reviews"
  ON card_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own card reviews"
  ON card_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card reviews"
  ON card_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own review history"
  ON review_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own review history"
  ON review_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comments
COMMENT ON TABLE flashcards IS 'Spaced repetition flashcards for optimal memory retention';
COMMENT ON TABLE card_reviews IS 'SM-2 algorithm state tracking for each flashcard';
COMMENT ON TABLE review_history IS 'Historical log of all card reviews for analytics';
COMMENT ON COLUMN card_reviews.easiness_factor IS 'SM-2 easiness factor (1.3-2.5). Higher = easier to remember';
COMMENT ON COLUMN card_reviews.interval IS 'Days until next review. Grows exponentially for correct answers';
COMMENT ON COLUMN card_reviews.repetitions IS 'Number of successful reviews in a row. Resets to 0 on failure';
