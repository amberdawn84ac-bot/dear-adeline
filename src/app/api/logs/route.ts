import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('student_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ logs: data });

    } catch (error: unknown) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { student_id, caption, translation, skills, grade } = await req.json();

        if (!student_id || !caption || !translation) {
            return NextResponse.json({
                error: 'student_id, caption, and translation are required'
            }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('activity_logs')
            .insert({
                student_id,
                caption,
                translation,
                skills,
                grade,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Database Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ log: data });

    } catch (error: unknown) {
        console.error('API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
    }
}
