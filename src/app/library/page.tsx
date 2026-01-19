import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LibraryClient from './LibraryClient';

export default async function LibraryPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get all library projects (only approved ones for students)
    let { data: projects } = await supabase
        .from('library_projects')
        .select('*')
        .eq('approved', true)
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

    // Auto-seed library if empty (for existing users who didn't go through onboarding)
    if (!projects || projects.length === 0) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/seed-starter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
        });

        // Refetch projects after seeding
        const { data: seededProjects } = await supabase
            .from('library_projects')
            .select('*')
            .order('created_at', { ascending: false });

        projects = seededProjects;
    }

    return (
        <LibraryClient
            projects={projects || []}
            studentProjects={studentProjects || []}
            userRole={profile?.role || 'student'}
            gradeLevel={profile?.grade_level}
        />
    );
}
