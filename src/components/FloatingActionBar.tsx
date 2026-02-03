
'use client';

import React from 'react';
import { useDashboardExperience } from '@/contexts/DashboardExperienceContext';

//================================================================================
// ActionButton Component
//================================================================================

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

/**
 * A single button within the Floating Action Bar.
 */
const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-forest-800 transition-colors duration-200 ease-in-out group"
      aria-label={`Action: ${label}`}
    >
      <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full border-2 border-gray-200 group-hover:border-forest-500 group-hover:shadow-lg transform group-hover:-translate-y-1 transition-all duration-200 ease-in-out">
        <span className="text-2xl">{icon}</span>
      </div>
      <span className="text-xs font-semibold tracking-wide uppercase">{label}</span>
    </button>
  );
};


//================================================================================
// FloatingActionBar Component
//================================================================================

/**
 * The Floating Action Bar provides students with a persistent set of commands
 * to initiate discovery, reflecting the principle of student agency.
 * Instead of relying solely on chat prompts, the student can directly trigger
 * key experiences.
 */
export const FloatingActionBar: React.FC = () => {
  const { triggerGenUIExperience } = useDashboardExperience();

  const handleExplore = () => {
    console.log("Action triggered: Explore");
    triggerGenUIExperience("I want to explore something new and interesting");
  };

  const handleLesson = () => {
    console.log("Action triggered: Lesson");
    triggerGenUIExperience("I want to learn about money and how it works");
  };

  const handleScout = () => {
    console.log("Action triggered: Scout");
    triggerGenUIExperience("Help me find opportunities to learn");
  };

  const handleJournal = () => {
    console.log("Action triggered: Journal");
    triggerGenUIExperience("Help me reflect on what I learned today");
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center justify-center gap-4 px-6 py-3 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-full shadow-lg">
        <ActionButton icon="🗺️" label="Explore" onClick={handleExplore} />
        <ActionButton icon="🎓" label="Lesson" onClick={handleLesson} />
        <ActionButton icon="🔍" label="Scout" onClick={handleScout} />
        <ActionButton icon="📖" label="Journal" onClick={handleJournal} />
      </div>
    </div>
  );
};
