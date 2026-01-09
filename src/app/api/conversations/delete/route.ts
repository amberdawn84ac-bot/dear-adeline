import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
    try {
        const { conversationId, userId } = await req.json();

        if (!conversationId || !userId) {
            return NextResponse.json({ 
                error: 'Conversation ID and User ID required' 
            }, { status: 400 });
        }

        // Delete conversation (only if it belongs to this user)
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ 
            success: true 
        });

    } catch (error: any) {
        console.error('Delete conversation error:', error);
        return NextResponse.json({ 
            error: 'Failed to delete conversation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
