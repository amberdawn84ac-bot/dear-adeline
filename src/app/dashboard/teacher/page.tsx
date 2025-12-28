import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeacherClient from './TeacherClient';

export default async function TeacherDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is teacher or admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    //     redirect('/dashboard');
    // }

    // Get teacher's students
    let { data: teacherStudents } = await supabase
        .from('teacher_students')
        .select(`
      student_id,
      student:profiles!teacher_students_student_id_fkey(
        id,
        email,
        display_name,
        grade_level,
        state_standards,
        avatar_url,
        created_at
      )
    `)
        .eq('teacher_id', user.id);

    // DEVELOPMENT OVERRIDE: If no students assigned, show all profiles for tonight's testing
    if (!teacherStudents || teacherStudents.length === 0) {
        const { data: allProfiles } = await supabase
            .from('profiles')
            .select('id, email, display_name, grade_level, state_standards, avatar_url, created_at')
            .limit(5);

        teacherStudents = (allProfiles || []).map(p => ({
            student_id: p.id,
            student: p
        })) as any;
    }

    // Get each student's progress
    const students = await Promise.all(
        (teacherStudents || []).map(async (ts) => {
            const studentId = ts.student_id;
            const studentData = (Array.isArray(ts.student) ? ts.student[0] : ts.student) as unknown as {
                id: string;
                email: string;
                display_name: string | null;
                grade_level: string | null;
                avatar_url: string | null;
                created_at: string;
            };

            // Get skills count
            const { count: skillsCount } = await supabase
                .from('student_skills')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', studentId);

            // Get graduation progress
            const { data: progress } = await supabase
                .from('student_graduation_progress')
                .select(`
                    credits_earned,
                    requirement:graduation_requirements(name)
                `)
                .eq('student_id', studentId);

            const totalCredits = progress?.reduce((sum, p) => sum + (p.credits_earned || 0), 0) || 0;
            const trackCredits = (progress || []).reduce((acc: Record<string, number>, p: any) => {
                const name = p.requirement?.name;
                if (name) {
                    acc[name] = (acc[name] || 0) + (p.credits_earned || 0);
                }
                return acc;
            }, {});

            // Get recent portfolio items
            const { data: recentWork } = await supabase
                .from('portfolio_items')
                .select('id, title, created_at')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false })
                .limit(3);

            return {
                id: studentData.id,
                email: studentData.email,
                display_name: studentData.display_name,
                grade_level: studentData.grade_level,
                state_standards: (studentData as any).state_standards,
                avatar_url: studentData.avatar_url,
                created_at: studentData.created_at,
                skills_earned: skillsCount || 0,
                total_credits: totalCredits,
                track_credits: trackCredits,
                recent_work: recentWork || [],
            };
        })
    );


    // Get library projects for assignment
    const { data: projects } = await supabase
        .from('library_projects')
        .select('id, title, category, difficulty')
        .order('category');

    return (
        <TeacherClient
            profile={profile}
            students={students}
            projects={projects || []}
        />
    );
}
