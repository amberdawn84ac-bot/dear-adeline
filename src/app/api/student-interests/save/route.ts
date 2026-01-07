import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { interests } = await request.json();

        if (!Array.isArray(interests)) {
            return NextResponse.json({ error: 'Interests must be an array.' }, { status: 400 });
        }

        // First, delete all existing interests for the user
        const { error: deleteError } = await supabase
            .from('student_interests')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Error deleting student interests:', deleteError);
            return NextResponse.json({ error: 'Failed to update interests' }, { status: 500 });
        }

        // Then, insert the new interests
        if (interests.length > 0) {
            const interestsToInsert = interests.map(interest => ({
                user_id: user.id,
                interest,
            }));

            const { error: insertError } = await supabase
                .from('student_interests')
                .insert(interestsToInsert);

            if (insertError) {
                console.error('Error saving student interests:', insertError);
                return NextResponse.json({ error: 'Failed to save interests' }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in student-interests/save:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
