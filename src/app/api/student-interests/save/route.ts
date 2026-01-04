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
        const { interests } = body;

        // Validate input (basic)
        if (!interests && !body.hobbies && !body.favorite_subjects && !body.writing_level) {
            // Allow partial updates, but ensure at least something is passed if strict validation is needed.
            // For now, we'll accept upserts that might merge with existing data, 
            // but typically we want specific fields.
        }

        // Prepare the payload, filtering out undefined values to avoid overwriting with null if that's not intended.
        // However, upsert in Supabase replaces the row unless we use specific logic. 
        // Ideally, we should fetch first or use jsonb merging if we want to add to arrays.
        // For this MVP step, we will assume the client sends the full state or we overwrite specific fields.
        // Let's implement a simple upsert for now that updates the provided fields.

        // Construct the update object based on what's in the body matching our schema
        const updates: any = {
            student_id: user.id,
            updated_at: new Date().toISOString(),
        };

        if (body.interests) updates.interests = body.interests;
        if (body.hobbies) updates.hobbies = body.hobbies;
        if (body.favorite_subjects) updates.favorite_subjects = body.favorite_subjects;
        if (body.learning_style) updates.learning_style = body.learning_style;
        if (body.writing_level) updates.writing_level = body.writing_level;
        // Add other fields as needed based on the migration

        const { data, error } = await supabase
            .from('student_interests')
            .upsert(updates, { onConflict: 'student_id' })
            .select()
            .single();

        if (error) {
            console.error('Error saving student interests:', error);
            return NextResponse.json({ error: 'Failed to save interests' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in student-interests/save:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
