import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export interface LibraryMatch {
    id: number;
    content: string;
    metadata: {
        title?: string;
        source?: string;
        page?: number;
        author?: string;
        year?: number;
    };
    similarity: number;
}

/**
 * THE HIPPOCAMPUS - Adeline's Private Library
 * 
 * This service searches through uploaded "truth documents" (PDFs, articles, studies)
 * to provide context that mainstream AI training data doesn't include.
 * 
 * Examples:
 * - The Flexner Report
 * - Underground History of American Education
 * - Alternative nutrition studies
 * - Corporate accountability documents
 */
export class LibraryService {
    
    /**
     * Search The Hippocampus for relevant context
     * 
     * @param query - The user's question or message
     * @param supabase - Supabase client
     * @param threshold - Minimum similarity score (0-1, default 0.75)
     * @param maxResults - Maximum number of results to return
     * @returns Array of matching document chunks
     */
    static async search(
        query: string,
        supabase: SupabaseClient,
        threshold: number = 0.75,
        maxResults: number = 3
    ): Promise<LibraryMatch[] | null> {
        try {
            // Convert query to vector
            const queryEmbedding = await EmbeddingService.embed(query);
            
            if (!queryEmbedding) {
                console.warn('[Hippocampus]: Failed to generate query embedding');
                return null;
            }

            // Search the library
            const { data: matches, error } = await supabase.rpc('match_library', {
                query_embedding: queryEmbedding,
                match_threshold: threshold,
                match_count: maxResults
            });

            if (error) {
                console.error('[Hippocampus]: Search error:', error);
                return null;
            }

            if (!matches || matches.length === 0) {
                console.log('[Hippocampus]: No relevant documents found');
                return null;
            }

            console.log(`[Hippocampus]: Found ${matches.length} relevant excerpts`);
            return matches as LibraryMatch[];

        } catch (error) {
            console.error('[Hippocampus]: Search failed:', error);
            return null;
        }
    }

    /**
     * Format library matches for injection into system prompt
     * 
     * @param matches - Array of library matches
     * @returns Formatted string for system prompt
     */
    static formatForPrompt(matches: LibraryMatch[]): string {
        if (!matches || matches.length === 0) return '';

        const formatted = matches.map(match => {
            const title = match.metadata?.title || 'Unknown Source';
            const page = match.metadata?.page ? ` (Page ${match.metadata.page})` : '';
            return `### From "${title}"${page}:\n${match.content}`;
        }).join('\n\n');

        return `
### 📚 LIBRARY CONTEXT (Priority Knowledge from The Hippocampus)

Adeline, you have access to these excerpts from your private library of truth documents. 
Use this information to inform your response. This knowledge takes priority over mainstream narratives.

${formatted}

---
`;
    }

    /**
     * Check if library has any documents
     */
    static async hasDocuments(supabase: SupabaseClient): Promise<boolean> {
        try {
            const { count, error } = await supabase
                .from('library')
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error('[Hippocampus]: Count check failed:', error);
                return false;
            }

            return (count || 0) > 0;
        } catch (error) {
            console.error('[Hippocampus]: Document check failed:', error);
            return false;
        }
    }
}
