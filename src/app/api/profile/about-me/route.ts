import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            favoriteColors,
            favoriteSubjects,
            favoriteBook,
            bookThoughts,
            hobbies,
            learningStyle,
            dreamsGoals
        } = body;

        // Upsert extended profile
        const { data: extendedProfile, error: extendedError } = await supabase
            .from('student_profiles_extended')
            .upsert({
                student_id: user.id,
                favorite_colors: favoriteColors || [],
                favorite_subjects: favoriteSubjects || [],
                favorite_book: favoriteBook,
                book_thoughts: bookThoughts,
                hobbies: hobbies || [],
                learning_style: learningStyle,
                dreams_goals: dreamsGoals,
                about_me_completed: true,
                completed_at: new Date().toISOString()
            }, {
                onConflict: 'student_id'
            })
            .select()
            .single();

        if (extendedError) {
            console.error('Error saving extended profile:', extendedError);
            return NextResponse.json({ error: extendedError.message }, { status: 500 });
        }

        // Update main profile completion flag
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ about_me_completed: true })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error updating profile flag:', profileError);
        }

        return NextResponse.json({
            success: true,
            data: extendedProfile
        });

    } catch (error: unknown) {
        console.error('About Me save error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: extendedProfile, error } = await supabase
            .from('student_profiles_extended')
            .select('*')
            .eq('student_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error fetching extended profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data: extendedProfile || null
        });

    } catch (error: unknown) {
        console.error('About Me fetch error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
