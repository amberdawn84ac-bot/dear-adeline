import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateStructuredLesson } from '@/services/lessonGenerator';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { topic, conversation_context, suggested_track } = body;

        if (!topic) {
            return NextResponse.json(
                { error: 'Missing required field: topic' },
                { status: 400 }
            );
        }

        // Get student profile for context
        const { data: profile } = await supabase
            .from('profiles')
            .select('grade_level, display_name')
            .eq('id', user.id)
            .single();

        // Get student interests from about_me if available
        const { data: aboutMe } = await supabase
            .from('student_profiles_extended')
            .select('favorite_subjects, hobbies')
            .eq('student_id', user.id)
            .single();

        const interests = [
            ...(aboutMe?.favorite_subjects || []),
            ...(aboutMe?.hobbies || [])
        ];

        // Generate the mission using AI
        const missionData = await generateStructuredLesson(
            topic,
            profile?.grade_level || '9',
            interests,
            conversation_context || '',
            suggested_track
        );

        // Save to database
        const { data: savedMission, error: saveError } = await supabase
            .from('academic_missions')
            .insert({
                student_id: user.id,
                ...missionData,
                status: 'proposed',
                progress_percentage: 0,
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving mission:', saveError);
            return NextResponse.json(
                { error: 'Failed to save mission' },
                { status: 500 }
            );
        }

        return NextResponse.json({ mission: savedMission });

    } catch (error: any) {
        console.error('Mission generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate mission' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('academic_missions')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: missions, error } = await query;

        if (error) {
            console.error('Error fetching missions:', error);
            return NextResponse.json(
                { error: 'Failed to fetch missions' },
                { status: 500 }
            );
        }

        return NextResponse.json({ missions });

    } catch (error: any) {
        console.error('Mission fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch missions' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { mission_id, status, progress_percentage, action_plan, evidence_submissions } = body;

        if (!mission_id) {
            return NextResponse.json(
                { error: 'Missing required field: mission_id' },
                { status: 400 }
            );
        }

        const updates: any = { updated_at: new Date().toISOString() };

        if (status) updates.status = status;
        if (progress_percentage !== undefined) updates.progress_percentage = progress_percentage;
        if (action_plan) updates.action_plan = action_plan;
        if (evidence_submissions) updates.evidence_submissions = evidence_submissions;

        if (status === 'active' && !updates.started_at) {
            updates.started_at = new Date().toISOString();
        }
        if (status === 'completed' && !updates.completed_at) {
            updates.completed_at = new Date().toISOString();
        }

        const { data: updatedMission, error } = await supabase
            .from('academic_missions')
            .update(updates)
            .eq('id', mission_id)
            .eq('student_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating mission:', error);
            return NextResponse.json(
                { error: 'Failed to update mission' },
                { status: 500 }
            );
        }

        return NextResponse.json({ mission: updatedMission });

    } catch (error: any) {
        console.error('Mission update error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update mission' },
            { status: 500 }
        );
    }
}
