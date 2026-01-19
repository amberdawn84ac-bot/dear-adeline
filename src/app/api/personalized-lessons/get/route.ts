import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Optional: Add query params for filtering/pagination later
        const { data, error } = await supabase
            .from('personalized_lessons')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching personalized lessons:', error);
            return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in personalized-lessons/get:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
