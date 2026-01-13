import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import PublicPortfolioClient from './PublicPortfolioClient';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PublicPortfolioPage({ params }: { params: { studentId: string } }) {
    const { studentId } = params;

    // Get student profile - check if portfolio is public
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, portfolio_public')
        .eq('id', studentId)
        .single();

    // If profile doesn't exist or portfolio is not public, show 404
    if (!profile || !profile.portfolio_public) {
        notFound();
    }

    // Get portfolio items
    const { data: portfolioItems } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    // Get activity logs
    const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50);

    return (
        <PublicPortfolioClient
            profile={profile}
            portfolioItems={portfolioItems || []}
            activityLogs={activityLogs || []}
        />
    );
}
