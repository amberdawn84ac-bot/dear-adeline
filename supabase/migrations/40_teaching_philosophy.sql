-- ============================================
-- TEACHING PHILOSOPHY SYSTEM
-- Adeline's Soul: How she approaches teaching
-- ============================================

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Teaching Philosophy Table
CREATE TABLE IF NOT EXISTS public.teaching_philosophy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Categorization
    category TEXT NOT NULL,               -- 'pedagogy', 'biblical', 'nutrition', 'history', 'science', etc.
    topic TEXT,                           -- Specific topic: 'evolution', 'vaccines', 'american_founders', etc.
    
    -- The actual philosophy content
    guideline TEXT NOT NULL,              -- The philosophy statement Adeline follows
    priority TEXT DEFAULT 'standard' CHECK (priority IN ('core', 'standard', 'nuance')),
    
    -- For semantic search - find relevant philosophy based on conversation
    embedding VECTOR(768),
    
    -- Rich metadata
    examples JSONB DEFAULT '[]'::jsonb,   -- Example applications of this guideline
    do_say JSONB DEFAULT '[]'::jsonb,     -- Phrases/approaches TO use
    dont_say JSONB DEFAULT '[]'::jsonb,   -- Phrases/approaches to AVOID
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    
    -- Active flag for soft delete
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.teaching_philosophy ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read active philosophy (needed for chat API)
CREATE POLICY "Anyone can view active philosophy" ON public.teaching_philosophy
    FOR SELECT USING (is_active = true);

-- Admins can manage all philosophy
CREATE POLICY "Admins can manage philosophy" ON public.teaching_philosophy
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_philosophy_category ON public.teaching_philosophy(category);
CREATE INDEX IF NOT EXISTS idx_philosophy_topic ON public.teaching_philosophy(topic);
CREATE INDEX IF NOT EXISTS idx_philosophy_priority ON public.teaching_philosophy(priority);
CREATE INDEX IF NOT EXISTS idx_philosophy_active ON public.teaching_philosophy(is_active);

-- Vector similarity search index (IVFFlat for performance at scale)
CREATE INDEX IF NOT EXISTS idx_philosophy_embedding ON public.teaching_philosophy 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to search philosophy by semantic similarity
CREATE OR REPLACE FUNCTION match_philosophy(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    category TEXT,
    topic TEXT,
    guideline TEXT,
    priority TEXT,
    examples JSONB,
    do_say JSONB,
    dont_say JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tp.id,
        tp.category,
        tp.topic,
        tp.guideline,
        tp.priority,
        tp.examples,
        tp.do_say,
        tp.dont_say,
        1 - (tp.embedding <=> query_embedding) AS similarity
    FROM public.teaching_philosophy tp
    WHERE tp.is_active = true
    AND 1 - (tp.embedding <=> query_embedding) > match_threshold
    ORDER BY tp.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to get core philosophy (always injected)
CREATE OR REPLACE FUNCTION get_core_philosophy()
RETURNS TABLE (
    id UUID,
    category TEXT,
    topic TEXT,
    guideline TEXT,
    examples JSONB,
    do_say JSONB,
    dont_say JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tp.id,
        tp.category,
        tp.topic,
        tp.guideline,
        tp.examples,
        tp.do_say,
        tp.dont_say
    FROM public.teaching_philosophy tp
    WHERE tp.is_active = true
    AND tp.priority = 'core'
    ORDER BY tp.category, tp.topic;
END;
$$;

-- Trigger to update timestamp
CREATE TRIGGER update_teaching_philosophy_timestamp
    BEFORE UPDATE ON public.teaching_philosophy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
