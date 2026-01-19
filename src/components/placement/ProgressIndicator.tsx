'use client';

import { CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  subjects: string[];
  currentIndex: number;
  completedCount: number;
}

export function ProgressIndicator({ subjects, currentIndex, completedCount }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 rounded-lg">
      {subjects.map((subject, index) => {
        const isComplete = index < completedCount;
        const isCurrent = index === currentIndex;

        // Shorten subject names for display
        const shortName = subject
          .replace('English Language Arts', 'Reading')
          .replace('Mathematics', 'Math')
          .replace('Social Studies', 'Social');

        return (
          <div
            key={subject}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
              isComplete
                ? 'bg-green-100 text-green-700'
                : isCurrent
                  ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-medium'
                  : 'text-gray-400'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${
                isCurrent ? 'bg-[var(--forest)]' : 'bg-gray-300'
              }`} />
            )}
            <span>{shortName}</span>
          </div>
        );
      })}
    </div>
  );
}
