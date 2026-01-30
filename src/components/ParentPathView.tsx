'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { PathMilestone } from '@/lib/services/learningPathService';

interface ParentPathViewProps {
    milestones: PathMilestone[];
    jurisdiction: string;
    gradeLevel: string;
}

export function ParentPathView({ milestones, jurisdiction, gradeLevel }: ParentPathViewProps) {
    const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Learning Path Details</h1>
                <p className="text-gray-600">
                    Standards-aligned path for Grade {gradeLevel} ({jurisdiction === 'California' ? 'Common Core (CCSS/NGSS)' : jurisdiction})
                </p>
            </div>

            <div className="space-y-4">
                {milestones.map((milestone) => {
                    const isExpanded = expandedMilestone === milestone.id;
                    const isCompleted = milestone.status === 'completed';

                    return (
                        <div
                            key={milestone.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200"
                        >
                            <button
                                onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                                className="w-full p-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-1" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                            {milestone.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-2">
                                            {milestone.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{milestone.standards?.length || 0} standards</span>
                                            <span>•</span>
                                            <span>{milestone.estimatedWeeks} weeks</span>
                                            <span>•</span>
                                            <span className="capitalize">{milestone.status}</span>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="px-6 pb-6 border-t border-gray-100">
                                    <div className="pt-4">
                                        <h4 className="font-medium text-gray-700 mb-3">Teaching Approach</h4>
                                        <p className="text-gray-600 text-sm mb-6">
                                            {milestone.approachSummary}
                                        </p>

                                        <h4 className="font-medium text-gray-700 mb-3">Covered Standards</h4>
                                        <div className="space-y-2">
                                            {milestone.standards?.map((standard) => (
                                                <div
                                                    key={standard.id}
                                                    className="bg-gray-50 rounded p-3"
                                                >
                                                    <div className="font-mono text-xs text-gray-500 mb-1">
                                                        {standard.standard_code}
                                                    </div>
                                                    <div className="text-sm text-gray-700">
                                                        {standard.statement_text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
