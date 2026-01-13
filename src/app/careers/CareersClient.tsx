
'use client';

import React, { useState, useEffect } from 'react';
import {
    Rocket,
    ArrowLeft,
    Briefcase,
    Sparkles,
    Target,
    Lightbulb,
    ChevronRight,
    Trophy,
    Gamepad2,
    Code,
    Leaf,
    Scale,
    Hammer,
    Users,
    Globe,
    Compass,
    Shield,
    Anchor
} from 'lucide-react';
import Link from 'next/link';
import CareerQuiz from '@/components/CareerQuiz';

const ICON_MAP: Record<string, any> = {
    Rocket, Briefcase, Target, Lightbulb, Trophy, Gamepad2, Code, Leaf, Scale, Hammer, Users, Globe, Compass, Sparkles, Shield, Anchor
};

interface CareersClientProps {
    profile: any;
    skills: any[];
    topics: string[];
    portfolio: any[];
    assessment: any;
}

export default function CareersClient({ profile, skills, topics, portfolio, assessment }: CareersClientProps) {
    const [loading, setLoading] = useState(true);
    const [blueprint, setBlueprint] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentAssessment, setCurrentAssessment] = useState(assessment);

    useEffect(() => {
        // If assessment is not complete, show quiz instead of loading blueprint
        if (!currentAssessment?.is_complete) {
            setShowQuiz(true);
            setLoading(false);
            return;
        }

        // Assessment is complete, fetch blueprint
        const fetchCareers = async () => {
            try {
                const res = await fetch('/api/careers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profile,
                        skills: skills.map(s => s.skill?.name).filter(Boolean),
                        topics,
                        portfolio: portfolio.map(p => ({ title: p.title || 'Untitled', description: p.description || '', type: p.type || 'project' })),
                        assessment: currentAssessment
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to analyze restorative blueprint');
                }
                const data = await res.json();
                setBlueprint(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCareers();
    }, [profile, skills, topics, portfolio, currentAssessment]);

    const handleQuizComplete = async (quizData: any) => {
        setLoading(true);
        try {
            // Save assessment to database
            const res = await fetch('/api/career-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData),
            });

            if (!res.ok) throw new Error('Failed to save assessment');

            const { assessment: savedAssessment } = await res.json();
            setCurrentAssessment(savedAssessment);
            setShowQuiz(false);
            // The useEffect will trigger blueprint fetch since currentAssessment changed
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (showQuiz && !loading) {
        return (
            <div className="min-h-screen bg-[var(--cream)]">
                <header className="bg-white border-b border-[var(--cream-dark)] sticky top-0 z-50 p-6 lg:px-12 backdrop-blur-md bg-white/80">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold serif text-[var(--forest)]">Career Discovery</h1>
                            <p className="text-[var(--ochre)] font-black uppercase text-[10px] tracking-[0.3em] mt-1">Know Yourself • Discover Your Calling</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto p-6 lg:p-12">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Before we craft your Restorative Blueprint...
                        </h2>
                        <p className="text-lg text-gray-600">
                            Let's discover more about YOU through these interactive activities.
                            This will help us create a career vision that truly fits who you are.
                        </p>
                    </div>

                    <CareerQuiz onComplete={handleQuizComplete} initialData={currentAssessment} />
                </main>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--cream)] gap-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-[var(--sage)]/20 rounded-full animate-ping" />
                    <Sparkles className="w-10 h-10 text-[var(--sage)] absolute inset-0 m-auto animate-spin-slow" />
                </div>
                <div className="text-center">
                    <p className="text-[var(--forest)] font-black uppercase tracking-[0.4em] text-[10px] mb-2">Architecting Restorative Vision</p>
                    <p className="text-[var(--ochre)] text-xs animate-pulse">Weaving your vision into a blueprint...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--cream)] p-12">
                <div className="card-glass p-12 bg-white border-2 border-[var(--burgundy)]/20 text-center max-w-md">
                    <Shield className="w-12 h-12 text-[var(--burgundy)] mx-auto mb-6" />
                    <h2 className="text-2xl font-bold serif text-[var(--forest)] mb-4">Blueprint Interrupted</h2>
                    <p className="text-sm text-slate-500 mb-8 italic">"{error}"</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-[var(--forest)] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                    >
                        Retry Analysis
                    </button>
                </div>
            </div>
        );
    }

    const BlueprintIcon = ICON_MAP[blueprint?.icon] || Compass;

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            <header className="bg-white border-b border-[var(--cream-dark)] sticky top-0 z-50 p-6 lg:px-12 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="p-3 hover:bg-[var(--cream)] rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-md bg-white border border-slate-100 group">
                            <ArrowLeft className="w-5 h-5 text-[var(--charcoal-light)] group-hover:text-[var(--forest)]" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold serif text-[var(--forest)] transition-all">Restorative Blueprint</h1>
                            <p className="text-[var(--ochre)] font-black uppercase text-[10px] tracking-[0.3em] mt-1">Unique • Individualized • Pioneer</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-3 px-6 py-2 bg-[var(--forest)] rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                        <Trophy className="w-4 h-4" />
                        Mastery Authenticated
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: The Foundation Dossier */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="card-glass p-8 bg-white border-2 border-[var(--forest)]/5 shadow-2xl relative overflow-hidden group hover:border-[var(--forest)]/20 transition-all">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--forest)]" />
                            <h2 className="text-xl font-bold serif mb-8 flex items-center gap-3">
                                <Compass className="w-5 h-5 text-[var(--forest)]" />
                                Your Individual Dossier
                            </h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2">Demonstrated Mastery</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-[var(--sage)]/5 text-[var(--sage-dark)] font-bold rounded-lg text-[10px] border border-[var(--sage)]/10">
                                                {s.skill?.name || 'In Progress'}
                                            </span>
                                        ))}
                                        {skills.length === 0 && <p className="text-[10px] italic text-slate-400">Mastery is emerging through your inquiries...</p>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2">Active Curiosities</h3>
                                    <div className="space-y-3">
                                        {topics.slice(0, 4).map((topic, i) => (
                                            <div key={i} className="flex items-start gap-3 text-xs text-[var(--burgundy)]/80 font-medium">
                                                <Sparkles className="w-3 h-3 text-[var(--ochre)] shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{topic}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {portfolio.length > 0 && (
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-50 pb-2">Concrete Work Evidence</h3>
                                        <div className="grid gap-3">
                                            {portfolio.slice(0, 3).map((item, i) => (
                                                <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-all">
                                                    <p className="text-[10px] font-bold text-[var(--forest)] mb-1 uppercase tracking-wide">{item.title}</p>
                                                    <p className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed italic">{item.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-glass p-8 bg-[var(--forest)] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
                            <h3 className="text-lg font-bold serif mb-4">The Architect's Creed</h3>
                            <p className="text-xs leading-relaxed opacity-80 mb-6 font-medium font-serif italic">
                                "We refuse the generic. We reject the placeholder life. You were designed for a restoration that only you can spearhead."
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#76946a]">
                                <Shield className="w-4 h-4" />
                                Anti-Generic Verified
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Singular Rest restorative Blueprint */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* The Unified Calling Vision */}
                        <div className="card-glass p-10 lg:p-16 bg-white border-2 border-[var(--ochre)]/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--ochre)]/5 rounded-full blur-[80px] -mr-48 -mt-48" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--ochre)]/10 flex items-center justify-center text-[var(--ochre)] shadow-inner">
                                        <BlueprintIcon className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--ochre)] mb-2 block">Your Unique Restorative Calling</span>
                                        <h2 className="text-3xl lg:text-4xl font-bold serif text-[var(--forest)] leading-tight">{blueprint?.callingTitle}</h2>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none">
                                    <p className="text-lg lg:text-xl text-[var(--burgundy)] leading-relaxed font-serif italic mb-12">
                                        "{blueprint?.manifesto}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    {blueprint?.facets?.map((facet: string, i: number) => (
                                        <div key={i} className="p-6 rounded-[2rem] bg-[var(--cream)] border border-[var(--cream-dark)] flex items-start gap-4 group hover:bg-white hover:border-[var(--sage)] transition-all">
                                            <div className="w-8 h-8 rounded-xl bg-[var(--sage)] text-white flex items-center justify-center shrink-0 font-black text-xs">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm font-bold text-[var(--forest)] leading-snug group-hover:text-[var(--sage-dark)]">{facet}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col lg:flex-row gap-8 items-stretch pt-10 border-t border-slate-100">
                                    <div className="flex-1 p-8 bg-[var(--sage)]/5 rounded-[2.5rem] border-2 border-[var(--sage)]/10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Rocket className="w-5 h-5 text-[var(--sage-dark)]" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--sage-dark)]">Immediate Mission Launch</h4>
                                        </div>
                                        <p className="text-sm font-bold text-[var(--forest)] leading-relaxed italic border-l-4 border-[var(--sage)] pl-4">
                                            {blueprint?.immediateMission}
                                        </p>
                                    </div>

                                    <div className="w-full lg:w-72 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                                        <div className="flex items-center gap-3 mb-6">
                                            <Target className="w-5 h-5 text-[var(--sage)]" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Next Level Mastery</h4>
                                        </div>
                                        <div className="space-y-3 relative z-10">
                                            {blueprint?.nextMastery?.map((sm: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#76946a]">
                                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    {sm}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto p-12 text-center">
                <p className="text-[var(--forest)] font-black uppercase tracking-[0.5em] text-[9px] opacity-20">RESTORED TRUTH • ARCHITECTURAL BLUEPRINT • ADELINE ACADEMY</p>
            </footer>
        </div>
    );
}
