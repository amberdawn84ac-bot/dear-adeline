import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WisdomClient from './WisdomClient';

export default async function WisdomPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    return <WisdomClient />;
}
