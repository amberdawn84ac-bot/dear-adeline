import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated and is a teacher
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Teacher access required' }, { status: 403 });
        }

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Find the student by email
        const { data: student, error: studentError } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', email.toLowerCase())
            .single();

        if (studentError || !student) {
            return NextResponse.json(
                { error: 'No student found with that email. The student must create an account first.' },
                { status: 404 }
            );
        }

        if (student.role !== 'student') {
            return NextResponse.json(
                { error: 'This user is not a student account' },
                { status: 400 }
            );
        }

        // Check if relationship already exists
        const { data: existing } = await supabase
            .from('teacher_students')
            .select('id')
            .eq('teacher_id', user.id)
            .eq('student_id', student.id)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'This student is already in your classroom' },
                { status: 400 }
            );
        }

        // Create the teacher-student relationship
        const { error: insertError } = await supabase
            .from('teacher_students')
            .insert({
                teacher_id: user.id,
                student_id: student.id,
            });

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to add student' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Invite error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
