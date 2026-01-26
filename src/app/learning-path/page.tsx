import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LearningPathClient from './LearningPathClient';
import { LearningPathService } from '@/lib/services/learningPathService';

export default async function LearningPathPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return redirect('/login');
    }

    // Get current learning path
    const learningPath = await LearningPathService.getPath(user.id, supabase);
    const summary = await LearningPathService.getPathSummary(user.id, supabase);
    const nextFocus = await LearningPathService.suggestNextFocus(user.id, supabase);

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            <LearningPathClient
                profile={profile}
                initialPath={learningPath}
                initialSummary={summary}
                initialNextFocus={nextFocus}
            />
        </div>
    );
}
