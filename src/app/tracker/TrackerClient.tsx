'use client';

import { useState } from 'react';
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
    Home,
    FolderOpen,
    Library,
    Settings,
    LogOut,
    Menu,
    ChevronDown,
    ChevronUp
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
    profile: { display_name: string | null; state_standards: string | null } | null;
    requirements: Requirement[];
    progress: Progress[];
    earnedSkills: EarnedSkill[];
    allSkills: Skill[];
}

const categoryIcons: Record<string, typeof BookOpen> = {
    ela: BookOpen,
    math: Calculator,
    science: FlaskConical,
    social_studies: Globe,
    fine_arts: Palette,
    world_languages: Languages,
    technology: Monitor,
    health_pe: Heart,
    electives: Target,
};

const categoryColors: Record<string, string> = {
    ela: 'from-blue-500 to-blue-600',
    math: 'from-purple-500 to-purple-600',
    science: 'from-green-500 to-green-600',
    social_studies: 'from-orange-500 to-orange-600',
    fine_arts: 'from-pink-500 to-pink-600',
    world_languages: 'from-indigo-500 to-indigo-600',
    technology: 'from-cyan-500 to-cyan-600',
    health_pe: 'from-red-500 to-red-600',
    electives: 'from-gray-500 to-gray-600',
};

export default function TrackerClient({
    profile,
    requirements,
    progress,
    earnedSkills,
    allSkills,
}: TrackerClientProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    // Calculate totals
    const totalRequired = requirements.reduce((sum, req) => sum + req.required_credits, 0);
    const totalEarned = progress.reduce((sum, p) => sum + p.credits_earned, 0);
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
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[var(--cream-dark)]">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold">Dear Adeline</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Home className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/portfolio" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <FolderOpen className="w-5 h-5" />
                            <span>Portfolio</span>
                        </Link>
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Library className="w-5 h-5" />
                            <span>Project Library</span>
                        </Link>
                        <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--sage-light)] text-[var(--sage-dark)]">
                            <GraduationCap className="w-5 h-5" />
                            <span className="font-medium">Graduation Tracker</span>
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
                        <GraduationCap className="w-5 h-5 text-[var(--sage)]" />
                        <span className="font-semibold">Graduation Tracker</span>
                    </div>
                    <div className="w-6" />
                </header>

                <div className="p-4 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Graduation Tracker</h1>
                        <p className="text-[var(--charcoal-light)]">
                            Track your progress toward {profile?.state_standards?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Oklahoma'} graduation requirements
                        </p>
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
                                    {overallPercent >= 100 ? '🎉 Congratulations!' : 'Keep Going!'}
                                </h2>
                                <p className="text-lg opacity-90 mb-4">
                                    {totalEarned.toFixed(1)} of {totalRequired} credits earned
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <div className="bg-white/20 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">{earnedSkills.length}</div>
                                        <div className="text-sm opacity-80">Skills Earned</div>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">
                                            {requirements.filter(r => {
                                                const p = getProgressForRequirement(r.id);
                                                return p && p.credits_earned >= r.required_credits;
                                            }).length}
                                        </div>
                                        <div className="text-sm opacity-80">Areas Complete</div>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-4 py-2">
                                        <div className="text-2xl font-bold">{(totalRequired - totalEarned).toFixed(1)}</div>
                                        <div className="text-sm opacity-80">Credits Remaining</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Breakdown */}
                    <div className="space-y-4">
                        {requirements.map((req) => {
                            const prog = getProgressForRequirement(req.id);
                            const earned = prog?.credits_earned || 0;
                            const percent = (earned / req.required_credits) * 100;
                            const isComplete = earned >= req.required_credits;
                            const Icon = categoryIcons[req.category] || Target;
                            const colorClass = categoryColors[req.category] || 'from-gray-500 to-gray-600';
                            const isExpanded = expandedCategories.includes(req.category);
                            const categorySkills = getSkillsForCategory(req.category);

                            return (
                                <div key={req.id} className="card">
                                    <div
                                        className="flex items-center gap-4 cursor-pointer"
                                        onClick={() => toggleCategory(req.category)}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold truncate flex items-center gap-2">
                                                    {req.name}
                                                    {isComplete && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                </h3>
                                                <span className="text-sm text-[var(--charcoal-light)] flex-shrink-0">
                                                    {earned.toFixed(1)} / {req.required_credits} credits
                                                </span>
                                            </div>
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${Math.min(percent, 100)}%`,
                                                        background: `linear-gradient(90deg, ${colorClass.includes('blue') ? '#3b82f6' : colorClass.includes('purple') ? '#8b5cf6' : colorClass.includes('green') ? '#22c55e' : 'var(--sage)'} 0%, ${colorClass.includes('blue') ? '#2563eb' : colorClass.includes('purple') ? '#7c3aed' : colorClass.includes('green') ? '#16a34a' : 'var(--sage-dark)'} 100%)`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        <button className="p-2 hover:bg-[var(--cream)] rounded-lg transition-colors">
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-[var(--charcoal-light)]" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-[var(--charcoal-light)]" />
                                            )}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-[var(--cream-dark)]">
                                            <p className="text-sm text-[var(--charcoal-light)] mb-4">{req.description}</p>

                                            <h4 className="text-sm font-medium mb-3">Skills Earned in this Category</h4>
                                            {categorySkills.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {categorySkills.map((es) => (
                                                        <div
                                                            key={es.id}
                                                            className="skill-badge earned"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            {es.skill.name}
                                                            <span className="text-xs opacity-70">+{es.skill.credit_value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-[var(--charcoal-light)] italic">
                                                    No skills earned yet in this category. Keep learning!
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Completion Certificate Preview (if complete) */}
                    {overallPercent >= 100 && (
                        <div className="mt-8 card bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] text-center">
                            <Award className="w-16 h-16 mx-auto mb-4 text-white" />
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Certificate Ready!
                            </h2>
                            <p className="text-white/90 mb-4">
                                Congratulations on completing all graduation requirements!
                            </p>
                            <button className="bg-white text-[var(--gold)] font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-shadow">
                                Download Certificate
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
