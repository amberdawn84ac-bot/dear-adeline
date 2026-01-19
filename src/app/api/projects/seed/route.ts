
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { REAL_PROJECTS } from '@/lib/constants/projects';

export async function POST() {
    try {
        const supabase = await createClient();

        // Check if projects already exist (batch check or just insert)
        const { data: existing } = await supabase.from('library_projects').select('id').limit(1);

        // We insert regardless but we could filter. 
        // For this demo, let's just insert the new ones.
        const { error } = await supabase.from('library_projects').insert(REAL_PROJECTS);

        if (error) throw error;

        return NextResponse.json({ success: true, count: REAL_PROJECTS.length });
    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed projects' }, { status: 500 });
    }
}
