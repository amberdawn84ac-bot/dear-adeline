'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, Loader2, Check, ArrowRight, Rocket, Gamepad2, Palette, Music, Trophy, Microscope, BookOpen, Globe } from 'lucide-react';

interface Message {
    role: 'adeline' | 'user';
    content: string;
}

type SetupStep = 'interests' | 'style' | 'chat';

const INTERESTS = [
    { id: 'space', label: 'Space & Universe', icon: Rocket, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'animals', label: 'Animals & Nature', icon: Globe, color: 'bg-green-100 text-green-600' },
    { id: 'gaming', label: 'Gaming & Minecraft', icon: Gamepad2, color: 'bg-purple-100 text-purple-600' },
    { id: 'art', label: 'Art & Creativity', icon: Palette, color: 'bg-pink-100 text-pink-600' },
    { id: 'music', label: 'Music & Dance', icon: Music, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'sports', label: 'Sports & Movement', icon: Trophy, color: 'bg-orange-100 text-orange-600' },
    { id: 'science', label: 'Science & Experiments', icon: Microscope, color: 'bg-blue-100 text-blue-600' },
    { id: 'reading', label: 'Reading & Stories', icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
];

const LEARNING_STYLES = [
    { id: 'visual', label: 'I like to watch videos and see pictures', description: 'Visual Learner' },
    { id: 'auditory', label: 'I like to listen to stories and talk', description: 'Auditory Learner' },
    { id: 'kinesthetic', label: 'I like to build and do things with my hands', description: 'Kinesthetic Learner' },
    { id: 'reading', label: 'I like to read and write notes', description: 'Read/Write Learner' },
];

export default function OnboardingAssessment({ user }: { user: any }) {
    const router = useRouter();

    // State
    const [step, setStep] = useState<SetupStep>('interests');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [assessmentId, setAssessmentId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, step]);

    // Focus input when chat starts
    useEffect(() => {
        if (step === 'chat' && !loading) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [step, loading]);

    const handleInterestToggle = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id].slice(0, 3) // Max 3
        );
    };

    const handleStyleSelect = (id: string) => {
        setSelectedStyle(id);
        // Add a small delay for effect before moving to next step?
        // Or just let user click continue. Let's let them click continue for confirmation.
    };

    const startChat = async () => {
        setStep('chat');
        setLoading(true);
        console.log('[OnboardingAssessment] Starting assessment for user:', user.id);

        try {
            const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'friend';

            const response = await fetch('/api/placement/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    displayName: displayName,
                    grade: user.user_metadata?.grade_level,
                    interests: selectedInterests.map(id => INTERESTS.find(i => i.id === id)?.label),
                    learningStyle: LEARNING_STYLES.find(s => s.id === selectedStyle)?.description
                })
            });

            const data = await response.json();

            if (data.alreadyCompleted) {
                router.push('/dashboard');
                return;
            }

            if (data.error) throw new Error(data.error);

            setAssessmentId(data.assessmentId);
            addAdelineMessage(data.firstQuestion);

        } catch (err) {
            console.error('Failed to start assessment:', err);
            setError("I'm having a little trouble connecting. Please refresh the page to try again.");
            setStep('interests'); // Go back to start if failed?
        } finally {
            setLoading(false);
        }
    };

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

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.completed) {
                addAdelineMessage(data.completionMessage || "That's everything I need! You did great.");

                // Trigger Learning Plan Generation
                setTimeout(async () => {
                    addAdelineMessage("Building your personalized learning plan now... (This might take a moment!)");

                    try {
                        const report = data.placementReport;
                        const estimatedGrade = report?.recommendedStartingLevel || user.user_metadata?.grade_level || '6th Grade';

                        await fetch('/api/learning-plan/generate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                studentId: user.id,
                                gradeLevel: estimatedGrade,
                                state: user.user_metadata?.state || 'National'
                            })
                        });

                        addAdelineMessage("All done! Your dashboard is ready.");
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 1500);

                    } catch (genError) {
                        console.error("Plan generation failed:", genError);
                        addAdelineMessage("I've saved your results! Let's go to the dashboard.");
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 1500);
                    }
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
        <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--forest)] mb-2">
                    {step === 'interests' && "What captures your imagination?"}
                    {step === 'style' && "How do you like to learn?"}
                    {step === 'chat' && "Let's personalize your plan"}
                </h1>
                <p className="text-[var(--charcoal-light)]">
                    {step === 'interests' && "Pick up to 3 topics you love."}
                    {step === 'style' && "Help Adeline teach you better."}
                    {step === 'chat' && "Chat with Adeline to finish your profile."}
                </p>
            </div>

            {/* Container */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-[var(--forest)]/5 min-h-[500px] flex flex-col">

                {/* INTERESTS STEP */}
                {step === 'interests' && (
                    <div className="p-8 flex-1 flex flex-col">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {INTERESTS.map((interest) => { // NOTE: Correcting typo in next step if missed, but here I write correctly
                                const Icon = interest.icon;
                                const isSelected = selectedInterests.includes(interest.id);
                                return (
                                    <button
                                        key={interest.id}
                                        onClick={() => handleInterestToggle(interest.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 text-center group
                                            ${isSelected
                                                ? 'border-[var(--forest)] bg-[var(--cream)] shadow-md scale-105'
                                                : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:scale-105'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-[var(--forest)] text-white' : interest.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-[var(--forest)]' : 'text-gray-600'}`}>
                                            {interest.label}
                                        </span>
                                        {isSelected && <div className="absolute top-2 right-2 text-[var(--forest)]"><Check className="w-4 h-4" /></div>}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-auto flex justify-end">
                            <button
                                onClick={() => setStep('style')}
                                disabled={selectedInterests.length === 0}
                                className="flex items-center gap-2 px-8 py-4 bg-[var(--forest)] text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium text-lg"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STYLE STEP */}
                {step === 'style' && (
                    <div className="p-8 flex-1 flex flex-col max-w-xl mx-auto w-full">
                        <div className="space-y-4 mb-8">
                            {LEARNING_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => handleStyleSelect(style.id)}
                                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group
                                        ${selectedStyle === style.id
                                            ? 'border-[var(--forest)] bg-[var(--cream)] shadow-md'
                                            : 'border-gray-100 bg-white hover:border-[var(--forest)]/30 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${selectedStyle === style.id ? 'border-[var(--forest)]' : 'border-gray-300 group-hover:border-[var(--forest)]/50'}`}>
                                        {selectedStyle === style.id && <div className="w-3 h-3 rounded-full bg-[var(--forest)]" />}
                                    </div>
                                    <div>
                                        <p className={`font-medium text-lg ${selectedStyle === style.id ? 'text-[var(--forest)]' : 'text-gray-800'}`}>
                                            {style.label}
                                        </p>
                                        <p className="text-sm text-gray-500">{style.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="mt-auto flex justify-between items-center">
                            <button
                                onClick={() => setStep('interests')}
                                className="text-gray-500 hover:text-[var(--forest)] transition-colors px-4 py-2"
                            >
                                Back
                            </button>
                            <button
                                onClick={startChat}
                                disabled={!selectedStyle}
                                className="flex items-center gap-2 px-8 py-4 bg-[var(--forest)] text-white rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium text-lg"
                            >
                                Start Chat <Sparkles className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* CHAT STEP */}
                {step === 'chat' && (
                    <>
                        <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-[var(--cream)]">
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
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
                    </>
                )}
            </div>
        </div>
    );
}
