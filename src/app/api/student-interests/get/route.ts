import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: interestsData, error } = await supabase
            .from('student_interests')
            .select('interest') // Select only the 'interest' column
            .eq('student_id', user.id);

        if (error) {
            console.error('Error fetching student interests:', error);
            return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
        }

        // Extract the interest strings from the returned objects
        const interests = interestsData ? interestsData.map(item => item.interest) : [];

        return NextResponse.json({ data: { interests } }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in student-interests/get:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
