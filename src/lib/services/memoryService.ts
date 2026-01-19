import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export const retrieveSimilarMemories = async (
    prompt: string,
    userId: string,
    supabase: SupabaseClient
) => {
    try {
        const promptEmbedding = await EmbeddingService.embed(prompt);
        if (promptEmbedding && userId) {
            const { data: similarMemories, error: matchError } = await supabase.rpc('match_memories', {
                query_embedding: promptEmbedding,
                match_threshold: 0.5,
                match_count: 5,
                p_student_id: userId
            });

            if (matchError) {
                console.error('Memory Match Error:', matchError);
                return null;
            }

            if (similarMemories && similarMemories.length > 0) {
                console.log(`[Memory]: Injected ${similarMemories.length} memories.`);
                return similarMemories;
            }
        }
        return null;
    } catch (memError) {
        console.error('Memory Retrieval Failed:', memError);
        return null;
    }
};
