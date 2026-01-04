'use client';

import React, { useState } from 'react';
import { BookOpen, Check, Save } from 'lucide-react';

interface Step {
    title: string;
    instruction: string;
}

export interface LessonData {
    title: string;
    description: string;
    subject: string;
    difficulty: string;
    materials: string[];
    steps: Step[];
    learning_goals: string[];
}

interface LessonCardProps {
    lesson: LessonData;
    onSave?: (lesson: LessonData) => void;
    isSaved?: boolean;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onSave, isSaved = false }) => {
    const [saved, setSaved] = useState(isSaved);

    const handleSave = () => {
        if (onSave) {
            onSave(lesson);
            setSaved(true);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden my-4 mx-auto">
            {/* Header */}
            <div className="bg-purple-600 p-4 text-white relative">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                            {lesson.subject} • {lesson.difficulty}
                        </span>
                        <h3 className="text-xl font-bold font-serif leading-tight">{lesson.title}</h3>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <BookOpen size={20} />
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                    {lesson.description}
                </p>

                {/* Goals */}
                <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Target Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {lesson.learning_goals.map((goal, i) => (
                            <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-md border border-green-100">
                                {goal}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Materials */}
                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <h4 className="text-xs font-bold uppercase text-yellow-800 tracking-widest mb-1.5 flex items-center gap-1">
                        Details & Material
                    </h4>
                    <ul className="text-xs text-yellow-900/80 space-y-1 ml-4 list-disc">
                        {lesson.materials.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saved}
                    className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2
                ${saved
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:shadow-lg active:scale-95'
                        }
            `}
                >
                    {saved ? (
                        <>
                            <Check size={16} /> Saved to Library
                        </>
                    ) : (
                        <>
                            <Save size={16} /> Save Lesson Plan
                        </>
                    )}
                </button>
            </div>

            {/* Preview of Steps (Truncated) */}
            <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Project Steps</h4>
                <div className="space-y-3">
                    {lesson.steps.slice(0, 2).map((step, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {i + 1}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-700">{step.title}</p>
                                <p className="text-xs text-gray-500">{step.instruction}</p>
                            </div>
                        </div>
                    ))}
                    {lesson.steps.length > 2 && (
                        <p className="text-center text-xs text-gray-400 italic mt-2">
                            + {lesson.steps.length - 2} more steps available in full view
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonCard;
