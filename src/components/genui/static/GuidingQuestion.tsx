
'use client';

import React from 'react';
import { Lightbulb } from 'lucide-react';

//================================================================================
// Type Definitions
//================================================================================

interface GuidingQuestionProps {
  text: string;
}

//================================================================================
// GuidingQuestion Component
//================================================================================

/**
 * A component to display a contextual "guiding question" from Adeline.
 * This is a key part of the "Discovery Dialogue Pattern", used to prompt
 * student reflection while they are engaged in an activity.
 */
export const GuidingQuestion: React.FC<GuidingQuestionProps> = ({ text }) => {
  return (
    <div className="flex items-start gap-4 my-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-sm">
      <div className="flex-shrink-0">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
      </div>
      <div className="flex-grow">
        <h4 className="font-['Architects_Daughter'] text-lg text-yellow-800 mb-1">A Question to Ponder...</h4>
        <p className="text-base font-['Kalam'] text-gray-700">
          {text}
        </p>
      </div>
    </div>
  );
};
