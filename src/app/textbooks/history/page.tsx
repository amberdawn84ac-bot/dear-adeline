import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import HistoryClient from './HistoryClient';

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch history events
    const { data: events } = await supabase
        .from('textbook_events')
        .select('*')
        .order('sort_order', { ascending: true });

    // Fetch student progress
    const { data: progress } = await supabase
        .from('student_textbook_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('item_type', 'event');

    return (
        <HistoryClient
            events={events || []}
            progress={progress || []}
            userId={user.id}
        />
    );
}
