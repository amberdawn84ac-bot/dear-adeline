import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

        // Fetch recent activity from multiple tables
        // 1. Project creations/updates (from projects)
        const { data: projects } = await supabase
            .from('projects')
            .select('id, title, created_at, updated_at, student_id, profiles!student_id(display_name)')
            .eq('pod_id', podId)
            .order('updated_at', { ascending: false })
            .limit(5);

        // 2. Discussions (from pod_discussions)
        const { data: discussions } = await supabase
            .from('pod_discussions')
            .select('id, title, created_at, author_id, profiles!author_id(display_name)')
            .eq('pod_id', podId)
            .order('created_at', { ascending: false })
            .limit(5);

        // 3. New members (from pod_members)
        const { data: members } = await supabase
            .from('pod_members')
            .select('id, joined_at, student_id, profiles!student_id(display_name)')
            .eq('pod_id', podId)
            .order('joined_at', { ascending: false })
            .limit(5);

        // Normalize and combine
        const activities = [
            ...(projects || []).map(p => {
                const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                return {
                    id: `proj-${p.id}`,
                    type: p.created_at === p.updated_at ? 'project_created' : 'project_updated',
                    actor_name: profile?.display_name || 'Unknown',
                    target_name: p.title,
                    created_at: p.updated_at
                };
            }),
            ...(discussions || []).map(d => {
                const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
                return {
                    id: `disc-${d.id}`,
                    type: 'discussion_created',
                    actor_name: profile?.display_name || 'Unknown',
                    target_name: d.title,
                    created_at: d.created_at
                };
            }),
            ...(members || []).map(m => {
                const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                return {
                    id: `memb-${m.id}`,
                    type: 'member_joined',
                    actor_name: profile?.display_name || 'Unknown',
                    target_name: 'the pod',
                    created_at: m.joined_at
                };
            })
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);

        return NextResponse.json({ activities });
    } catch (error) {
        console.error('Error fetching pod activity:', error);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
