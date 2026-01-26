'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, ArrowRight, Sparkles, AlertCircle, FileText } from 'lucide-react';

interface SavedOpportunity {
    id: string; // The saved_opportunity id (not the opp id)
    opportunity: {
        id: string;
        title: string;
        organization: string;
        deadline: string | null;
        difficulty_level: string;
        estimated_time: string;
    };
    status: 'saved' | 'in_progress' | 'submitted' | 'completed' | 'won' | 'lost';
    checklist: { id: string; text: string; completed: boolean }[];
    next_step_date: string | null;
}

interface OpportunityTrackerProps {
    savedOpportunities: SavedOpportunity[];
    onUpdateStatus: (id: string, newStatus: string) => void;
    onUpdateChecklist: (id: string, newChecklist: any[]) => void;
}

export function OpportunityTracker({ savedOpportunities, onUpdateStatus, onUpdateChecklist }: OpportunityTrackerProps) {
    const [selectedOpp, setSelectedOpp] = useState<SavedOpportunity | null>(null);

    const activeProjects = savedOpportunities.filter(s => s.status === 'in_progress' || s.status === 'saved');
    const completedProjects = savedOpportunities.filter(s => ['submitted', 'completed', 'won', 'lost'].includes(s.status));

    const generateChecklist = async (opp: SavedOpportunity) => {
        // In a real app, this would call an API to generate a specific plan
        // For now, we'll use a standard template based on difficulty
        const template = [
            { id: '1', text: 'Read all requirements carefully', completed: false },
            { id: '2', text: 'Draft the main essay/submission', completed: false },
            { id: '3', text: 'Ask a mentor/parent to review', completed: false },
            { id: '4', text: 'Final polish and submit', completed: false },
        ];
        onUpdateChecklist(opp.id, template);
        onUpdateStatus(opp.id, 'in_progress');
    };

    const toggleCheckitem = (oppId: string, itemId: string, currentChecklist: any[]) => {
        const newChecklist = currentChecklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        onUpdateChecklist(oppId, newChecklist);
    };

    if (savedOpportunities.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
                <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">No Active Projects</h3>
                <p className="text-gray-500">Find an opportunity and click "Start Project" to begin!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Active Projects Kanban-lite */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-purple-600" />
                    Active Projects
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {activeProjects.map(opp => (
                        <div key={opp.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{opp.opportunity.title}</h3>
                                    <p className="text-sm text-gray-500">{opp.opportunity.organization}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${opp.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {opp.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Progress or Call to Action */}
                            {opp.status === 'saved' ? (
                                <div className="mt-4">
                                    <button
                                        onClick={() => generateChecklist(opp)}
                                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Create Plan
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-2">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Next Steps</div>
                                    {opp.checklist && opp.checklist.length > 0 ? (
                                        opp.checklist.slice(0, 3).map((item: any) => (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleCheckitem(opp.id, item.id, opp.checklist)}
                                                className="flex items-start gap-2 text-sm text-left w-full group"
                                            >
                                                {item.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-300 group-hover:text-purple-500 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span className={item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                                                    {item.text}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No checklist items yet.</p>
                                    )}

                                    {opp.checklist && opp.checklist.every((i: any) => i.completed) && (
                                        <button
                                            onClick={() => onUpdateStatus(opp.id, 'submitted')}
                                            className="w-full mt-2 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm hover:bg-green-200 transition-colors"
                                        >
                                            Mark Submitted
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {opp.opportunity.estimated_time || 'Unknown time'}
                                </span>
                                {opp.opportunity.deadline && (
                                    <span className={`font-medium ${new Date(opp.opportunity.deadline) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
                                        Due: {new Date(opp.opportunity.deadline).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed/History */}
            {completedProjects.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-opacity-70">Past Projects</h2>
                    <div className="space-y-2">
                        {completedProjects.map(opp => (
                            <div key={opp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">{opp.opportunity.title}</span>
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md capitalize">{opp.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
