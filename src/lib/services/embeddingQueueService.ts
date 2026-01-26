import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export interface QueueItem {
    id: string;
    content_type: string;
    content_id: string | null;
    content: string;
    title: string | null;
    source_url: string | null;
    metadata: Record<string, unknown>;
    attempts: number;
}

/**
 * AUTO-EMBED PIPELINE SERVICE
 * 
 * Manages the embedding queue for scraped content.
 * Supports opportunities, articles, and manual content.
 */
export class EmbeddingQueueService {

    /**
     * Add content to the embedding queue
     */
    static async enqueue(
        content: {
            type: 'opportunity' | 'article' | 'manual' | 'scraped';
            text: string;
            title?: string;
            sourceUrl?: string;
            contentId?: string;
            metadata?: Record<string, unknown>;
        },
        supabase: SupabaseClient,
        queuedBy?: string
    ): Promise<{ success: boolean; queueId?: string; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('embedding_queue')
                .insert({
                    content_type: content.type,
                    content_id: content.contentId,
                    content: content.text,
                    title: content.title,
                    source_url: content.sourceUrl,
                    metadata: content.metadata || {},
                    queued_by: queuedBy
                })
                .select('id')
                .single();

            if (error) {
                console.error('[EmbedQueue] Enqueue error:', error);
                return { success: false, error: error.message };
            }

            console.log(`[EmbedQueue] Queued: ${content.title || 'Untitled'}`);
            return { success: true, queueId: data.id };

        } catch (error) {
            console.error('[EmbedQueue] Error:', error);
            return { success: false, error: 'Unknown error' };
        }
    }

    /**
     * Process pending items in the queue
     * Called by CRON job or background worker
     */
    static async processQueue(
        supabase: SupabaseClient,
        batchSize: number = 10
    ): Promise<{ processed: number; failed: number }> {
        let processed = 0;
        let failed = 0;

        try {
            // Get pending items
            const { data: items, error } = await supabase.rpc('get_pending_embeddings', {
                p_limit: batchSize
            });

            if (error) {
                console.error('[EmbedQueue] Fetch error:', error);
                return { processed: 0, failed: 0 };
            }

            if (!items || items.length === 0) {
                console.log('[EmbedQueue] No pending items');
                return { processed: 0, failed: 0 };
            }

            console.log(`[EmbedQueue] Processing ${items.length} items...`);

            for (const item of items as QueueItem[]) {
                try {
                    // Generate embedding
                    const embedding = await EmbeddingService.embed(item.content);

                    if (!embedding) {
                        throw new Error('Failed to generate embedding');
                    }

                    // Store in knowledge_chunks
                    // First, create a source if needed
                    let sourceId: string;

                    const { data: existingSource } = await supabase
                        .from('knowledge_sources')
                        .select('id')
                        .eq('title', item.title || 'Auto-embedded Content')
                        .eq('source_type', item.content_type)
                        .single();

                    if (existingSource) {
                        sourceId = existingSource.id;
                    } else {
                        const { data: newSource, error: sourceError } = await supabase
                            .from('knowledge_sources')
                            .insert({
                                title: item.title || 'Auto-embedded Content',
                                source_type: item.content_type,
                                url: item.source_url,
                                is_processed: true,
                                chunk_count: 1
                            })
                            .select('id')
                            .single();

                        if (sourceError || !newSource) {
                            throw new Error('Failed to create source');
                        }
                        sourceId = newSource.id;
                    }

                    // Store the chunk
                    const { error: chunkError } = await supabase
                        .from('knowledge_chunks')
                        .insert({
                            source_id: sourceId,
                            content: item.content,
                            chunk_index: 0,
                            embedding,
                            metadata: item.metadata
                        });

                    if (chunkError) {
                        throw new Error(`Chunk insert failed: ${chunkError.message}`);
                    }

                    // Mark as completed
                    await supabase.rpc('complete_embedding', {
                        p_queue_id: item.id,
                        p_success: true
                    });

                    processed++;
                    console.log(`[EmbedQueue] ✓ Processed: ${item.title}`);

                } catch (itemError) {
                    // Mark as failed
                    await supabase.rpc('complete_embedding', {
                        p_queue_id: item.id,
                        p_success: false,
                        p_error: itemError instanceof Error ? itemError.message : 'Unknown error'
                    });

                    failed++;
                    console.error(`[EmbedQueue] ✗ Failed: ${item.title}`, itemError);
                }
            }

            console.log(`[EmbedQueue] Complete: ${processed} processed, ${failed} failed`);
            return { processed, failed };

        } catch (error) {
            console.error('[EmbedQueue] Process error:', error);
            return { processed, failed };
        }
    }

    /**
     * Get queue statistics
     */
    static async getStats(supabase: SupabaseClient): Promise<{
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    }> {
        try {
            const { data, error } = await supabase
                .from('embedding_queue')
                .select('status');

            if (error) {
                console.error('[EmbedQueue] Stats error:', error);
                return { pending: 0, processing: 0, completed: 0, failed: 0 };
            }

            const stats = { pending: 0, processing: 0, completed: 0, failed: 0 };
            for (const row of data || []) {
                stats[row.status as keyof typeof stats]++;
            }

            return stats;

        } catch (error) {
            console.error('[EmbedQueue] Error:', error);
            return { pending: 0, processing: 0, completed: 0, failed: 0 };
        }
    }
}
