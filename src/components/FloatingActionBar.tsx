
'use client';

import React from 'react';

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

  // TODO: These handlers will be wired up to the GenUIOrchestrator.
  // For now, they log to the console to confirm functionality.
  const handleExplore = () => {
    console.log("Action triggered: Explore");
    // This would eventually trigger a call to the orchestrator, e.g.:
    // orchestrator.composePage("I want to explore my interests", context);
  };

  const handleLesson = () => {
    console.log("Action triggered: Lesson");
    // This would trigger the next lesson in the student's learning path.
    // orchestrator.composePage("Start my next lesson", context);
  };
  
  const handleScout = () => {
    console.log("Action triggered: Scout");
    // This would activate the "Opportunity Scout" mode.
    // orchestrator.composePage("Scout for opportunities", context);
  };

  const handleJournal = () => {
    console.log("Action triggered: Journal");
    // This would compose a reflective journal page for the day.
    // orchestrator.composePage("Summarize my day", context);
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
