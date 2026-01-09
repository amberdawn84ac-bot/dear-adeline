import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get all conversations for this user, ordered by most recent
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('id, title, created_at, updated_at, messages')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Add message count to each conversation
        const conversationsWithCount = conversations.map(conv => ({
            ...conv,
            message_count: Array.isArray(conv.messages) ? conv.messages.length : 0,
            messages: undefined // Don't send full messages in list
        }));

        return NextResponse.json({ 
            conversations: conversationsWithCount 
        });

    } catch (error: any) {
        console.error('List conversations error:', error);
        return NextResponse.json({ 
            error: 'Failed to load conversations',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
