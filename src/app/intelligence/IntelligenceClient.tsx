
'use client';

import React, { useState, useEffect } from 'react';
import {
    Cloud,
    Newspaper,
    ArrowLeft,
    MapPin,
    Loader2,
    ExternalLink,
    Sparkles,
    Wind,
    Sun,
    Calendar,
    Trophy,
    Award,
    Target
} from 'lucide-react';
import Link from 'next/link';

interface IntelligenceClientProps {
    profile: any;
    currentTopic: string;
}

export default function IntelligenceClient({ profile, currentTopic }: IntelligenceClientProps) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState(profile?.city || 'Nowata, OK');
    const [isEditing, setIsEditing] = useState(false);
    const [showAllOpportunities, setShowAllOpportunities] = useState(false);

    const fetchIntelligence = async (cityToFetch: string) => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city: cityToFetch,
                    topics: currentTopic
                }),
            });

            if (!res.ok) throw new Error('Failed to load local data');
            const result = await res.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchIntelligence(location);
    }, [currentTopic]);

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditing(false);
        fetchIntelligence(location);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--cream)] gap-4">
                <div className="w-16 h-16 bg-[var(--sage)]/10 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-[var(--sage)] animate-spin-slow" />
                </div>
                <p className="text-[var(--forest)] font-black uppercase tracking-widest text-[10px]">Gathering Local Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            <header className="bg-white border-b border-[var(--cream-dark)] sticky top-0 z-10 p-4 lg:p-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-[var(--cream)] rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-[var(--charcoal-light)]" />
                        </Link>
                        <div>
                            <h1 className="text-xl lg:text-3xl font-bold serif text-[var(--forest)]">Local Intelligence</h1>
                            {isEditing ? (
                                <form onSubmit={handleLocationSubmit} className="flex items-center gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        autoFocus
                                        className="bg-[var(--cream)] border-b-2 border-[var(--forest)] text-[10px] font-bold uppercase tracking-widest text-[var(--forest)] focus:outline-none px-1"
                                        placeholder="Enter City..."
                                    />
                                    <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-[var(--sage)] hover:text-[var(--forest)] transition-colors">
                                        Save
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 text-[var(--ochre)] font-bold uppercase text-[10px] tracking-widest mt-1 group cursor-pointer hover:text-[var(--forest)] transition-all"
                                >
                                    <MapPin className={`w-3 h-3 ${refreshing ? 'animate-bounce' : ''}`} />
                                    {location}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-[8px] italic">(Change)</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 lg:p-10 space-y-10">
                {/* Weather Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--ochre)]/10 flex items-center justify-center">
                            <Cloud className="w-5 h-5 text-[var(--ochre)]" />
                        </div>
                        <h2 className="text-2xl font-bold serif">Sky & Atmosphere</h2>
                    </div>

                    <div className="card-glass p-8 bg-gradient-to-br from-white to-[var(--cream)] border-2 border-[var(--ochre)]/20 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--ochre)]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[var(--ochre)]/10 transition-colors duration-1000" />
                        <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center">
                            <div className="flex-1">
                                <p className={`text-lg text-[var(--burgundy)] leading-relaxed italic font-serif transition-opacity ${refreshing ? 'opacity-30' : 'opacity-100'}`}>
                                    "{data?.weather}"
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                                <div className="p-4 bg-white/50 rounded-2xl border border-[var(--ochre)]/10 text-center">
                                    <Wind className="w-5 h-5 mx-auto mb-2 text-[var(--sage)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wind Speed</span>
                                    <p className="font-bold text-[var(--forest)]">Varies Locally</p>
                                </div>
                                <div className="p-4 bg-white/50 rounded-2xl border border-[var(--ochre)]/10 text-center">
                                    <Sun className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">UV Index</span>
                                    <p className="font-bold text-[var(--forest)]">Check Safety</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* News Section - Only show if a specific topic is being worked on */}
                {currentTopic && (
                    <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--forest)]/10 flex items-center justify-center">
                                <Newspaper className="w-5 h-5 text-[var(--forest)]" />
                            </div>
                            <h2 className="text-2xl font-bold serif">Local Currents & Context</h2>
                            <span className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sage)] bg-[var(--sage)]/10 px-3 py-1.5 rounded-full">
                                Relevant to: {currentTopic}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data?.news?.map((item: any, i: number) => (
                                <a
                                    key={i}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group card-glass p-6 bg-white hover:border-[var(--sage)] transition-all hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-[var(--sage)]/10 transition-colors">
                                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[var(--sage)]" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{item.score?.toFixed(2) || '0.99'} Match</span>
                                    </div>
                                    <h3 className="font-bold text-[var(--forest)] text-lg mb-4 group-hover:text-[var(--sage-dark)] transition-colors leading-tight line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                        {item.content}
                                    </p>
                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                                            {new URL(item.url || 'https://google.com').hostname.replace('www.', '')}
                                        </span>
                                        <div className="w-6 h-6 rounded-full bg-[var(--cream)] flex items-center justify-center group-hover:bg-[var(--sage)] transition-colors">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {data?.news?.length === 0 && (
                            <div className="card-glass p-20 text-center border-dashed">
                                <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 italic">Scanning archives for news relevant to {currentTopic}...</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Opportunities Section */}
                <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold serif">Missions & Opportunities</h2>
                        <span className="ml-auto text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
                            Active Local Calls
                        </span>
                    </div>

                    <div className="space-y-6">
                        {data?.opportunities?.slice(0, showAllOpportunities ? undefined : 4).map((opp: any, i: number) => (
                            <a
                                key={i}
                                href={opp.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative card-glass p-8 bg-white border-2 border-slate-50 hover:border-amber-200 hover:shadow-2xl transition-all overflow-hidden block"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <Award className="w-12 h-12 text-amber-400" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Live Opportunity</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-[var(--forest)] mb-3 group-hover:text-amber-700 transition-colors">
                                        {opp.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                        {opp.content}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Target className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new URL(opp.url).hostname.replace('www.', '')}
                                            </span>
                                        </div>
                                        <div className="px-4 py-2 bg-[var(--forest)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group-hover:scale-105 active:scale-95 shadow-lg shadow-[var(--forest)]/10">
                                            View Mission
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}

                        {data?.opportunities?.length > 4 && !showAllOpportunities && (
                            <button
                                onClick={() => setShowAllOpportunities(true)}
                                className="w-full py-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-2xl text-amber-700 font-bold transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Show {data.opportunities.length - 4} More Opportunities
                            </button>
                        )}
                    </div>

                    {(!data?.opportunities || data?.opportunities?.length === 0) && (
                        <div className="card-glass p-12 text-center bg-slate-50 border-dashed">
                            <Trophy className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm italic">Scanning for local contests, bees, and scholarships...</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Integration Tip Footnote */}
            <footer className="max-w-7xl mx-auto p-4 lg:p-10 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 mx-auto mb-2 opacity-30" />
                Intelligence is gathered in real-time to connect your study of {currentTopic || 'Creation'} to the world around you.
            </footer>
        </div>
    );
}

