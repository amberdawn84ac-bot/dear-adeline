'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ComposedUIPage } from '@/lib/services/genUIOrchestrator';

//================================================================================
// Context Definition
//================================================================================

interface DashboardExperienceContextType {
  composedPage: ComposedUIPage | null;
  setComposedPage: (page: ComposedUIPage | null) => void;
  triggerGenUIExperience: (message: string) => Promise<void>;
  isLoadingGenUI: boolean;
}

const DashboardExperienceContext = createContext<DashboardExperienceContextType | undefined>(undefined);

//================================================================================
// Provider Component
//================================================================================

interface DashboardExperienceProviderProps {
  children: ReactNode;
}

/**
 * Provides the context for managing the generative UI experience on the dashboard.
 * This includes the currently displayed `ComposedUIPage` and the function to trigger
 * new GenUI experiences via the orchestrator.
 *
 * This context is crucial for decoupling the components that initiate GenUI experiences
 * (like the Floating Action Bar) from the DashboardClient's internal state management,
 * allowing for a more modular and scalable architecture.
 */
export const DashboardExperienceProvider: React.FC<DashboardExperienceProviderProps> = ({ children }) => {
  const [composedPage, setComposedPage] = useState<ComposedUIPage | null>(null);
  const [isLoadingGenUI, setIsLoadingGenUI] = useState(false);

  const triggerGenUIExperience = useCallback(async (message: string) => {
    setIsLoadingGenUI(true);
    setComposedPage(null); // Clear previous page while loading

    try {
      const response = await fetch('/api/copilotkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch composed page');
      }

      // For now, read the full response as JSON
      // TODO: Add streaming support for progressive rendering
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
        }

        // Parse the accumulated JSON
        const pageData: ComposedUIPage = JSON.parse(buffer);
        setComposedPage(pageData);
      }

    } catch (error) {
      console.error('Error triggering GenUI experience:', error);
      // Optionally, set an error state or display a temporary message
    } finally {
      setIsLoadingGenUI(false);
    }
  }, []);

  return (
    <DashboardExperienceContext.Provider value={{
      composedPage,
      setComposedPage,
      triggerGenUIExperience,
      isLoadingGenUI,
    }}>
      {children}
    </DashboardExperienceContext.Provider>
  );
};

//================================================================================
// Hook for Consumption
//================================================================================

/**
 * Custom hook to consume the DashboardExperienceContext.
 * Throws an error if used outside of a DashboardExperienceProvider.
 */
export const useDashboardExperience = () => {
  const context = useContext(DashboardExperienceContext);
  if (context === undefined) {
    throw new Error('useDashboardExperience must be used within a DashboardExperienceProvider');
  }
  return context;
};
