-- Sketchnotes Storage System
-- Catalog PDF sketchnotes that Adeline can share with students and add to journals

-- ==========================================
-- SKETCHNOTES CATALOG
-- ==========================================

CREATE TABLE IF NOT EXISTS sketchnotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadata
  title TEXT NOT NULL,
  topic TEXT,                    -- "fractions", "photosynthesis", etc.
  subject TEXT,                  -- "math", "science", "reading", etc.
  grade_levels TEXT[],           -- ["K", "1", "2"] or ["6", "7", "8"]
  description TEXT,
  
  -- Lesson content (what Adeline presents in chat)
  presentation_content TEXT,     -- The lesson text Adeline walks through
  
  -- File info
  file_url TEXT NOT NULL,        -- Public URL from Supabase Storage
  file_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- JOURNAL-SKETCHNOTES LINK
-- ==========================================

CREATE TABLE IF NOT EXISTS journal_sketchnotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  sketchnote_id UUID NOT NULL REFERENCES sketchnotes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each sketchnote can only be attached once per entry
  UNIQUE(journal_entry_id, sketchnote_id)
);

-- ==========================================
-- ENABLE RLS
-- ==========================================

ALTER TABLE sketchnotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_sketchnotes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - Sketchnotes (read-only for all)
-- ==========================================

-- Everyone can view sketchnotes (they're shared resources)
CREATE POLICY "Anyone can view sketchnotes"
  ON sketchnotes FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete (via admin scripts)
CREATE POLICY "Service role can manage sketchnotes"
  ON sketchnotes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- RLS POLICIES - Journal Sketchnotes
-- ==========================================

-- Users can view sketchnotes attached to their journal entries
CREATE POLICY "Users can view their journal sketchnotes"
  ON journal_sketchnotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = journal_sketchnotes.journal_entry_id
      AND journal_entries.student_id = auth.uid()
    )
  );

-- Users can attach sketchnotes to their own journal entries
CREATE POLICY "Users can attach sketchnotes to their journals"
  ON journal_sketchnotes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = journal_sketchnotes.journal_entry_id
      AND journal_entries.student_id = auth.uid()
    )
  );

-- Users can remove sketchnotes from their journal entries
CREATE POLICY "Users can remove sketchnotes from their journals"
  ON journal_sketchnotes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = journal_sketchnotes.journal_entry_id
      AND journal_entries.student_id = auth.uid()
    )
  );

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_sketchnotes_topic ON sketchnotes(topic);
CREATE INDEX IF NOT EXISTS idx_sketchnotes_subject ON sketchnotes(subject);
CREATE INDEX IF NOT EXISTS idx_journal_sketchnotes_entry ON journal_sketchnotes(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_sketchnotes_sketchnote ON journal_sketchnotes(sketchnote_id);

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE sketchnotes IS 'Catalog of PDF sketchnotes that Adeline can share with students';
COMMENT ON COLUMN sketchnotes.topic IS 'Learning topic like fractions, photosynthesis, etc.';
COMMENT ON COLUMN sketchnotes.grade_levels IS 'Array of grade levels this sketchnote is appropriate for';
COMMENT ON COLUMN sketchnotes.file_url IS 'Public URL to the sketchnote PDF in Supabase Storage';

COMMENT ON TABLE journal_sketchnotes IS 'Links sketchnotes to student journal entries';
