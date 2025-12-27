'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Globe,
    Scale,
    Shield,
    Hammer,
    Home,
    Award,
    Wrench,
    Users,
    Palette,
    Sparkles,
    GraduationCap,
    BookOpen,
    Leaf,
    Target,
    Zap,
    Heart,
    ChevronRight,
    Search
} from 'lucide-react';
import { CAMPAIGNS, Campaign } from '@/lib/constants/campaigns';

const ICON_MAP: Record<string, any> = {
    Scale, Shield, Hammer, Home, Award, Wrench, Users, Palette, Sparkles, GraduationCap, BookOpen, Leaf
};

export default function ImpactClient() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Justice' | 'Community' | 'Growth' | 'Provision'>('All');

    const filteredCampaigns = CAMPAIGNS.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.objective.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || c.category === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--cream-dark)] sticky top-0 z-50 p-6 lg:px-12 backdrop-blur-md bg-white/80">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/dashboard" className="p-3 hover:bg-[var(--cream)] rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-md bg-white border border-slate-100 group">
                            <ArrowLeft className="w-5 h-5 text-[var(--charcoal-light)] group-hover:text-[var(--forest)]" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold serif text-[var(--forest)] transition-all">World Impact & Campaigns</h1>
                            <p className="text-[var(--ochre)] font-black uppercase text-[10px] tracking-[0.3em] mt-1">Foundational Restoration • Neighborly Love • High Impact</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/20 w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 lg:p-12">
                {/* Hero Section */}
                <div className="mb-16 relative p-12 lg:p-20 rounded-[3rem] bg-[var(--forest)] text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-t from-white/5 to-transparent" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-3 text-[var(--sage)] mb-6">
                            <Globe className="w-6 h-6 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">World Restoration Initiative</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold serif mb-8 leading-tight">
                            Your mastery wasn't meant to be kept. It was meant to be <span className="text-[var(--ochre)]">given</span>.
                        </h2>
                        <p className="text-lg opacity-80 font-medium leading-relaxed mb-10 text-slate-100">
                            Adeline doesn't just track tests. We track the correction of brokenness. These campaigns are pre-designed blueprints for real-world impact that count directly toward your graduation.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="px-6 py-3 bg-[var(--ochre)] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-[var(--ochre-dark)] transition-all cursor-pointer">
                                <Target className="w-4 h-4" />
                                Propose a Campaign
                            </div>
                            <div className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold backdrop-blur-md transition-all cursor-pointer">
                                How this tracks for Graduation
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-1/2 right-20 -translate-y-1/2 hidden xl:block opacity-20 hover:opacity-40 transition-opacity">
                        <Globe className="w-96 h-96 scale-125" />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
                    {['All', 'Justice', 'Community', 'Growth', 'Provision'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-[var(--forest)] text-white shadow-xl scale-105'
                                    : 'bg-white text-slate-400 hover:text-[var(--forest)] border border-slate-100 shadow-sm'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Campaign Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCampaigns.map((campaign) => {
                        const Icon = ICON_MAP[campaign.icon] || Globe;
                        return (
                            <div
                                key={campaign.id}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[6rem] -mr-8 -mt-8 transition-all group-hover:bg-[var(--sage)]/5" />

                                <div className="relative z-10 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--forest)] mb-8 transition-all group-hover:bg-[var(--forest)] group-hover:text-white group-hover:scale-110 shadow-inner">
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div className="mb-6">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--ochre)] mb-2 block">{campaign.category}</span>
                                        <h3 className="text-xl font-bold serif text-[var(--forest)] group-hover:text-[var(--sage-dark)] transition-colors">{campaign.title}</h3>
                                    </div>

                                    <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3 italic">
                                        "{campaign.objective}"
                                    </p>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <Zap className="w-4 h-4 text-[var(--sage)]" />
                                            Key Metrics for Success
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {campaign.metrics.slice(0, 3).map((m, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-bold border border-slate-100">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                    U{i}
                                                </div>
                                            ))}
                                            <div className="w-8 h-8 rounded-full bg-[var(--sage)]/20 border-2 border-white flex items-center justify-center text-[8px] font-bold text-[var(--sage-dark)]">
                                                +12
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--forest)]/5 text-[var(--forest)] group-hover:bg-[var(--forest)] group-hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                                            Step Into Campaign
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA / Proposal */}
                <div className="mt-20 card-glass p-12 bg-white border-2 border-dashed border-[var(--sage)]/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--sage)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Heart className="w-12 h-12 text-[var(--ochre)] mx-auto mb-6 animate-bounce" />
                    <h3 className="text-3xl font-bold serif text-[var(--forest)] mb-4">Have a different mission on your heart?</h3>
                    <p className="text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-serif italic text-lg">
                        "The world's brokenness is vaste, but your specific gifts are the key to a specific restoration. Propose your own non-profit campaign and Adeline will help you architect it."
                    </p>
                    <button className="px-12 py-4 bg-[var(--forest)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Architect a New Initiative
                    </button>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto p-12 text-center">
                <p className="text-[var(--forest)] font-black uppercase tracking-[0.5em] text-[9px] opacity-20 italic">WORLD RESTORATION ARCHIVES • NEIGHBORLY LOVE • ADELINE ACADEMY</p>
            </footer>
        </div>
    );
}
