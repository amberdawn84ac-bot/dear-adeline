'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    Map as MapIcon,
    CheckCircle2,
    Circle,
    ArrowRight,
    Sparkles,
    Settings,
    Plus,
    GraduationCap
} from 'lucide-react';
import { LearningPath, NextFocusSuggestion } from '@/lib/services/learningPathService';

interface LearningPathClientProps {
    profile: any;
    initialPath: LearningPath | null;
    initialSummary: any;
    initialNextFocus: NextFocusSuggestion | null;
}

export default function LearningPathClient({
    profile,
    initialPath,
    initialSummary,
    initialNextFocus
}: LearningPathClientProps) {
    const router = useRouter();
    const [path, setPath] = useState<LearningPath | null>(initialPath);
    const [summary, setSummary] = useState(initialSummary);
    const [loading, setLoading] = useState(false);

    // Setup state
    const [selectedState, setSelectedState] = useState(profile.state_standards || 'Oklahoma');
    const [selectedGrade, setSelectedGrade] = useState('8');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [newInterest, setNewInterest] = useState('');

    const handleGeneratePath = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/learning-path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade_level: selectedGrade,
                    jurisdiction: selectedState,
                    interests: selectedInterests
                })
            });

            const data = await res.json();
            if (data.success) {
                setPath(data.path);
                setSummary(data.summary);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to generate path', error);
        } finally {
            setLoading(false);
        }
    };

    const addInterest = () => {
        if (newInterest && !selectedInterests.includes(newInterest)) {
            // If path exists, update it
            if (path) {
                updatePathInterests([...selectedInterests, newInterest]);
            }
            setSelectedInterests([...selectedInterests, newInterest]);
            setNewInterest('');
        }
    };

    const updatePathInterests = async (interests: string[]) => {
        // Call API to update interests
        try {
            await fetch('/api/learning-path', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_interests',
                    interests: interests
                })
            });
            // Refresh to see adapted path
            router.refresh();
        } catch (e) {
            console.error(e);
        }
    };

    if (!path) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-[var(--sage-light)]">
                    <div className="text-center mb-8">
                        <MapIcon className="w-16 h-16 text-[var(--sage)] mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-2">Create Your Learning Path</h1>
                        <p className="text-[var(--charcoal-light)]">
                            Adeline will generate a personalized path covering all required state standards,
                            adapted to your interests.
                        </p>
                    </div>

                    <div className="space-y-6 max-w-lg mx-auto">
                        <div>
                            <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">State / Jurisdiction</label>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--sage)] outline-none"
                            >
                                <option value="Oklahoma">Oklahoma</option>
                                <option value="Texas">Texas</option>
                                <option value="California">California</option>
                                <option value="Florida">Florida</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">Grade Level</label>
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--sage)] outline-none"
                            >
                                <option value="K">Kindergarten</option>
                                <option value="1">1st Grade</option>
                                <option value="2">2nd Grade</option>
                                <option value="3">3rd Grade</option>
                                <option value="4">4th Grade</option>
                                <option value="5">5th Grade</option>
                                <option value="6">6th Grade</option>
                                <option value="7">7th Grade</option>
                                <option value="8">8th Grade</option>
                                <option value="9-12">High School (9-12)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">Interests & Hobbies</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                                    placeholder="e.g. Minecraft, Cooking, Horses..."
                                    className="flex-1 p-3 rounded-lg border border-gray-200 outline-none"
                                />
                                <button
                                    onClick={addInterest}
                                    className="bg-[var(--sage)] text-white p-3 rounded-lg hover:bg-[var(--sage-dark)] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedInterests.map(int => (
                                    <span key={int} className="api-chip bg-[var(--cream-dark)] text-[var(--charcoal)] px-3 py-1 rounded-full text-sm">
                                        {int}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGeneratePath}
                            disabled={loading}
                            className="w-full bg-[var(--ochre)] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50"
                        >
                            {loading ? 'Generating Path...' : 'Generate Personalized Path'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--cream-dark)] flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-[var(--charcoal)]">
                            {summary?.completed} / {summary?.totalStandards}
                        </div>
                        <div className="text-sm text-[var(--charcoal-light)]">Standards Mastered</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--cream-dark)] flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <TargetIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-[var(--charcoal)] truncate max-w-[200px]">
                            {path.currentFocusArea || 'Not Set'}
                        </div>
                        <div className="text-sm text-[var(--charcoal-light)]">Current Focus</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--cream-dark)] flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-[var(--charcoal)]">
                            {path.interests.length} Interests
                        </div>
                        <div className="text-sm text-[var(--charcoal-light)]">Adapting Path</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Path Visualization */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-[var(--sage-light)] overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[var(--charcoal)] flex items-center gap-2">
                                <MapIcon className="w-5 h-5 text-[var(--sage)]" />
                                Your Learning Path
                            </h2>
                            <span className="text-sm text-[var(--charcoal-light)]">
                                {path.jurisdiction} • Grade {path.gradeLevel}
                            </span>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-gray-200">
                                {path.pathData.map((item, index) => {
                                    const isCompleted = item.status === 'completed';
                                    const isUpcoming = item.status === 'upcoming';
                                    const isInProgress = item.status === 'in_progress';

                                    return (
                                        <div key={item.standardId} className="relative flex gap-6 group">
                                            <div className={`
                                relative z-10 w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4
                                ${isCompleted ? 'bg-green-100 border-green-50 text-green-600' : ''}
                                ${isInProgress ? 'bg-blue-100 border-blue-50 text-blue-600 ring-2 ring-blue-100 ring-offset-2' : ''}
                                ${isUpcoming ? 'bg-gray-50 border-white text-gray-300' : ''}
                            `}>
                                                {isCompleted ? <CheckCircle2 className="w-8 h-8" /> :
                                                    isInProgress ? <BookOpen className="w-8 h-8" /> :
                                                        <Circle className="w-8 h-8" />}
                                            </div>

                                            <div className={`
                                flex-1 p-4 rounded-xl border transition-all
                                ${isInProgress ? 'bg-blue-50/50 border-blue-100 shadow-md' : 'bg-white border-gray-100 hover:border-gray-200'}
                                ${isCompleted ? 'opacity-75' : ''}
                            `}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isInProgress ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {item.subject} • {item.standardCode}
                                                    </span>
                                                    {item.interestConnection && (
                                                        <span className="text-xs flex items-center gap-1 text-purple-600 font-medium">
                                                            <Sparkles className="w-3 h-3" />
                                                            via {item.interestConnection}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`font-medium mb-1 ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                    {item.statementText}
                                                </h3>
                                                {item.suggestedApproach && isInProgress && (
                                                    <div className="mt-3 text-sm bg-white p-3 rounded-lg border border-blue-100 text-blue-800">
                                                        💡 <strong>Try this:</strong> {item.suggestedApproach}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Interests */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--cream-dark)]">
                        <h3 className="font-bold text-[var(--charcoal)] mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            Interests & Passions
                        </h3>
                        <p className="text-sm text-[var(--charcoal-light)] mb-4">
                            Adeline adapts your path based on what you love. Add more to see the path change!
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {path.interests.map(int => (
                                <span key={int} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-100">
                                    {int}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                                placeholder="Add interest..."
                                className="flex-1 p-2 rounded-lg border border-gray-200 outline-none text-sm"
                            />
                            <button
                                onClick={addInterest}
                                className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Next Up */}
                    {initialNextFocus && (
                        <div className="bg-[var(--ochre)]/10 rounded-xl p-6 border border-[var(--ochre)]/20">
                            <h3 className="font-bold text-[var(--ochre)] mb-2 flex items-center gap-2">
                                <ArrowRight className="w-5 h-5" />
                                Recommended Next
                            </h3>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-sm font-medium text-gray-500 mb-1">{initialNextFocus.subject}</div>
                                <div className="font-bold text-gray-800 mb-2">{initialNextFocus.statementText}</div>
                                <div className="text-sm text-gray-600 italic">"{initialNextFocus.reason}"</div>
                            </div>
                            <button
                                onClick={() => router.push('/chat')}
                                className="w-full mt-4 bg-[var(--ochre)] text-white font-bold py-2 rounded-lg hover:brightness-110 transition-all"
                            >
                                Go to Lesson
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TargetIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}
