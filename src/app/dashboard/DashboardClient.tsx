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
    Plus,
    Rocket,
    X,
    Home,
    Library,
    User as UserIcon,
    Heart,
    Leaf,
    FlaskConical,
    Scale,
    Globe,
    Calculator,
    Shield,
    Cloud,
    ArrowRight,
    BarChart3
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { GameCenter } from '@/components/GameCenter';
import { SandboxedGame } from '@/components/SandboxedGame';
import { Whiteboard } from '@/components/Whiteboard';
import { TypingGame } from '@/components/TypingGame';
import { CodingGame } from '@/components/CodingGame';
import { DigitalWorksheet } from '@/components/DigitalWorksheet';
import { CodeWorkspace } from '@/components/CodeWorkspace';
import { OnboardingModal } from '@/components/OnboardingModal';
import { VoiceSession } from '@/components/VoiceSession';
import { GoalsWidget } from '@/components/GoalsWidget';
import MessageContent from '@/components/MessageContent';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    skills?: string[];
    game?: string;
    type?: 'default' | 'lesson_award' | 'whiteboard_anim' | 'code_lesson' | 'worksheet' | 'typing_game' | 'coding_game';
    animationData?: string;
    code?: string;
    worksheetData?: any;
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
    conversationHistory: Array<{
        id: string;
        title: string | null;
        updated_at: string;
        topic: string | null;
    }>;
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
    conversationHistory,
    learningGaps,
    profileError,
}: DashboardClientProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Only show onboarding if explicitly requested via URL parameter (set during signup)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const shouldOnboard = params.get('onboarding') === 'true';

            if (shouldOnboard) {
                setShowOnboarding(true);
            }
        }
    }, []);

    useEffect(() => {
        setIsClient(true);
        if (activeConversation?.messages) {
            setMessages(activeConversation.messages);
        } else {
            setMessages([
                {
                    role: 'assistant',
                    content: profile?.display_name
                        ? `Hello there, ${profile.display_name}. I'm Adeline! I was just thinking that "wisdom is like a garden; if it is not cultivated, it cannot be harvested." What shall we build or discover together today, dear?`
                        : "Hello! I am Adeline, your learning companion. I always say that a curious mind is the best tool on the farm. What shall we discover together today, dear?",
                    timestamp: new Date(),
                },
            ]);
        }
    }, [activeConversation, profile?.display_name]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [gameData, setGameData] = useState<any>(null);
    const [customGameHtml, setCustomGameHtml] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [activeModality, setActiveModality] = useState<'BUILDER' | 'ARTIST' | 'SCHOLAR' | 'ORATOR'>('ORATOR');
    const [workspaceView, setWorkspaceView] = useState<'none' | 'whiteboard' | 'code' | 'worksheet' | 'game'>('none');
    const [workspaceData, setWorkspaceData] = useState<any>(null);
    const [showCelebration, setShowCelebration] = useState<string[] | null>(null);
    const [showVoiceSession, setShowVoiceSession] = useState(false);

    const dailyScriptures = [
        { verse: "Micah 6:8", text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God." },
        { verse: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
        { verse: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
        { verse: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
        { verse: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." }
    ];
    const todayScripture = dailyScriptures[new Date().getDate() % dailyScriptures.length];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const totalRequiredCredits = allRequirements.reduce((sum, req) => sum + req.required_credits, 0);
    const totalEarnedCredits = graduationProgress.reduce((sum, prog) => sum + prog.credits_earned, 0);
    const overallProgress = totalRequiredCredits > 0 ? (totalEarnedCredits / totalRequiredCredits) * 100 : 0;

    const trackConfig: Record<string, { icon: any; color: string; badgeColor: string }> = {
        "God's Creation & Science": { icon: FlaskConical, color: 'text-[var(--forest)]', badgeColor: 'bg-[var(--forest)]/10 text-[var(--forest)] border-[var(--forest)]/20' },
        "Health/Naturopathy": { icon: Heart, color: 'text-[var(--dusty-rose)]', badgeColor: 'bg-[var(--dusty-rose)]/10 text-[var(--dusty-rose)] border-[var(--dusty-rose)]/20' },
        "Food Systems": { icon: Leaf, color: 'text-[var(--ochre)]', badgeColor: 'bg-[var(--ochre)]/10 text-[var(--ochre)] border-[var(--ochre)]/20' },
        "Government/Economics": { icon: BarChart3, color: 'text-[var(--forest-light)]', badgeColor: 'bg-[var(--forest-light)]/10 text-[var(--forest-light)] border-[var(--forest-light)]/20' },
        "Justice": { icon: Scale, color: 'text-[var(--ochre-light)]', badgeColor: 'bg-[var(--ochre-light)]/10 text-[var(--ochre-light)] border-[var(--ochre-light)]/20' },
        "Discipleship": { icon: Sparkles, color: 'text-[var(--burgundy)]', badgeColor: 'bg-[var(--burgundy)]/5 text-[var(--burgundy)] border-[var(--burgundy)]/10' },
        "History": { icon: Globe, color: 'text-[var(--burgundy)]', badgeColor: 'bg-[var(--burgundy)]/5 text-[var(--burgundy)] border-[var(--burgundy)]/10' },
        "English/Lit": { icon: BookOpen, color: 'text-[var(--ochre)]', badgeColor: 'bg-[var(--ochre)]/10 text-[var(--ochre)] border-[var(--ochre)]/20' },
        "Math": { icon: Calculator, color: 'text-[var(--charcoal)]', badgeColor: 'bg-[var(--charcoal)]/5 text-[var(--charcoal)] border-[var(--charcoal)]/10' },
    };

    const earnedBadges = graduationProgress.filter(p => p.credits_earned >= 0.5); // Example threshold for a badge

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

    const handleSendMessage = async (textOverride?: string) => {
        const messageText = textOverride || input.trim();
        if (!messageText || isTyping) return;

        const userMessage: Message = {
            role: 'user',
            content: messageText,
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
                        graduationProgress: graduationProgress.map(p => ({
                            track: p.requirement.name,
                            earned: p.credits_earned,
                            required: p.requirement.required_credits
                        })),
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Chat API Error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Disabled robotic browser TTS - use Voice button for natural speech instead
            // if (data.speak) {
            //     speakText(data.speak);
            // }

            // Parse game tags from response
            let gameType: string | undefined;
            const gameMatch = data.content?.match(/<GAME>(.+?)<\/GAME>/);
            if (gameMatch) {
                const fullGameTag = gameMatch[1];
                if (fullGameTag.includes(':')) {
                    const [type, ...jsonDataParts] = fullGameTag.split(':');
                    gameType = type.trim();
                    try {
                        const parsedData = JSON.parse(jsonDataParts.join(':').trim());
                        setGameData(parsedData);
                    } catch (e) {
                        console.error('Failed to parse game JSON data', e);
                        setGameData(null);
                    }
                } else {
                    gameType = fullGameTag.trim();
                    setGameData(null);
                }

                if (gameType) {
                    setActiveGame(gameType);
                }
            }

            // Parse custom game HTML
            const customGameMatch = data.content?.match(/<CUSTOM_GAME>([\s\S]+?)<\/CUSTOM_GAME>/);
            if (customGameMatch) {
                const gameHtml = customGameMatch[1].trim();
                setCustomGameHtml(gameHtml);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.content,
                skills: data.skills,
                type: data.type,
                animationData: data.animationData,
                code: data.code,
                worksheetData: data.worksheetData,
                game: gameType,
                timestamp: new Date(),
            };

            // Automatically open workspaces based on response type
            if (data.type === 'whiteboard_anim') {
                setWorkspaceView('whiteboard');
                setWorkspaceData(data.animationData);
            } else if (data.type === 'worksheet') {
                setWorkspaceView('worksheet');
                setWorkspaceData(data.worksheetData);
            } else if (data.type === 'code_lesson') {
                setWorkspaceView('code');
                setWorkspaceData(data.code);
            }

            if (data.type === 'lesson_award' && data.skills) {
                setShowCelebration(data.skills);
                setTimeout(() => setShowCelebration(null), 5000);
            }

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
        router.push('/login');
        router.refresh();
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
                <div className="flex flex-col h-full bg-[var(--cream-dark)]/30">
                    <div className="p-6 border-b border-[var(--forest)]/10 bg-[var(--forest)] text-[var(--cream)]">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--ochre)] flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight serif">Dear Adeline</span>
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

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Navigation</p>
                        <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/dashboard' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                            <Home className="w-4 h-4" />
                            <span className="text-sm">Dashboard</span>
                        </Link>
                        <Link href="/portfolio" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/portfolio' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                            <FolderOpen className="w-4 h-4" />
                            <span className="text-sm">Portfolio</span>
                        </Link>
                        <Link href="/library" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/library' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                            <Library className="w-4 h-4" />
                            <span className="text-sm">Project Library</span>
                        </Link>
                        <Link href="/intelligence" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/intelligence' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                            <Cloud className="w-4 h-4" />
                            <span className="text-sm">Local Intelligence</span>
                        </Link>
                        <Link href="/careers" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/careers' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                            <Rocket className="w-4 h-4" />
                            <span className="text-sm">Career Discovery</span>
                        </Link>
                        <Link href="/tracker" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/tracker' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-sm">Graduation Tracker</span>
                        </Link>

                        <div className="mt-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Spiritual Growth</p>
                            <Link href="/journal" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/journal' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                                <BookOpen className="w-4 h-4" />
                                <span className="text-sm">Journal</span>
                            </Link>
                            <Link href="/wisdom" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/wisdom' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                                <Heart className="w-4 h-4" />
                                <span className="text-sm">Wisdom in Action</span>
                            </Link>
                        </div>

                        <div className="mt-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Learning Tools</p>
                            <Link href="/gamelab" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/gamelab' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                                <Gamepad2 className="w-4 h-4" />
                                <span className="text-sm">Game Lab</span>
                            </Link>
                            <Link href="/diagnostic" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isClient && window.location.pathname === '/diagnostic' ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}>
                                <Target className="w-4 h-4" />
                                <span className="text-sm">Diagnostic Center</span>
                            </Link>
                        </div>

                        <div className="mt-8">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Learning History</p>
                            <div className="space-y-1">
                                {conversationHistory.map((chat) => (
                                    <button
                                        key={chat.id}
                                        onClick={() => router.push(`/dashboard?chatId=${chat.id}`)}
                                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${activeConversation?.id === chat.id ? 'bg-slate-100 text-slate-800' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'}`}
                                    >
                                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{chat.title || chat.topic || 'New Lesson'}</p>
                                            <p className="text-[10px] opacity-50">{new Date(chat.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </button>
                                ))}
                                {conversationHistory.length === 0 && (
                                    <p className="text-[10px] text-slate-400 italic px-4">No past lessons yet.</p>
                                )}
                            </div>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-[var(--cream-dark)] space-y-1">
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Settings</span>
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
            <main className="flex-1 flex flex-col min-h-[100dvh] max-h-[100dvh] overflow-hidden">
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
                        {/* Onboarding Flow */}
                        {showOnboarding && (
                            <OnboardingModal
                                userId={user.id}
                                onComplete={() => {
                                    setShowOnboarding(false);
                                    // Remove the onboarding parameter from URL
                                    const url = new URL(window.location.href);
                                    url.searchParams.delete('onboarding');
                                    window.history.replaceState({}, '', url);
                                    router.refresh();
                                }}
                            />
                        )}

                        {/* Chat Area */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col h-[500px] md:h-[600px] lg:h-[calc(100vh-120px)] bg-white rounded-2xl shadow-sm border border-[var(--cream-dark)] overflow-hidden">
                            <div className="p-4 border-b border-[var(--cream-dark)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--forest)]/10 flex items-center justify-center">
                                            <Brain className="w-6 h-6 text-[var(--forest)]" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-[var(--forest)] serif">Learning Chat</h2>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest opacity-60">Talk to Adeline</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowVoiceSession(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[var(--sage-light)] text-[var(--sage-dark)] rounded-xl hover:bg-[var(--sage)] hover:text-white transition-all font-medium text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                        Voice
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                {messages.map((m, i) => {
                                    // Parse potential scripture tag
                                    const scriptureMatch = m.content.match(/<SCRIPTURE>(.*?)<\/SCRIPTURE>/s);
                                    let cleanContent = m.content;
                                    let scriptureInfo = null;

                                    if (scriptureMatch) {
                                        scriptureInfo = scriptureMatch[1];
                                        cleanContent = m.content.replace(/<SCRIPTURE>.*?<\/SCRIPTURE>/s, '').trim();
                                    }

                                    return (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
                                                {scriptureInfo && (
                                                    <div className="mb-4 p-4 bg-[var(--ochre)]/10 border-l-4 border-[var(--ochre)] rounded-r-xl italic font-serif text-[var(--burgundy)] text-lg animate-in fade-in slide-in-from-left-2">
                                                        "{scriptureInfo}"
                                                    </div>
                                                )}
                                                {m.role === 'assistant' ? (
                                                    <MessageContent content={cleanContent} />
                                                ) : (
                                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{cleanContent}</p>
                                                )}

                                                {m.type === 'whiteboard_anim' && (
                                                    <button
                                                        onClick={() => { setWorkspaceView('whiteboard'); setWorkspaceData(m.animationData); }}
                                                        className="mt-3 w-full bg-[#76946a]/10 text-[#76946a] py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#76946a]/20 hover:bg-[#76946a]/20 transition-all"
                                                    >
                                                        View Adeline's Illustration
                                                    </button>
                                                )}

                                                {m.type === 'worksheet' && (
                                                    <button
                                                        onClick={() => { setWorkspaceView('worksheet'); setWorkspaceData(m.worksheetData); }}
                                                        className="mt-3 w-full bg-indigo-50 text-indigo-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-all"
                                                    >
                                                        Open Discovery Sheet
                                                    </button>
                                                )}

                                                {m.type === 'code_lesson' && (
                                                    <button
                                                        onClick={() => { setWorkspaceView('code'); setWorkspaceData(m.code); }}
                                                        className="mt-3 w-full bg-slate-900 text-indigo-300 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-slate-800 transition-all"
                                                    >
                                                        Open Code Workshop
                                                    </button>
                                                )}

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
                                    );
                                })}
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
                                    <button type="submit" disabled={!input.trim() || isTyping} className="bg-[var(--forest)] text-white p-2.5 rounded-xl hover:brightness-110 transition-all shadow-sm disabled:opacity-50">
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar Stats */}
                        <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto no-scrollbar lg:h-[calc(100vh-120px)]">
                            {/* Learning Goals Widget */}
                            {profile?.grade_level && profile?.state_standards && (
                                <GoalsWidget
                                    studentId={user.id}
                                    gradeLevel={profile.grade_level}
                                    state={profile.state_standards}
                                />
                            )}

                            {/* Daily Bread Card */}
                            <div className="card !p-0 overflow-hidden border-2 border-[var(--ochre)]/30 group">
                                <div className="bg-[var(--ochre)]/10 p-5 border-b border-[var(--ochre)]/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-[var(--ochre)] serif flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" />
                                            Daily Bread
                                        </h3>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--ochre)] opacity-60">Restoring Truth</span>
                                    </div>
                                    <p className="text-xs text-[var(--burgundy)]/70 italic">Get back to the original context and meaning.</p>
                                </div>
                                <div className="p-5">
                                    <div className="mb-6 p-4 bg-[var(--cream)] rounded-2xl border border-[var(--ochre)]/10 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-1 opacity-10">
                                            <Sparkles className="w-8 h-8 text-[var(--ochre)]" />
                                        </div>
                                        <p className="text-sm font-medium text-[var(--forest)] italic leading-relaxed mb-3 relative z-10">
                                            "{todayScripture.text}"
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--ochre)]">
                                            — {todayScripture.verse}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            handleSendMessage("Adeline, I want my Daily Bread deep-dive study on a scripture today. Show me the original language and context that modern translations might have missed.");
                                        }}
                                        className="w-full py-4 rounded-xl bg-[var(--ochre)] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        Start Deep Dive Study
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="card !p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-[var(--forest)] serif flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5" />
                                        Goal Progress
                                    </h3>
                                    <span className="text-2xl font-black text-[var(--ochre)]">{overallProgress.toFixed(0)}%</span>
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
                                <h3 className="font-bold text-[var(--forest)] serif flex items-center gap-2 mb-4">
                                    <Trophy className="w-5 h-5 text-[var(--ochre)]" />
                                    Badges Earned
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {earnedBadges.map(badge => {
                                        const config = trackConfig[badge.requirement.name];
                                        if (!config) return null;
                                        const Icon = config.icon;
                                        return (
                                            <div key={badge.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${config.badgeColor} transition-transform hover:scale-110 cursor-help group relative`} title={`${badge.requirement.name} Specialist`}>
                                                <Icon className="w-6 h-6" />
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    {badge.requirement.name} Master
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {earnedBadges.length === 0 && (
                                        <div className="col-span-4 py-4 text-center">
                                            <p className="text-xs text-slate-400 italic">Work on projects to earn your first badge!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--cream-dark)]">
                                <h3 className="font-bold text-[var(--forest)] serif flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-[var(--ochre)]" />
                                    Skills Earned
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {studentSkills.map(s => (
                                        <span key={s.id} className="bg-amber-50 text-amber-700 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                            {s.skill.name}
                                        </span>
                                    ))}
                                    {studentSkills.length === 0 && <p className="text-xs text-slate-400 italic">No skills yet!</p>}
                                </div>
                            </div>

                            {portfolioItems.length > 0 && (
                                <div className="card !p-5">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                        <FolderOpen className="w-5 h-5 text-indigo-500" />
                                        Recent Projects
                                    </h3>
                                    <div className="space-y-2">
                                        {portfolioItems.slice(0, 3).map(item => (
                                            <Link key={item.id} href="/portfolio" className="block p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all">
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

            {/* Workspace Slide-over / Area */}
            {workspaceView !== 'none' && (
                <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-[var(--cream)] shadow-2xl z-40 border-l border-[var(--cream-dark)] flex flex-col animate-slide-in-right">
                    <div className="p-4 border-b border-[var(--cream-dark)] flex justify-between items-center bg-white">
                        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
                            {workspaceView === 'whiteboard' ? 'Illustration Room' :
                                workspaceView === 'code' ? 'Logic Terminal' :
                                    workspaceView === 'worksheet' ? 'Discovery Sheet' : 'Learning Hub'}
                        </h3>
                        <button onClick={() => setWorkspaceView('none')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 p-6 overflow-hidden">
                        {workspaceView === 'whiteboard' && (
                            <Whiteboard
                                onSave={(url) => console.log('Saved whiteboard', url)}
                                animationData={workspaceData}
                            />
                        )}
                        {workspaceView === 'code' && (
                            <CodeWorkspace
                                initialCode={workspaceData || ''}
                                language="javascript"
                                onCodeRun={(code) => {
                                    setInput(`Check my logic: ${code}`);
                                    handleSendMessage();
                                    setWorkspaceView('none');
                                }}
                            />
                        )}
                        {workspaceView === 'worksheet' && (
                            <DigitalWorksheet
                                data={workspaceData}
                                onSubmit={(answers) => {
                                    setInput(`Here's my discovery: ${JSON.stringify(answers)}`);
                                    handleSendMessage();
                                    setWorkspaceView('none');
                                }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Game Modals */}
            {activeGame && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <GameCenter type={activeGame} gameData={gameData} onClose={() => { setActiveGame(null); setGameData(null); }} />
                </div>
            )}

            {customGameHtml && (
                <SandboxedGame
                    htmlContent={customGameHtml}
                    onClose={() => setCustomGameHtml(null)}
                />
            )}

            {showCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm animate-fade-in" />
                    <div className="relative bg-white p-12 rounded-[4rem] shadow-2xl border-4 border-[var(--ochre)] text-center animate-in zoom-in-75 duration-500 max-w-lg pointer-events-auto">
                        <div className="w-24 h-24 bg-[var(--ochre)]/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Trophy className="w-12 h-12 text-[var(--ochre)]" />
                        </div>
                        <p className="text-[var(--ochre)] font-black uppercase tracking-[0.4em] text-xs mb-4">Mastery Verified</p>
                        <h2 className="text-5xl font-bold serif text-[var(--forest)] mb-6">New Skills Earned!</h2>
                        <div className="flex flex-wrap justify-center gap-3 mb-8">
                            {showCelebration.map((skill, i) => (
                                <span key={i} className="px-6 py-2 bg-[var(--forest)] text-white font-bold rounded-2xl text-sm shadow-lg animate-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                        <button onClick={() => setShowCelebration(null)} className="btn-primary w-full">
                            Praise God! Continue Discovery
                        </button>
                    </div>
                </div>
            )}

            {/* Voice Session Modal */}
            {showVoiceSession && (
                <VoiceSession
                    onClose={() => setShowVoiceSession(false)}
                    studentName={profile?.display_name || undefined}
                />
            )}
        </div>
    );
}
