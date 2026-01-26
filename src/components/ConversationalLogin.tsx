'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Send, Loader2, ArrowRight } from 'lucide-react';

interface Message {
    role: 'adeline' | 'user';
    content: string;
}

type Step = 'greeting' | 'email' | 'password' | 'name' | 'role' | 'confirm_signup' | 'complete' | 'signup_password';

export default function ConversationalLogin() {
    const router = useRouter();
    const supabase = createClient();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('greeting');

    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'student' | 'teacher'>('student');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input
    useEffect(() => {
        if (!loading && step !== 'complete') {
            const timeout = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(timeout);
        }
    }, [loading, step]);

    // Initial Greeting
    useEffect(() => {
        // Check for existing session first
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
                return;
            }

            // Start conversation
            setTimeout(() => {
                addAdelineMessage("Hi there! I'm Adeline, your learning companion. I'm so excited to meet you!");
                setTimeout(() => {
                    addAdelineMessage("To get started, what's your email address?");
                    setStep('email');
                }, 1000);
            }, 500);
        };

        checkSession();
    }, []);

    const addAdelineMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'adeline', content }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'user', content }]);
    };

    const handleInputSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const value = input.trim();
        setInput('');
        addUserMessage(value);
        setLoading(true);

        try {
            await processStep(value);
        } catch (error) {
            console.error(error);
            addAdelineMessage("I'm sorry, I ran into a little issue. Could you try that again?");
        } finally {
            setLoading(false);
        }
    };

    const processStep = async (value: string) => {
        switch (step) {
            case 'email':
                if (!validateEmail(value)) {
                    addAdelineMessage("That doesn't look quite like an email address. Could you try again?");
                    return;
                }
                setEmail(value);

                // New logic: Check if email exists
                setLoading(true);
                try {
                    const res = await fetch('/api/auth/check-email', {
                        method: 'POST',
                        body: JSON.stringify({ email: value })
                    });
                    const data = await res.json();

                    if (data.exists) {
                        // User exists -> Ask password
                        addAdelineMessage(`Welcome back, ${data.displayName || 'friend'}! What's your password?`);
                        setStep('password');
                    } else {
                        // New user -> Ask role directly
                        addAdelineMessage("I don't see an account for that email yet. Are you a Student or a Teacher/Parent?");
                        setStep('role');
                    }
                } catch (err) {
                    // Fallback if check fails
                    addAdelineMessage("Thanks! And what's your password?");
                    setStep('password');
                } finally {
                    setLoading(false);
                }
                break;

            case 'password':
                setPassword(value);
                // If we are at the 'password' step, it means the email check determined an existing user.
                // So, we attempt to log them in.
                await attemptLogin(email, value);
                break;

            case 'name':
                setName(value);
                // Now we have everything for signup (email, password, role, name)
                completeSignup(role, value);
                break;

            case 'role':
                const lowerVal = value.toLowerCase();
                let selectedRole: 'student' | 'teacher' | null = null;

                if (lowerVal.includes('teacher') || lowerVal.includes('parent')) selectedRole = 'teacher';
                else if (lowerVal.includes('student')) selectedRole = 'student';

                if (selectedRole) {
                    setRole(selectedRole);
                    addAdelineMessage("Got it! Now, let's pick a secret password for your account.");
                    setStep('signup_password'); // Distinction for signup password
                } else {
                    addAdelineMessage("I didn't quite catch that. Are you a Student or a Teacher/Parent?");
                }
                break;

            case 'signup_password':
                setPassword(value);
                addAdelineMessage("Secret safe with me! Finally, what should I call you?");
                setStep('name');
                break;

            case 'confirm_signup':
                // This path is now deprecated with the new email check flow.
                // However, if somehow reached, we'll guide them to the new flow.
                if (value.toLowerCase().startsWith('y')) {
                    addAdelineMessage("Wonderful! Are you a Student or a Teacher/Parent?");
                    setStep('role');
                } else {
                    addAdelineMessage("Okay. What's your email address?");
                    setStep('email');
                    setEmail('');
                }
                break;
        }
    };

    const attemptLogin = async (emailAttempt: string, passwordAttempt: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailAttempt,
                password: passwordAttempt
            });

            if (error) {
                // Failed login - now we know the email exists, so it's a password issue.
                addAdelineMessage("That password didn't seem to work. Do you want to try again or reset it?");
                // For now, just allow retry. Could add a "reset password" flow here.
                return;
            }

            if (data.user) {
                addAdelineMessage("Perfect! Taking you to your dashboard...");
                setStep('complete');

                // Check role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                setTimeout(() => {
                    if (profile?.role === 'admin') router.push('/dashboard/admin');
                    else if (profile?.role === 'teacher') router.push('/dashboard/teacher');
                    else router.push('/dashboard');
                }, 1500);
            }
        } catch (err) {
            addAdelineMessage("Something went wrong. Let's try starting over.");
            setStep('email');
        }
    };

    const completeSignup = async (userRole: 'student' | 'teacher', userName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    data: {
                        role: userRole,
                        display_name: userName // saving name to metadata
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                addAdelineMessage("Account created successfully!");

                if (userRole === 'student') {
                    addAdelineMessage("I have a few questions to help personalize your learning. Ready?");
                    setTimeout(() => {
                        router.push('/onboarding');
                    }, 2000);
                } else {
                    addAdelineMessage("Welcome, Teacher! Taking you to your dashboard.");
                    setTimeout(() => {
                        router.push('/dashboard/teacher');
                    }, 2000);
                }
                setStep('complete');
            }
        } catch (err: any) {
            addAdelineMessage(`I couldn't create the account: ${err.message || 'Unknown error'}. Let's try the email again.`);
            setStep('email');
        }
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    return (
        <div className="flex flex-col h-full bg-[var(--cream)] rounded-3xl overflow-hidden shadow-2xl border_2 border-[var(--forest)]/5 w-full max-w-2xl mx-auto">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="chat-container">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm text-lg ${msg.role === 'user'
                            ? 'bg-[var(--forest)] text-white rounded-br-none'
                            : 'bg-white text-[var(--charcoal)] border border-[var(--cream-dark)] rounded-bl-none'
                            }`}>
                            {msg.role === 'adeline' && (
                                <div className="flex items-center gap-2 mb-2 opacity-50">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Adeline</span>
                                </div>
                            )}
                            <p className="leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-[var(--cream-dark)] flex gap-2">
                            <div className="w-2 h-2 bg-[var(--sage)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-[var(--sage)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-[var(--sage)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-[var(--cream-dark)]">
                <form onSubmit={handleInputSubmit} className="flex gap-3">
                    <input
                        ref={inputRef}
                        type={step === 'password' ? 'password' : 'text'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={step === 'password' ? "********" : "Type here..."}
                        className="flex-1 px-6 py-4 bg-[var(--cream)] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--forest)] outline-none transition-all placeholder:text-[var(--charcoal-light)]/50 text-lg"
                        disabled={loading || step === 'complete'}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading || step === 'complete'}
                        className="p-4 bg-[var(--forest)] text-white rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                    </button>
                </form>
                <div className="text-center mt-3">
                    <p className="text-xs text-[var(--charcoal-light)]">
                        By chatting, you agree to our <a href="/terms" className="underline hover:text-[var(--forest)]">Terms</a> and <a href="/privacy" className="underline hover:text-[var(--forest)]">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
