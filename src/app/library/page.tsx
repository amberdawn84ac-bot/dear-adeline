import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LibraryClient from './LibraryClient';

export default async function LibraryPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get all library projects
    const { data: projects } = await supabase
        .from('library_projects')
        .select('*')
        .order('created_at', { ascending: false });

    // Get student's project progress
    const { data: studentProjects } = await supabase
        .from('student_projects')
        .select('*')
        .eq('student_id', user.id);

    // Get user profile for grade filtering
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, grade_level')
        .eq('id', user.id)
        .single();

    return (
        <LibraryClient
            projects={projects || []}
            studentProjects={studentProjects || []}
            userRole={profile?.role || 'student'}
            gradeLevel={profile?.grade_level}
        />
    );
}
