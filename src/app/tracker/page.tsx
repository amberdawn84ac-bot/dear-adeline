import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TrackerClient from './TrackerClient';

export default async function TrackerPage() {
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

    // Get all graduation requirements for the student's state
    const { data: requirements } = await supabase
        .from('graduation_requirements')
        .select('*')
        .eq('state_standards', profile?.state_standards || 'oklahoma')
        .order('category');

    // Get student's graduation progress
    const { data: progress } = await supabase
        .from('student_graduation_progress')
        .select('*')
        .eq('student_id', user.id);

    // Get all earned skills grouped by category
    const { data: earnedSkills } = await supabase
        .from('student_skills')
        .select(`
      *,
      skill:skills(*)
    `)
        .eq('student_id', user.id)
        .order('earned_at', { ascending: false });

    // Get all skills for reference
    const { data: allSkills } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true });

    // Get portfolio for blueprint synthesis
    const { data: portfolioItems } = await supabase
        .from('portfolio_items')
        .select('title, description, type')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    // Get topics for blueprint synthesis
    const { data: conversations } = await supabase
        .from('conversations')
        .select('topic, title')
        .eq('student_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

    return (
        <TrackerClient
            profile={profile}
            requirements={requirements || []}
            progress={progress || []}
            earnedSkills={earnedSkills || []}
            allSkills={allSkills || []}
            portfolio={portfolioItems || []}
            topics={conversations?.map(c => c.title || c.topic).filter(Boolean) || []}
        />
    );
}
