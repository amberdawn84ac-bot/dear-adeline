'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { SupabaseProvider } from './SupabaseProvider'; // Import SupabaseProvider

if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (posthogKey) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            capture_pageview: false, // Handled by PostHogPageview component or manually
            persistence: 'localStorage',
        });
    }
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupabaseProvider> {/* Wrap with SupabaseProvider */}
            <PostHogProvider client={posthog}>
                {children}
            </PostHogProvider>
        </SupabaseProvider>
    );
}
