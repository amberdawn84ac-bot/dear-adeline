'use client';

import { useState } from 'react';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceProps {
  prompt: string;
  options: Option[];
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({ prompt, options, onAnswer, disabled }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (selected) {
      onAnswer(selected);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">{prompt}</p>

      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option.text)}
            disabled={disabled}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
              selected === option.text
                ? 'border-[var(--forest)] bg-[var(--forest)]/10'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === option.text
                  ? 'border-[var(--forest)] bg-[var(--forest)]'
                  : 'border-gray-300'
              }`}>
                {selected === option.text && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>
              <span>{option.text}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected || disabled}
        className="w-full py-3 px-4 bg-[var(--forest)] text-white rounded-lg font-medium hover:bg-[var(--forest-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
