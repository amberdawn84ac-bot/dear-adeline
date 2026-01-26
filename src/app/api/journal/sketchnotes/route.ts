import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/journal/sketchnotes?entry_id=xxx
 * Get sketchnotes attached to a journal entry
 */
export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get('entry_id');

    if (!entryId) {
        return NextResponse.json({ error: 'entry_id required' }, { status: 400 });
    }

    // Get sketchnotes for this journal entry
    const { data: attachments, error } = await supabase
        .from('journal_sketchnotes')
        .select(`
            id,
            added_at,
            sketchnote:sketchnotes(*)
        `)
        .eq('journal_entry_id', entryId);

    if (error) {
        console.error('Error fetching journal sketchnotes:', error);
        return NextResponse.json({ error: 'Failed to fetch sketchnotes' }, { status: 500 });
    }

    return NextResponse.json({ attachments });
}

/**
 * POST /api/journal/sketchnotes
 * Attach a sketchnote to a journal entry
 * 
 * Body: { journal_entry_id, sketchnote_id }
 */
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { journal_entry_id, sketchnote_id } = body;

    if (!journal_entry_id || !sketchnote_id) {
        return NextResponse.json({ error: 'journal_entry_id and sketchnote_id required' }, { status: 400 });
    }

    // Verify the journal entry belongs to the user
    const { data: entry } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('id', journal_entry_id)
        .eq('student_id', user.id)
        .single();

    if (!entry) {
        return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 });
    }

    // Attach the sketchnote
    const { data: attachment, error } = await supabase
        .from('journal_sketchnotes')
        .upsert({
            journal_entry_id,
            sketchnote_id
        }, {
            onConflict: 'journal_entry_id,sketchnote_id'
        })
        .select(`
            id,
            added_at,
            sketchnote:sketchnotes(*)
        `)
        .single();

    if (error) {
        console.error('Error attaching sketchnote:', error);
        return NextResponse.json({ error: 'Failed to attach sketchnote' }, { status: 500 });
    }

    return NextResponse.json({ attachment });
}

/**
 * DELETE /api/journal/sketchnotes
 * Remove a sketchnote from a journal entry
 * 
 * Body: { journal_entry_id, sketchnote_id }
 */
export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { journal_entry_id, sketchnote_id } = body;

    if (!journal_entry_id || !sketchnote_id) {
        return NextResponse.json({ error: 'journal_entry_id and sketchnote_id required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('journal_sketchnotes')
        .delete()
        .eq('journal_entry_id', journal_entry_id)
        .eq('sketchnote_id', sketchnote_id);

    if (error) {
        console.error('Error removing sketchnote:', error);
        return NextResponse.json({ error: 'Failed to remove sketchnote' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
