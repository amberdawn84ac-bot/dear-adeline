'use client';

import { useState, useEffect } from 'react';
import { Target, Calendar, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react';

interface GoalsWidgetProps {
    studentId: string;
    gradeLevel: string;
    state: string;
}

export function GoalsWidget({ studentId, gradeLevel, state }: GoalsWidgetProps) {
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<any>(null);
    const [view, setView] = useState<'week' | 'month' | 'year'>('week');

    useEffect(() => {
        fetchLearningPlan();
    }, [studentId, gradeLevel]);

    const fetchLearningPlan = async () => {
        try {
            // First try to get existing plan
            const response = await fetch('/api/learning-plan/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId }),
            });

            let data = await response.json();

            // If no plan exists, generate one
            if (!data.plan) {
                const generateResponse = await fetch('/api/learning-plan/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId, gradeLevel, state }),
                });
                data = await generateResponse.json();
                setPlan(data.learningPlan);
            } else {
                setPlan(data.plan);
            }
        } catch (error) {
            console.error('Error fetching learning plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[var(--cream-dark)]">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-[var(--sage)] animate-spin" />
                </div>
            </div>
        );
    }

    if (!plan) {
        return null;
    }

    const getCurrentMonth = () => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        return monthNames[new Date().getMonth()];
    };

    const currentMonthData = plan.monthlyThemes?.find((m: any) => m.month === getCurrentMonth());

    return (
        <div className="bg-gradient-to-br from-[var(--sage-light)] to-white rounded-3xl p-8 shadow-lg border-2 border-[var(--sage)]/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--sage)] flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--forest)]">Your Learning Goals</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-[var(--sage)]">
                            {gradeLevel} • {state}
                        </p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
                    {['week', 'month', 'year'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${view === v
                                    ? 'bg-[var(--sage)] text-white'
                                    : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Weekly Goals */}
            {view === 'week' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-[var(--sage)]" />
                        <h4 className="font-bold text-[var(--forest)]">This Week's Focus</h4>
                    </div>
                    <div className="bg-white rounded-2xl p-6 space-y-3">
                        <p className="text-sm text-[var(--charcoal-light)] italic mb-4">
                            Based on {getCurrentMonth()}'s theme, here's what to focus on this week:
                        </p>
                        {currentMonthData?.projects?.slice(0, 2).map((project: string, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-[var(--cream)] rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-[var(--sage)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-[var(--sage)]">{i + 1}</span>
                                </div>
                                <p className="text-sm text-[var(--charcoal)] leading-relaxed">{project}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Goals */}
            {view === 'month' && currentMonthData && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-[var(--sage)]" />
                        <h4 className="font-bold text-[var(--forest)]">{getCurrentMonth()} Focus Areas</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(currentMonthData).filter(([key]) => key !== 'month' && key !== 'projects').map(([subject, topic]: any) => (
                            <div key={subject} className="bg-white rounded-2xl p-4">
                                <div className="text-xs font-black uppercase tracking-widest text-[var(--ochre)] mb-2">
                                    {subject}
                                </div>
                                <p className="text-sm text-[var(--charcoal)]">{topic}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Yearly Goals */}
            {view === 'year' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-[var(--sage)]" />
                        <h4 className="font-bold text-[var(--forest)]">Year-End Mastery Goals</h4>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(plan.yearlyGoals || {}).map(([subject, goals]: any) => (
                            <div key={subject} className="bg-white rounded-2xl p-4">
                                <div className="text-xs font-black uppercase tracking-widest text-[var(--burgundy)] mb-3">
                                    {subject}
                                </div>
                                <ul className="space-y-2">
                                    {goals.map((goal: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--charcoal)]">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] mt-2 flex-shrink-0" />
                                            {goal}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-white/50 rounded-xl border border-[var(--sage)]/20">
                <p className="text-xs text-[var(--charcoal-light)] italic text-center">
                    💡 These goals adapt as you complete projects and chat with Adeline
                </p>
            </div>
        </div>
    );
}
