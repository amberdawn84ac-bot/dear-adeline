'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Step = 'greeting' | 'email' | 'password' | 'name' | 'role' | 'grade' | 'city' | 'state' | 'placement' | 'creating' | 'complete';

interface Message {
    role: 'adeline' | 'user';
    content: string;
}

const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
];

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const LOGIN_SESSION_KEY = 'conversational-login-active';

export default function ConversationalLogin() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('greeting');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasInitialized = useRef(false);
    const greetingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const emailPromptTimerRef = useRef<NodeJS.Timeout | null>(null);

    // User data collected through conversation
    const [userData, setUserData] = useState({
        email: '',
        password: '',
        name: '',
        state: '',
        city: '',
        role: '' as 'student' | 'parent' | 'teacher' | '',
        grade: '',
        isReturning: false,
        existingName: '',
        assessmentId: null as string | null,
        placementComplete: false
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when step changes
    useEffect(() => {
        if (step !== 'greeting' && step !== 'creating') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [step]);

    // Initial greeting - only run once even in StrictMode
    useEffect(() => {
        console.log('[ConversationalLogin] Component mounted');

        // Check if already in an active login session - prevent duplicate flows
        const sessionActive = sessionStorage.getItem(LOGIN_SESSION_KEY);
        if (sessionActive) {
            console.log('[ConversationalLogin] Session already active, skipping greeting');
            // Still show greeting if there's no messages, but don't add new ones
            if (messages.length === 0) {
                addAdelineMessage("Hi there! I'm Adeline, your learning companion. I'm so excited to meet you!");
                emailPromptTimerRef.current = setTimeout(() => {
                    addAdelineMessage("Let's get you set up. What's your email address?");
                    setStep('email');
                }, 1500);
            }
            return;
        }

        // Mark session as active
        sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
        hasInitialized.current = true;

        const timer1 = setTimeout(() => {
            console.log('[ConversationalLogin] Starting initial greeting');
            addAdelineMessage("Hi there! I'm Adeline, your learning companion. I'm so excited to meet you!");
            greetingTimerRef.current = setTimeout(() => {
                addAdelineMessage("Let's get you set up. What's your email address?");
                setStep('email');
            }, 1500);
        }, 500);

        return () => {
            console.log('[ConversationalLogin] Cleanup called');
            clearTimeout(timer1);
            if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
            if (emailPromptTimerRef.current) clearTimeout(emailPromptTimerRef.current);
            // Don't clear session here - let completion handler do it
        };
    }, []);

    // Clear session on completion
    useEffect(() => {
        if (step === 'complete') {
            sessionStorage.removeItem(LOGIN_SESSION_KEY);
            console.log('[ConversationalLogin] Session cleared - onboarding complete');
        }
    }, [step]);

    const addAdelineMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'adeline', content }]);
    };

    const addUserMessage = (content: string) => {
        setMessages(prev => [...prev, { role: 'user', content }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const value = input.trim();
        setInput('');
        setError('');

        switch (step) {
            case 'email':
                await handleEmailStep(value);
                break;
            case 'password':
                await handlePasswordStep(value);
                break;
            case 'name':
                handleNameStep(value);
                break;
            case 'role':
                handleRoleStep(value);
                break;
            case 'grade':
                handleGradeStep(value);
                break;
            case 'city':
                handleCityStep(value);
                break;
            case 'placement':
                await handlePlacementResponse(value);
                break;
        }
    };

    const handleEmailStep = async (email: string) => {
        if (!email.includes('@')) {
            setError("Hmm, that doesn't look like an email address. Try again?");
            return;
        }

        addUserMessage(email);
        setUserData(prev => ({ ...prev, email }));
        setLoading(true);

        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.exists) {
                setUserData(prev => ({ ...prev, isReturning: true, existingName: data.displayName }));
                const greeting = data.displayName ? `Welcome back, ${data.displayName}!` : 'Welcome back!';
                addAdelineMessage(greeting + " Please enter your password to continue.");
                setStep('password');
            } else {
                addAdelineMessage("Nice to meet you! Looks like you're new here. Let's create your account!");
                setTimeout(() => {
                    addAdelineMessage("First, create a password (at least 6 characters).");
                    setStep('password');
                }, 1000);
            }
        } catch {
            setError("I'm having trouble checking that email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordStep = async (password: string) => {
        if (password.length < 6) {
            setError("Your password needs to be at least 6 characters long.");
            return;
        }

        addUserMessage('••••••••');
        setUserData(prev => ({ ...prev, password }));
        setLoading(true);

        const supabase = createClient();

        if (userData.isReturning) {
            // Login existing user
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: userData.email,
                    password
                });

                if (error) throw error;

                if (data.user) {
                    addAdelineMessage("Perfect! Taking you to your dashboard...");
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', data.user.id)
                        .single();

                    setTimeout(() => {
                        if (profile?.role === 'admin') router.push('/dashboard/admin');
                        else if (profile?.role === 'teacher') router.push('/dashboard/teacher');
                        else router.push('/dashboard');
                    }, 1000);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "That password didn't work. Try again?");
                setLoading(false);
            }
        } else {
            // New user - continue to name
            setLoading(false);
            addAdelineMessage("Great! Now, what's your name? (This is how I'll address you)");
            setStep('name');
        }
    };

    const handleNameStep = (name: string) => {
        addUserMessage(name);
        setUserData(prev => ({ ...prev, name }));
        addAdelineMessage(`Lovely to meet you, ${name}! Are you a student, parent, or teacher?`);
        setStep('role');
    };

    const handleRoleStep = (role: string) => {
        const normalizedRole = role.toLowerCase().trim();
        let validRole: 'student' | 'parent' | 'teacher' | '' = '';

        if (normalizedRole.includes('student') || normalizedRole.includes('kid') || normalizedRole.includes('learner')) {
            validRole = 'student';
        } else if (normalizedRole.includes('parent') || normalizedRole.includes('mom') || normalizedRole.includes('dad')) {
            validRole = 'parent';
        } else if (normalizedRole.includes('teacher') || normalizedRole.includes('educator') || normalizedRole.includes('instructor')) {
            validRole = 'teacher';
        }

        if (!validRole) {
            setError("I didn't catch that. Are you a student, parent, or teacher?");
            return;
        }

        addUserMessage(validRole.charAt(0).toUpperCase() + validRole.slice(1));
        setUserData(prev => ({ ...prev, role: validRole }));

        if (validRole === 'student') {
            addAdelineMessage("Wonderful! What grade are you in?");
            setStep('grade');
        } else {
            // Parent or teacher - proceed to account creation
            createAccount(validRole);
        }
    };

    const handleGradeStep = (grade: string) => {
        console.log('[ConversationalLogin] handleGradeStep called with:', grade);

        // Extract grade number/letter
        const gradeMatch = grade.match(/(\d+|k|kindergarten)/i);
        let normalizedGrade = gradeMatch ? gradeMatch[1].toUpperCase() : '';
        if (normalizedGrade === 'KINDERGARTEN') normalizedGrade = 'K';

        if (!GRADES.includes(normalizedGrade)) {
            setError("Which grade? (K through 12)");
            return;
        }

        addUserMessage(`Grade ${normalizedGrade}`);
        setUserData(prev => ({ ...prev, grade: normalizedGrade }));
        console.log('[ConversationalLogin] Moving to city step');
        addAdelineMessage(`Great! Which city do you live in?`);
        setTimeout(() => {
            addAdelineMessage(`(I use this to find local opportunities and news for you)`);
        }, 800);
        setStep('city');
    };

    const handleCityStep = (city: string) => {
        if (city.trim().length < 2) {
            setError("Please enter your city name");
            return;
        }

        addUserMessage(city);
        setUserData(prev => ({ ...prev, city }));
        addAdelineMessage(`${city} - nice! And which state is that in?`);
        setStep('state');
    };

    const handleStateSelect = (state: string) => {
        setUserData(prev => ({ ...prev, state }));
        addUserMessage(state);
        addAdelineMessage(`Perfect! Now let's have a quick chat so I know where to start teaching you.`);
        setTimeout(() => {
            addAdelineMessage(`This isn't a test - just say "I don't know" if you're not sure!`);
            setTimeout(() => {
                startPlacementAssessment();
            }, 1500);
        }, 1000);
    };

    const startPlacementAssessment = async () => {
        setStep('placement');
        setLoading(true);

        try {
            const response = await fetch('/api/placement/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'temp', // Account not created yet
                    grade: userData.grade,
                    state: userData.state
                })
            });

            const data = await response.json();
            setUserData(prev => ({ ...prev, assessmentId: data.assessmentId }));

            // First assessment question appears as Adeline message
            addAdelineMessage(data.firstQuestion);

        } catch (error) {
            console.error('Error starting placement:', error);
            setError("Having trouble starting the assessment. Let me try again...");
        } finally {
            setLoading(false);
        }
    };

    const handlePlacementResponse = async (response: string) => {
        addUserMessage(response);
        setLoading(true);

        try {
            const result = await fetch('/api/placement/continue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assessmentId: userData.assessmentId,
                    response
                })
            });

            const data = await result.json();

            if (data.complete) {
                // Assessment done!
                addAdelineMessage(data.completionMessage || "Great job! I have a good sense of where you're at.");
                setUserData(prev => ({ ...prev, placementComplete: true }));

                setTimeout(() => {
                    addAdelineMessage("Perfect! Let me set up your account now...");
                    setTimeout(() => {
                        createAccount('student');
                    }, 1000);
                }, 2000);

            } else {
                // Next question
                addAdelineMessage(data.nextQuestion);
            }

        } catch (error) {
            console.error('Error in placement:', error);
            setError("Sorry, I lost track. Could you say that again?");
        } finally {
            setLoading(false);
        }
    };

    const createAccount = async (role: 'student' | 'parent' | 'teacher', grade?: string) => {
        setStep('creating');
        setLoading(true);

        addAdelineMessage("Perfect! Let me set up your account...");

        const supabase = createClient();

        try {
            const { data: signupData, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                    data: {
                        role: role === 'parent' ? 'student' : role, // Parents use student view
                        display_name: userData.name,
                        grade_level: userData.grade || grade || null,
                        state_standards: userData.state || null,
                        city: userData.city || null
                    }
                }
            });

            if (error) throw error;

            if (signupData?.user && signupData?.session) {
                setStep('complete');
                addAdelineMessage(`Welcome to Dear Adeline, ${userData.name}! Taking you to your dashboard...`);
                setTimeout(() => {
                    if (role === 'student') router.push('/dashboard');
                    else if (role === 'teacher') router.push('/dashboard/teacher');
                    else router.push('/dashboard');
                }, 1500);
            } else {
                addAdelineMessage("Almost there! Check your email for a confirmation link, then come back to start learning!");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
            setStep('email');
            setLoading(false);
        }
    };

    const renderInput = () => {
        if (step === 'greeting' || step === 'creating' || step === 'complete') {
            return null;
        }

        if (step === 'state') {
            return (
                <div className="p-4 bg-white border-t border-[var(--cream-dark)]">
                    <label className="block text-sm font-medium text-[var(--charcoal-light)] mb-2">
                        Select your state:
                    </label>
                    <div className="relative">
                        <select
                            value={userData.state}
                            onChange={(e) => handleStateSelect(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--cream)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--forest)] appearance-none cursor-pointer"
                        >
                            <option value="">Choose a state...</option>
                            {US_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)] pointer-events-none" />
                    </div>
                </div>
            );
        }

        if (step === 'role') {
            return (
                <div className="p-4 bg-white border-t border-[var(--cream-dark)]">
                    <div className="grid grid-cols-3 gap-2">
                        {['Student', 'Parent', 'Teacher'].map(role => (
                            <button
                                key={role}
                                onClick={() => handleRoleStep(role)}
                                className="py-3 px-4 rounded-xl font-medium border-2 border-[var(--cream-dark)] hover:border-[var(--forest)] hover:bg-[var(--cream)] transition-all"
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        if (step === 'grade') {
            return (
                <div className="p-4 bg-white border-t border-[var(--cream-dark)]">
                    <div className="grid grid-cols-7 gap-2">
                        {GRADES.map(g => (
                            <button
                                key={g}
                                onClick={() => handleGradeStep(g)}
                                className="py-2 px-3 rounded-xl font-medium border-2 border-[var(--cream-dark)] hover:border-[var(--forest)] hover:bg-[var(--cream)] transition-all text-sm"
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-[var(--cream-dark)]">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type={step === 'password' && !showPassword ? 'password' : step === 'email' ? 'email' : 'text'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                step === 'email' ? 'your@email.com' :
                                step === 'password' ? 'Enter password...' :
                                step === 'name' ? 'Your name...' :
                                step === 'city' ? 'e.g., Tulsa' :
                                step === 'placement' ? 'Type your answer...' :
                                'Type here...'
                            }
                            className="w-full px-4 py-3 bg-[var(--cream)] border-2 border-transparent rounded-xl focus:bg-white focus:border-[var(--forest)] outline-none transition-all"
                            disabled={loading}
                            autoComplete={step === 'email' ? 'email' : step === 'password' ? 'current-password' : 'off'}
                        />
                        {step === 'password' && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--charcoal-light)] hover:text-[var(--charcoal)]"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-3 bg-[var(--forest)] text-white rounded-xl hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
            </form>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--forest)]">Dear Adeline</h1>
                    <p className="text-sm text-[var(--charcoal-light)]">Your AI Learning Companion</p>
                </div>

                {/* Chat Container */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Messages */}
                    <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[var(--cream)]">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    msg.role === 'user'
                                        ? 'bg-[var(--forest)] text-white rounded-br-none'
                                        : 'bg-white text-[var(--charcoal)] shadow-sm border border-[var(--cream-dark)] rounded-bl-none'
                                }`}>
                                    {msg.role === 'adeline' && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <Sparkles className="w-3 h-3 text-[var(--sage)]" />
                                            <span className="text-xs font-bold text-[var(--sage)]">Adeline</span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && step !== 'creating' && (
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
                    {renderInput()}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[var(--charcoal-light)] mt-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
}
