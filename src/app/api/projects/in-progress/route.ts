import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: projects, error } = await supabase
        .from('projects_in_progress')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const { data: project, error } = await supabase
        .from('projects_in_progress')
        .insert({
            student_id: user.id,
            ...body,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project });
}

export async function PATCH(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await req.json();

    const { data: project, error } = await supabase
        .from('projects_in_progress')
        .update(updates)
        .eq('id', id)
        .eq('student_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    // If marked as completed, create portfolio item
    if (updates.status === 'completed' && !project.portfolio_item_id) {
        const { data: portfolioItem } = await supabase
            .from('portfolio_items')
            .insert({
                student_id: user.id,
                title: project.title,
                description: project.description,
                type: project.type || 'project',
                completion_date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (portfolioItem) {
            // Link project to portfolio item
            await supabase
                .from('projects_in_progress')
                .update({ portfolio_item_id: portfolioItem.id })
                .eq('id', id);
        }
    }

    return NextResponse.json({ project });
}
