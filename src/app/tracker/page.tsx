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

    return (
        <TrackerClient
            profile={profile}
            requirements={requirements || []}
            progress={progress || []}
            earnedSkills={earnedSkills || []}
            allSkills={allSkills || []}
        />
    );
}
