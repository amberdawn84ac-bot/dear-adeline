import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId } = await request.json();

        const { data: plan, error } = await supabase
            .from('student_learning_plans')
            .select('*')
            .eq('student_id', studentId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching learning plan:', error);
            return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
        }

        return NextResponse.json({ plan: plan || null });

    } catch (error: any) {
        console.error('Learning plan fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch learning plan' },
            { status: 500 }
        );
    }
}
