import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch student's saved opportunities
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: saved, error } = await supabase
            .from('student_opportunities')
            .select(`
                *,
                opportunity:opportunities(*)
            `)
            .eq('student_id', user.id)
            .order('saved_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ saved: saved || [] });
    } catch (error) {
        console.error('Fetch saved opportunities error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved opportunities' },
            { status: 500 }
        );
    }
}

// POST - Save an opportunity
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { opportunityId, projectPlan } = await request.json();

        const { data, error } = await supabase
            .from('student_opportunities')
            .insert({
                student_id: user.id,
                opportunity_id: opportunityId,
                project_plan: projectPlan || null,
                status: 'saved'
            })
            .select()
            .single();

        if (error) {
            // Handle duplicate save
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Opportunity already saved' },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ saved: data });
    } catch (error) {
        console.error('Save opportunity error:', error);
        return NextResponse.json(
            { error: 'Failed to save opportunity' },
            { status: 500 }
        );
    }
}

// PATCH - Update saved opportunity status
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status, notes, submissionUrl } = await request.json();

        const updateData: any = { status };
        if (notes !== undefined) updateData.notes = notes;
        if (submissionUrl !== undefined) updateData.submission_url = submissionUrl;

        // Set timestamps based on status
        if (status === 'applied' && !updateData.applied_at) {
            updateData.applied_at = new Date().toISOString();
        }
        if (status === 'awarded' && !updateData.completed_at) {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('student_opportunities')
            .update(updateData)
            .eq('id', id)
            .eq('student_id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ saved: data });
    } catch (error) {
        console.error('Update saved opportunity error:', error);
        return NextResponse.json(
            { error: 'Failed to update opportunity' },
            { status: 500 }
        );
    }
}

// DELETE - Remove saved opportunity
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('student_opportunities')
            .delete()
            .eq('id', id)
            .eq('student_id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete saved opportunity error:', error);
        return NextResponse.json(
            { error: 'Failed to delete opportunity' },
            { status: 500 }
        );
    }
}
