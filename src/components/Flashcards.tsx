'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface FlashCard {
    front: string;
    back: string;
}

interface FlashcardsProps {
    title: string;
    cards: FlashCard[];
}

export function Flashcards({ title, cards }: FlashcardsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="h-full bg-gradient-to-br from-[var(--sage-light)] to-[var(--cream)] rounded-3xl p-8 flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold serif text-[var(--forest)]">{title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]/50 mt-2">
                    Card {currentIndex + 1} of {cards.length}
                </p>
            </div>

            {/* Card */}
            <div className="flex-1 flex items-center justify-center perspective-1000">
                <div
                    onClick={handleFlip}
                    className={`relative w-full max-w-2xl aspect-[3/2] cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div
                        className={`absolute inset-0 bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center backface-hidden ${isFlipped ? 'invisible' : 'visible'
                            }`}
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--sage)] mb-4">Question</p>
                        <p className="text-2xl md:text-3xl font-bold text-center text-[var(--forest)] leading-relaxed">
                            {cards[currentIndex].front}
                        </p>
                        <p className="text-xs text-[var(--charcoal-light)] mt-8 italic">Click to reveal answer</p>
                    </div>

                    {/* Back */}
                    <div
                        className={`absolute inset-0 bg-[var(--forest)] rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center backface-hidden rotate-y-180 ${isFlipped ? 'visible' : 'invisible'
                            }`}
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--sage-light)] mb-4">Answer</p>
                        <p className="text-xl md:text-2xl font-medium text-center text-white leading-relaxed">
                            {cards[currentIndex].back}
                        </p>
                        <p className="text-xs text-white/50 mt-8 italic">Click to see question</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8">
                <button
                    onClick={handlePrev}
                    disabled={cards.length <= 1}
                    className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl hover:bg-[var(--cream)] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="font-bold text-sm">Previous</span>
                </button>

                <button
                    onClick={() => {
                        setCurrentIndex(0);
                        setIsFlipped(false);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/50 rounded-2xl hover:bg-white transition-all"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-bold text-sm">Restart</span>
                </button>

                <button
                    onClick={handleNext}
                    disabled={cards.length <= 1}
                    className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl hover:bg-[var(--cream)] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                    <span className="font-bold text-sm">Next</span>
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
