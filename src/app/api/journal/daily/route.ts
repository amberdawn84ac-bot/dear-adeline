import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get entry for specific date
    const { data: entry, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('student_id', user.id)
        .eq('entry_date', date)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, which is ok
        console.error('Error fetching journal entry:', error);
        return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
    }

    return NextResponse.json({ entry });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { entry_date, text_notes, learned_today, mood, sketchnote_content } = body;

    // Upsert (create or update)
    const { data: entry, error } = await supabase
        .from('journal_entries')
        .upsert({
            student_id: user.id,
            entry_date: entry_date || new Date().toISOString().split('T')[0],
            text_notes,
            learned_today,
            mood,
            sketchnote_content,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'student_id,entry_date'
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving journal entry:', error);
        return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }

    return NextResponse.json({ entry });
}

// Get all entries for the month (for calendar view)
export async function PUT(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // Format: YYYY-MM

    if (!month) {
        return NextResponse.json({ error: 'Month parameter required' }, { status: 400 });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('entry_date, mood, learned_today')
        .eq('student_id', user.id)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: false });

    if (error) {
        console.error('Error fetching entries:', error);
        return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ entries });
}
