import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, content, prompt, mood, tags } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('spiritual_journal_entries')
            .insert({
                student_id: user.id,
                title,
                content,
                prompt,
                mood,
                tags: tags || []
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating journal entry:', error);
            return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
        }

        return NextResponse.json({ entry: data });

    } catch (error: unknown) {
        console.error('Journal create error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to create journal entry' },
            { status: 500 }
        );
    }
}
