'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Sparkles,
    Heart,
    BookOpen,
    CheckCircle2,
    Loader2,
    ArrowRight
} from 'lucide-react';

interface WisdomOption {
    id: number;
    text: string;
    wisdom_level: string;
    consequence: string;
    scripture_connection: string;
}

interface WisdomScenario {
    id: string;
    title: string;
    description: string;
    age_group: string;
    scenario_text: string;
    options: WisdomOption[];
    scripture_reference: string;
    learning_points: string[];
}

export default function WisdomActionClient() {
    const [scenario, setScenario] = useState<WisdomScenario | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [reasoning, setReasoning] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        loadScenario();
    }, []);

    const loadScenario = async () => {
        setLoading(true);
        setSelectedOption(null);
        setReasoning('');
        setFeedback(null);
        setShowFeedback(false);

        try {
            const response = await fetch('/api/wisdom/scenario');
            const data = await response.json();
            setScenario(data.scenario);
        } catch (error) {
            console.error('Error loading scenario:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption === null || !scenario) return;

        setSubmitting(true);
        try {
            const response = await fetch('/api/wisdom/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenarioId: scenario.id,
                    chosenOption: selectedOption,
                    reasoning
                })
            });

            const data = await response.json();
            setFeedback(data);
            setShowFeedback(true);
        } catch (error) {
            console.error('Error submitting response:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[var(--sage)] animate-spin" />
            </div>
        );
    }

    if (showFeedback && feedback) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-white p-6">
                <div className="max-w-3xl mx-auto">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--charcoal-light)] hover:text-[var(--forest)] mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    {/* Feedback Card */}
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl border-2 border-[var(--sage)]/20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--ochre)] to-[var(--terracotta)] mx-auto flex items-center justify-center shadow-lg">
                                <Heart className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold serif text-[var(--forest)]">Adeline's Wisdom</h2>
                        </div>

                        {/* Feedback */}
                        <div className="bg-[var(--cream)] rounded-2xl p-8 border-2 border-[var(--ochre)]/20">
                            <p className="text-lg text-[var(--charcoal)] leading-relaxed whitespace-pre-wrap font-serif">
                                {feedback.feedback}
                            </p>
                        </div>

                        {/* Scripture */}
                        {feedback.scriptureReference && (
                            <div className="bg-gradient-to-r from-[var(--burgundy)] to-[var(--burgundy-light)] rounded-2xl p-6 text-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <BookOpen className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest opacity-80">
                                        Scripture Connection
                                    </span>
                                </div>
                                <p className="text-lg font-serif italic">{feedback.scriptureReference}</p>
                            </div>
                        )}

                        {/* Learning Points */}
                        {feedback.learningPoints && feedback.learningPoints.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--charcoal-light)]">
                                    What You're Learning
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.learningPoints.map((point: string, i: number) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-[var(--sage)]/10 text-[var(--sage-dark)] rounded-full text-sm font-bold border border-[var(--sage)]/20"
                                        >
                                            {point}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Next Scenario Button */}
                        <button
                            onClick={loadScenario}
                            className="w-full py-4 bg-gradient-to-r from-[var(--forest)] to-[var(--forest-light)] text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            Next Scenario
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!scenario) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-white flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <p className="text-xl text-[var(--charcoal-light)]">No scenarios available</p>
                    <Link href="/dashboard" className="text-[var(--sage)] hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-white p-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--charcoal-light)] hover:text-[var(--forest)] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Main Scenario Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-[var(--sage)]/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[var(--forest)] to-[var(--forest-light)] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold serif">Wisdom in Action</h1>
                                <p className="text-white/80 text-sm font-medium mt-1">{scenario.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Scenario Content */}
                    <div className="p-12 space-y-8">
                        {/* Scenario Text */}
                        <div className="bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)] rounded-2xl p-8 border-2 border-[var(--ochre)]/20">
                            <h2 className="text-2xl font-bold serif text-[var(--forest)] mb-4">{scenario.title}</h2>
                            <p className="text-lg text-[var(--charcoal)] leading-relaxed font-serif">
                                {scenario.scenario_text}
                            </p>
                        </div>

                        {/* Question */}
                        <div className="text-center">
                            <p className="text-xl font-bold text-[var(--burgundy)] serif">What would you do?</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            {scenario.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedOption(option.id)}
                                    className={`w-full p-6 rounded-2xl text-left transition-all border-2 ${selectedOption === option.id
                                            ? 'bg-[var(--sage)] border-[var(--sage)] text-white shadow-xl scale-[1.02]'
                                            : 'bg-white border-[var(--cream-dark)] text-[var(--charcoal)] hover:border-[var(--sage)]/50 hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedOption === option.id ? 'bg-white/20' : 'bg-[var(--cream)]'
                                            }`}>
                                            {selectedOption === option.id ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <span className={`text-sm font-bold ${selectedOption === option.id ? 'text-white' : 'text-[var(--charcoal-light)]'}`}>
                                                    {option.id}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg font-medium flex-1">{option.text}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Reasoning */}
                        {selectedOption !== null && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <label className="block text-sm font-black uppercase tracking-widest text-[var(--charcoal-light)]">
                                    Why did you choose this? (Optional)
                                </label>
                                <textarea
                                    value={reasoning}
                                    onChange={(e) => setReasoning(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    className="w-full p-4 rounded-2xl border-2 border-[var(--cream-dark)] focus:border-[var(--sage)] focus:ring-0 resize-none h-32 text-[var(--charcoal)] placeholder:text-[var(--charcoal-light)]/50"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        {selectedOption !== null && (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--burgundy-light)] text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Thinking...
                                    </>
                                ) : (
                                    <>
                                        Hear Adeline's Wisdom
                                        <Heart className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
