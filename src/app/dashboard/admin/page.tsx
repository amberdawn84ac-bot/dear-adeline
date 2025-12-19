import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Get all users
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    // Get all library projects
    const { data: projects } = await supabase
        .from('library_projects')
        .select('*')
        .order('created_at', { ascending: false });

    // Get all skills
    const { data: skills } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true });

    // Get graduation requirements
    const { data: requirements } = await supabase
        .from('graduation_requirements')
        .select('*')
        .order('category');

    // Get stats
    const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

    const { count: teacherCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher');

    const { count: projectCount } = await supabase
        .from('library_projects')
        .select('*', { count: 'exact', head: true });

    return (
        <AdminClient
            profile={profile}
            users={users || []}
            projects={projects || []}
            skills={skills || []}
            requirements={requirements || []}
            stats={{
                students: studentCount || 0,
                teachers: teacherCount || 0,
                projects: projectCount || 0,
                skills: skills?.length || 0,
            }}
        />
    );
}
