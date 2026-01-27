import { SupabaseClient } from '@supabase/supabase-js';

export interface TrustLevel {
    trustScore: number;
    canAutoPublish: boolean;
}

const AUTO_PUBLISH_THRESHOLD = 50;

export class TrustService {
    static async getTrustLevel(studentId: string, supabase: SupabaseClient): Promise<TrustLevel> {
        const { data } = await supabase
            .from('student_trust_levels')
            .select('trust_score, auto_publish')
            .eq('student_id', studentId)
            .single();

        if (!data) {
            return { trustScore: 0, canAutoPublish: false };
        }

        return {
            trustScore: data.trust_score,
            canAutoPublish: data.auto_publish,
        };
    }

    static async adjustTrustScore(
        studentId: string,
        delta: number,
        reason: string,
        supabase: SupabaseClient
    ): Promise<TrustLevel> {
        // Get current score
        const { data: current } = await supabase
            .from('student_trust_levels')
            .select('trust_score')
            .eq('student_id', studentId)
            .single();

        const currentScore = current?.trust_score ?? 0;
        const newScore = Math.max(0, Math.min(100, currentScore + delta));

        // Upsert the new score
        await supabase
            .from('student_trust_levels')
            .upsert({
                student_id: studentId,
                trust_score: newScore,
                auto_publish: newScore >= AUTO_PUBLISH_THRESHOLD,
            }, { onConflict: 'student_id' });

        return {
            trustScore: newScore,
            canAutoPublish: newScore >= AUTO_PUBLISH_THRESHOLD,
        };
    }

    static async awardPoints(
        studentId: string,
        action: 'content_approved' | 'teacher_endorsed' | 'peer_feedback',
        supabase: SupabaseClient
    ): Promise<TrustLevel> {
        const pointsMap = {
            content_approved: 5,
            teacher_endorsed: 10,
            peer_feedback: 2,
        };
        return this.adjustTrustScore(studentId, pointsMap[action], action, supabase);
    }

    static async penalize(
        studentId: string,
        supabase: SupabaseClient
    ): Promise<TrustLevel> {
        return this.adjustTrustScore(studentId, -20, 'content_flagged', supabase);
    }
}
