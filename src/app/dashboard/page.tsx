import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { headers } from 'next/headers'; // Import headers

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();
    const headersList = headers();
    const searchParams = new URLSearchParams(headersList.get('x-url')?.split('?')[1] || '');

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile - try ID first, then Email as fallback
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile) {
        const { data: fallbackProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

        if (fallbackProfile) {
            profile = fallbackProfile;
        }
    }

    // Redirect admin to admin dashboard
    if (profile?.role === 'admin') {
        redirect('/dashboard/admin');
    }

    let currentUserId = user.id;
    let students: Array<{ id: string; display_name: string | null; avatar_url: string | null; grade_level: string | null }> = [];
    let selectedStudent: { id: string; display_name: string | null; avatar_url: string | null; grade_level: string | null } | null = null;

    if (profile?.role === 'teacher') {
        // Fetch students associated with this teacher
        const { data: teacherStudents, error: studentsError } = await supabase
            .from('teacher_students')
            .select(`
                student_id,
                student:profiles (id, display_name, avatar_url, grade_level)
            `)
            .eq('teacher_id', user.id);

        if (studentsError) {
            console.error('Error fetching teacher students:', studentsError);
            // Handle error, maybe show an empty list or a message
        } else {
            students = teacherStudents.map(ts => ts.student).filter(s => s !== null);
            
            const studentIdFromParam = searchParams.get('studentId');
            if (studentIdFromParam) {
                selectedStudent = students.find(s => s.id === studentIdFromParam) || null;
            }

            if (!selectedStudent && students.length > 0) {
                selectedStudent = students[0]; // Default to the first student
                // Redirect to include the studentId in the URL for consistency
                redirect(`/dashboard?studentId=${selectedStudent.id}`);
            } else if (!selectedStudent && students.length === 0) {
                // Teacher has no students, render an empty state or message
                // currentUserId remains the teacher's ID, which will result in empty data fetches below
            }

            if (selectedStudent) {
                currentUserId = selectedStudent.id;
            }
        }
    }

    // ⚡ Bolt: Parallelize independent data fetches for currentUserId
    const [
        { data: studentSkills },
        { data: graduationProgress },
        { data: allRequirements },
        { data: portfolioItems },
        { data: conversationHistory },
        { data: activeConversation },
        { data: learningGaps },
    ] = await Promise.all([
        supabase
            .from('student_skills')
            .select(`
      *,
      skill:skills(*)
    `)
            .eq('student_id', currentUserId), // Use currentUserId

        supabase
            .from('student_graduation_progress')
            .select(`
      *,
      requirement:graduation_requirements(*)
    `)
            .eq('student_id', currentUserId), // Use currentUserId

        supabase
            .from('graduation_requirements')
            .select('*')
            .eq('state_standards', profile?.state_standards || 'oklahoma'),

        supabase
            .from('portfolio_items')
            .select('*')
            .eq('student_id', currentUserId) // Use currentUserId
            .order('created_at', { ascending: false })
            .limit(5),

        supabase
            .from('conversations')
            .select('id, title, updated_at, topic')
            .eq('student_id', currentUserId) // Use currentUserId
            .order('updated_at', { ascending: false }),

        supabase
            .from('conversations')
            .select('*')
            .eq('student_id', currentUserId) // Use currentUserId
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

        supabase
            .from('learning_gaps')
            .select('*')
            .eq('student_id', currentUserId) // Use currentUserId
            .is('resolved_at', null),
    ]);


    return (
        <DashboardClient
            user={user}
            profile={profile}
            studentSkills={studentSkills || []}
            graduationProgress={graduationProgress || []}
            allRequirements={allRequirements || []}
            portfolioItems={portfolioItems || []}
            activeConversation={activeConversation}
            conversationHistory={conversationHistory || []}
            learningGaps={learningGaps || []}
            // Pass new props for teacher dashboard
            students={students}
            selectedStudent={selectedStudent}
            currentViewingUserId={currentUserId} // Pass the ID of the user whose data is being viewed
        />
    );
}
