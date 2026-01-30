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
import { LearningAdventure } from '@/components/LearningAdventure';
import { ParentPathView } from '@/components/ParentPathView';

interface LearningPathClientProps {
    profile: any;
    studentState: string;
    isParent: boolean;
    initialPath: LearningPath | null;
    initialSummary: any;
    initialNextFocus: NextFocusSuggestion | null;
}

export default function LearningPathClient({
    profile,
    studentState,
    isParent,
    initialPath,
    initialSummary,
    initialNextFocus
}: LearningPathClientProps) {
    const router = useRouter();
    const [path, setPath] = useState<LearningPath | null>(initialPath);
    const [summary, setSummary] = useState(initialSummary);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Setup state - use the studentState prop from server (which checks user_metadata and profile)
    const [selectedState, setSelectedState] = useState(studentState);
    const [selectedGrade, setSelectedGrade] = useState('8');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [newInterest, setNewInterest] = useState('');

    const handleGeneratePath = async () => {
        setLoading(true);
        setError(null);
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
            } else {
                setError(data.error || 'Failed to generate path');
            }
        } catch (error) {
            console.error('Failed to generate path', error);
            setError('An unexpected error occurred. Please try again.');
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
                                <option value="California">Common Core (CCSS/NGSS)</option>
                                <option value="Texas">Texas (TEKS)</option>
                                <option value="Florida">Florida</option>
                                <option value="Oklahoma">Oklahoma (will use Common Core)</option>
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

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

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
                            {path.milestones?.find(m => m.status === 'in_progress')?.title ||
                             path.milestones?.find(m => m.status === 'upcoming')?.title ||
                             'Not Set'}
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

            {/* Path Display - Different views for students vs parents */}
            {path && (
                isParent ? (
                    <ParentPathView
                        milestones={path.milestones || []}
                        jurisdiction={path.jurisdiction}
                        gradeLevel={path.gradeLevel}
                    />
                ) : (
                    <LearningAdventure
                        milestones={path.milestones || []}
                        studentName={profile.display_name}
                    />
                )
            )}
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
