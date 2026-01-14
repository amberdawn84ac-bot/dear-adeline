import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ActivityTranslationService } from '@/lib/services/activityTranslationService';
import { MasteryService } from '@/lib/services/masteryService';

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

        // 1. Get Student Context (Grade Level)
        const { data: profile } = await supabase
            .from('profiles')
            .select('grade_level')
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

        return NextResponse.json({ 
            success: true, 
            log,
            analysis: aiAnalysis,
            mastery: masteryResults
        });

    } catch (error: unknown) {
        console.error('Activity translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}