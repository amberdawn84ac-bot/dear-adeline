import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/sketchnotes
 * List available sketchnotes, optionally filtered by topic/subject
 * 
 * Query params:
 *   - topic: filter by topic
 *   - subject: filter by subject
 *   - grade: filter by grade level
 */
export async function GET(req: Request) {
    const supabase = await createClient();

    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');

    let query = supabase
        .from('sketchnotes')
        .select('*')
        .order('created_at', { ascending: false });

    // Apply filters
    if (topic) {
        query = query.ilike('topic', `%${topic}%`);
    }
    if (subject) {
        query = query.ilike('subject', `%${subject}%`);
    }
    if (grade) {
        query = query.contains('grade_levels', [grade]);
    }

    const { data: sketchnotes, error } = await query;

    if (error) {
        console.error('Error fetching sketchnotes:', error);
        return NextResponse.json({ error: 'Failed to fetch sketchnotes' }, { status: 500 });
    }

    return NextResponse.json({ sketchnotes });
}
