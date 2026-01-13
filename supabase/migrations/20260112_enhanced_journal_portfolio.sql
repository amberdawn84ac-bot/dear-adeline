-- Enhanced Journal & Portfolio Migration
-- Journal = Daily learning diary with sketches, notes, sketchnotes
-- Portfolio = Printable book of completed projects with photos

-- ==========================================
-- JOURNAL ENTRIES (Daily Learning Diary)
-- ==========================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Daily entry info
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,

  -- Different types of content
  text_notes TEXT, -- Written thoughts/reflections
  doodles JSONB DEFAULT '[]'::jsonb, -- Array of sketch data
  sketchnote_content TEXT, -- AI-generated sketchnote from conversation
  learned_today TEXT[], -- Array of learning points

  -- Conversation link
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

  -- Metadata
  mood TEXT CHECK (mood IN ('excited', 'curious', 'focused', 'challenged', 'proud', 'tired', 'confused', 'happy')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One entry per day per student
  UNIQUE(student_id, entry_date)
);

-- ==========================================
-- PROJECTS IN PROGRESS (Journal Planning)
-- ==========================================

CREATE TABLE IF NOT EXISTS projects_in_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project details
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('project', 'lesson', 'artwork', 'writing', 'experiment', 'other')),

  -- Progress tracking
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'almost_done', 'completed')),
  progress_notes TEXT[], -- Daily updates
  next_steps TEXT[], -- What to do next

  -- When complete, this links to portfolio
  portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE SET NULL,

  -- Dates
  started_at DATE DEFAULT CURRENT_DATE,
  completed_at DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PORTFOLIO ITEMS (Major Projects)
-- ==========================================

-- Add new columns to existing portfolio_items table
ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('photo', 'document', 'video', 'link')),
  ADD COLUMN IF NOT EXISTS grade_level TEXT,
  ADD COLUMN IF NOT EXISTS reflection TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create media storage table for portfolio
CREATE TABLE IF NOT EXISTS portfolio_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_item_id UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,

  -- Media details
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- image/jpeg, application/pdf, etc
  file_size INTEGER,
  caption TEXT,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ENABLE RLS
-- ==========================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_in_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_media ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - Journal
-- ==========================================

CREATE POLICY "Users can view their own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = student_id);

-- ==========================================
-- RLS POLICIES - Projects In Progress
-- ==========================================

CREATE POLICY "Users can view their own projects"
  ON projects_in_progress FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Users can create their own projects"
  ON projects_in_progress FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own projects"
  ON projects_in_progress FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Users can delete their own projects"
  ON projects_in_progress FOR DELETE
  USING (auth.uid() = student_id);

-- ==========================================
-- RLS POLICIES - Portfolio Media
-- ==========================================

CREATE POLICY "Users can view media for their portfolios"
  ON portfolio_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_items
      WHERE portfolio_items.id = portfolio_media.portfolio_item_id
      AND portfolio_items.student_id = auth.uid()
    )
  );

CREATE POLICY "Users can add media to their portfolios"
  ON portfolio_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_items
      WHERE portfolio_items.id = portfolio_media.portfolio_item_id
      AND portfolio_items.student_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media in their portfolios"
  ON portfolio_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_items
      WHERE portfolio_items.id = portfolio_media.portfolio_item_id
      AND portfolio_items.student_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media from their portfolios"
  ON portfolio_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_items
      WHERE portfolio_items.id = portfolio_media.portfolio_item_id
      AND portfolio_items.student_id = auth.uid()
    )
  );

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_journal_entries_student ON journal_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_student_date ON journal_entries(student_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_projects_in_progress_student ON projects_in_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_in_progress_status ON projects_in_progress(status);
CREATE INDEX IF NOT EXISTS idx_projects_in_progress_student_status ON projects_in_progress(student_id, status);

CREATE INDEX IF NOT EXISTS idx_portfolio_media_item ON portfolio_media(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_order ON portfolio_items(student_id, display_order);

-- ==========================================
-- TRIGGERS
-- ==========================================

CREATE TRIGGER journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_in_progress_updated_at
  BEFORE UPDATE ON projects_in_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE journal_entries IS 'Daily learning diary with notes, sketches, and sketchnotes from conversations';
COMMENT ON COLUMN journal_entries.text_notes IS 'Daily written thoughts and reflections';
COMMENT ON COLUMN journal_entries.doodles IS 'JSON array of sketch/doodle data';
COMMENT ON COLUMN journal_entries.sketchnote_content IS 'AI-generated sketchnote content from learning that day';
COMMENT ON COLUMN journal_entries.learned_today IS 'Array of key learning points from the day';

COMMENT ON TABLE projects_in_progress IS 'Projects being planned and worked on in journal - move to portfolio when complete';
COMMENT ON COLUMN projects_in_progress.progress_notes IS 'Daily updates on project progress';
COMMENT ON COLUMN projects_in_progress.portfolio_item_id IS 'Links to portfolio item when project is marked complete';

COMMENT ON TABLE portfolio_media IS 'Photos, documents, and media attached to portfolio projects';
COMMENT ON COLUMN portfolio_items.completion_date IS 'When the project was completed';
COMMENT ON COLUMN portfolio_items.reflection IS 'Student reflection on what they learned';
