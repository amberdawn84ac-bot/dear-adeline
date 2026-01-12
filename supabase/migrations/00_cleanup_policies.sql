-- CLEANUP SCRIPT
-- Run this FIRST to drop all existing policies
-- This prevents "already exists" errors

-- Drop all flashcard policies
DROP POLICY IF EXISTS "Users can view their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can create their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON flashcards;

-- Drop all card review policies
DROP POLICY IF EXISTS "Users can view their own card reviews" ON card_reviews;
DROP POLICY IF EXISTS "Users can create their own card reviews" ON card_reviews;
DROP POLICY IF EXISTS "Users can update their own card reviews" ON card_reviews;

-- Drop all review history policies
DROP POLICY IF EXISTS "Users can view their own review history" ON review_history;
DROP POLICY IF EXISTS "Users can create their own review history" ON review_history;

-- Drop all difficulty history policies
DROP POLICY IF EXISTS "Users can view their own difficulty history" ON difficulty_history;
DROP POLICY IF EXISTS "Users can create their own difficulty history" ON difficulty_history;

-- Drop all difficulty profile policies
DROP POLICY IF EXISTS "Users can view their own difficulty profiles" ON student_difficulty_profiles;
DROP POLICY IF EXISTS "Users can create their own difficulty profiles" ON student_difficulty_profiles;
DROP POLICY IF EXISTS "Users can update their own difficulty profiles" ON student_difficulty_profiles;

-- Drop all performance session policies
DROP POLICY IF EXISTS "Users can view their own performance sessions" ON performance_sessions;
DROP POLICY IF EXISTS "Users can create their own performance sessions" ON performance_sessions;
DROP POLICY IF EXISTS "Users can update their own performance sessions" ON performance_sessions;

-- Drop triggers
DROP TRIGGER IF EXISTS flashcards_updated_at ON flashcards;
DROP TRIGGER IF EXISTS difficulty_history_update_profile ON difficulty_history;
DROP TRIGGER IF EXISTS student_difficulty_profiles_updated_at ON student_difficulty_profiles;
