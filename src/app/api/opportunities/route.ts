import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all opportunities for now. Recommendation logic will be added later.
        const { data: opportunities, error } = await supabase
            .from('opportunities')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching opportunities:', error);
            return NextResponse.json({ error: 'Failed to fetch opportunities.' }, { status: 500 });
        }

        return NextResponse.json({ data: opportunities }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error in /api/opportunities:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}