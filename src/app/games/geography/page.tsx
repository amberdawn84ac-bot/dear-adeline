'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Clock, MapPin, Check, X } from 'lucide-react';

interface Question {
    question: string;
    options: string[];
    correct: number;
    fact: string;
}

const GEOGRAPHY_QUESTIONS: Question[] = [
    {
        question: "What is the largest continent by land area?",
        options: ["Africa", "Asia", "North America", "Europe"],
        correct: 1,
        fact: "Asia covers about 30% of Earth's total land area!"
    },
    {
        question: "Which river is the longest in the world?",
        options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
        correct: 1,
        fact: "The Nile flows through 11 countries in northeastern Africa."
    },
    {
        question: "What is the capital of Japan?",
        options: ["Osaka", "Kyoto", "Tokyo", "Yokohama"],
        correct: 2,
        fact: "Tokyo is one of the most populous metropolitan areas in the world!"
    },
    {
        question: "Which country has the most natural lakes?",
        options: ["United States", "Russia", "Canada", "Finland"],
        correct: 2,
        fact: "Canada has over 60% of the world's lakes!"
    },
    {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
        correct: 2,
        fact: "Vatican City is only about 0.17 square miles!"
    },
    {
        question: "Which ocean is the largest?",
        options: ["Atlantic", "Indian", "Pacific", "Arctic"],
        correct: 2,
        fact: "The Pacific Ocean covers more area than all the land on Earth combined!"
    },
    {
        question: "What mountain range separates Europe from Asia?",
        options: ["Alps", "Himalayas", "Ural Mountains", "Andes"],
        correct: 2,
        fact: "The Ural Mountains stretch about 1,600 miles from north to south."
    },
    {
        question: "Which country has the longest coastline?",
        options: ["Australia", "Canada", "Russia", "Indonesia"],
        correct: 1,
        fact: "Canada's coastline is over 202,000 km long!"
    },
    {
        question: "What is the largest desert in the world?",
        options: ["Sahara", "Arabian", "Gobi", "Antarctic"],
        correct: 3,
        fact: "Antarctica is technically a cold desert and is larger than the Sahara!"
    },
    {
        question: "Which US state is the largest by area?",
        options: ["Texas", "California", "Alaska", "Montana"],
        correct: 2,
        fact: "Alaska is more than twice the size of Texas!"
    }
];

const HISTORY_QUESTIONS: Question[] = [
    {
        question: "In what year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correct: 2,
        fact: "WWII ended with Japan's surrender on September 2, 1945."
    },
    {
        question: "Who was the first President of the United States?",
        options: ["John Adams", "Thomas Jefferson", "George Washington", "Benjamin Franklin"],
        correct: 2,
        fact: "Washington served as president from 1789 to 1797."
    },
    {
        question: "The Great Wall of China was primarily built during which dynasty?",
        options: ["Han Dynasty", "Ming Dynasty", "Tang Dynasty", "Qin Dynasty"],
        correct: 1,
        fact: "Most of the existing wall was built during the Ming Dynasty (1368-1644)."
    },
    {
        question: "What year did the Titanic sink?",
        options: ["1910", "1911", "1912", "1913"],
        correct: 2,
        fact: "The Titanic sank on April 15, 1912, during her maiden voyage."
    },
    {
        question: "Which ancient civilization built the pyramids at Giza?",
        options: ["Romans", "Greeks", "Egyptians", "Persians"],
        correct: 2,
        fact: "The pyramids were built around 2560 BCE as tombs for pharaohs."
    }
];

type GameMode = 'geography' | 'history';

export default function GeographyGame() {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'feedback' | 'finished'>('menu');
    const [mode, setMode] = useState<GameMode>('geography');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showFact, setShowFact] = useState(false);

    const startGame = (selectedMode: GameMode) => {
        setMode(selectedMode);
        const questionPool = selectedMode === 'geography' ? GEOGRAPHY_QUESTIONS : HISTORY_QUESTIONS;
        const shuffled = [...questionPool].sort(() => Math.random() - 0.5).slice(0, 5);
        setQuestions(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setTimeLeft(15);
        setSelectedAnswer(null);
        setShowFact(false);
        setGameState('playing');
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time's up
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, currentIndex]);

    const handleAnswer = (answerIndex: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(answerIndex);
        const isCorrect = answerIndex === questions[currentIndex].correct;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setShowFact(true);
        setGameState('feedback');
    };

    const nextQuestion = () => {
        setSelectedAnswer(null);
        setShowFact(false);
        setTimeLeft(15);

        if (currentIndex + 1 >= questions.length) {
            setGameState('finished');
        } else {
            setCurrentIndex(prev => prev + 1);
            setGameState('playing');
        }
    };

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Games
                    </Link>

                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            World Explorer
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Test your knowledge of geography and history! Answer quickly for bonus points.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => startGame('geography')}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                🌍 Geography Challenge
                            </button>
                            <button
                                onClick={() => startGame('history')}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                📜 History Challenge
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const percentage = Math.round((score / questions.length) * 100);

        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {percentage >= 80 ? 'Amazing!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            You got {score} out of {questions.length} correct!
                        </p>

                        <div className="text-5xl font-bold text-orange-600 mb-8">
                            {percentage}%
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => startGame(mode)}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Play Again
                            </button>
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Change Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Playing or Feedback state
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 flex justify-between items-center">
                    <span className="text-gray-600">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-500'}`} />
                        <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <span className="font-bold text-orange-600">
                        Score: {score}
                    </span>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        {currentQuestion.question}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                        {currentQuestion.options.map((option, index) => {
                            let buttonClass = 'w-full p-4 rounded-xl font-medium text-left transition-all ';

                            if (gameState === 'feedback') {
                                if (index === currentQuestion.correct) {
                                    buttonClass += 'bg-green-100 border-2 border-green-500 text-green-700';
                                } else if (index === selectedAnswer && !isCorrect) {
                                    buttonClass += 'bg-red-100 border-2 border-red-500 text-red-700';
                                } else {
                                    buttonClass += 'bg-gray-100 text-gray-500';
                                }
                            } else {
                                buttonClass += 'bg-gray-100 hover:bg-orange-100 hover:border-orange-300 border-2 border-transparent';
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={gameState === 'feedback'}
                                    className={buttonClass}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {gameState === 'feedback' && index === currentQuestion.correct && (
                                            <Check className="w-5 h-5 text-green-500" />
                                        )}
                                        {gameState === 'feedback' && index === selectedAnswer && !isCorrect && (
                                            <X className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback */}
                    {showFact && (
                        <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                            <p className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                                {isCorrect ? '✓ Correct!' : selectedAnswer === -1 ? "⏱ Time's up!" : '✗ Not quite!'}
                            </p>
                            <p className="text-gray-700 text-sm">
                                <strong>Fun Fact:</strong> {currentQuestion.fact}
                            </p>
                        </div>
                    )}

                    {gameState === 'feedback' && (
                        <button
                            onClick={nextQuestion}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
