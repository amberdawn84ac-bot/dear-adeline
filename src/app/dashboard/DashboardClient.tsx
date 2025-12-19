'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Send,
    Brain,
    BookOpen,
    GraduationCap,
    Target,
    Trophy,
    Palette,
    Settings,
    LogOut,
    ChevronRight,
    Lightbulb,
    Gamepad2,
    FolderOpen,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Menu,
    X,
    Home,
    Library,
    User as UserIcon
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    skills?: string[];
    timestamp: Date;
}

interface DashboardClientProps {
    user: User;
    profile: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
        dashboard_theme: { primary: string; mode: string } | null;
        grade_level: string | null;
        state_standards: string | null;
        role: string;
    } | null;
    studentSkills: Array<{
        id: string;
        skill: { name: string; category: string; credit_value: number };
        earned_at: string;
    }>;
    graduationProgress: Array<{
        id: string;
        credits_earned: number;
        requirement: { id: string; name: string; category: string; required_credits: number };
    }>;
    allRequirements: Array<{
        id: string;
        name: string;
        category: string;
        required_credits: number;
    }>;
    portfolioItems: Array<{
        id: string;
        title: string;
        type: string;
        created_at: string;
    }>;
    activeConversation: {
        id: string;
        messages: Message[];
        topic: string | null;
    } | null;
    learningGaps: Array<{
        id: string;
        skill_area: string;
        severity: string;
        suggested_activities: { title: string; description: string }[];
    }>;
    profileError?: any;
}

export default function DashboardClient({
    user,
    profile,
    studentSkills,
    graduationProgress,
    allRequirements,
    portfolioItems,
    activeConversation,
    learningGaps,
    profileError,
}: DashboardClientProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>(
        activeConversation?.messages || [
            {
                role: 'assistant',
                content: `Hi ${profile?.display_name || 'there'}! 👋 I'm Adeline, your learning companion. What are you excited to learn about or work on today?`,
                timestamp: new Date(),
            },
        ]
    );
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const totalRequiredCredits = allRequirements.reduce((sum, req) => sum + req.required_credits, 0);
    const totalEarnedCredits = graduationProgress.reduce((sum, prog) => sum + prog.credits_earned, 0);
    const overallProgress = totalRequiredCredits > 0 ? (totalEarnedCredits / totalRequiredCredits) * 100 : 0;

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.startsWith('en-US')) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    studentInfo: {
                        name: profile?.display_name,
                        gradeLevel: profile?.grade_level,
                        skills: studentSkills.map(s => s.skill.name),
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Chat API Error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.speak) {
                speakText(data.speak);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.content,
                skills: data.skills,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I'm having trouble connecting right now. Please try again in a moment!",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    const quickPrompts = [
        { icon: Lightbulb, text: "I want to learn something new" },
        { icon: Gamepad2, text: "Let's play a learning game" },
        { icon: Target, text: "Help me with a project" },
        { icon: BookOpen, text: "What should I study today?" },
    ];

    return (
        <div className="min-h-screen flex bg-[var(--cream)]">
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

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

                    <div className="p-4 border-b border-[var(--cream-dark)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--dusty-rose)] to-[var(--terracotta)] flex items-center justify-center text-white font-semibold shadow-sm">
                                {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{profile?.display_name || 'Student'}</p>
                                <p className="text-sm text-[var(--charcoal-light)] truncate">{profile?.grade_level || 'Grade not set'}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--sage-light)] text-[var(--sage-dark)] font-medium">
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
                        <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <GraduationCap className="w-5 h-5" />
                            <span>Graduation Tracker</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-[var(--cream-dark)] space-y-1">
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
                <header className="lg:hidden sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[var(--sage)]" />
                        <span className="font-semibold">Dear Adeline</span>
                    </div>
                    <div className="w-6" />
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar">
                    <div className="grid grid-cols-12 gap-6 h-full">
                        {/* Chat Area */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col h-[600px] lg:h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-[var(--cream-dark)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--cream-dark)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--sage-light)] flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-[var(--sage-dark)]" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-800">Learning Chat</h2>
                                        <p className="text-xs text-slate-500">Talk to Adeline</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user'
                                            ? 'bg-[var(--sage-dark)] text-white rounded-tr-none'
                                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                                            }`}>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                                            {m.skills && m.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--cream-dark)]/20">
                                                    {m.skills.map((skill, j) => (
                                                        <span key={j} className="text-[10px] font-bold uppercase tracking-wider bg-white/50 text-slate-600 px-2 py-1 rounded-md border border-slate-200/50 flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-50 px-4 py-3 rounded-2xl flex gap-1 animate-pulse">
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-[var(--cream-dark)]">
                                {messages.length <= 1 && (
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {quickPrompts.map((p, i) => (
                                            <button key={i} onClick={() => setInput(p.text)} className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[var(--sage)] transition-all text-xs text-slate-600 shadow-sm">
                                                <p.icon className="w-3.5 h-3.5 text-[var(--sage)]" />
                                                <span>{p.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Message Adeline..."
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm ring-[var(--sage)] focus:ring-2 focus:outline-none"
                                    />
                                    <button type="submit" disabled={!input.trim() || isTyping} className="bg-[var(--sage-dark)] text-white p-2.5 rounded-xl hover:bg-[var(--sage)] transition-colors shadow-sm disabled:opacity-50">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto no-scrollbar lg:h-[calc(100vh-120px)]">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--cream-dark)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-[var(--sage)]" />
                                        Goal Progress
                                    </h3>
                                    <span className="text-2xl font-black text-[var(--sage-dark)]">{overallProgress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                                    <div className="bg-gradient-to-r from-[var(--sage)] to-[var(--sage-dark)] h-full transition-all duration-1000 ease-out" style={{ width: `${overallProgress}%` }} />
                                </div>
                                <div className="space-y-4">
                                    {allRequirements.slice(0, 3).map((req) => {
                                        const prog = graduationProgress.find(p => p.requirement.id === req.id);
                                        const earned = prog?.credits_earned || 0;
                                        const percentage = Math.min((earned / req.required_credits) * 100, 100);
                                        return (
                                            <div key={req.id}>
                                                <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600">
                                                    <span>{req.name}</span>
                                                    <span>{earned} / {req.required_credits}</span>
                                                </div>
                                                <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                                                    <div className="bg-[var(--sage)] h-full rounded-full" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--cream-dark)]">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    Skills Earned
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {studentSkills.map(s => (
                                        <span key={s.id} className="bg-amber-50 text-amber-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            {s.skill.name}
                                        </span>
                                    ))}
                                    {studentSkills.length === 0 && <p className="text-xs text-slate-400 italic">No skills yet!</p>}
                                </div>
                            </div>

                            {portfolioItems.length > 0 && (
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--cream-dark)]">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                        <FolderOpen className="w-5 h-5 text-indigo-500" />
                                        Recent Projects
                                    </h3>
                                    <div className="space-y-2">
                                        {portfolioItems.slice(0, 3).map(item => (
                                            <Link key={item.id} href={`/portfolio/${item.id}`} className="block p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all">
                                                <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{item.type}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Debug Overlay - FINAL VERSION (V4) */}
            <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white p-4 rounded-lg text-xs font-mono shadow-2xl border-2 border-white animate-pulse max-w-sm">
                <p className="font-bold border-b border-white/20 mb-2">DEBUG INFO (V4)</p>
                <p>Email: {user.email}</p>
                <p className="truncate text-[10px]">ID: {user.id}</p>
                <p>Role: {profile?.role || 'null'}</p>
                {profileError && <p className="text-red-300 mt-1">Error: {JSON.stringify(profileError)}</p>}
                <p className="mt-2 pt-2 border-t border-white/10 font-bold text-yellow-200">PROJECT URL CHECK:</p>
                <p className="truncate text-[10px] break-all">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            </div>
        </div>
    );
}
