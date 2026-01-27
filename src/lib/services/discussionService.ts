import { SupabaseClient } from '@supabase/supabase-js';

export interface Discussion {
    id: string;
    pod_id: string;
    project_id: string | null;
    title: string;
    body: string;
    author_id: string;
    is_pinned: boolean;
    is_assignment: boolean;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    author?: { display_name: string };
    reply_count?: number;
}

export interface Reply {
    id: string;
    discussion_id: string;
    author_id: string;
    body: string;
    created_at: string;
    updated_at: string;
    author?: { display_name: string };
}

export class DiscussionService {
    static async getPodDiscussions(
        podId: string,
        filter: 'all' | 'project' | 'general' | 'assignment' = 'all',
        supabase: SupabaseClient
    ): Promise<Discussion[]> {
        let query = supabase
            .from('pod_discussions')
            .select(`
        *,
        profiles!author_id (display_name),
        discussion_replies (id)
      `)
            .eq('pod_id', podId)
            .order('is_pinned', { ascending: false })
            .order('updated_at', { ascending: false });

        switch (filter) {
            case 'project':
                query = query.not('project_id', 'is', null);
                break;
            case 'general':
                query = query.is('project_id', null).eq('is_assignment', false);
                break;
            case 'assignment':
                query = query.eq('is_assignment', true);
                break;
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching discussions:', error);
            return [];
        }

        return (data || []).map(d => ({
            ...d,
            author: d.profiles,
            reply_count: d.discussion_replies?.length || 0,
        }));
    }

    static async getDiscussion(discussionId: string, supabase: SupabaseClient): Promise<Discussion | null> {
        const { data, error } = await supabase
            .from('pod_discussions')
            .select(`
        *,
        profiles!author_id (display_name)
      `)
            .eq('id', discussionId)
            .single();

        if (error) {
            console.error('Error fetching discussion:', error);
            return null;
        }

        return { ...data, author: data.profiles };
    }

    static async getReplies(discussionId: string, supabase: SupabaseClient): Promise<Reply[]> {
        const { data, error } = await supabase
            .from('discussion_replies')
            .select(`
        *,
        profiles!author_id (display_name)
      `)
            .eq('discussion_id', discussionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching replies:', error);
            return [];
        }

        return (data || []).map(r => ({ ...r, author: r.profiles }));
    }

    static async createDiscussion(
        podId: string,
        authorId: string,
        title: string,
        body: string,
        projectId: string | null,
        supabase: SupabaseClient
    ): Promise<string | null> {
        const { data, error } = await supabase
            .from('pod_discussions')
            .insert({
                pod_id: podId,
                author_id: authorId,
                title,
                body,
                project_id: projectId,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating discussion:', error);
            return null;
        }

        return data.id;
    }

    static async createReply(
        discussionId: string,
        authorId: string,
        body: string,
        supabase: SupabaseClient
    ): Promise<string | null> {
        const { data, error } = await supabase
            .from('discussion_replies')
            .insert({
                discussion_id: discussionId,
                author_id: authorId,
                body,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating reply:', error);
            return null;
        }

        // Update discussion updated_at
        await supabase
            .from('pod_discussions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', discussionId);

        return data.id;
    }

    static async updateReply(
        replyId: string,
        authorId: string,
        body: string,
        supabase: SupabaseClient
    ): Promise<boolean> {
        // Check if reply is within 15 minutes of creation
        const { data: reply } = await supabase
            .from('discussion_replies')
            .select('created_at, author_id')
            .eq('id', replyId)
            .single();

        if (!reply || reply.author_id !== authorId) {
            return false;
        }

        const createdAt = new Date(reply.created_at);
        const now = new Date();
        const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / 60000;

        if (minutesSinceCreation > 15) {
            return false; // Cannot edit after 15 minutes
        }

        const { error } = await supabase
            .from('discussion_replies')
            .update({ body })
            .eq('id', replyId);

        return !error;
    }
}
