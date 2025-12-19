import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Redirect based on role
    if (profile?.role === 'admin') {
        redirect('/dashboard/admin');
    }

    if (profile?.role === 'teacher') {
        redirect('/dashboard/teacher');
    }

    // Get student's skills
    const { data: studentSkills } = await supabase
        .from('student_skills')
        .select(`
      *,
      skill:skills(*)
    `)
        .eq('student_id', user.id);

    // Get graduation progress
    const { data: graduationProgress } = await supabase
        .from('student_graduation_progress')
        .select(`
      *,
      requirement:graduation_requirements(*)
    `)
        .eq('student_id', user.id);

    // Get graduation requirements for initial setup
    const { data: allRequirements } = await supabase
        .from('graduation_requirements')
        .select('*')
        .eq('state_standards', profile?.state_standards || 'oklahoma');

    // Get recent portfolio items
    const { data: portfolioItems } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // Get active conversation
    const { data: activeConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('student_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    // Get learning gaps
    const { data: learningGaps } = await supabase
        .from('learning_gaps')
        .select('*')
        .eq('student_id', user.id)
        .is('resolved_at', null);

    return (
        <DashboardClient
            user={user}
            profile={profile}
            studentSkills={studentSkills || []}
            graduationProgress={graduationProgress || []}
            allRequirements={allRequirements || []}
            portfolioItems={portfolioItems || []}
            activeConversation={activeConversation}
            learningGaps={learningGaps || []}
        />
    );
}
