import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateStructuredLesson } from '@/services/lessonGenerator';

interface MissionUpdates {
    updated_at: string;
    status?: string;
    progress_percentage?: number;
    action_plan?: string;
    evidence_submissions?: string;
    started_at?: string;
    completed_at?: string;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { topic, conversation_context, suggested_track, is_student_initiated, deadline, proposal_data } = body;

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
        // If student initiated, we treat the topic as their proposal
        const context = is_student_initiated
            ? `Student Proposal: ${topic}. Context: ${conversation_context || 'None'}. Please structure this student idea into a formal project.`
            : conversation_context || '';

        const missionData = await generateStructuredLesson(
            topic,
            profile?.grade_level || '9',
            interests,
            context,
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
                is_student_initiated: is_student_initiated || false,
                student_proposal_data: proposal_data || {},
                deadline: deadline || null,
                submission_status: is_student_initiated ? 'submitted' : 'draft', // Submitted for approval if student initiated
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

        // ALSO create a portfolio item so it shows in the portfolio page
        const { error: portfolioError } = await supabase
            .from('portfolio_items')
            .insert({
                student_id: user.id,
                title: topic,
                description: conversation_context || `Learning mission: ${topic}`,
                type: 'lesson',
                content: `Mission: ${topic}\nTrack: ${suggested_track || 'General'}\n\n${conversation_context || ''}`,
                created_at: new Date().toISOString(),
            });

        if (portfolioError) {
            console.warn('Failed to add mission to portfolio (mission still saved):', portfolioError);
        }

        return NextResponse.json({ mission: savedMission });

    } catch (error: unknown) {
        console.error('Mission generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to generate mission' },
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

    } catch (error: unknown) {
        console.error('Mission fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to fetch missions' },
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

        const updates: MissionUpdates = { updated_at: new Date().toISOString() };

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

    } catch (error: unknown) {
        console.error('Mission update error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to update mission' },
            { status: 500 }
        );
    }
}
