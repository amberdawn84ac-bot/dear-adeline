import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
    req: Request,
    paramsPromise: Promise<{ params: { id: string } }>
) {
    try {
        const { params } = await paramsPromise;
        const conversationId = params.id;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Load full conversation with all messages
        const { data: conversation, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        if (!conversation) {
            return NextResponse.json({ 
                error: 'Conversation not found' 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            conversation 
        });

    } catch (error: any) {
        console.error('Load conversation error:', error);
        return NextResponse.json({ 
            error: 'Failed to load conversation',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
