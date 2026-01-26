import { SupabaseClient } from '@supabase/supabase-js';
import { EmbeddingService } from '@/lib/embeddingService';

export interface Philosophy {
    id: string;
    category: string;
    topic: string | null;
    guideline: string;
    priority: string;
    examples: string[];
    do_say: string[];
    dont_say: string[];
    similarity?: number;
}

/**
 * ADELINE'S SOUL - Teaching Philosophy Service
 * 
 * This service manages Adeline's teaching philosophy - the principles
 * that guide HOW she teaches, not just WHAT she teaches.
 * 
 * Core philosophy is always injected. Topic-specific philosophy is
 * retrieved via semantic search based on the conversation.
 */
export class PhilosophyService {

    /**
     * Get core philosophy - always injected into every conversation
     * These are Adeline's fundamental identity and approach
     */
    static async getCorePhilosophy(supabase: SupabaseClient): Promise<Philosophy[]> {
        try {
            const { data, error } = await supabase.rpc('get_core_philosophy');

            if (error) {
                console.error('[Philosophy] Error getting core philosophy:', error);
                return [];
            }

            return data as Philosophy[];
        } catch (error) {
            console.error('[Philosophy] Failed to get core philosophy:', error);
            return [];
        }
    }

    /**
     * Get relevant philosophy based on the current conversation
     * Uses semantic search to find applicable guidelines
     */
    static async getRelevantPhilosophy(
        query: string,
        supabase: SupabaseClient,
        threshold: number = 0.7,
        maxResults: number = 5
    ): Promise<Philosophy[]> {
        try {
            // Generate embedding for the query
            const queryEmbedding = await EmbeddingService.embed(query);

            if (!queryEmbedding) {
                console.warn('[Philosophy] Failed to embed query');
                return [];
            }

            // Search for relevant philosophy
            const { data, error } = await supabase.rpc('match_philosophy', {
                query_embedding: queryEmbedding,
                match_threshold: threshold,
                match_count: maxResults
            });

            if (error) {
                console.error('[Philosophy] Search error:', error);
                return [];
            }

            if (!data || data.length === 0) {
                console.log('[Philosophy] No relevant philosophy found');
                return [];
            }

            console.log(`[Philosophy] Found ${data.length} relevant guidelines`);
            return data as Philosophy[];

        } catch (error) {
            console.error('[Philosophy] Failed to search philosophy:', error);
            return [];
        }
    }

    /**
     * Format philosophy for injection into system prompt
     * Combines core and topic-specific philosophy
     */
    static formatForPrompt(core: Philosophy[], relevant: Philosophy[]): string {
        if (core.length === 0 && relevant.length === 0) {
            return '';
        }

        let formatted = '\n### 🌱 TEACHING PHILOSOPHY (Adeline\'s Soul)\n\n';

        // Core philosophy first
        if (core.length > 0) {
            formatted += '**Core Identity & Approach:**\n';
            for (const p of core) {
                formatted += `\n**${p.category}${p.topic ? ` - ${p.topic}` : ''}**\n`;
                formatted += `${p.guideline}\n`;

                if (p.do_say && p.do_say.length > 0) {
                    formatted += `✅ DO: ${p.do_say.join(', ')}\n`;
                }
                if (p.dont_say && p.dont_say.length > 0) {
                    formatted += `❌ AVOID: ${p.dont_say.join(', ')}\n`;
                }
            }
            formatted += '\n---\n';
        }

        // Relevant topic-specific philosophy
        if (relevant.length > 0) {
            formatted += '\n**Relevant Guidelines for This Conversation:**\n';
            for (const p of relevant) {
                formatted += `\n**${p.category}${p.topic ? ` - ${p.topic}` : ''}** (relevance: ${Math.round((p.similarity || 0) * 100)}%)\n`;
                formatted += `${p.guideline}\n`;

                if (p.examples && p.examples.length > 0) {
                    formatted += `Examples: ${p.examples.slice(0, 2).join('; ')}\n`;
                }
                if (p.do_say && p.do_say.length > 0) {
                    formatted += `✅ DO: ${p.do_say.join(', ')}\n`;
                }
                if (p.dont_say && p.dont_say.length > 0) {
                    formatted += `❌ AVOID: ${p.dont_say.join(', ')}\n`;
                }
            }
        }

        formatted += '\n---\n';
        return formatted;
    }

    /**
     * Get all philosophy for a conversation - combines core + relevant
     */
    static async getPhilosophyForConversation(
        query: string,
        supabase: SupabaseClient
    ): Promise<{ core: Philosophy[]; relevant: Philosophy[]; formatted: string }> {
        // Get both in parallel
        const [core, relevant] = await Promise.all([
            this.getCorePhilosophy(supabase),
            this.getRelevantPhilosophy(query, supabase)
        ]);

        // Filter out duplicates (in case core items also match semantically)
        const coreIds = new Set(core.map(p => p.id));
        const uniqueRelevant = relevant.filter(p => !coreIds.has(p.id));

        return {
            core,
            relevant: uniqueRelevant,
            formatted: this.formatForPrompt(core, uniqueRelevant)
        };
    }

    /**
     * Add a new philosophy entry (admin only)
     */
    static async addPhilosophy(
        philosophy: Omit<Philosophy, 'id' | 'similarity'>,
        supabase: SupabaseClient
    ): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            // Generate embedding for the guideline
            const embedding = await EmbeddingService.embed(
                `${philosophy.category} ${philosophy.topic || ''} ${philosophy.guideline}`
            );

            if (!embedding) {
                return { success: false, error: 'Failed to generate embedding' };
            }

            const { data, error } = await supabase
                .from('teaching_philosophy')
                .insert({
                    ...philosophy,
                    embedding
                })
                .select('id')
                .single();

            if (error) {
                console.error('[Philosophy] Insert error:', error);
                return { success: false, error: error.message };
            }

            return { success: true, id: data.id };

        } catch (error) {
            console.error('[Philosophy] Failed to add philosophy:', error);
            return { success: false, error: 'Unknown error' };
        }
    }
}
