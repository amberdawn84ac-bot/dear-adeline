'use client';

import { createContext, useContext, useState } from 'react';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

// Create a context for the Supabase client
const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
    const [supabase] = useState(() => createBrowserClient());

    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
};

// Custom hook to use the Supabase client
export const useSupabase = () => {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
};
