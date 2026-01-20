import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScienceClient from './ScienceClient';

export default async function SciencePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch science concepts
    const { data: concepts } = await supabase
        .from('textbook_concepts')
        .select('*')
        .order('sort_order', { ascending: true });

    // Fetch student progress
    const { data: progress } = await supabase
        .from('student_textbook_progress')
        .select('*')
        .eq('student_id', user.id)
        .eq('item_type', 'concept');

    return (
        <ScienceClient
            concepts={concepts || []}
            progress={progress || []}
            userId={user.id}
        />
    );
}
