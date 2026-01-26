import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { opportunityId } = await request.json();

        if (!opportunityId) {
            return NextResponse.json({ error: 'Opportunity ID is required.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('saved_opportunities')
            .insert({ student_id: user.id, opportunity_id: opportunityId })
            .select()
            .single();

        if (error) {
            console.error('Error saving opportunity:', error);
            return NextResponse.json({ error: 'Failed to save opportunity.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in /api/opportunities/saved POST:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(_request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('saved_opportunities')
            .select(`
                *,
                opportunity:opportunities(*)
            `)
            .eq('student_id', user.id);

        if (error) {
            console.error('Error fetching saved opportunities:', error);
            return NextResponse.json({ error: 'Failed to fetch saved opportunities.' }, { status: 500 });
        }

        return NextResponse.json({ saved: data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in /api/opportunities/saved GET:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, status, checklist } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (checklist) updateData.checklist = checklist;

        const { data, error } = await supabase
            .from('saved_opportunities')
            .update(updateData)
            .eq('id', id)
            .eq('student_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating saved opportunity:', error);
            return NextResponse.json({ error: 'Failed to update opportunity.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in /api/opportunities/saved PUT:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}