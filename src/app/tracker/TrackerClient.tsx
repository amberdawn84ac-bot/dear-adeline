'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    GraduationCap,
    CheckCircle2,
    Circle,
    TrendingUp,
    Award,
    Target,
    BookOpen,
    Calculator,
    FlaskConical,
    Globe,
    Palette,
    Languages,
    Monitor,
    Heart,
    ChevronDown,
    ChevronUp,
    Scale,
    Menu,
    Home,
    FolderOpen,
    Library,
    Settings,
    LogOut,
    Leaf,
    BarChart3,
    Rocket,
    Loader2,
    Save
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Requirement {
    id: string;
    name: string;
    description: string;
    category: string;
    required_credits: number;
}

interface Progress {
    id: string;
    requirement_id: string;
    credits_earned: number;
    completed_at: string | null;
}

interface Skill {
    id: string;
    name: string;
    category: string;
    subcategory: string | null;
    credit_value: number;
}

interface EarnedSkill {
    id: string;
    skill_id: string;
    earned_at: string;
    source_type: string;
    skill: Skill;
}

interface TrackerClientProps {
    profile: { id: string, role: string, display_name: string | null; state_standards: string | null } | null;
    requirements: Requirement[];
    progress: Progress[];
    earnedSkills: EarnedSkill[];
    allSkills: Skill[];
    portfolio: any[];
    topics: string[];
}

const categoryIcons: Record<string, typeof BookOpen> = {
    creation_science: FlaskConical,
    health_naturopathy: Heart,
    food_systems: Leaf,
    gov_econ: BarChart3,
    justice: Scale,
    discipleship: Sparkles,
    history: Globe,
    english_lit: BookOpen,
    math: Calculator,
};

const categoryColors: Record<string, string> = {
    creation_science: 'from-green-500 to-green-600',
    health_naturopathy: 'from-red-500 to-red-600',
    food_systems: 'from-orange-500 to-orange-600',
    gov_econ: 'from-blue-500 to-blue-600',
    justice: 'from-indigo-500 to-indigo-600',
    discipleship: 'from-purple-500 to-purple-600',
    history: 'from-amber-500 to-amber-600',
    english_lit: 'from-pink-500 to-pink-600',
    math: 'from-cyan-500 to-cyan-600',
};

export default function TrackerClient({
    profile,
    requirements,
    progress,
    earnedSkills,
    allSkills,
    portfolio,
    topics,
}: TrackerClientProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [blueprint, setBlueprint] = useState<any>(null);
    const [loadingBlueprint, setLoadingBlueprint] = useState(true);
    const [localRequirements, setLocalRequirements] = useState<Requirement[]>(requirements);
    const [discovering, setDiscovering] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const isAdmin = profile?.role === 'admin';
    const hasPersistentRequirements = requirements.length > 0;
    const complianceMode = !!profile?.state_standards;

    useEffect(() => {
        const fetchBlueprint = async () => {
            if (localRequirements.length === 0) return;
            setLoadingBlueprint(true);
            try {
                const res = await fetch('/api/graduation-blueprint', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profile,
                        requirements: localRequirements,
                        progress,
                        earnedSkills,
                        portfolio,
                        topics
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setBlueprint(data);
                }
            } finally {
                setLoadingBlueprint(false);
            }
        };
        fetchBlueprint();
    }, [profile, localRequirements, progress, earnedSkills, portfolio, topics]);

    const handleDiscoverRequirements = async () => {
        if (!profile?.state_standards) return;
        setDiscovering(true);
        try {
            const res = await fetch('/api/graduation-requirements/discover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: profile.state_standards }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.requirements) {
                    setLocalRequirements(data.requirements);
                }
            }
        } catch (error) {
            console.error('Discovery failed:', error);
        } finally {
            setDiscovering(false);
        }
    };

    const handlePublishRequirements = async () => {
        if (!profile?.state_standards || localRequirements.length === 0) return;
        setPublishing(true);
        try {
            const res = await fetch('/api/graduation-requirements/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requirements: localRequirements,
                    state: profile.state_standards
                }),
            });
            if (res.ok) {
                router.refresh();
                // We'll keep the local ones for now but refresh might update props
            }
        } catch (error) {
            console.error('Publishing failed:', error);
        } finally {
            setPublishing(false);
        }
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Calculate totals with robustness (Still tracked in bg, but renamed for students)
    const totalRequired = requirements.reduce((sum, req) => sum + Number(req.required_credits || 0), 0);
    const totalEarned = progress.reduce((sum, p) => sum + Number(p.credits_earned || 0), 0);
    const overallPercent = totalRequired > 0 ? (totalEarned / totalRequired) * 100 : 0;

    const getProgressForRequirement = (reqId: string) => {
        return progress.find(p => p.requirement_id === reqId);
    };

    const getSkillsForCategory = (category: string) => {
        return earnedSkills.filter(es => es.skill.category === category);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex bg-[var(--cream)]">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full bg-[var(--cream-dark)]/30">
                    <div className="p-6 border-b border-[var(--forest)]/10 bg-[var(--forest)] text-[var(--cream)]">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--ochre)] flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight serif">Dear Adeline</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <Home className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/portfolio" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <FolderOpen className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>Portfolio</span>
                        </Link>
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <Library className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>Project Library</span>
                        </Link>
                        <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--forest)]/10 text-[var(--forest)] font-bold">
                            <TrendingUp className="w-5 h-5" />
                            <span>Mastery Roadmap</span>
                        </Link>
                        <Link href="/impact" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <Globe className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>World Impact</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-[var(--cream-dark)] space-y-1">
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--sage)]" />
                        <span className="font-semibold">Mastery Roadmap</span>
                    </div>
                    <div className="w-6" />
                </header>

                <div className="p-4 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-normal serif text-[var(--forest)] mb-2">Mastery Roadmap</h1>
                            <p className="text-[var(--charcoal-light)] font-medium">
                                Charting your growth across the 9 tracks of discovery.
                            </p>
                        </div>

                        {isAdmin && localRequirements.length > 0 && !hasPersistentRequirements && (
                            <button
                                onClick={handlePublishRequirements}
                                disabled={publishing}
                                className="px-6 py-3 bg-[var(--ochre)] text-white rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all flex items-center gap-2 group animate-in fade-in slide-in-from-right-4"
                            >
                                {publishing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                                Publish for {profile?.state_standards}
                            </button>
                        )}
                    </div>

                    {/* Overall Progress Card */}
                    <div className="card mb-8 bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] text-white">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="relative w-48 h-48">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth="12"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="12"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 88}`}
                                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - overallPercent / 100)}`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold">{overallPercent.toFixed(0)}%</span>
                                    <span className="text-sm opacity-80">Complete</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center lg:text-left">
                                <h2 className="text-2xl font-bold mb-2">
                                    {overallPercent >= 100 ? '🎉 Mastery Achieved!' : 'Becoming an Architect'}
                                </h2>
                                <p className="text-lg opacity-90 mb-4 italic">
                                    "Wisdom is the principal thing; therefore get wisdom."
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <div className="bg-white/20 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">{earnedSkills.length}</div>
                                        <div className="text-sm opacity-80 font-black uppercase tracking-widest text-[10px]">Skills Mastered</div>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">
                                            {requirements.filter(r => {
                                                const p = getProgressForRequirement(r.id);
                                                return p && Number(p.credits_earned || 0) >= Number(r.required_credits || 0);
                                            }).length}
                                        </div>
                                        <div className="text-sm opacity-80 font-black uppercase tracking-widest text-[10px]">Tracks Completed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Restorative Graduation Roadmap */}
                    <div className="mb-12 relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[var(--forest)]/5 rounded-[2rem] -rotate-1 scale-105" />
                        <div className="relative card bg-white border-2 border-dashed border-[var(--forest)]/20 p-8 lg:p-12 overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Rocket className="w-32 h-32" />
                            </div>

                            {loadingBlueprint ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-4">
                                    <Sparkles className="w-8 h-8 text-[var(--sage)] animate-spin-slow" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--charcoal-light)]">Individualizing Your Mission...</p>
                                </div>
                            ) : blueprint ? (
                                <div className="space-y-10">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--ochre)] mb-2 block">Your Individualized Graduation Mission</span>
                                            <h2 className="text-3xl font-bold serif text-[var(--forest)]">{blueprint.missionTitle}</h2>
                                        </div>
                                        <div className="flex items-center gap-3 px-6 py-3 bg-[var(--ochre)]/10 rounded-2xl text-[var(--ochre)]">
                                            <Target className="w-5 h-5" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Active Roadmap</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                        <div className="lg:col-span-2 space-y-10">
                                            <div className="space-y-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">The Spirit of the Requirement</h3>
                                                <p className="text-xl text-[var(--burgundy)] leading-relaxed font-serif italic">
                                                    "{blueprint.strategy}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="p-8 bg-[var(--burgundy)]/5 rounded-[2.5rem] border border-[var(--burgundy)]/10 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform">
                                                        <Heart className="w-24 h-24" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--burgundy)] mb-4 flex items-center gap-2">
                                                        <Heart className="w-3 h-3" />
                                                        Meaning & Purpose
                                                    </h4>
                                                    <p className="text-sm font-bold text-[var(--forest)] leading-relaxed relative z-10">
                                                        {blueprint.characterVision}
                                                    </p>
                                                </div>

                                                <div className="p-8 bg-[var(--sage)]/5 rounded-[2.5rem] border border-[var(--sage)]/10 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform">
                                                        <Globe className="w-24 h-24" />
                                                    </div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--sage-dark)] mb-4 flex items-center gap-2">
                                                        <Globe className="w-3 h-3" />
                                                        World Impact
                                                    </h4>
                                                    <p className="text-sm font-bold text-[var(--forest)] leading-relaxed relative z-10">
                                                        {blueprint.worldImpact}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Passionate Milestones</h3>
                                                <div className="space-y-4">
                                                    {blueprint.milestones?.map((m: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-4 p-5 bg-[var(--cream)] rounded-2xl border border-[var(--cream-dark)] hover:border-[var(--sage)] transition-colors group/m shadow-sm">
                                                            <div className="w-8 h-8 rounded-full bg-white border-2 border-[var(--sage)]/20 flex items-center justify-center shrink-0 text-xs font-bold text-[var(--sage)] group-hover/m:bg-[var(--sage)] group-hover/m:text-white transition-colors">
                                                                {i + 1}
                                                            </div>
                                                            <p className="text-sm font-bold text-[var(--forest)] pt-1">{m}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="p-8 bg-[var(--forest)] rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-1000" />
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#76946a] mb-4">Commencement Defense</h4>
                                                <p className="text-sm leading-relaxed mb-6 italic opacity-90 relative z-10 font-serif">
                                                    "{blueprint.finalDefense}"
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                                    <Award className="w-4 h-4" />
                                                    Spiritually Authenticated
                                                </div>
                                            </div>

                                            <div className="p-6 border-2 border-[var(--sage)]/20 rounded-[2rem] bg-white">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Mastery Inputs</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="opacity-50">PORTFOLIO DATA</span>
                                                        <span className="text-[var(--sage)]">{portfolio.length} ITEMS</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="opacity-50">MASTERY SKILLS</span>
                                                        <span className="text-[var(--sage)]">{earnedSkills.length} EARNED</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-slate-400 italic">Could not generate your individualized roadmap at this time. Check back soon!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mastery Tracks Split */}
                    <div className="space-y-12">
                        {localRequirements.length === 0 ? (
                            <div className="card-glass p-12 text-center bg-white border-2 border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-[var(--sage)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Target className="w-8 h-8 text-[var(--sage)]" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 serif mb-3">Roadmap Not Initialized</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 font-medium">
                                    We haven't indexed the graduation standards for <span className="text-[var(--forest)] font-bold capitalize">{profile?.state_standards || 'your state'}</span> yet.
                                    Adeline can discover them for you right now using public datasets.
                                </p>
                                <button
                                    onClick={handleDiscoverRequirements}
                                    disabled={discovering}
                                    className="btn-primary"
                                >
                                    {discovering ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Searching State Records...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Discover My Roadmap
                                        </>
                                    )}
                                </button>
                                <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Adeline will prioritize Public School standards for full compliance.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Spiritual & Character Core - The "Humanity" Requirements */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-[var(--burgundy)]/10 flex items-center justify-center">
                                            <Heart className="w-4 h-4 text-[var(--burgundy)]" />
                                        </div>
                                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--burgundy)]">Spiritual & Character Core</h2>
                                        {complianceMode && (
                                            <span className="ml-auto text-[9px] font-bold text-[var(--ochre)] bg-[var(--ochre)]/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                Academy Priority (Beyond State Law)
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {localRequirements.filter(r => ['discipleship', 'justice'].includes(r.category)).map((req) => (
                                            <RequirementCard key={req.id || req.name} req={req} />
                                        ))}
                                    </div>
                                </section>

                                {/* Academic Foundation - The "Compliance" Requirements */}
                                <section className="mt-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-[var(--forest)]/10 flex items-center justify-center">
                                            <Scale className="w-4 h-4 text-[var(--forest)]" />
                                        </div>
                                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--forest)]">The Academic Foundation</h2>
                                        {complianceMode && (
                                            <span className="ml-auto text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                State Compliance Tracking Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {localRequirements.filter(r => !['discipleship', 'justice'].includes(r.category)).map((req) => (
                                            <RequirementCard key={req.id || req.name} req={req} />
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {/* Completion Certificate Preview (if complete) */}
                        {overallPercent >= 100 && (
                            <div className="mt-8 card bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] text-center shadow-gold">
                                <Award className="w-16 h-16 mx-auto mb-4 text-white" />
                                <h2 className="text-2xl font-bold text-white mb-2 serif">
                                    Certificate Ready!
                                </h2>
                                <p className="text-white/90 mb-4 italic">
                                    Congratulations on completing all graduation requirements!
                                </p>
                                <button className="bg-white text-[var(--gold)] font-bold px-8 py-3 rounded-full hover:shadow-xl transition-all hover:scale-105">
                                    Download Certificate
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );

    // Sub-component for clean rendering
    function RequirementCard({ req }: { req: Requirement }) {
        const prog = getProgressForRequirement(req.id);
        const earned = Number(prog?.credits_earned || 0);
        const percent = (earned / Number(req.required_credits)) * 100;
        const isComplete = earned >= Number(req.required_credits);
        const Icon = categoryIcons[req.category] || Target;
        const colorClass = categoryColors[req.category] || 'from-gray-500 to-gray-600';
        const isExpanded = expandedCategories.includes(req.category);
        const categorySkills = getSkillsForCategory(req.category);

        const trackPurpose: Record<string, string> = {
            creation_science: "Unlocking the blueprints of the natural world to be a better steward.",
            health_naturopathy: "Caring for the temple so you have the vitality to serve.",
            food_systems: "Restoring the cycle of provision for your community.",
            gov_econ: "Mastering resources to build a legacy of generosity.",
            justice: "Protecting the vulnerable and speaking truth to power.",
            discipleship: "Aligning your heart with the mission of the Kingdom.",
            history: "Learning the long memory to avoid the shadows of the past.",
            english_lit: "Offering your voice and pen as instruments of love and truth for the Gospel.",
            math: "Training your mind in the perfect logic and design of the Creator.",
        };

        return (
            <div className="card bg-white hover:border-[var(--sage)] transition-all group/r">
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => toggleCategory(req.category)}
                >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-sm shadow-black/10`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div>
                                <h3 className="font-bold text-[var(--forest)] truncate flex items-center gap-2">
                                    {req.name}
                                    {isComplete && <CheckCircle2 className="w-4 h-4 text-[var(--sage)]" />}
                                </h3>
                                <p className="text-[9px] font-medium text-[var(--sage-dark)] opacity-0 group-hover/r:opacity-100 transition-opacity">
                                    {trackPurpose[req.category] || "Finding meaning in every lesson."}
                                </p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {complianceMode
                                    ? `${earned.toFixed(1)} / ${Number(req.required_credits).toFixed(1)} Credits`
                                    : (isComplete ? '100% Mastered' : `${percent.toFixed(0)}% Investigated`)}
                            </span>
                        </div>
                        <div className="progress-bar bg-slate-100">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${Math.min(percent, 100)}%`,
                                    background: `linear-gradient(90deg, ${colorClass.includes('red') ? '#ef4444' : colorClass.includes('purple') ? '#8b5cf6' : 'var(--sage)'} 0%, ${colorClass.includes('red') ? '#dc2626' : colorClass.includes('purple') ? '#7c3aed' : 'var(--sage-dark)'} 100%)`
                                }}
                            ></div>
                        </div>
                    </div>

                    <button className="p-2 hover:bg-[var(--cream)] rounded-lg transition-colors">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-300" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-300" />
                        )}
                    </button>
                </div>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed italic">"{req.description}"</p>

                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Mastery Evidence</h4>
                        {categorySkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {categorySkills.map((es) => (
                                    <div
                                        key={es.id}
                                        className="px-3 py-1.5 rounded-full bg-[var(--cream)] border border-[var(--cream-dark)] flex items-center gap-2 text-[10px] font-bold text-[var(--forest)]"
                                    >
                                        <Sparkles className="w-3 h-3 text-[var(--ochre)]" />
                                        {es.skill.name}
                                        <span className="opacity-40 text-[8px]">+{es.skill.credit_value}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 italic">
                                No evidence recorded yet for this track.
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
}
