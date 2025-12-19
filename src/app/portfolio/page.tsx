import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PortfolioClient from './PortfolioClient';

export default async function PortfolioPage() {
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

    // Get all portfolio items
    const { data: portfolioItems } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

    // Get skills for each portfolio item
    const { data: allSkills } = await supabase
        .from('skills')
        .select('id, name, category');

    return (
        <PortfolioClient
            profile={profile}
            portfolioItems={portfolioItems || []}
            allSkills={allSkills || []}
        />
    );
}
