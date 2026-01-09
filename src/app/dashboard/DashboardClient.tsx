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
    Settings,
    LogOut,
    Lightbulb,
    Gamepad2,
    FolderOpen,
    CheckCircle2,
    Menu,
    Rocket,
    X,
    Home,
    Library,
    Heart,
    Leaf,
    FlaskConical,
    Scale,
    Globe,
    Calculator,
    Cloud,
    ArrowRight,
    BarChart3,
    Camera,
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
import { CameraInput } from '@/components/CameraInput';
import { GoalsWidget } from '@/components/GoalsWidget';
import MessageContent from '@/components/MessageContent';
import DailyManna from '@/components/DailyManna';

// Moved from DashboardClient to prevent re-declaration on every render
const dailyScriptures = [
    { verse: "Micah 6:8", text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God." },
    { verse: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
    { verse: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
    { verse: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
    { verse: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." }
];

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

const quickPrompts = [
    { icon: Lightbulb, text: "I want to learn something new" },
    { icon: Gamepad2, text: "Let's play a learning game" },
    { icon: Target, text: "Help me with a project" },
    { icon: BookOpen, text: "What should I study today?" },
];

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
    // New props for teacher dashboard
    students: Array<{
        id: string;
        display_name: string | null;
        avatar_url: string | null;
        grade_level: string | null;
    }>;
    selectedStudent: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
        grade_level: string | null;
    } | null;
    currentViewingUserId: string; // The ID of the user whose data is currently displayed
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
    students, // New prop
    selectedStudent, // New prop
    currentViewingUserId, // New prop
}: DashboardClientProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

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
            // Start with an empty chat. Adeline's identity comes from the server SYSTEM_PROMPT,
            // not a seeded client message (which can contaminate tone and behavior).
            setMessages([]);
        }
    }, [activeConversation]);

    const [currentChatId, setCurrentChatId] = useState<string | null>(activeConversation?.id || null);

    // Update currentChatId when activeConversation changes prop (e.g. navigation)
    useEffect(() => {
        if (activeConversation?.id) {
            setCurrentChatId(activeConversation.id);
        }
    }, [activeConversation]);

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
    const [showCameraInput, setShowCameraInput] = useState(false);

    const todayScripture = dailyScriptures[new Date().getDate() % dailyScriptures.length];
    const currentPassage = todayScripture.text;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const totalRequiredCredits = allRequirements.reduce((sum, req) => sum + req.required_credits, 0);
    const totalEarnedCredits = graduationProgress.reduce((sum, prog) => sum + prog.credits_earned, 0);
    const overallProgress = totalRequiredCredits > 0 ? (totalEarnedCredits / totalRequiredCredits) * 100 : 0;

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

const handleSendMessage = async (textOverride?: string, imageData?: string) => {
        const messageText = textOverride || input.trim();
        if ((!messageText && !imageData) || isTyping) return;

        setLoading(true);

        const userMessage: Message = {
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                    studentInfo: {
                        name: selectedStudent?.display_name ?? profile?.display_name,
                        gradeLevel: selectedStudent?.grade_level ?? profile?.grade_level,
                        skills: studentSkills.map(s => s.skill.name),
                        graduationProgress: graduationProgress.map(p => ({
                            track: p.requirement.name,
                            earned: p.credits_earned,
                            required: p.requirement.required_credits
                        })),
                    },
                    userId: currentViewingUserId,
                    conversationId: currentChatId,
                    imageData: imageData,
                }),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();

            // Store AI data in state
            if (data.summary) setAiSummary(data.summary);
            if (data.opportunities) setOpportunities(data.opportunities);

            if (data.conversationId && data.conversationId !== currentChatId) {
                setCurrentChatId(data.conversationId);
                router.replace(`/dashboard?chatId=${data.conversationId}`);
                router.refresh();
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.content,
                skills: data.skills,
                type: data.type,
                animationData: data.animationData,
                code: data.code,
                worksheetData: data.worksheetData,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I'm having trouble connecting right now.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsTyping(false);
            setLoading(false);
        }
    };




    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const handleDeepDive = async () => {
        if (!currentPassage) return;
        const prompt = `Deep Dive Study: ${currentPassage}`;
        await handleSendMessage(prompt);
    };

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
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-[...]`}
