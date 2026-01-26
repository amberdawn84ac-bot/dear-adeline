-- ============================================
-- EMBEDDING QUEUE SYSTEM
-- Queue and process content for auto-embedding
-- ============================================

-- Embedding queue table
CREATE TABLE IF NOT EXISTS public.embedding_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What to embed
    content_type TEXT NOT NULL CHECK (content_type IN ('opportunity', 'article', 'manual', 'scraped')),
    content_id UUID,                   -- Reference to original content (e.g., opportunity ID)
    content TEXT NOT NULL,             -- The text to embed
    
    -- Metadata for storage
    title TEXT,
    source_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Who queued it
    queued_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.embedding_queue ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage queue" ON public.embedding_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System can insert/update
CREATE POLICY "System can manage queue" ON public.embedding_queue
    FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.embedding_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_type ON public.embedding_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_queue_created ON public.embedding_queue(created_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get next items to process
CREATE OR REPLACE FUNCTION get_pending_embeddings(
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    content_type TEXT,
    content_id UUID,
    content TEXT,
    title TEXT,
    source_url TEXT,
    metadata JSONB,
    attempts INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update status to processing and return
    RETURN QUERY
    WITH to_process AS (
        SELECT eq.id
        FROM public.embedding_queue eq
        WHERE eq.status = 'pending'
        AND eq.attempts < eq.max_attempts
        ORDER BY eq.created_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.embedding_queue eq
    SET status = 'processing',
        attempts = eq.attempts + 1
    FROM to_process tp
    WHERE eq.id = tp.id
    RETURNING 
        eq.id,
        eq.content_type,
        eq.content_id,
        eq.content,
        eq.title,
        eq.source_url,
        eq.metadata,
        eq.attempts;
END;
$$;

-- Mark item as completed
CREATE OR REPLACE FUNCTION complete_embedding(
    p_queue_id UUID,
    p_success BOOLEAN,
    p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.embedding_queue
    SET 
        status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
        error_message = p_error,
        processed_at = NOW()
    WHERE id = p_queue_id;
END;
$$;
