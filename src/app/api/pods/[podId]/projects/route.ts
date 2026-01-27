import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CollaborationService } from '@/lib/services/collaborationService';
import { RevisionService } from '@/lib/services/revisionService';
import { TrustService } from '@/lib/services/trustService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ podId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { podId } = await params;

        const projects = await CollaborationService.getPodProjects(podId, supabase);
        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching pod projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ podId: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const { podId } = await params;

        // Check if user is a pod member
        const { data: membership } = await supabase
            .from('pod_members')
            .select('id')
            .eq('pod_id', podId)
            .eq('student_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'Not a pod member' }, { status: 403 });
        }

        const projectId = await CollaborationService.createSharedProject(
            podId,
            title,
            description || '',
            user.id,
            supabase
        );

        if (!projectId) {
            return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
        }

        // Create initial revision
        await RevisionService.createRevision(
            projectId,
            user.id,
            { title, description: description || '' },
            'Project created',
            supabase
        );

        // Award trust points for creating content
        const trust = await TrustService.getTrustLevel(user.id, supabase);
        if (trust.canAutoPublish) {
            await TrustService.awardPoints(user.id, 'content_approved', supabase);
        }

        return NextResponse.json({ projectId });
    } catch (error) {
        console.error('Error creating pod project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
