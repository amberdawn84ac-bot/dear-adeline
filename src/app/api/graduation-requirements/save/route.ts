
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required to publish global requirements' }, { status: 403 });
        }

        const { requirements, state } = await req.json();

        if (!requirements || !state) {
            return NextResponse.json({ error: 'Requirements and state are required' }, { status: 400 });
        }

        // Insert requirements
        const { error } = await supabase
            .from('graduation_requirements')
            .insert(requirements.map((r: any) => ({
                ...r,
                state_standards: state.toLowerCase()
            })));

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Save Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
