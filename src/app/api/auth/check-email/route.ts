import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check if email exists in profiles
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, display_name, role')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (error) {
            console.error('Error checking email:', error);
            return NextResponse.json({ error: 'Failed to check email' }, { status: 500 });
        }

        return NextResponse.json({
            exists: !!profile,
            displayName: profile?.display_name || null,
            role: profile?.role || null
        });

    } catch (error) {
        console.error('Check email error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
