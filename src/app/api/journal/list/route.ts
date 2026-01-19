import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const tag = searchParams.get('tag');

        let query = supabase
            .from('spiritual_journal_entries')
            .select('*', { count: 'exact' })
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (tag) {
            query = query.contains('tags', [tag]);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching journal entries:', error);
            return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
        }

        return NextResponse.json({ entries: data || [], total: count || 0 });

    } catch (error: unknown) {
        console.error('Journal list error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to fetch journal entries' },
            { status: 500 }
        );
    }
}
