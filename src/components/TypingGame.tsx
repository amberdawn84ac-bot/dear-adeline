'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, RefreshCw } from 'lucide-react';

const TYPING_CONTENT = [
    {
        category: "Hebrew Word Study",
        text: "The word 'Shema' (Hear) in Deuteronomy 6:4 means more than just auditory processing; it implies listening with the intent to obey and take action immediately.",
        source: "Hebrew Mastery"
    },
    {
        category: "Scripture",
        text: "For the mountains shall depart, and the hills be removed; but my kindness shall not depart from thee, neither shall the covenant of my peace be removed, saith the Lord that hath mercy on thee.",
        source: "Isaiah 54:10"
    },
    {
        category: "Literature",
        text: "It is a narrow mind which cannot look at a subject from various points of view.",
        source: "George Eliot, Middlemarch"
    },
    {
        category: "Scripture Context",
        text: "In the original Greek of Matthew 5:9, 'Peacemakers' are not just people who avoid conflict, but those who actively pursue 'Shalom'—restoring wholleness to broken systems.",
        source: "Original Text Deep Dive"
    },
    {
        category: "Literature",
        text: "Real courage is when you know you're licked before you begin, but you begin anyway and see it through no matter what.",
        source: "Harper Lee, To Kill a Mockingbird"
    },
    {
        category: "Historical Nuance",
        text: "Many modern translations lose the specific agrarian context of the Parables. The 'Sower' was not just a farmer, but a symbol of radical generosity in a scarcity-minded world.",
        source: "Restored Truth Series"
    },
    {
        category: "Classical Education",
        text: "The roots of education are bitter, but the fruit is sweet. Learning is an ornament in prosperity, a refuge in adversity, and a provision in old age.",
        source: "Aristotle"
    }
];

interface TypingGameProps {
    onComplete: (wpm: number) => void;
    customText?: string;
    customSource?: string;
    customCategory?: string;
}

export function TypingGame({ onComplete, customText, customSource, customCategory }: TypingGameProps) {
    const [activeContent, setActiveContent] = useState(() => {
        if (customText) {
            return {
                text: customText,
                source: customSource || 'Adeline Academy',
                category: customCategory || 'Custom Lesson'
            };
        }
        return TYPING_CONTENT[0];
    });
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [missedKeys, setMissedKeys] = useState<Record<string, number>>({});
    const [keystrokes, setKeystrokes] = useState({ total: 0, correct: 0 });
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const oldVal = input;

        // Track metrics only on forward typing
        if (val.length > oldVal.length) {
            const charTyped = val.slice(-1);
            const targetChar = activeContent.text[val.length - 1];

            setKeystrokes(prev => ({
                total: prev.total + 1,
                correct: prev.correct + (charTyped === targetChar ? 1 : 0)
            }));

            if (charTyped !== targetChar && targetChar) {
                setMissedKeys(prev => ({
                    ...prev,
                    [targetChar.toLowerCase()]: (prev[targetChar.toLowerCase()] || 0) + 1
                }));
            }
        }
        setInput(val);
    };

    useEffect(() => {
        if (customText) {
            setActiveContent({
                text: customText,
                source: customSource || 'Adeline Academy',
                category: customCategory || 'Custom Lesson'
            });
        } else {
            // Select random content on mount if no custom text
            const randomContent = TYPING_CONTENT[Math.floor(Math.random() * TYPING_CONTENT.length)];
            setActiveContent(randomContent);
        }
    }, [customText, customSource, customCategory]);

    useEffect(() => {
        if (input.length === 1 && !startTime) {
            setStartTime(Date.now());
        }
        if (input === activeContent.text) {
            const endTime = Date.now();
            const timeInMinutes = (endTime - (startTime || endTime)) / 60000;
            const wordCount = activeContent.text.split(' ').length;
            const calculatedWpm = Math.round(wordCount / (timeInMinutes || 0.01));
            setWpm(calculatedWpm);
            setIsFinished(true);
            onComplete(calculatedWpm);
        }
    }, [input, activeContent.text, startTime, onComplete]);

    const resetGame = () => {
        const currentIndex = TYPING_CONTENT.findIndex(c => c.text === activeContent.text);
        const nextIndex = (currentIndex + 1) % TYPING_CONTENT.length;
        setActiveContent(TYPING_CONTENT[nextIndex]);
        setInput('');
        setIsFinished(false);
        setMissedKeys({});
        setKeystrokes({ total: 0, correct: 0 });
        setStartTime(null);
    };

    return (
        <div className="bg-[var(--cream)] p-8 rounded-[3rem] border-2 border-[var(--forest)]/10 h-full flex flex-col">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-bold serif text-slate-800">Typing Terminal</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Master Meaningful Vocabulary</p>
                </div>
                <div className="text-right">
                    <span className="px-3 py-1 bg-[var(--forest)]/10 text-[var(--forest)] font-bold rounded-lg text-[9px] uppercase tracking-widest">
                        {activeContent.category}
                    </span>
                </div>
            </div>

            <div className="flex-1 space-y-8 flex flex-col">
                <div className="p-8 bg-white border border-slate-50 rounded-[2rem] shadow-inner relative flex-1 min-h-[150px] overflow-y-auto">
                    <p className="text-xl font-medium text-slate-300 leading-relaxed select-none relative z-10">
                        {activeContent.text.split('').map((char, i) => {
                            let color = 'text-slate-300';
                            if (i < input.length) {
                                color = input[i] === char ? 'text-[var(--forest)] font-bold' : 'text-rose-500 font-bold';
                            }
                            return <span key={i} className={`${color} transition-colors duration-100`}>{char}</span>;
                        })}
                    </p>
                    <div className="mt-6 text-right">
                        <span className="text-[10px] italic text-slate-400 font-serif">— {activeContent.source}</span>
                    </div>
                </div>

                {!isFinished ? (
                    <div className="relative">
                        <textarea
                            ref={inputRef}
                            autoFocus
                            value={input}
                            onChange={handleInput}
                            className="w-full p-8 bg-white rounded-[2rem] border-2 border-[var(--cream-dark)] focus:border-[var(--forest)]/40 focus:outline-none font-mono text-sm shadow-sm transition-all h-32 resize-none"
                            placeholder="Begin typing the wisdom above..."
                        />
                        {input.length > 0 && (
                            <div className="absolute bottom-4 right-6 text-[10px] font-black text-[var(--forest)] opacity-40 uppercase tracking-widest">
                                Live Feed Active
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-[var(--forest)] p-10 rounded-[2.5rem] text-white text-center animate-in zoom-in-95 shadow-2xl shadow-[var(--forest)]/20">
                        <div className="flex justify-center gap-12 mb-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                                    <Target className="w-8 h-8" />
                                </div>
                                <h4 className="text-4xl font-bold serif">{wpm}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">WPM</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                                    <span className="font-mono font-bold text-lg">
                                        {keystrokes.total > 0 ? Math.round((keystrokes.correct / keystrokes.total) * 100) : 100}%
                                    </span>
                                </div>
                                <h4 className="text-4xl font-bold serif">Accuracy</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Precision</p>
                            </div>
                        </div>

                        {Object.keys(missedKeys).length > 0 && (
                            <div className="mb-8 p-4 bg-black/20 rounded-xl inline-block">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 flex items-center justify-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Needs Practice
                                </p>
                                <div className="flex gap-2 justify-center">
                                    {Object.entries(missedKeys)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([key, count]) => (
                                            <span key={key} className="px-2 py-1 bg-red-500/30 rounded text-xs font-mono border border-red-500/20">
                                                {key === ' ' ? 'Space' : key} <span className="opacity-50 text-[10px]">x{count}</span>
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={resetGame}
                                className="bg-white text-[var(--forest)] px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Next Lesson
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
