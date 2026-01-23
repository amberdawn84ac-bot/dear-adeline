import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: assessment, error } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching assessment:', error);
        return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
    }

    return NextResponse.json({ assessment });
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Upsert (insert or update if exists)
    // Clear blueprint when assessment changes to force regeneration
    const { data: assessment, error } = await supabase
        .from('career_assessments')
        .upsert({
            student_id: user.id,
            ...body,
            blueprint: null,
            blueprint_generated_at: null,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving assessment:', error);
        return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    return NextResponse.json({ assessment });
}
