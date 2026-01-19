'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    MessageCircle,
    Target,
    BookOpen,
    Home,
    X,
    Lock,
    CheckCircle,
    FlaskConical,
    Zap,
    Cog,
    Leaf,
    Droplets,
    Heart,
    Cloud,
    HelpCircle,
    Plus,
} from 'lucide-react';
import TextbookChat from '@/components/TextbookChat';

interface TextbookConcept {
    id: string;
    title: string;
    branch: string;
    prerequisite_ids: string[];
    why_it_matters: string;
    what_we_observe: any[];
    what_models_say: string | null;
    what_we_dont_know: string | null;
    key_ideas: any[];
    learn_content: string | null;
    sort_order: number;
}

interface Progress {
    item_id: string;
    mastery_level: string;
    completed_at: string | null;
}

interface Props {
    concepts: TextbookConcept[];
    progress: Progress[];
    userId: string;
}

const BRANCHES = [
    { id: 'matter', name: 'Matter', icon: FlaskConical, color: 'bg-purple-500' },
    { id: 'energy', name: 'Energy', icon: Zap, color: 'bg-yellow-500' },
    { id: 'forces', name: 'Forces & Motion', icon: Cog, color: 'bg-blue-500' },
    { id: 'gravity', name: 'Gravity', icon: HelpCircle, color: 'bg-indigo-500' },
    { id: 'growing', name: 'Growing Things', icon: Leaf, color: 'bg-green-500' },
    { id: 'animals', name: 'Animals', icon: Heart, color: 'bg-pink-500' },
    { id: 'food', name: 'Food & Preservation', icon: FlaskConical, color: 'bg-orange-500' },
    { id: 'health', name: 'Natural Health', icon: Heart, color: 'bg-red-500' },
    { id: 'weather', name: 'Weather & Navigation', icon: Cloud, color: 'bg-sky-500' },
    { id: 'water', name: 'Water', icon: Droplets, color: 'bg-cyan-500' },
    { id: 'life', name: 'Life', icon: Leaf, color: 'bg-emerald-500' },
];

export default function ScienceClient({ concepts, progress, userId }: Props) {
    const [selectedConcept, setSelectedConcept] = useState<TextbookConcept | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [showSuggestForm, setShowSuggestForm] = useState(false);

    const getProgressForConcept = (conceptId: string) => {
        return progress.find(p => p.item_id === conceptId);
    };

    const isConceptUnlocked = (concept: TextbookConcept) => {
        if (!concept.prerequisite_ids || concept.prerequisite_ids.length === 0) {
            return true;
        }
        return concept.prerequisite_ids.every(prereqId => {
            const prereqProgress = getProgressForConcept(prereqId);
            return prereqProgress?.mastery_level === 'mastered' || prereqProgress?.mastery_level === 'proficient';
        });
    };

    const filteredConcepts = selectedBranch
        ? concepts.filter(c => c.branch === selectedBranch)
        : concepts;

    const groupedByBranch = BRANCHES.map(branch => ({
        ...branch,
        concepts: concepts.filter(c => c.branch === branch.id),
    })).filter(b => b.concepts.length > 0 || concepts.length === 0);

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-[var(--charcoal-light)] hover:text-[var(--forest)] transition-colors">
                            <Home className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--forest)] serif">Science Skill Tree</h1>
                            <p className="text-sm text-[var(--charcoal-light)]">Real knowledge for real life</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSuggestForm(true)}
                        className="flex items-center gap-2 bg-[var(--sage)] text-white px-4 py-2 rounded-xl hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Suggest Topic</span>
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Branch Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedBranch(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedBranch ? 'bg-[var(--forest)] text-white' : 'bg-white border hover:bg-gray-50'}`}
                    >
                        All Topics
                    </button>
                    {BRANCHES.map(branch => {
                        const Icon = branch.icon;
                        const branchConcepts = concepts.filter(c => c.branch === branch.id);
                        if (branchConcepts.length === 0 && concepts.length > 0) return null;

                        return (
                            <button
                                key={branch.id}
                                onClick={() => setSelectedBranch(selectedBranch === branch.id ? null : branch.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedBranch === branch.id ? `${branch.color} text-white` : 'bg-white border hover:bg-gray-50'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {branch.name}
                                <span className="opacity-60">({branchConcepts.length})</span>
                            </button>
                        );
                    })}
                </div>

                {/* Concepts Grid */}
                {concepts.length === 0 ? (
                    <div className="text-center py-16">
                        <FlaskConical className="w-16 h-16 mx-auto text-[var(--charcoal-light)]/30 mb-4" />
                        <h2 className="text-xl font-bold text-[var(--charcoal)] mb-2">Skill Tree Coming Soon</h2>
                        <p className="text-[var(--charcoal-light)] mb-4">
                            Science concepts are being added. Check back soon!
                        </p>
                        <button
                            onClick={() => setShowSuggestForm(true)}
                            className="inline-flex items-center gap-2 bg-[var(--forest)] text-white px-6 py-3 rounded-xl hover:brightness-110"
                        >
                            <Plus className="w-5 h-5" />
                            Suggest a Topic
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredConcepts.map((concept) => {
                            const conceptProgress = getProgressForConcept(concept.id);
                            const isUnlocked = isConceptUnlocked(concept);
                            const isMastered = conceptProgress?.mastery_level === 'mastered';
                            const inProgress = conceptProgress?.mastery_level === 'developing' || conceptProgress?.mastery_level === 'proficient';

                            const branch = BRANCHES.find(b => b.id === concept.branch);
                            const Icon = branch?.icon || FlaskConical;

                            return (
                                <button
                                    key={concept.id}
                                    onClick={() => isUnlocked && setSelectedConcept(concept)}
                                    disabled={!isUnlocked}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${!isUnlocked
                                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                        : isMastered
                                            ? 'bg-green-50 border-green-300 hover:shadow-lg'
                                            : inProgress
                                                ? 'bg-blue-50 border-blue-200 hover:shadow-lg'
                                                : 'bg-white border-gray-200 hover:border-[var(--forest)] hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className={`p-2 rounded-lg ${branch?.color || 'bg-gray-500'} bg-opacity-20`}>
                                            <Icon className={`w-5 h-5 ${branch?.color.replace('bg-', 'text-') || 'text-gray-500'}`} />
                                        </div>
                                        {!isUnlocked ? (
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        ) : isMastered ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : inProgress ? (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                In Progress
                                            </span>
                                        ) : null}
                                    </div>
                                    <h3 className="font-bold text-[var(--forest)] mb-1">{concept.title}</h3>
                                    <p className="text-xs text-[var(--charcoal-light)] uppercase tracking-wider mb-2">
                                        {branch?.name || concept.branch}
                                    </p>
                                    <p className="text-sm text-[var(--charcoal-light)] line-clamp-2">
                                        {concept.why_it_matters}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Concept Detail Modal */}
            {selectedConcept && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--sage)]">
                                    {BRANCHES.find(b => b.id === selectedConcept.branch)?.name || selectedConcept.branch}
                                </span>
                                <h2 className="text-xl font-bold text-[var(--forest)]">{selectedConcept.title}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedConcept(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Why It Matters */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <h3 className="font-bold text-amber-800 mb-2">Why This Matters</h3>
                                <p className="text-amber-900/80 text-sm">
                                    {selectedConcept.why_it_matters}
                                </p>
                            </div>

                            {/* What We Observe */}
                            {selectedConcept.what_we_observe && selectedConcept.what_we_observe.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h3 className="font-bold text-blue-800 mb-2">What We Observe</h3>
                                    <ul className="text-blue-900/80 text-sm space-y-1">
                                        {selectedConcept.what_we_observe.map((obs: any, i: number) => (
                                            <li key={i}>• {typeof obs === 'string' ? obs : obs.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* What Models Describe */}
                            {selectedConcept.what_models_say && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <h3 className="font-bold text-purple-800 mb-2">What Models Describe</h3>
                                    <p className="text-purple-900/80 text-sm italic">
                                        {selectedConcept.what_models_say}
                                    </p>
                                </div>
                            )}

                            {/* What We Don&apos;t Know */}
                            {selectedConcept.what_we_dont_know && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <h3 className="font-bold text-gray-800 mb-2">What We Don&apos;t Know</h3>
                                    <p className="text-gray-700 text-sm">
                                        {selectedConcept.what_we_dont_know}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--sage)] text-white py-3 rounded-xl hover:brightness-110 transition-all"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Learn
                                </button>
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--forest)] text-white py-3 rounded-xl hover:brightness-110 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Ask Adeline
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--ochre)] text-white py-3 rounded-xl hover:brightness-110 transition-all"
                                >
                                    <Target className="w-5 h-5" />
                                    Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suggest Topic Modal */}
            {showSuggestForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[var(--forest)]">Suggest a Topic</h2>
                            <button
                                onClick={() => setShowSuggestForm(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-[var(--charcoal-light)] mb-4">
                            Want to learn about something that&apos;s not here? Tell Adeline and she&apos;ll help research it!
                        </p>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('suggestion') as HTMLInputElement;
                            const suggestion = input.value;

                            if (!suggestion.trim()) return;

                            try {
                                const res = await fetch('/api/textbooks/suggest', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ suggestion })
                                });

                                if (res.ok) {
                                    alert('Thanks! Your suggestion has been sent to Adeline.');
                                    setShowSuggestForm(false);
                                } else {
                                    alert('Failed to send suggestion. Please try again.');
                                }
                            } catch (err) {
                                console.error(err);
                                alert('Error sending suggestion.');
                            }
                        }}>
                            <textarea
                                name="suggestion"
                                className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[var(--forest)] focus:outline-none mb-4"
                                placeholder="I want to learn about..."
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[var(--forest)] text-white px-6 py-2 rounded-xl font-bold hover:brightness-110 transition-all"
                                >
                                    Send Suggestion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Panel */}
            {showChat && selectedConcept && (
                <TextbookChat
                    userId={userId}
                    title={selectedConcept.title}
                    context={`Science Concept: ${selectedConcept.title} (${selectedConcept.branch}). Why it matters: "${selectedConcept.why_it_matters}". What we observe: "${JSON.stringify(selectedConcept.what_we_observe)}". What models say: "${selectedConcept.what_models_say}".`}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
}
