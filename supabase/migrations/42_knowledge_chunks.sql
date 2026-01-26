-- ============================================
-- KNOWLEDGE CHUNKS TABLE
-- Unified storage for all document chunks with embeddings
-- Supports PDFs, articles, web content, textbooks
-- ============================================

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Sources table (tracks original documents)
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source identification
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'article', 'textbook', 'scraped', 'manual')),
    
    -- Metadata for citations
    author TEXT,
    publication_date DATE,
    url TEXT,
    file_path TEXT,
    
    -- Categorization
    subject TEXT,                      -- 'math', 'science', 'history', etc.
    category TEXT,                     -- 'teaching_material', 'reference', 'philosophy', etc.
    tags TEXT[] DEFAULT '{}',
    
    -- Status
    is_processed BOOLEAN DEFAULT false,
    chunk_count INTEGER DEFAULT 0,
    
    -- Audit
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge chunks table (individual searchable pieces)
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to source document
    source_id UUID REFERENCES public.knowledge_sources(id) ON DELETE CASCADE NOT NULL,
    
    -- Chunk content
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,       -- Order within the source document
    
    -- For semantic search
    embedding VECTOR(768),
    
    -- Citation metadata (preserved from source)
    page_number INTEGER,
    chapter TEXT,
    section TEXT,
    
    -- Rich metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Sources: Anyone can read processed sources
CREATE POLICY "Anyone can view processed sources" ON public.knowledge_sources
    FOR SELECT USING (is_processed = true);

-- Sources: Admins can manage all sources
CREATE POLICY "Admins can manage sources" ON public.knowledge_sources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Chunks: Anyone can read chunks from processed sources
CREATE POLICY "Anyone can view chunks" ON public.knowledge_chunks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.knowledge_sources
            WHERE id = knowledge_chunks.source_id AND is_processed = true
        )
    );

-- Chunks: Admins can manage all chunks
CREATE POLICY "Admins can manage chunks" ON public.knowledge_chunks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sources_type ON public.knowledge_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_subject ON public.knowledge_sources(subject);
CREATE INDEX IF NOT EXISTS idx_sources_processed ON public.knowledge_sources(is_processed);

CREATE INDEX IF NOT EXISTS idx_chunks_source ON public.knowledge_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_chunks_index ON public.knowledge_chunks(chunk_index);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON public.knowledge_chunks 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Search knowledge chunks by semantic similarity
CREATE OR REPLACE FUNCTION match_knowledge(
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    filter_source_type TEXT DEFAULT NULL,
    filter_subject TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    source_id UUID,
    source_title TEXT,
    source_type TEXT,
    page_number INTEGER,
    chapter TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kc.id,
        kc.content,
        kc.source_id,
        ks.title AS source_title,
        ks.source_type,
        kc.page_number,
        kc.chapter,
        kc.metadata,
        1 - (kc.embedding <=> query_embedding) AS similarity
    FROM public.knowledge_chunks kc
    JOIN public.knowledge_sources ks ON ks.id = kc.source_id
    WHERE ks.is_processed = true
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    AND (filter_source_type IS NULL OR ks.source_type = filter_source_type)
    AND (filter_subject IS NULL OR ks.subject = filter_subject)
    ORDER BY kc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_sources_timestamp
    BEFORE UPDATE ON public.knowledge_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
