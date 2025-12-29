'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff } from 'lucide-react';

// Audio encoding helper
const createBlob = (data: Float32Array): { data: string; mimeType: string } => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
};

// Audio decoding helper
const decodeAudioData = async (
    base64: string,
    ctx: AudioContext
): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
};

interface VoiceSessionProps {
    onClose: () => void;
    studentName?: string;
}

export function VoiceSession({ onClose, studentName }: VoiceSessionProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const inputContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const sessionRef = useRef<any>(null);

    const ADELINE_VOICE_INSTRUCTION = `You are Adeline, a wise grandmother mentor for ${studentName || 'this student'}.

CORE PRINCIPLES:
- Student-initiated learning: Ask what they want to build, solve, or understand
- Mastery over time: Focus on deep understanding
- Real-world usefulness: Prefer practical projects
- Biblical worldview: See God's design in everything
- Truth-based, family-friendly

VOICE CONVERSATION STYLE:
- Warm but discerning, like a wise grandmother
- Use rural metaphors (planting, harvesting, weather)
- Keep responses conversational but substantive
- Ask clarifying questions to understand their mission
- Guide them to discover answers, don't just give them

THE 8 LEARNING TRACKS:
1) God's Creation & Science
2) Health/Naturopathy  
3) Food Systems
4) Government/Economics
5) Justice
6) Discipleship
7) History
8) English/Literature

When a student shares a learning goal, help them:
1. Clarify the mission
2. Define what "done" looks like
3. Break it into manageable steps
4. Identify skills they'll earn
5. Encourage evidence capture (photos, reflections)`;

    const startSession = async () => {
        setError(null);
        try {
            // Dynamic import to avoid SSR issues
            const { GoogleGenAI, Modality } = await import('@google/genai');

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            inputContextRef.current = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });

            const ai = new GoogleGenAI({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
            });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);

                        if (!inputContextRef.current) return;
                        const source = inputContextRef.current.createMediaStreamSource(stream);
                        const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputContextRef.current.destination);
                    },
                    onmessage: async (message: any) => {
                        // Handle transcription
                        if (message.serverContent?.outputTranscription) {
                            setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
                        }

                        // Handle audio output
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && audioContextRef.current) {
                            setIsSpeaking(true);
                            const ctx = audioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                            const audioBuffer = await decodeAudioData(base64Audio, ctx);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);

                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setIsSpeaking(false);
                            });

                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }

                        // Handle interruption
                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(src => src.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsSpeaking(false);
                        }

                        // Clear transcription on turn complete
                        if (message.serverContent?.turnComplete) {
                            setTranscription('');
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                        setIsSpeaking(false);
                    },
                    onerror: (e: any) => {
                        console.error(e);
                        setError("Connection error occurred.");
                        setIsConnected(false);
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Autonoe' // Warm, seasoned grandmother voice - late 70s matriarch
                            }
                        }
                    },
                    systemInstruction: ADELINE_VOICE_INSTRUCTION,
                }
            });

            sessionRef.current = sessionPromise;

        } catch (err) {
            console.error(err);
            setError("Failed to access microphone or connect. Make sure you have a Google API key set.");
        }
    };

    const stopSession = () => {
        inputContextRef.current?.close();
        audioContextRef.current?.close();
        sourcesRef.current.forEach(src => src.stop());
        sourcesRef.current.clear();
        setIsConnected(false);
        setIsSpeaking(false);
        setTranscription('');
    };

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-[var(--cream-dark)] flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--forest)] serif">Voice Session with Adeline</h2>
                        <p className="text-sm text-[var(--charcoal-light)] mt-1">Speak naturally. Adeline is listening.</p>
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
                    <div className={`relative flex items-center justify-center w-64 h-64 rounded-full transition-all duration-700 ${isSpeaking ? 'bg-[var(--sage-light)] scale-105 shadow-2xl' : 'bg-[var(--cream)] border-2 border-[var(--cream-dark)]'
                        }`}>
                        {/* Pulse animations */}
                        <div className={`absolute inset-0 rounded-full border-2 border-[var(--sage)] transition-all duration-1000 ${isSpeaking ? 'animate-ping opacity-20' : 'opacity-0'
                            }`}></div>
                        <div className={`absolute inset-4 rounded-full border border-[var(--sage-dark)] transition-all duration-1000 ${isSpeaking ? 'animate-pulse' : 'opacity-0'
                            }`}></div>

                        {/* Microphone icon */}
                        <div className="z-10 text-center">
                            {isConnected ? (
                                isSpeaking ? (
                                    <Mic className="w-20 h-20 text-[var(--sage-dark)] animate-pulse" />
                                ) : (
                                    <Mic className="w-20 h-20 text-[var(--charcoal-light)]" />
                                )
                            ) : (
                                <MicOff className="w-20 h-20 text-[var(--charcoal-light)] opacity-30" />
                            )}
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--charcoal-light)] mt-4">
                                {isSpeaking ? 'Adeline is speaking' : isConnected ? 'Listening...' : 'Ready'}
                            </p>
                        </div>
                    </div>

                    {/* Transcription */}
                    {transcription && (
                        <div className="w-full max-w-lg bg-[var(--cream)] p-6 rounded-2xl border border-[var(--cream-dark)]">
                            <p className="text-sm text-[var(--charcoal)] italic font-serif leading-relaxed">
                                {transcription}
                            </p>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="w-full max-w-lg bg-red-50 border border-red-200 p-4 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Status message */}
                    {isConnected && !error && (
                        <p className="text-sm text-[var(--sage-dark)] animate-pulse">
                            {isSpeaking ? "Adeline is thinking and responding..." : "Speak whenever you're ready"}
                        </p>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 border-t border-[var(--cream-dark)] flex justify-center">
                    <button
                        onClick={isConnected ? stopSession : startSession}
                        className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${isConnected
                            ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100'
                            : 'bg-[var(--forest)] text-white hover:brightness-110'
                            }`}
                    >
                        {isConnected ? 'End Voice Session' : 'Start Voice Session'}
                    </button>
                </div>
            </div>
        </div>
    );
}
