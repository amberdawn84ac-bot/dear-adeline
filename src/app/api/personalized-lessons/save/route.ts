import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            subject,
            difficulty_level,
            content,
            generated_from_interests
        } = body;

        // Basic Validation
        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('personalized_lessons')
            .insert({
                student_id: user.id,
                title,
                description,
                subject,
                difficulty_level,
                content,
                generated_from_interests,
                status: 'draft'
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving personalized lesson:', error);
            return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in personalized-lessons/save:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
