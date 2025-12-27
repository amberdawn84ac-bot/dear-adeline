
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import IntelligenceClient from './IntelligenceClient';

export default async function IntelligencePage() {
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

    // Get current topic from active conversation
    const { data: activeConversation } = await supabase
        .from('conversations')
        .select('topic')
        .eq('student_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return (
        <IntelligenceClient
            profile={profile}
            currentTopic={activeConversation?.topic || ''}
        />
    );
}
