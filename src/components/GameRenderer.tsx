'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Trophy } from 'lucide-react';

interface GameProps {
    type: 'quiz' | 'matching' | 'wordsearch' | 'fillinblank' | 'truefalse';
    content: any;
    onComplete?: (score: number) => void;
}

export function GameRenderer({ type, content, onComplete }: GameProps) {
    switch (type) {
        case 'quiz':
            return <QuizGame content={content} onComplete={onComplete} />;
        case 'matching':
            return <MatchingGame content={content} onComplete={onComplete} />;
        case 'truefalse':
            return <TrueFalseGame content={content} onComplete={onComplete} />;
        case 'fillinblank':
            return <FillInBlankGame content={content} onComplete={onComplete} />;
        default:
            return <QuizGame content={content} onComplete={onComplete} />;
    }
}

// Quiz Game Component
function QuizGame({ content, onComplete }: { content: any; onComplete?: (score: number) => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const questions = content.questions || [];
    const question = questions[currentQuestion];

    const handleAnswer = (index: number) => {
        setSelectedAnswer(index);
        setShowFeedback(true);

        if (index === question.correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
            } else {
                setCompleted(true);
                const finalScore = Math.round(((score + (index === question.correct ? 1 : 0)) / questions.length) * 100);
                onComplete?.(finalScore);
            }
        }, 2000);
    };

    if (!question) {
        return (
            <div className="bg-gradient-to-br from-purple/10 to-blue/10 rounded-3xl p-6 border-2 border-purple/20">
                <p className="text-center text-charcoal/50">Question data unavailable</p>
            </div>
        );
    }

    if (completed) {
        const finalScore = Math.round((score / questions.length) * 100);
        return (
            <div className="bg-gradient-to-br from-purple/10 to-magenta/10 rounded-3xl p-8 border-2 border-purple/20">
                <div className="text-center">
                    <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h3 className="text-2xl font-heading text-purple mb-2">Great Job!</h3>
                    <p className="text-lg text-charcoal mb-4">
                        You scored <span className="font-bold text-magenta">{finalScore}%</span>
                    </p>
                    <p className="text-sm text-charcoal/70">
                        {finalScore >= 80 ? "Excellent work! You really understand this!" :
                            finalScore >= 60 ? "Good effort! Keep practicing!" :
                                "Keep learning! You're making progress!"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple/10 to-blue/10 rounded-3xl p-6 border-2 border-purple/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple" />
                    <span className="text-sm font-bold text-purple">
                        Question {currentQuestion + 1} of {questions.length}
                    </span>
                </div>
                <span className="text-sm text-charcoal/70">Score: {score}/{questions.length}</span>
            </div>

            <h4 className="text-lg font-bold text-charcoal mb-4">{question.question}</h4>

            <div className="space-y-3">
                {question.options.map((option: string, index: number) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === question.correct;
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;

                    return (
                        <button
                            key={index}
                            onClick={() => !showFeedback && handleAnswer(index)}
                            disabled={showFeedback}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${showCorrect ? 'bg-green-100 border-green-500' :
                                showIncorrect ? 'bg-red-100 border-red-500' :
                                    isSelected ? 'bg-purple/10 border-purple' :
                                        'bg-white border-gray-200 hover:border-purple/50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-charcoal">{option}</span>
                                {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showFeedback && question.explanation && (
                <div className="mt-4 p-4 bg-blue/10 rounded-2xl border border-blue/20">
                    <p className="text-sm text-charcoal">{question.explanation}</p>
                </div>
            )}
        </div>
    );
}

// True/False Game Component
function TrueFalseGame({ content, onComplete }: { content: any; onComplete?: (score: number) => void }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    const questions = content.questions || [];
    const question = questions[currentQuestion];

    const handleAnswer = (answer: boolean) => {
        setSelectedAnswer(answer);
        setShowFeedback(true);

        if (answer === question.correct) {
            setScore(score + 1);
        }

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowFeedback(false);
            } else {
                setCompleted(true);
                const finalScore = Math.round(((score + (answer === question.correct ? 1 : 0)) / questions.length) * 100);
                onComplete?.(finalScore);
            }
        }, 2000);
    };

    if (completed) {
        const finalScore = Math.round((score / questions.length) * 100);
        return (
            <div className="bg-gradient-to-br from-purple/10 to-magenta/10 rounded-3xl p-8 border-2 border-purple/20">
                <div className="text-center">
                    <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h3 className="text-2xl font-heading text-purple mb-2">Well Done!</h3>
                    <p className="text-lg text-charcoal mb-4">
                        You got <span className="font-bold text-magenta">{score} out of {questions.length}</span> correct!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-coral/10 to-gold/10 rounded-3xl p-6 border-2 border-coral/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-coral" />
                    <span className="text-sm font-bold text-coral">
                        Statement {currentQuestion + 1} of {questions.length}
                    </span>
                </div>
                <span className="text-sm text-charcoal/70">Score: {score}/{questions.length}</span>
            </div>

            <h4 className="text-lg font-bold text-charcoal mb-6">{question.statement}</h4>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => !showFeedback && handleAnswer(true)}
                    disabled={showFeedback}
                    className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${selectedAnswer === true && showFeedback
                        ? question.correct === true
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-white border-gray-200 hover:border-coral text-charcoal'
                        }`}
                >
                    True
                </button>
                <button
                    onClick={() => !showFeedback && handleAnswer(false)}
                    disabled={showFeedback}
                    className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${selectedAnswer === false && showFeedback
                        ? question.correct === false
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-white border-gray-200 hover:border-coral text-charcoal'
                        }`}
                >
                    False
                </button>
            </div>

            {showFeedback && question.explanation && (
                <div className="mt-4 p-4 bg-blue/10 rounded-2xl border border-blue/20">
                    <p className="text-sm text-charcoal">{question.explanation}</p>
                </div>
            )}
        </div>
    );
}

// Matching Game Component
function MatchingGame({ content, onComplete }: { content: any; onComplete?: (score: number) => void }) {
    const [matches, setMatches] = useState<Record<number, number>>({});
    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [completed, setCompleted] = useState(false);

    const pairs = content.pairs || [];

    const handleLeftClick = (index: number) => {
        setSelectedLeft(index);
    };

    const handleRightClick = (index: number) => {
        if (selectedLeft === null) return;

        setMatches({ ...matches, [selectedLeft]: index });
        setSelectedLeft(null);

        if (Object.keys(matches).length + 1 === pairs.length) {
            setTimeout(() => {
                const correct = pairs.filter((pair: any, i: number) => matches[i] === i || (selectedLeft === i && index === i)).length;
                const score = Math.round((correct / pairs.length) * 100);
                setCompleted(true);
                onComplete?.(score);
            }, 500);
        }
    };

    if (completed) {
        return (
            <div className="bg-gradient-to-br from-purple/10 to-magenta/10 rounded-3xl p-8 border-2 border-purple/20">
                <div className="text-center">
                    <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
                    <h3 className="text-2xl font-heading text-purple mb-2">Matched!</h3>
                    <p className="text-sm text-charcoal">Great job matching all the pairs!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-magenta/10 to-coral/10 rounded-3xl p-6 border-2 border-magenta/20">
            <h4 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-magenta" />
                Match the Pairs
            </h4>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    {pairs.map((pair: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleLeftClick(index)}
                            disabled={matches[index] !== undefined}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${selectedLeft === index ? 'bg-magenta border-magenta text-white' :
                                matches[index] !== undefined ? 'bg-gray-100 border-gray-200 text-gray-400' :
                                    'bg-white border-gray-200 hover:border-magenta'
                                }`}
                        >
                            {pair.left}
                        </button>
                    ))}
                </div>
                <div className="space-y-2">
                    {pairs.map((pair: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleRightClick(index)}
                            disabled={Object.values(matches).includes(index)}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${Object.values(matches).includes(index) ? 'bg-gray-100 border-gray-200 text-gray-400' :
                                'bg-white border-gray-200 hover:border-magenta'
                                }`}
                        >
                            {pair.right}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Fill in the Blank Game Component
function FillInBlankGame({ content, onComplete }: { content: any; onComplete?: (score: number) => void }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    const questions = content.questions || [];

    const handleSubmit = () => {
        setShowResults(true);
        const correct = questions.filter((q: any, i: number) =>
            answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()
        ).length;
        const score = Math.round((correct / questions.length) * 100);
        onComplete?.(score);
    };

    return (
        <div className="bg-gradient-to-br from-blue/10 to-purple/10 rounded-3xl p-6 border-2 border-blue/20">
            <h4 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue" />
                Fill in the Blanks
            </h4>

            <div className="space-y-4">
                {questions.map((question: any, index: number) => {
                    const isCorrect = answers[index]?.toLowerCase().trim() === question.answer.toLowerCase().trim();

                    return (
                        <div key={index}>
                            <p className="text-charcoal mb-2">{question.question}</p>
                            <input
                                type="text"
                                value={answers[index] || ''}
                                onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                                disabled={showResults}
                                className={`w-full p-3 rounded-xl border-2 ${showResults
                                    ? isCorrect
                                        ? 'bg-green-100 border-green-500'
                                        : 'bg-red-100 border-red-500'
                                    : 'border-gray-200 focus:border-blue'
                                    } focus:outline-none`}
                                placeholder="Type your answer..."
                            />
                            {showResults && !isCorrect && (
                                <p className="text-sm text-green-600 mt-1">Correct answer: {question.answer}</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {!showResults && (
                <button
                    onClick={handleSubmit}
                    className="mt-6 w-full py-3 bg-blue text-white rounded-2xl font-bold hover:scale-105 transition-all"
                >
                    Check Answers
                </button>
            )}
        </div>
    );
}

// Helper function to parse game tags from text
export function parseGameTags(text: string): { beforeGame: string; game: any; afterGame: string } | null {
    const gameMatch = text.match(/<GAME>([\s\S]*?)<\/GAME>/);

    if (!gameMatch) return null;

    try {
        const gameData = JSON.parse(gameMatch[1]);
        return {
            beforeGame: text.substring(0, gameMatch.index),
            game: gameData,
            afterGame: text.substring((gameMatch.index || 0) + gameMatch[0].length)
        };
    } catch (e) {
        console.error('Failed to parse game data:', e);
        return null;
    }
}
