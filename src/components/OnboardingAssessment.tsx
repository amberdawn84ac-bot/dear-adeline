'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Loader2 } from 'lucide-react';


interface Message {
    role: 'adeline' | 'user';
    content: string;
}

export default function OnboardingAssessment({ user }: { user: any }) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [assessmentId, setAssessmentId] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when input changes
    useEffect(() => {
        if (!loading) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [loading]);

    // Initial Start
    useEffect(() => {
        const startAssessment = async () => {
            console.log('[OnboardingAssessment] Starting assessment for user:', user.id);
            setLoading(true);
            try {
                // If user has a name, use it
                const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'friend';

                const response = await fetch('/api/placement/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        displayName: displayName,
                        // Could pull grade from metadata if we saved it there during signup
                        grade: user.user_metadata?.grade_level
                    })
                });

                const data = await response.json();

                if (data.alreadyCompleted) {
                    // Already done? Redirect to dashboard
                    router.push('/dashboard');
                    return;
                }

                if (data.error) throw new Error(data.error);

                setAssessmentId(data.assessmentId);
                addAdelineMessage(data.firstQuestion);

            } catch (err) {
                console.error('Failed to start assessment:', err);
                setError("I'm having a little trouble connecting. Please refresh the page to try again.");
            } finally {
                setLoading(false);
            }
        };

        // Only start if we have a user
        if (user) {
            startAssessment();
        }
    }, [user, router]); // Run once when user is available

    const addAdelineMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'adeline', content }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'user', content }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !assessmentId) return;

        const responseText = input.trim();
        setInput('');
        setError('');
        addUserMessage(responseText);
        setLoading(true);

        try {
            const result = await fetch('/api/placement/continue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessmentId: assessmentId,
                    response: responseText
                })
            });

            const data = await result.json();

            if (data.complete) {
                addAdelineMessage(data.completionMessage || "That's everything I need! You did great.");
                setTimeout(() => {
                    addAdelineMessage("Building your personalized dashboard now...");
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                }, 1000);
            } else {
                addAdelineMessage(data.nextQuestion);
            }
        } catch (err) {
            console.error('Error in placement:', err);
            setError("Sorry, I didn't quite catch that. Could you try sending it again?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--forest)]">Let's Get Started</h1>
                <p className="text-sm text-[var(--charcoal-light)]">Chat with Adeline to personalize your plan</p>
            </div>

            {/* Chat Container */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-[var(--forest)]/5">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[var(--cream)]">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                                ? 'bg-[var(--forest)] text-white rounded-br-none'
                                : 'bg-white text-[var(--charcoal)] border border-[var(--cream-dark)] rounded-bl-none'
                                }`}>
                                {msg.role === 'adeline' && (
                                    <div className="flex items-center gap-2 mb-1 opacity-50">
                                        <Sparkles className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Adeline</span>
                                    </div>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-[var(--cream-dark)] flex gap-1">
                                <div className="w-2 h-2 bg-[var(--sage)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-[var(--sage)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-[var(--sage)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-[var(--cream-dark)]">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your answer here..."
                            className="flex-1 px-4 py-3 bg-[var(--cream)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--forest)] outline-none transition-all placeholder:text-[var(--charcoal-light)]/50"
                            disabled={loading || !assessmentId}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading || !assessmentId}
                            className="p-3 bg-[var(--forest)] text-white rounded-xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-xs text-red-500 font-medium text-center bg-red-50 py-1 rounded-lg">{error}</p>
                    )}
                </form>
            </div>
        </div>
    );
}
