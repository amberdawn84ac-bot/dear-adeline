import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { suggestion } = await request.json();

        if (!suggestion || suggestion.trim().length === 0) {
            return NextResponse.json({ error: 'Suggestion is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('textbook_suggestions')
            .insert({
                student_id: user.id,
                suggestion: suggestion.trim(),
                status: 'pending' // pending, approved, rejected
            })
            .select()
            .single();

        if (error) {
            console.error('Database Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: unknown) {
        console.error('Suggestion error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
