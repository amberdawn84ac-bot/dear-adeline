'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
}

interface QuizProps {
    title: string;
    questions: QuizQuestion[];
}

export function Quiz({ title, questions }: QuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const handleAnswer = (index: number) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setShowResult(true);
        if (selectedAnswer === questions[currentQuestion].correct) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setCompleted(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setCompleted(false);
    };

    if (completed) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="h-full bg-gradient-to-br from-[var(--ochre-light)] to-[var(--cream)] rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl">
                    <Trophy className="w-12 h-12 text-[var(--ochre)]" />
                </div>
                <h3 className="text-3xl font-bold serif text-[var(--forest)] mb-4">Quiz Complete!</h3>
                <p className="text-6xl font-black text-[var(--ochre)] mb-2">{percentage}%</p>
                <p className="text-lg text-[var(--charcoal-light)] mb-8">
                    You got {score} out of {questions.length} correct
                </p>
                <button
                    onClick={handleRestart}
                    className="px-8 py-4 bg-[var(--forest)] text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const question = questions[currentQuestion];

    return (
        <div className="h-full bg-gradient-to-br from-[var(--sage-light)] to-[var(--cream)] rounded-3xl p-8 flex flex-col">
            {/* Header */}
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold serif text-[var(--forest)]">{title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]/50 mt-2">
                    Question {currentQuestion + 1} of {questions.length}
                </p>
                <div className="w-full bg-white/50 rounded-full h-2 mt-4">
                    <div
                        className="bg-[var(--sage)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white rounded-3xl p-8 shadow-lg mb-6">
                    <p className="text-xl md:text-2xl font-bold text-[var(--forest)] leading-relaxed">
                        {question.question}
                    </p>
                </div>

                {/* Options */}
                <div className="space-y-4 flex-1">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === question.correct;
                        const showCorrect = showResult && isCorrect;
                        const showIncorrect = showResult && isSelected && !isCorrect;

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={showResult}
                                className={`w-full p-6 rounded-2xl text-left font-medium transition-all border-2 flex items-center gap-4 ${showCorrect
                                        ? 'bg-green-50 border-green-500 text-green-900'
                                        : showIncorrect
                                            ? 'bg-red-50 border-red-500 text-red-900'
                                            : isSelected
                                                ? 'bg-[var(--sage-light)] border-[var(--sage)] text-[var(--forest)]'
                                                : 'bg-white border-[var(--cream-dark)] hover:border-[var(--sage)] text-[var(--charcoal)]'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${showCorrect ? 'border-green-500 bg-green-500' :
                                        showIncorrect ? 'border-red-500 bg-red-500' :
                                            isSelected ? 'border-[var(--sage)] bg-[var(--sage)]' :
                                                'border-[var(--cream-dark)]'
                                    }`}>
                                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                                    {showIncorrect && <XCircle className="w-5 h-5 text-white" />}
                                    {!showResult && isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                                </div>
                                <span className="flex-1">{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex justify-between items-center">
                <div className="text-sm font-bold text-[var(--charcoal-light)]">
                    Score: {score}/{questions.length}
                </div>
                {!showResult ? (
                    <button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className="px-8 py-4 bg-[var(--forest)] text-white rounded-2xl font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-8 py-4 bg-[var(--ochre)] text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg"
                    >
                        {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                )}
            </div>
        </div>
    );
}
