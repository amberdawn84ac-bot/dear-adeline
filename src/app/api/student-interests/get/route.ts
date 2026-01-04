import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('student_interests')
            .select('*')
            .eq('student_id', user.id)
            .maybeSingle();

        if (error) {
            console.error('Error fetching student interests:', error);
            return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
        }

        // If no record exists, return an empty default object structure or null
        if (!data) {
            return NextResponse.json({
                data: {
                    interests: [],
                    hobbies: [],
                    favorite_subjects: [],
                    // ... defaults
                }
            }, { status: 200 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in student-interests/get:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
