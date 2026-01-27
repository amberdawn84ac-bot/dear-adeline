import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DiscussionService } from '@/lib/services/discussionService';
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

        const url = new URL(request.url);
        const filter = url.searchParams.get('filter') as 'all' | 'project' | 'general' | 'assignment' || 'all';

        const { podId } = await params;

        const discussions = await DiscussionService.getPodDiscussions(podId, filter, supabase);
        return NextResponse.json({ discussions });
    } catch (error) {
        console.error('Error fetching discussions:', error);
        return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
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

        const { title, body, projectId } = await request.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        const { podId } = await params;

        // Check trust level
        const trust = await TrustService.getTrustLevel(user.id, supabase);

        if (!trust.canAutoPublish) {
            // Queue for approval
            const discussionId = await DiscussionService.createDiscussion(
                podId,
                user.id,
                title,
                body,
                projectId || null,
                supabase
            );

            if (discussionId) {
                await supabase.from('pending_content').insert({
                    content_type: 'discussion',
                    content_id: discussionId,
                    content_preview: title.slice(0, 100),
                    author_id: user.id,
                    pod_id: podId,
                });
            }

            return NextResponse.json({
                discussionId,
                pending: true,
                message: 'Discussion submitted for review'
            });
        }

        // Auto-publish for trusted users
        const discussionId = await DiscussionService.createDiscussion(
            podId,
            user.id,
            title,
            body,
            projectId || null,
            supabase
        );

        await TrustService.awardPoints(user.id, 'content_approved', supabase);

        return NextResponse.json({ discussionId, pending: false });
    } catch (error) {
        console.error('Error creating discussion:', error);
        return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
    }
}
