// Example: How to integrate AboutMeModal into Dashboard

import { AboutMeModal, AboutMeData } from '@/components/AboutMeModal';
import { useState, useEffect } from 'react';

// In your DashboardClient component:

export function DashboardClient({ user, profile }: DashboardClientProps) {
    const [showAboutMe, setShowAboutMe] = useState(false);

    // Check if user needs to complete About Me
    useEffect(() => {
        if (profile && !profile.about_me_completed) {
            setShowAboutMe(true);
        }
    }, [profile]);

    const handleAboutMeComplete = async (data: AboutMeData) => {
        try {
            const response = await fetch('/api/profile/about-me', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setShowAboutMe(false);
                // Optionally refresh profile or show success message
                window.location.reload(); // Simple refresh to update profile
            }
        } catch (error) {
            console.error('Error saving About Me:', error);
        }
    };

    return (
        <>
            {/* Your existing dashboard content */}
            <div>
                {/* Dashboard UI */}
            </div>

            {/* About Me Modal */}
            <AboutMeModal
                isOpen={showAboutMe}
                onClose={() => { }} // Can't close - must complete
                onComplete={handleAboutMeComplete}
                studentName={profile?.display_name || 'friend'}
            />
        </>
    );
}

// Alternative: Use in WhimsicalDashboard
export function WhimsicalDashboard({ profile }: Props) {
    const [showAboutMe, setShowAboutMe] = useState(!profile.about_me_completed);

    return (
        <>
            <div className="dashboard-content">
                {/* Whimsical dashboard UI */}
            </div>

            <AboutMeModal
                isOpen={showAboutMe}
                onClose={() => { }}
                onComplete={handleAboutMeComplete}
                studentName={profile.display_name}
            />
        </>
    );
}
