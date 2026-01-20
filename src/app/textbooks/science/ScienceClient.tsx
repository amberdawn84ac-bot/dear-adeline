'use client';

import { useState, useRef } from 'react';
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
    ChevronDown,
    ChevronRight,
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
    { id: 'matter', name: 'Matter', icon: FlaskConical, color: 'bg-purple-500', lightBg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
    { id: 'energy', name: 'Energy', icon: Zap, color: 'bg-yellow-500', lightBg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
    { id: 'forces', name: 'Forces & Motion', icon: Cog, color: 'bg-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
    { id: 'gravity', name: 'Gravity', icon: HelpCircle, color: 'bg-indigo-500', lightBg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700' },
    { id: 'growing', name: 'Growing Things', icon: Leaf, color: 'bg-green-500', lightBg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    { id: 'animals', name: 'Animals', icon: Heart, color: 'bg-pink-500', lightBg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700' },
    { id: 'food', name: 'Food & Preservation', icon: FlaskConical, color: 'bg-orange-500', lightBg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
    { id: 'health', name: 'Natural Health', icon: Heart, color: 'bg-red-500', lightBg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' },
    { id: 'weather', name: 'Weather & Navigation', icon: Cloud, color: 'bg-sky-500', lightBg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
    { id: 'water', name: 'Water', icon: Droplets, color: 'bg-cyan-500', lightBg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700' },
    { id: 'life', name: 'Life', icon: Leaf, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
];

export default function ScienceClient({ concepts, progress, userId }: Props) {
    const [selectedConcept, setSelectedConcept] = useState<TextbookConcept | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [showSuggestForm, setShowSuggestForm] = useState(false);
    const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set(BRANCHES.map(b => b.id)));

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

    const toggleBranch = (branchId: string) => {
        setExpandedBranches(prev => {
            const next = new Set(prev);
            if (next.has(branchId)) {
                next.delete(branchId);
            } else {
                next.add(branchId);
            }
            return next;
        });
    };

    // Group concepts by branch
    const conceptsByBranch = BRANCHES.map(branch => ({
        ...branch,
        concepts: concepts.filter(c => c.branch === branch.id).sort((a, b) => a.sort_order - b.sort_order)
    })).filter(b => b.concepts.length > 0);

    // Calculate progress stats
    const totalConcepts = concepts.length;
    const masteredConcepts = concepts.filter(c => {
        const p = getProgressForConcept(c.id);
        return p?.mastery_level === 'mastered' || p?.mastery_level === 'proficient';
    }).length;

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
                            <h1 className="text-2xl font-bold text-[var(--forest)] font-serif">Science Skill Tree</h1>
                            <p className="text-sm text-[var(--charcoal-light)]">Real knowledge for real life</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {totalConcepts > 0 && (
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-bold text-[var(--forest)]">{masteredConcepts}/{totalConcepts}</div>
                                <div className="text-xs text-[var(--charcoal-light)]">Mastered</div>
                            </div>
                        )}
                        <button
                            onClick={() => setShowSuggestForm(true)}
                            className="flex items-center gap-2 bg-[var(--sage)] text-white px-4 py-2 rounded-xl hover:brightness-110 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Suggest Topic</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Skill Tree */}
            <div className="max-w-5xl mx-auto px-4 py-8">
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
                    <div className="space-y-4">
                        {conceptsByBranch.map((branch) => {
                            const Icon = branch.icon;
                            const isExpanded = expandedBranches.has(branch.id);
                            const branchMastered = branch.concepts.filter(c => {
                                const p = getProgressForConcept(c.id);
                                return p?.mastery_level === 'mastered' || p?.mastery_level === 'proficient';
                            }).length;

                            return (
                                <div key={branch.id} className={`${branch.lightBg} rounded-2xl border-2 ${branch.border} overflow-hidden`}>
                                    {/* Branch Header */}
                                    <button
                                        onClick={() => toggleBranch(branch.id)}
                                        className={`w-full flex items-center justify-between p-4 ${branch.color} text-white hover:brightness-110 transition-all`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-6 h-6" />
                                            <span className="font-bold text-lg">{branch.name}</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                                                {branchMastered}/{branch.concepts.length}
                                            </span>
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </button>

                                    {/* Branch Concepts - Skill Tree Style */}
                                    {isExpanded && (
                                        <div className="p-4">
                                            <div className="flex flex-wrap gap-3 relative">
                                                {/* Connection Lines (SVG) */}
                                                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                                    {branch.concepts.map((concept, idx) => {
                                                        if (idx === 0) return null;
                                                        // Draw line from previous concept
                                                        const x1 = (idx - 1) * 200 + 90;
                                                        const x2 = idx * 200 + 10;
                                                        return (
                                                            <line
                                                                key={`line-${concept.id}`}
                                                                x1={x1}
                                                                y1={50}
                                                                x2={x2}
                                                                y2={50}
                                                                stroke={branch.color.replace('bg-', '#').replace('-500', '')}
                                                                strokeWidth="3"
                                                                strokeDasharray="8,4"
                                                                opacity="0.3"
                                                            />
                                                        );
                                                    })}
                                                </svg>

                                                {/* Concept Nodes */}
                                                {branch.concepts.map((concept, idx) => {
                                                    const conceptProgress = getProgressForConcept(concept.id);
                                                    const isUnlocked = isConceptUnlocked(concept);
                                                    const isMastered = conceptProgress?.mastery_level === 'mastered' || conceptProgress?.mastery_level === 'proficient';
                                                    const inProgress = conceptProgress?.mastery_level === 'developing' || conceptProgress?.mastery_level === 'introduced';

                                                    return (
                                                        <div key={concept.id} className="relative z-10" style={{ width: '180px' }}>
                                                            {/* Node */}
                                                            <button
                                                                onClick={() => isUnlocked && setSelectedConcept(concept)}
                                                                disabled={!isUnlocked}
                                                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                                                    !isUnlocked
                                                                        ? 'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed'
                                                                        : isMastered
                                                                        ? 'bg-green-50 border-green-400 shadow-md hover:shadow-lg'
                                                                        : inProgress
                                                                        ? 'bg-blue-50 border-blue-300 shadow-md hover:shadow-lg'
                                                                        : 'bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-[var(--forest)]'
                                                                }`}
                                                            >
                                                                {/* Status Icon */}
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                        !isUnlocked ? 'bg-gray-200' :
                                                                        isMastered ? 'bg-green-500' :
                                                                        inProgress ? 'bg-blue-400' :
                                                                        branch.color
                                                                    }`}>
                                                                        {!isUnlocked ? (
                                                                            <Lock className="w-4 h-4 text-gray-500" />
                                                                        ) : isMastered ? (
                                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                                        ) : (
                                                                            <span className="text-white font-bold text-sm">{idx + 1}</span>
                                                                        )}
                                                                    </div>
                                                                    {inProgress && !isMastered && (
                                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                            Learning
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Title */}
                                                                <h3 className={`font-bold text-sm mb-1 ${!isUnlocked ? 'text-gray-500' : 'text-[var(--forest)]'}`}>
                                                                    {concept.title}
                                                                </h3>

                                                                {/* Why it matters preview */}
                                                                <p className={`text-xs line-clamp-2 ${!isUnlocked ? 'text-gray-400' : 'text-[var(--charcoal-light)]'}`}>
                                                                    {concept.why_it_matters}
                                                                </p>
                                                            </button>

                                                            {/* Arrow to next */}
                                                            {idx < branch.concepts.length - 1 && (
                                                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                                                                    <ChevronRight className={`w-6 h-6 ${branch.text}`} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Concept Detail Modal */}
            {selectedConcept && !showChat && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--cream)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-[var(--forest)] text-white p-6 rounded-t-2xl">
                            <button
                                onClick={() => setSelectedConcept(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-medium uppercase tracking-wider text-white/70">
                                {BRANCHES.find(b => b.id === selectedConcept.branch)?.name || selectedConcept.branch}
                            </span>
                            <h2 className="text-2xl font-bold font-serif mt-1">{selectedConcept.title}</h2>
                            <p className="text-white/90 mt-3 leading-relaxed">
                                {selectedConcept.why_it_matters}
                            </p>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Observations as natural list */}
                            {selectedConcept.what_we_observe && selectedConcept.what_we_observe.length > 0 && (
                                <div>
                                    <p className="text-[var(--charcoal)] leading-relaxed">
                                        {selectedConcept.what_we_observe.map((obs: any, i: number) => (
                                            <span key={i}>
                                                {typeof obs === 'string' ? obs : obs.text}
                                                {i < selectedConcept.what_we_observe.length - 1 && ' '}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            )}

                            {/* Models explanation - conversational */}
                            {selectedConcept.what_models_say && (
                                <p className="text-[var(--charcoal-light)] leading-relaxed border-l-4 border-[var(--sage)] pl-4">
                                    {selectedConcept.what_models_say}
                                </p>
                            )}

                            {/* Open questions - inviting curiosity */}
                            {selectedConcept.what_we_dont_know && (
                                <div className="bg-white rounded-xl p-4 border border-[var(--cream-dark)]">
                                    <p className="text-[var(--charcoal)] text-sm flex items-start gap-2">
                                        <HelpCircle className="w-5 h-5 text-[var(--ochre)] flex-shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{selectedConcept.what_we_dont_know}</span>
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--sage)] text-white py-3 rounded-xl hover:brightness-110 transition-all font-medium"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Learn More
                                </button>
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--forest)] text-white py-3 rounded-xl hover:brightness-110 transition-all font-medium"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Ask Adeline
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--ochre)] text-white py-3 rounded-xl hover:brightness-110 transition-all font-medium"
                                >
                                    <Target className="w-5 h-5" />
                                    Quiz Me
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
                                    body: JSON.stringify({ suggestion, type: 'concept' })
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
                    context={`Science Concept: ${selectedConcept.title} (${selectedConcept.branch}). Why it matters: "${selectedConcept.why_it_matters}". What we observe: "${JSON.stringify(selectedConcept.what_we_observe)}". What models say: "${selectedConcept.what_models_say}". What we don't know: "${selectedConcept.what_we_dont_know}".`}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
}
