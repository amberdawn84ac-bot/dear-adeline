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

    // Redirect based on role
    if (profile?.role === 'admin') {
        redirect('/dashboard/admin');
    }

    if (profile?.role === 'teacher') {
        redirect('/dashboard/teacher');
    }

    // ⚡ Bolt: Parallelize independent data fetches
    // All of these queries are independent, so we can run them in parallel
    // to significantly reduce the page load time. Instead of waiting for
    // each one to finish sequentially, we let them all run at once.
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
            .eq('student_id', user.id),

        supabase
            .from('student_graduation_progress')
            .select(`
      *,
      requirement:graduation_requirements(*)
    `)
            .eq('student_id', user.id),

        supabase
            .from('graduation_requirements')
            .select('*')
            .eq('state_standards', profile?.state_standards || 'oklahoma'),

        supabase
            .from('portfolio_items')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),

        supabase
            .from('conversations')
            .select('id, title, updated_at, topic')
            .eq('student_id', user.id)
            .order('updated_at', { ascending: false }),

        supabase
            .from('conversations')
            .select('*')
            .eq('student_id', user.id)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

        supabase
            .from('learning_gaps')
            .select('*')
            .eq('student_id', user.id)
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
        />
    );
}
