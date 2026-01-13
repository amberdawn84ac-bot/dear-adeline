import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ApproveProjectsClient from './ApproveProjectsClient';

export default async function ApproveProjectsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile to check if admin/teacher
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        redirect('/dashboard');
    }

    // Get all pending and rejected projects
    const { data: pendingProjects } = await supabase
        .from('library_projects')
        .select(`
            *,
            created_by_profile:profiles!library_projects_created_by_fkey(
                full_name,
                email
            )
        `)
        .in('approval_status', ['pending', 'rejected'])
        .order('created_at', { ascending: false });

    return (
        <ApproveProjectsClient
            projects={pendingProjects || []}
            adminId={user.id}
        />
    );
}
