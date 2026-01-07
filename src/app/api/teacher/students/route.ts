import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the user's profile to check their role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError || profile?.role !== 'teacher') {
            return NextResponse.json({ error: 'Forbidden: Only teachers can access student lists.' }, { status: 403 });
        }

        // Fetch students associated with this teacher
        const { data: students, error: studentsError } = await supabase
            .from('teacher_students')
            .select(`
                student_id,
                student:profiles (id, display_name, avatar_url, grade_level)
            `)
            .eq('teacher_id', user.id);

        if (studentsError) {
            console.error('Error fetching teacher students:', studentsError);
            return NextResponse.json({ error: 'Failed to retrieve students.' }, { status: 500 });
        }

        // Map to a cleaner array of student profiles
        const studentProfiles = students.map(ts => ts.student);

        return NextResponse.json({ data: studentProfiles }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in /api/teacher/students:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}