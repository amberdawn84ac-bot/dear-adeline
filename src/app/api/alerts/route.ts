import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get teacher's students
        const { data: teacherStudents } = await supabase
            .from('teacher_students')
            .select('student_id')
            .eq('teacher_id', user.id);

        if (!teacherStudents || teacherStudents.length === 0) {
            return NextResponse.json({ alerts: [] });
        }

        const studentIds = teacherStudents.map(ts => ts.student_id);

        // Fetch alerts for teacher's students
        const { data: alerts, error } = await supabase
            .from('parent_alerts')
            .select(`
                *,
                student:profiles!parent_alerts_student_id_fkey(
                    display_name,
                    email
                )
            `)
            .in('student_id', studentIds)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ alerts: alerts || [] });
    } catch (error: any) {
        console.error('Error fetching alerts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { alertId } = await request.json();

        // Mark alert as viewed
        const { error } = await supabase
            .from('parent_alerts')
            .update({
                viewed_at: new Date().toISOString(),
                viewed_by: user.id
            })
            .eq('id', alertId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating alert:', error);
        return NextResponse.json(
            { error: 'Failed to update alert' },
            { status: 500 }
        );
    }
}
