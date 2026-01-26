import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export interface UnifiedSearchResult {
    id: string;
    content: string;
    source_type: 'philosophy' | 'library' | 'pdf' | 'article' | 'textbook' | 'scraped' | 'manual' | 'memory';
    source_title: string;
    priority_weight: number;
    metadata: Record<string, unknown>;
    similarity: number;
    weighted_score: number;
}

export interface FormattedContext {
    philosophy: string;
    knowledge: string;
    memories: string;
    full: string;
}

/**
 * UNIFIED RAG SERVICE
 * 
 * Single entry point for all knowledge retrieval.
 * Combines and ranks results from:
 * - Teaching Philosophy (Adeline's soul)
 * - Library (truth documents)
 * - Knowledge chunks (PDFs, articles)
 * - Student memories (personal context)
 */
export class UnifiedRAGService {

    /**
     * Search all knowledge sources with a single query
     */
    static async search(
        query: string,
        supabase: SupabaseClient,
        options: {
            studentId?: string;
            threshold?: number;
            maxResults?: number;
            includePhilosophy?: boolean;
            includeLibrary?: boolean;
            includeKnowledge?: boolean;
            includeMemories?: boolean;
        } = {}
    ): Promise<UnifiedSearchResult[] | null> {
        try {
            // Generate embedding for query
            const queryEmbedding = await EmbeddingService.embed(query);

            if (!queryEmbedding) {
                console.warn('[UnifiedRAG] Failed to generate query embedding');
                return null;
            }

            // Call unified search function
            const { data, error } = await supabase.rpc('search_all_knowledge', {
                query_embedding: queryEmbedding,
                p_student_id: options.studentId || null,
                match_threshold: options.threshold || 0.65,
                match_count: options.maxResults || 15,
                include_philosophy: options.includePhilosophy !== false,
                include_library: options.includeLibrary !== false,
                include_knowledge: options.includeKnowledge !== false,
                include_memories: options.includeMemories !== false
            });

            if (error) {
                console.error('[UnifiedRAG] Search error:', error);
                return null;
            }

            if (!data || data.length === 0) {
                console.log('[UnifiedRAG] No results found');
                return [];
            }

            console.log(`[UnifiedRAG] Found ${data.length} results across all sources`);
            return data as UnifiedSearchResult[];

        } catch (error) {
            console.error('[UnifiedRAG] Search failed:', error);
            return null;
        }
    }

    /**
     * Format search results for injection into chat prompts
     * Returns organized sections for each source type
     */
    static formatForPrompt(results: UnifiedSearchResult[]): FormattedContext {
        if (!results || results.length === 0) {
            return { philosophy: '', knowledge: '', memories: '', full: '' };
        }

        // Group by source type
        const philosophy = results.filter(r => r.source_type === 'philosophy');
        const knowledge = results.filter(r =>
            ['library', 'pdf', 'article', 'textbook', 'scraped', 'manual'].includes(r.source_type)
        );
        const memories = results.filter(r => r.source_type === 'memory');

        // Format philosophy section
        let philosophyText = '';
        if (philosophy.length > 0) {
            philosophyText = '\n### 🌱 TEACHING PHILOSOPHY\n\n';
            for (const p of philosophy) {
                const meta = p.metadata as Record<string, string[]>;
                philosophyText += `**${p.source_title}**\n${p.content}\n`;
                if (meta?.do_say?.length) {
                    philosophyText += `✅ DO: ${meta.do_say.slice(0, 2).join(', ')}\n`;
                }
                if (meta?.dont_say?.length) {
                    philosophyText += `❌ AVOID: ${meta.dont_say.slice(0, 2).join(', ')}\n`;
                }
                philosophyText += '\n';
            }
        }

        // Format knowledge section
        let knowledgeText = '';
        if (knowledge.length > 0) {
            knowledgeText = '\n### 📚 KNOWLEDGE BASE CONTEXT\n\n';
            knowledgeText += 'Use these excerpts to inform your response:\n\n';
            for (const k of knowledge) {
                const meta = k.metadata as Record<string, unknown>;
                const page = meta?.page ? ` (p. ${meta.page})` : '';
                const relevance = Math.round(k.similarity * 100);
                knowledgeText += `**${k.source_title}${page}** [${relevance}%]\n`;
                knowledgeText += `${k.content.substring(0, 500)}${k.content.length > 500 ? '...' : ''}\n\n`;
            }
        }

        // Format memories section
        let memoriesText = '';
        if (memories.length > 0) {
            memoriesText = '\n### 💭 STUDENT CONTEXT\n\n';
            memoriesText += 'Personal memories relevant to this conversation:\n';
            for (const m of memories) {
                memoriesText += `- ${m.content}\n`;
            }
            memoriesText += '\n';
        }

        // Combine all sections
        const full = philosophyText + knowledgeText + memoriesText;

        return {
            philosophy: philosophyText,
            knowledge: knowledgeText,
            memories: memoriesText,
            full
        };
    }

    /**
     * Get context for a chat conversation
     * Convenience method that searches and formats in one call
     */
    static async getContextForChat(
        query: string,
        studentId: string | undefined,
        supabase: SupabaseClient
    ): Promise<FormattedContext> {
        const results = await this.search(query, supabase, {
            studentId,
            threshold: 0.65,
            maxResults: 12
        });

        if (!results) {
            return { philosophy: '', knowledge: '', memories: '', full: '' };
        }

        return this.formatForPrompt(results);
    }

    /**
     * Get statistics about context sources
     */
    static getContextStats(results: UnifiedSearchResult[]): {
        total: number;
        byType: Record<string, number>;
        avgSimilarity: number;
        topScore: number;
    } {
        if (!results || results.length === 0) {
            return { total: 0, byType: {}, avgSimilarity: 0, topScore: 0 };
        }

        const byType: Record<string, number> = {};
        let totalSimilarity = 0;
        let topScore = 0;

        for (const r of results) {
            byType[r.source_type] = (byType[r.source_type] || 0) + 1;
            totalSimilarity += r.similarity;
            if (r.weighted_score > topScore) topScore = r.weighted_score;
        }

        return {
            total: results.length,
            byType,
            avgSimilarity: totalSimilarity / results.length,
            topScore
        };
    }
}
