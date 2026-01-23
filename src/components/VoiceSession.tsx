'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceSessionProps {
    onClose: () => void;
    studentName?: string;
    userId?: string;
}

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event & { error: string }) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export function VoiceSession({ onClose, studentName, userId }: VoiceSessionProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Check for browser support
    const isSpeechRecognitionSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Initialize speech recognition
    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            setTranscription(finalTranscript || interimTranscript);

            if (finalTranscript) {
                handleUserSpeech(finalTranscript);
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                setError('No speech detected. Please try again.');
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please enable microphone permissions.');
            } else {
                setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeechRecognitionSupported]);

    // Send transcribed text to AI and get response
    const handleUserSpeech = useCallback(async (text: string) => {
        if (!text.trim()) return;

        setIsProcessing(true);
        setError(null);

        const newHistory = [...conversationHistory, { role: 'user' as const, content: text }];
        setConversationHistory(newHistory);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newHistory,
                    userId: userId,
                    studentInfo: { name: studentName },
                    mode: 'voice', // Hint to keep responses concise
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.userMessage || 'Failed to get response');
            }

            const data = await res.json();
            const aiResponse = data.content;

            setResponse(aiResponse);
            setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);

            // Speak the response
            speakResponse(aiResponse);

        } catch (err) {
            console.error('Chat error:', err);
            setError(err instanceof Error ? err.message : 'Failed to get response from Adeline');
        } finally {
            setIsProcessing(false);
        }
    }, [conversationHistory, userId, studentName]);

    // Use browser speech synthesis to speak the response
    const speakResponse = (text: string) => {
        if (!isSpeechSynthesisSupported) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Clean up the text (remove HTML tags, etc.)
        const cleanText = text
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/\*\*/g, '')    // Remove markdown bold
            .replace(/\*/g, '')      // Remove markdown italic
            .substring(0, 1000);     // Limit length for TTS

        const utterance = new SpeechSynthesisUtterance(cleanText);
        synthRef.current = utterance;

        // Try to find a warm female voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Victoria') ||
            (v.lang === 'en-US' && v.name.toLowerCase().includes('female'))
        ) || voices.find(v => v.lang === 'en-US') || voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setTranscription('');
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // Start listening
    const startListening = () => {
        if (!recognitionRef.current) return;

        // Stop any ongoing speech
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);

        setError(null);
        setTranscription('');
        setResponse('');

        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.error('Failed to start recognition:', err);
            setError('Failed to start listening. Please try again.');
        }
    };

    // Stop listening
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    // Stop speaking
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    const isActive = isListening || isSpeaking || isProcessing;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-[var(--cream-dark)] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--forest)] serif">Voice Session with Adeline</h2>
                        <p className="text-sm text-[var(--charcoal-light)] mt-1">
                            {isListening ? 'Listening... speak now' :
                             isSpeaking ? 'Adeline is responding' :
                             isProcessing ? 'Thinking...' :
                             'Press the button and speak'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--cream)] rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Voice Visualizer */}
                <div className="p-12 flex flex-col items-center justify-center space-y-8">
                    <div className={`relative flex items-center justify-center w-64 h-64 rounded-full transition-all duration-700 ${
                        isSpeaking ? 'bg-[var(--sage-light)] scale-105 shadow-2xl' :
                        isListening ? 'bg-[var(--ochre-light)] scale-105 shadow-2xl' :
                        isProcessing ? 'bg-[var(--cream)] animate-pulse' :
                        'bg-[var(--cream)] border-2 border-[var(--cream-dark)]'
                    }`}>
                        {/* Pulse animations */}
                        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                            isListening ? 'border-[var(--ochre)] animate-ping opacity-20' :
                            isSpeaking ? 'border-[var(--sage)] animate-ping opacity-20' :
                            'opacity-0'
                        }`}></div>
                        <div className={`absolute inset-4 rounded-full border transition-all duration-1000 ${
                            isListening ? 'border-[var(--ochre-dark)] animate-pulse' :
                            isSpeaking ? 'border-[var(--sage-dark)] animate-pulse' :
                            'opacity-0'
                        }`}></div>

                        {/* Icon */}
                        <div className="z-10 text-center">
                            {isSpeaking ? (
                                <Volume2 className="w-20 h-20 text-[var(--sage-dark)] animate-pulse" />
                            ) : isListening ? (
                                <Mic className="w-20 h-20 text-[var(--ochre-dark)] animate-pulse" />
                            ) : isProcessing ? (
                                <div className="w-20 h-20 flex items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-[var(--forest)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <MicOff className="w-20 h-20 text-[var(--charcoal-light)] opacity-30" />
                            )}
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--charcoal-light)] mt-4">
                                {isSpeaking ? 'Adeline is speaking' :
                                 isListening ? 'Listening...' :
                                 isProcessing ? 'Thinking...' :
                                 'Ready'}
                            </p>
                        </div>
                    </div>

                    {/* Transcription / Response */}
                    {(transcription || response) && (
                        <div className="w-full max-w-lg bg-[var(--cream)] p-6 rounded-2xl border border-[var(--cream-dark)]">
                            {transcription && (
                                <p className="text-sm text-[var(--charcoal)] mb-3">
                                    <span className="font-bold text-[var(--ochre)]">You: </span>
                                    {transcription}
                                </p>
                            )}
                            {response && !isProcessing && (
                                <p className="text-sm text-[var(--charcoal)] italic font-serif leading-relaxed">
                                    <span className="font-bold text-[var(--forest)] not-italic">Adeline: </span>
                                    {response.substring(0, 300)}{response.length > 300 ? '...' : ''}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="w-full max-w-lg bg-red-50 border border-red-200 p-4 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Browser support warning */}
                    {!isSpeechRecognitionSupported && (
                        <div className="w-full max-w-lg bg-amber-50 border border-amber-200 p-4 rounded-xl">
                            <p className="text-sm text-amber-700">
                                Voice recognition requires Chrome, Edge, or Safari. Please use a supported browser.
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 border-t border-[var(--cream-dark)] flex justify-center gap-4">
                    {isSpeaking ? (
                        <button
                            onClick={stopSpeaking}
                            className="px-8 py-4 rounded-2xl font-bold transition-all shadow-lg bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
                        >
                            Stop Adeline
                        </button>
                    ) : isListening ? (
                        <button
                            onClick={stopListening}
                            className="px-8 py-4 rounded-2xl font-bold transition-all shadow-lg bg-[var(--ochre)] text-white hover:brightness-110"
                        >
                            Done Speaking
                        </button>
                    ) : (
                        <button
                            onClick={startListening}
                            disabled={isProcessing || !isSpeechRecognitionSupported}
                            className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                                isProcessing || !isSpeechRecognitionSupported
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-[var(--forest)] text-white hover:brightness-110'
                            }`}
                        >
                            {isProcessing ? 'Processing...' : 'Start Talking'}
                        </button>
                    )}
                </div>

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                    <div className="px-6 pb-6">
                        <details className="text-sm">
                            <summary className="cursor-pointer text-[var(--charcoal-light)] hover:text-[var(--forest)]">
                                View conversation history ({conversationHistory.length} messages)
                            </summary>
                            <div className="mt-3 max-h-48 overflow-y-auto space-y-2 bg-[var(--cream)] p-4 rounded-xl">
                                {conversationHistory.map((msg, i) => (
                                    <p key={i} className={`text-xs ${msg.role === 'user' ? 'text-[var(--ochre-dark)]' : 'text-[var(--forest)]'}`}>
                                        <strong>{msg.role === 'user' ? 'You' : 'Adeline'}:</strong> {msg.content.substring(0, 150)}{msg.content.length > 150 ? '...' : ''}
                                    </p>
                                ))}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
