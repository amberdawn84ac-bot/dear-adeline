-- ============================================
-- UNIFIED RAG SEARCH
-- Single function to search all knowledge sources
-- ============================================

-- Create a unified search function that searches across ALL content types
CREATE OR REPLACE FUNCTION search_all_knowledge(
    query_embedding VECTOR(768),
    p_student_id UUID DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 15,
    include_philosophy BOOLEAN DEFAULT true,
    include_library BOOLEAN DEFAULT true,
    include_knowledge BOOLEAN DEFAULT true,
    include_memories BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    source_type TEXT,
    source_title TEXT,
    priority_weight FLOAT,
    metadata JSONB,
    similarity FLOAT,
    weighted_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH all_results AS (
        -- Teaching Philosophy (highest priority - Adeline's soul)
        SELECT
            tp.id,
            tp.guideline AS content,
            'philosophy'::TEXT AS source_type,
            (tp.category || ': ' || COALESCE(tp.topic, 'general'))::TEXT AS source_title,
            CASE tp.priority
                WHEN 'core' THEN 1.5
                WHEN 'standard' THEN 1.2
                ELSE 1.0
            END AS priority_weight,
            jsonb_build_object(
                'category', tp.category,
                'topic', tp.topic,
                'do_say', tp.do_say,
                'dont_say', tp.dont_say,
                'examples', tp.examples
            ) AS metadata,
            1 - (tp.embedding <=> query_embedding) AS similarity
        FROM public.teaching_philosophy tp
        WHERE include_philosophy
        AND tp.is_active = true
        AND tp.embedding IS NOT NULL
        AND 1 - (tp.embedding <=> query_embedding) > match_threshold
        
        UNION ALL
        
        -- Library (truth documents - high priority)
        SELECT
            lib.id,
            lib.content,
            'library'::TEXT AS source_type,
            COALESCE((lib.metadata->>'title')::TEXT, 'Library Document') AS source_title,
            1.3 AS priority_weight,
            lib.metadata,
            1 - (lib.embedding <=> query_embedding) AS similarity
        FROM public.library lib
        WHERE include_library
        AND lib.embedding IS NOT NULL
        AND 1 - (lib.embedding <=> query_embedding) > match_threshold
        
        UNION ALL
        
        -- Knowledge chunks (PDFs, articles - medium priority)
        SELECT
            kc.id,
            kc.content,
            ks.source_type::TEXT AS source_type,
            ks.title AS source_title,
            1.0 AS priority_weight,
            jsonb_build_object(
                'page', kc.page_number,
                'chapter', kc.chapter,
                'author', ks.author,
                'subject', ks.subject
            ) AS metadata,
            1 - (kc.embedding <=> query_embedding) AS similarity
        FROM public.knowledge_chunks kc
        JOIN public.knowledge_sources ks ON ks.id = kc.source_id
        WHERE include_knowledge
        AND ks.is_processed = true
        AND kc.embedding IS NOT NULL
        AND 1 - (kc.embedding <=> query_embedding) > match_threshold
        
        UNION ALL
        
        -- Student memories (personal context - lower priority but relevant)
        SELECT
            mem.id,
            mem.content,
            'memory'::TEXT AS source_type,
            'Personal Memory'::TEXT AS source_title,
            0.8 AS priority_weight,
            mem.metadata,
            1 - (mem.embedding <=> query_embedding) AS similarity
        FROM public.memories mem
        WHERE include_memories
        AND (p_student_id IS NULL OR mem.student_id = p_student_id)
        AND mem.embedding IS NOT NULL
        AND 1 - (mem.embedding <=> query_embedding) > match_threshold
    )
    SELECT
        ar.id,
        ar.content,
        ar.source_type,
        ar.source_title,
        ar.priority_weight,
        ar.metadata,
        ar.similarity,
        (ar.similarity * ar.priority_weight) AS weighted_score
    FROM all_results ar
    ORDER BY weighted_score DESC
    LIMIT match_count;
END;
$$;

-- Create a helper function for formatting unified results
COMMENT ON FUNCTION search_all_knowledge IS 
'Unified RAG search across all knowledge sources with priority weighting:
- Philosophy: 1.5x (core) / 1.2x (standard) - Adeline''s soul
- Library: 1.3x - Truth documents
- Knowledge: 1.0x - PDFs, articles
- Memories: 0.8x - Student personal context

Returns results sorted by weighted_score (similarity * priority_weight)';
