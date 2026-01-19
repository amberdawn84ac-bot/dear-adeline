
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CareersClient from './CareersClient';

export default async function CareersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: studentSkills } = await supabase
        .from('student_skills')
        .select('*, skill:skills(*)')
        .eq('student_id', user.id);

    const { data: conversations } = await supabase
        .from('conversations')
        .select('topic, title')
        .eq('student_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(15);

    const { data: portfolioItems } = await supabase
        .from('portfolio_items')
        .select('title, description, type')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    const { data: careerAssessment } = await supabase
        .from('career_assessments')
        .select('*')
        .eq('student_id', user.id)
        .maybeSingle();

    return (
        <CareersClient
            profile={profile}
            skills={studentSkills || []}
            topics={conversations?.map(c => c.title || c.topic).filter(Boolean) || []}
            portfolio={portfolioItems || []}
            assessment={careerAssessment}
        />
    );
}
