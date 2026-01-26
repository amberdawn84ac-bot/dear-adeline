import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ActivityTranslationService } from '@/lib/services/activityTranslationService';
import { MasteryService } from '@/lib/services/masteryService';
import { LearningGapService } from '@/lib/services/learningGapService';
import { ActivitySuggestionService } from '@/lib/services/activitySuggestionService';
import { ActivityToStandardsMapper } from '@/lib/services/activityToStandardsMapper';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { caption, student_id } = await request.json();
        const targetStudentId = student_id || user.id;

        if (!caption) {
            return NextResponse.json({ error: 'Activity description (caption) is required' }, { status: 400 });
        }

        // 1. Get Student Context (Grade Level & Standards)
        const { data: profile } = await supabase
            .from('profiles')
            .select('grade_level, state_standards')
            .eq('id', targetStudentId)
            .single();

        // 2. Translate Activity using AI
        const aiAnalysis = await ActivityTranslationService.translate(caption, profile?.grade_level);

        // 3. Process Skills for Mastery
        const masteryResults = await MasteryService.processSkills(
            targetStudentId,
            aiAnalysis.skills,
            supabase
        );

        // 3.5. Resolve Learning Gaps
        const resolvedGaps = await LearningGapService.resolveGaps(
            targetStudentId,
            aiAnalysis.skills,
            supabase
        );

        // 3.6. Get Suggestions for Remaining Gaps
        const suggestions = await ActivitySuggestionService.getSuggestionsForRemainingGaps(
            targetStudentId,
            supabase
        );

        // 4. Log the Activity
        const { data: log, error: dbError } = await supabase
            .from('activity_logs')
            .insert({
                student_id: targetStudentId,
                caption: caption,
                translation: aiAnalysis.translation,
                skills: aiAnalysis.skills.join(', '),
                grade: aiAnalysis.grade,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database Error:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        // 4.5. Log to Credit Ledger (Life Translated into Credits)
        // We log a small credit amount for every verified activity
        const creditAmount = 0.05;
        const { error: ledgerError } = await supabase.from('credit_ledger').insert({
            student_id: targetStudentId,
            amount: creditAmount,
            credit_category: aiAnalysis.skills[0] || 'General',
            source_type: 'life_experience',
            source_details: {
                activity_log_id: log.id,
                description: caption,
                translation: aiAnalysis,
                skills: aiAnalysis.skills
            },
            verification_status: 'verified' // Auto-verified by AI
        });

        if (ledgerError) console.error('Error logging to credit ledger:', ledgerError);

        // 5. Map Activity to State Standards (optional, can be enabled via feature flag)
        let standardsProgress = [];
        if (profile?.state_standards && profile?.grade_level && log?.id) {
            try {
                standardsProgress = await ActivityToStandardsMapper.autoLinkActivityToStandards(
                    targetStudentId,
                    log.id,
                    caption,
                    aiAnalysis,
                    profile.state_standards,
                    profile.grade_level,
                    supabase,
                    'medium' // Only link medium+ confidence standards
                );
            } catch (error) {
                console.error('Error linking to standards:', error);
                // Don't fail the request if standards mapping fails
            }
        }

        return NextResponse.json({
            success: true,
            log,
            analysis: aiAnalysis,
            mastery: masteryResults,
            resolvedGaps,
            suggestions,
            standardsProgress: standardsProgress.map(s => ({
                code: s.standard_code,
                subject: s.subject,
                statement: s.statement_text
            }))
        });

    } catch (error: unknown) {
        console.error('Activity translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}