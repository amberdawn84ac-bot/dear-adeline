-- ============================================
-- CITATION TRACKING SYSTEM
-- Track which sources informed each lesson/conversation
-- For parent/teacher visibility
-- ============================================

-- Lesson citations table
CREATE TABLE IF NOT EXISTS public.lesson_citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What conversation/lesson used these sources
    conversation_id UUID,              -- Links to conversations table if exists
    student_id UUID REFERENCES public.profiles(id),
    
    -- Session tracking
    session_date DATE DEFAULT CURRENT_DATE,
    subject TEXT,                      -- Subject area of the conversation
    topic TEXT,                        -- Topic being discussed
    
    -- Citations used
    source_ids UUID[] NOT NULL,        -- Array of knowledge_chunks/philosophy IDs used
    source_types TEXT[] NOT NULL,      -- Parallel array of source types
    source_titles TEXT[] NOT NULL,     -- Parallel array of titles for display
    
    -- Context
    query_text TEXT,                   -- What the student asked
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated citation stats per subject
CREATE TABLE IF NOT EXISTS public.citation_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    student_id UUID REFERENCES public.profiles(id),
    subject TEXT NOT NULL,
    
    -- Summarized data (updated periodically)
    total_lessons INTEGER DEFAULT 0,
    unique_sources INTEGER DEFAULT 0,
    top_sources JSONB DEFAULT '[]'::jsonb,  -- Array of {title, count, type}
    
    -- Time range
    period_start DATE,
    period_end DATE,
    
    -- Timestamps
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(student_id, subject, period_start, period_end)
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.lesson_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citation_summaries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Citations: Students can view their own citations
CREATE POLICY "Students can view own citations" ON public.lesson_citations
    FOR SELECT USING (student_id = auth.uid());

-- Citations: Parents/teachers can view their students' citations
CREATE POLICY "Teachers can view student citations" ON public.lesson_citations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teacher_students
            WHERE teacher_id = auth.uid() 
            AND student_id = lesson_citations.student_id
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'parent')
        )
    );

-- Citations: System can insert (from chat API)
CREATE POLICY "System can insert citations" ON public.lesson_citations
    FOR INSERT WITH CHECK (true);

-- Summaries: Same policies as citations
CREATE POLICY "Students can view own summaries" ON public.citation_summaries
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view student summaries" ON public.citation_summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teacher_students
            WHERE teacher_id = auth.uid() 
            AND student_id = citation_summaries.student_id
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'parent')
        )
    );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_citations_student ON public.lesson_citations(student_id);
CREATE INDEX IF NOT EXISTS idx_citations_date ON public.lesson_citations(session_date);
CREATE INDEX IF NOT EXISTS idx_citations_subject ON public.lesson_citations(subject);
CREATE INDEX IF NOT EXISTS idx_citations_conversation ON public.lesson_citations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_summaries_student ON public.citation_summaries(student_id);
CREATE INDEX IF NOT EXISTS idx_summaries_subject ON public.citation_summaries(subject);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get citations for a student within a date range
CREATE OR REPLACE FUNCTION get_student_citations(
    p_student_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_subject TEXT DEFAULT NULL
)
RETURNS TABLE (
    session_date DATE,
    subject TEXT,
    topic TEXT,
    source_titles TEXT[],
    source_types TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        lc.session_date,
        lc.subject,
        lc.topic,
        lc.source_titles,
        lc.source_types
    FROM public.lesson_citations lc
    WHERE lc.student_id = p_student_id
    AND (p_start_date IS NULL OR lc.session_date >= p_start_date)
    AND (p_end_date IS NULL OR lc.session_date <= p_end_date)
    AND (p_subject IS NULL OR lc.subject = p_subject)
    ORDER BY lc.session_date DESC, lc.created_at DESC;
END;
$$;

-- Get aggregated source usage for a student
CREATE OR REPLACE FUNCTION get_source_usage(
    p_student_id UUID,
    p_limit INT DEFAULT 20
)
RETURNS TABLE (
    source_title TEXT,
    source_type TEXT,
    usage_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        unnest(lc.source_titles) AS source_title,
        unnest(lc.source_types) AS source_type,
        COUNT(*) AS usage_count
    FROM public.lesson_citations lc
    WHERE lc.student_id = p_student_id
    GROUP BY 1, 2
    ORDER BY usage_count DESC
    LIMIT p_limit;
END;
$$;
