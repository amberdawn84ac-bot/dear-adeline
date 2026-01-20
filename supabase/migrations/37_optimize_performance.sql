-- OPTIMIZE PERFORMANCE FOR SCALE (10k+ Users)
-- Date: 2026-01-19

-- 1. Index Conversations (Critical for Dashboard)
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- 2. Index Skills & Progress
CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_graduation_progress_student_id ON student_graduation_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_standards_progress_student_id ON student_standards_progress(student_id);

-- 3. Index Portfolio & Gaps
CREATE INDEX IF NOT EXISTS idx_portfolio_items_student_id ON portfolio_items(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON portfolio_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_gaps_student_id ON learning_gaps(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_gaps_resolved_at ON learning_gaps(resolved_at) WHERE resolved_at IS NULL;

-- 4. Index Textbooks (New Features)
CREATE INDEX IF NOT EXISTS idx_textbook_interactions_student_id ON textbook_interactions(student_id);
CREATE INDEX IF NOT EXISTS idx_textbook_suggestions_student_id ON textbook_suggestions(student_id);

-- 5. Comments
COMMENT ON INDEX idx_conversations_student_id IS 'Optimizes dashboard conversation history load';
COMMENT ON INDEX idx_conversations_updated_at IS 'Optimizes sorting of conversation history';
