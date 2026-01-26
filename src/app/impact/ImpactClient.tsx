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
    Search,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { CAMPAIGNS, Campaign } from '@/lib/constants/campaigns';

const ICON_MAP: Record<string, any> = {
    Scale, Shield, Hammer, Home, Award, Wrench, Users, Palette, Sparkles, GraduationCap, BookOpen, Leaf
};

interface ScrapedCampaign extends Campaign {
    source_url?: string;
    organization?: string;
    scraped?: boolean;
}

export default function ImpactClient() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | 'Justice' | 'Community' | 'Growth' | 'Provision'>('All');
    const [scrapedCampaigns, setScrapedCampaigns] = useState<ScrapedCampaign[]>([]);
    const [searchingCategory, setSearchingCategory] = useState<string | null>(null);

    // New State for Wizard & Reflection
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(0);
    const [wizardAnswers, setWizardAnswers] = useState<string[]>([]);
    const [showReflection, setShowReflection] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [reflectionAnswer, setReflectionAnswer] = useState('');

    const allCampaigns = [...CAMPAIGNS, ...scrapedCampaigns];

    const filteredCampaigns = allCampaigns.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.objective.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || c.category === filter;
        return matchesSearch && matchesFilter;
    });

    const handleSearchCategory = async (category: string) => {
        setSearchingCategory(category);
        try {
            const res = await fetch('/api/campaigns/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category }),
            });
            const data = await res.json();

            if (data.campaigns && data.campaigns.length > 0) {
                // Add new campaigns to the list
                setScrapedCampaigns(prev => {
                    const existing = new Set(prev.map(c => c.source_url));
                    const newCampaigns = data.campaigns.filter((c: ScrapedCampaign) => !existing.has(c.source_url));
                    return [...prev, ...newCampaigns];
                });
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearchingCategory(null);
        }
    };

    const handleCampaignClick = (campaign: Campaign) => {
        if ((campaign as ScrapedCampaign).source_url) {
            window.open((campaign as ScrapedCampaign).source_url, '_blank');
        } else {
            setSelectedCampaign(campaign);
            setShowReflection(true);
        }
    };

    // Wizard Logic
    const WIZARD_QUESTIONS = [
        {
            q: "What kind of impact do you want to make?",
            options: ["Help people directly", "Build things", "Change systems", "Teach others"]
        },
        {
            q: "What skill do you want to practice?",
            options: ["Leadership", "Technical Skills", "Communication", "Problem Solving"]
        }
    ];

    const handleWizardSelect = (answer: string) => {
        const newAnswers = [...wizardAnswers, answer];
        setWizardAnswers(newAnswers);
        if (wizardStep < WIZARD_QUESTIONS.length - 1) {
            setWizardStep(prev => prev + 1);
        } else {
            // Finish wizard - mapped simply for demo. In real app, more complex logic.
            setShowWizard(false);
            if (newAnswers.includes("Help people directly") || newAnswers.includes("Teach others")) {
                setFilter('Community');
            } else if (newAnswers.includes("Build things")) {
                setFilter('Provision');
            } else {
                setFilter('Growth');
            }
            // Scroll to grid
            document.getElementById('campaign-grid')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white">
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
                        <div className="flex items-center gap-3 text-[var(--ochre)] mb-6">
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
                            <button
                                onClick={() => {
                                    setWizardStep(0);
                                    setWizardAnswers([]);
                                    setShowWizard(true);
                                }}
                                className="px-6 py-3 bg-[var(--ochre)] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-[var(--ochre-dark)] transition-all cursor-pointer hover:scale-105 active:scale-95"
                            >
                                <Sparkles className="w-4 h-4" />
                                Find Your Campaign
                            </button>
                            <div className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold backdrop-blur-md transition-all cursor-pointer flex items-center gap-2">
                                <ChevronRight className="w-4 h-4" />
                                Browse All
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-1/2 right-20 -translate-y-1/2 hidden xl:block opacity-20 hover:opacity-40 transition-opacity">
                        <Globe className="w-96 h-96 scale-125" />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar mb-6">
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

                    {/* Search More Button */}
                    {filter !== 'All' && (
                        <button
                            onClick={() => handleSearchCategory(filter)}
                            disabled={searchingCategory === filter}
                            className="w-full py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 hover:border-purple-300 rounded-2xl text-purple-700 font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {searchingCategory === filter ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Searching the web for {filter} campaigns...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Search Web for More {filter} Campaigns
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Campaign Grid */}
                <div id="campaign-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--ochre)]">{campaign.category}</span>
                                            {(campaign as ScrapedCampaign).scraped && (
                                                <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-100 text-blue-600 rounded-full">Live Web</span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold serif text-[var(--forest)] group-hover:text-[var(--burgundy)] transition-colors">{campaign.title}</h3>
                                    </div>

                                    <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-3 italic">
                                        "{campaign.objective}"
                                    </p>

                                    {/* Skills / Learning Goals (New) */}
                                    {campaign.skills && campaign.skills.length > 0 && (
                                        <div className="mb-6">
                                            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                                                <GraduationCap className="w-3 h-3" />
                                                Skills You'll Build
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {campaign.skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="px-2 py-1 bg-[var(--forest)]/5 text-[var(--forest)] rounded text-[9px] font-bold">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-4">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <Zap className="w-4 h-4 text-[var(--burgundy)]" />
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
                                            <div className="w-8 h-8 rounded-full bg-[var(--burgundy)]/20 border-2 border-white flex items-center justify-center text-[8px] font-bold text-[var(--burgundy)]">
                                                +12
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCampaignClick(campaign)}
                                            className="flex items-center gap-2 px-6 py-3 bg-[var(--forest)]/5 text-[var(--forest)] group-hover:bg-[var(--forest)] group-hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                                        >
                                            {(campaign as ScrapedCampaign).source_url ? 'Visit Website' : 'Step Into Campaign'}
                                            {(campaign as ScrapedCampaign).source_url ? <ExternalLink className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA / Proposal */}
                <div className="mt-20 card-glass p-12 bg-white border-2 border-dashed border-[var(--sage)]/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--burgundy)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Heart className="w-12 h-12 text-[var(--ochre)] mx-auto mb-6 animate-bounce" />
                    <h3 className="text-3xl font-bold serif text-[var(--forest)] mb-4">Have a different mission on your heart?</h3>
                    <p className="text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-serif italic text-lg">
                        "The world's brokenness is vaste, but your specific gifts are the key to a specific restoration. Propose your own non-profit campaign and Adeline will help you architect it."
                    </p>
                    <button className="px-12 py-4 bg-[var(--forest)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Start Your Own Campaign
                    </button>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto p-12 text-center">
                <p className="text-[var(--forest)] font-black uppercase tracking-[0.5em] text-[9px] opacity-20 italic">WORLD RESTORATION ARCHIVES • NEIGHBORLY LOVE • ADELINE ACADEMY</p>
            </footer>

            {/* WIZARD MODAL */}
            {showWizard && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold serif text-[var(--forest)]">Let's find your path</h3>
                            <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <div className="w-5 h-0.5 bg-slate-400 rotate-45 absolute"></div>
                                <div className="w-5 h-0.5 bg-slate-400 -rotate-45"></div>
                            </button>
                        </div>

                        <div className="mb-8">
                            <div className="flex gap-2 mb-2">
                                {WIZARD_QUESTIONS.map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full bg-slate-100 ${i <= wizardStep ? 'bg-[var(--ochre)]' : ''}`} />
                                ))}
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Question {wizardStep + 1} of {WIZARD_QUESTIONS.length}</span>
                        </div>

                        <h4 className="text-xl font-medium text-[var(--charcoal)] mb-6">
                            {WIZARD_QUESTIONS[wizardStep].q}
                        </h4>

                        <div className="space-y-3">
                            {WIZARD_QUESTIONS[wizardStep].options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleWizardSelect(opt)}
                                    className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[var(--ochre)] hover:bg-[var(--ochre)]/5 transition-all font-medium text-slate-600 hover:text-[var(--forest)] flex items-center justify-between group"
                                >
                                    {opt}
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* REFLECTION MODAL */}
            {showReflection && selectedCampaign && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="mb-8 p-6 bg-[var(--forest)]/5 rounded-2xl border border-[var(--forest)]/10">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ochre)] mb-2 block">Campaign Selected</span>
                            <h3 className="text-2xl font-bold serif text-[var(--forest)] mb-2">{selectedCampaign.title}</h3>
                            <p className="text-slate-600 italic">"{selectedCampaign.objective}"</p>
                        </div>

                        <h4 className="text-lg font-bold text-[var(--charcoal)] mb-4">Before you begin, a moment of reflection...</h4>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-2">
                                    Why does this specific campaign speak to you right now?
                                </label>
                                <textarea
                                    value={reflectionAnswer}
                                    onChange={(e) => setReflectionAnswer(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/50 min-h-[120px] resize-none"
                                    placeholder="I feel called to this because..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowReflection(false)}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle join logic here
                                        setShowReflection(false);
                                        // Could show success toast, etc.
                                    }}
                                    disabled={!reflectionAnswer.trim()}
                                    className="flex-1 py-4 bg-[var(--forest)] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    Commit & Start Journey
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
