import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return NextResponse.json({
        user_id: user.id,
        user_email: user.email,
        user_metadata_role: user.user_metadata?.role,
        profile_role: profile?.role,
        profile_data: profile,
    });
}
