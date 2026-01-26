import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingAssessment from '@/components/OnboardingAssessment';

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is a teacher/admin -> they don't need onboarding
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role === 'teacher' || profile?.role === 'admin') {
        redirect('/dashboard/teacher');
    }

    return (
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4"
            style={{
                backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(212, 219, 189, 0.4) 0%, rgba(254, 252, 240, 0) 40%)'
            }}>
            <OnboardingAssessment user={user} />
        </div>
    );
}
