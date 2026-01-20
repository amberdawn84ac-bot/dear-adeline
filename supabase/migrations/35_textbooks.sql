-- ============================================
-- TEXTBOOKS FEATURE
-- Interactive History Timeline & Science Skill Tree
-- ============================================

-- History Events Table
CREATE TABLE IF NOT EXISTS public.textbook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    date_display TEXT NOT NULL,
    era TEXT NOT NULL CHECK (era IN ('creation', 'ancient', 'classical', 'medieval', 'reformation', 'modern', 'current')),
    century INTEGER,
    decade INTEGER,
    mainstream_narrative TEXT NOT NULL,
    primary_sources TEXT NOT NULL,
    source_citations JSONB DEFAULT '[]'::jsonb,
    scripture_references JSONB DEFAULT '[]'::jsonb,
    related_event_ids UUID[] DEFAULT '{}',
    skills_awarded JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ
);

-- Science Concepts Table
CREATE TABLE IF NOT EXISTS public.textbook_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    branch TEXT NOT NULL,
    prerequisite_ids UUID[] DEFAULT '{}',
    why_it_matters TEXT NOT NULL,
    what_we_observe JSONB DEFAULT '[]'::jsonb,
    what_models_say TEXT,
    what_we_dont_know TEXT,
    key_ideas JSONB DEFAULT '[]'::jsonb,
    learn_content TEXT,
    skills_awarded JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ
);

-- Student Progress Table
CREATE TABLE IF NOT EXISTS public.student_textbook_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('event', 'concept')),
    mastery_level TEXT DEFAULT 'not_started' CHECK (mastery_level IN ('not_started', 'introduced', 'developing', 'proficient', 'mastered')),
    quiz_scores JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, item_id, item_type)
);

-- Student Suggestions Table (for kids to suggest new content)
CREATE TABLE IF NOT EXISTS public.textbook_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('event', 'concept')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    research_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_work')),
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.textbook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_textbook_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textbook_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Events: Everyone can read approved events
CREATE POLICY "Anyone can view approved events" ON public.textbook_events
    FOR SELECT USING (approved = true);

-- Events: Admins/teachers can view all events
CREATE POLICY "Admins can view all events" ON public.textbook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- Events: Admins can insert/update events
CREATE POLICY "Admins can manage events" ON public.textbook_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Concepts: Everyone can read approved concepts
CREATE POLICY "Anyone can view approved concepts" ON public.textbook_concepts
    FOR SELECT USING (approved = true);

-- Concepts: Admins/teachers can view all concepts
CREATE POLICY "Admins can view all concepts" ON public.textbook_concepts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- Concepts: Admins can insert/update concepts
CREATE POLICY "Admins can manage concepts" ON public.textbook_concepts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Progress: Students can view/update their own progress
CREATE POLICY "Students can manage own progress" ON public.student_textbook_progress
    FOR ALL USING (student_id = auth.uid());

-- Progress: Teachers can view their students' progress
CREATE POLICY "Teachers can view student progress" ON public.student_textbook_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teacher_students
            WHERE teacher_id = auth.uid() AND student_id = public.student_textbook_progress.student_id
        )
    );

-- Suggestions: Students can create and view their own suggestions
CREATE POLICY "Students can manage own suggestions" ON public.textbook_suggestions
    FOR ALL USING (student_id = auth.uid());

-- Suggestions: Teachers/admins can view all suggestions
CREATE POLICY "Teachers can view suggestions" ON public.textbook_suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- Suggestions: Admins can update suggestions (approve/reject)
CREATE POLICY "Admins can update suggestions" ON public.textbook_suggestions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_textbook_events_era ON public.textbook_events(era);
CREATE INDEX IF NOT EXISTS idx_textbook_events_approved ON public.textbook_events(approved);
CREATE INDEX IF NOT EXISTS idx_textbook_events_sort ON public.textbook_events(sort_order);

CREATE INDEX IF NOT EXISTS idx_textbook_concepts_branch ON public.textbook_concepts(branch);
CREATE INDEX IF NOT EXISTS idx_textbook_concepts_approved ON public.textbook_concepts(approved);
CREATE INDEX IF NOT EXISTS idx_textbook_concepts_sort ON public.textbook_concepts(sort_order);

CREATE INDEX IF NOT EXISTS idx_student_textbook_progress_student ON public.student_textbook_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_textbook_progress_item ON public.student_textbook_progress(item_id, item_type);

CREATE INDEX IF NOT EXISTS idx_textbook_suggestions_student ON public.textbook_suggestions(student_id);
CREATE INDEX IF NOT EXISTS idx_textbook_suggestions_status ON public.textbook_suggestions(status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_textbook_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_textbook_progress_timestamp
    BEFORE UPDATE ON public.student_textbook_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_textbook_progress_timestamp();
