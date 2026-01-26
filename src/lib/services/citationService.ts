import { SupabaseClient } from '@supabase/supabase-js';

export interface Citation {
    session_date: string;
    subject: string;
    topic: string;
    source_titles: string[];
    source_types: string[];
}

export interface SourceUsage {
    source_title: string;
    source_type: string;
    usage_count: number;
}

/**
 * CITATION TRACKING SERVICE
 * 
 * Tracks which sources informed each lesson.
 * Provides visibility for parents/teachers without
 * disrupting the student experience.
 */
export class CitationService {

    /**
     * Record sources used in a conversation
     * Called automatically by chat API when RAG context is used
     */
    static async recordCitation(
        studentId: string,
        data: {
            conversationId?: string;
            subject?: string;
            topic?: string;
            sources: Array<{
                id: string;
                type: string;
                title: string;
            }>;
            queryText?: string;
        },
        supabase: SupabaseClient
    ): Promise<boolean> {
        try {
            if (!data.sources || data.sources.length === 0) {
                return true; // Nothing to record
            }

            const { error } = await supabase
                .from('lesson_citations')
                .insert({
                    student_id: studentId,
                    conversation_id: data.conversationId,
                    subject: data.subject || 'general',
                    topic: data.topic,
                    source_ids: data.sources.map(s => s.id),
                    source_types: data.sources.map(s => s.type),
                    source_titles: data.sources.map(s => s.title),
                    query_text: data.queryText
                });

            if (error) {
                console.error('[Citations] Failed to record:', error);
                return false;
            }

            console.log(`[Citations] Recorded ${data.sources.length} sources for student`);
            return true;

        } catch (error) {
            console.error('[Citations] Record error:', error);
            return false;
        }
    }

    /**
     * Get citations for a student (for parent/teacher view)
     */
    static async getStudentCitations(
        studentId: string,
        supabase: SupabaseClient,
        options: {
            startDate?: string;
            endDate?: string;
            subject?: string;
        } = {}
    ): Promise<Citation[]> {
        try {
            const { data, error } = await supabase.rpc('get_student_citations', {
                p_student_id: studentId,
                p_start_date: options.startDate || null,
                p_end_date: options.endDate || null,
                p_subject: options.subject || null
            });

            if (error) {
                console.error('[Citations] Fetch error:', error);
                return [];
            }

            return data as Citation[];

        } catch (error) {
            console.error('[Citations] Error:', error);
            return [];
        }
    }

    /**
     * Get most-used sources for a student
     */
    static async getTopSources(
        studentId: string,
        supabase: SupabaseClient,
        limit: number = 20
    ): Promise<SourceUsage[]> {
        try {
            const { data, error } = await supabase.rpc('get_source_usage', {
                p_student_id: studentId,
                p_limit: limit
            });

            if (error) {
                console.error('[Citations] Source usage error:', error);
                return [];
            }

            return data as SourceUsage[];

        } catch (error) {
            console.error('[Citations] Error:', error);
            return [];
        }
    }

    /**
     * Get citation summary by subject
     */
    static async getCitationsBySubject(
        studentId: string,
        supabase: SupabaseClient
    ): Promise<Record<string, { count: number; sources: string[] }>> {
        try {
            const { data, error } = await supabase
                .from('lesson_citations')
                .select('subject, source_titles')
                .eq('student_id', studentId);

            if (error) {
                console.error('[Citations] Subject summary error:', error);
                return {};
            }

            // Aggregate by subject
            const bySubject: Record<string, { count: number; sources: Set<string> }> = {};

            for (const row of data || []) {
                const subject = row.subject || 'general';
                if (!bySubject[subject]) {
                    bySubject[subject] = { count: 0, sources: new Set() };
                }
                bySubject[subject].count++;
                for (const title of row.source_titles || []) {
                    bySubject[subject].sources.add(title);
                }
            }

            // Convert sets to arrays
            const result: Record<string, { count: number; sources: string[] }> = {};
            for (const [subject, data] of Object.entries(bySubject)) {
                result[subject] = {
                    count: data.count,
                    sources: Array.from(data.sources)
                };
            }

            return result;

        } catch (error) {
            console.error('[Citations] Error:', error);
            return {};
        }
    }

    /**
     * Format citations for display
     */
    static formatForDisplay(citations: Citation[]): string {
        if (!citations || citations.length === 0) {
            return 'No citations recorded yet.';
        }

        let output = '## Learning Sources\n\n';

        // Group by date
        const byDate: Record<string, Citation[]> = {};
        for (const c of citations) {
            const date = c.session_date;
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(c);
        }

        for (const [date, dateCitations] of Object.entries(byDate)) {
            output += `### ${date}\n\n`;

            for (const c of dateCitations) {
                output += `**${c.subject}${c.topic ? `: ${c.topic}` : ''}**\n`;
                output += `Sources: ${c.source_titles.join(', ')}\n\n`;
            }
        }

        return output;
    }
}
