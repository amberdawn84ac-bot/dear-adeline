'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Zap, Target, Clock } from 'lucide-react';

const WORD_LISTS = {
    easy: ['cat', 'dog', 'sun', 'run', 'hat', 'bat', 'map', 'cap', 'pen', 'ten', 'red', 'bed', 'box', 'fox', 'hot', 'pot'],
    medium: ['apple', 'water', 'happy', 'green', 'house', 'music', 'paper', 'chair', 'table', 'plant', 'phone', 'brain', 'cloud', 'dream', 'light', 'night'],
    hard: ['adventure', 'beautiful', 'chocolate', 'dangerous', 'education', 'fantastic', 'generation', 'happiness', 'important', 'knowledge', 'laboratory', 'mysterious', 'neighborhood', 'opportunity', 'personality', 'quality']
};

type Difficulty = 'easy' | 'medium' | 'hard';

export default function TypingGame() {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
    const [words, setWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [errors, setErrors] = useState(0);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [timeLeft, setTimeLeft] = useState(60);
    const inputRef = useRef<HTMLInputElement>(null);

    const totalWords = 15;

    const startGame = useCallback(() => {
        const wordList = WORD_LISTS[difficulty];
        const shuffled = [...wordList].sort(() => Math.random() - 0.5).slice(0, totalWords);
        setWords(shuffled);
        setCurrentWordIndex(0);
        setInput('');
        setScore(0);
        setErrors(0);
        setStartTime(Date.now());
        setTimeLeft(60);
        setGameState('playing');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [difficulty]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('finished');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Calculate WPM
    useEffect(() => {
        if (!startTime || gameState !== 'playing') return;

        const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        if (elapsed > 0 && score > 0) {
            setWpm(Math.round(score / elapsed));
        }
    }, [score, startTime, gameState]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        const currentWord = words[currentWordIndex];

        // Check if word is complete (space pressed or matches exactly)
        if (value.trim() === currentWord) {
            // Correct word
            setScore(prev => prev + 1);
            setInput('');

            if (currentWordIndex + 1 >= words.length) {
                setGameState('finished');
            } else {
                setCurrentWordIndex(prev => prev + 1);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
            e.preventDefault();
            const currentWord = words[currentWordIndex];

            if (input.trim() !== currentWord) {
                // Wrong word - count as error but move on
                setErrors(prev => prev + 1);
            }

            setScore(prev => prev + 1);
            setInput('');

            if (currentWordIndex + 1 >= words.length) {
                setGameState('finished');
            } else {
                setCurrentWordIndex(prev => prev + 1);
            }
        }
    };

    // Calculate accuracy
    useEffect(() => {
        const totalAttempts = score + errors;
        if (totalAttempts > 0) {
            setAccuracy(Math.round((score / totalAttempts) * 100));
        }
    }, [score, errors]);

    const renderCharacter = (char: string, index: number, word: string) => {
        if (index >= input.length) {
            return <span key={index} className="text-gray-400">{char}</span>;
        }
        const isCorrect = input[index] === char;
        return (
            <span
                key={index}
                className={isCorrect ? 'text-green-500' : 'text-red-500 bg-red-100 rounded'}
            >
                {char}
            </span>
        );
    };

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Games
                    </Link>

                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
                            <Zap className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Typing Practice
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Type words as fast as you can! Press space to move to the next word.
                        </p>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Difficulty
                            </label>
                            <div className="flex justify-center gap-3">
                                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className={`px-6 py-3 rounded-xl font-medium transition-all ${
                                            difficulty === d
                                                ? 'bg-blue-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            Start Typing!
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Great Job!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Here are your results:
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-blue-600">{wpm}</div>
                                <div className="text-sm text-gray-600">WPM</div>
                            </div>
                            <div className="bg-green-50 rounded-2xl p-4">
                                <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                                <div className="text-sm text-gray-600">Accuracy</div>
                            </div>
                            <div className="bg-purple-50 rounded-2xl p-4">
                                <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <div className="text-3xl font-bold text-purple-600">{score}</div>
                                <div className="text-sm text-gray-600">Words</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={startGame}
                                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Play Again
                            </button>
                            <Link
                                href="/games"
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Back to Games
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Playing state
    const currentWord = words[currentWordIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
            <div className="max-w-3xl mx-auto">
                {/* Stats Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-lg mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Zap className="w-5 h-5" />
                        <span className="font-bold">{wpm} WPM</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                        <Target className="w-5 h-5" />
                        <span className="font-bold">{accuracy}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold">{score}/{totalWords}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                        <Clock className="w-5 h-5" />
                        <span className="font-bold">{timeLeft}s</span>
                    </div>
                </div>

                {/* Word Display */}
                <div className="bg-white rounded-3xl p-12 shadow-xl text-center mb-8">
                    <div className="text-5xl font-mono font-bold mb-8 tracking-wider">
                        {currentWord.split('').map((char, i) => renderCharacter(char, i, currentWord))}
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        className="w-full max-w-md mx-auto text-center text-2xl font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        placeholder="Type here..."
                        autoFocus
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                </div>

                {/* Upcoming Words */}
                <div className="bg-white/50 rounded-2xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Coming up:</p>
                    <div className="flex justify-center gap-3 flex-wrap">
                        {words.slice(currentWordIndex + 1, currentWordIndex + 5).map((word, i) => (
                            <span key={i} className="px-3 py-1 bg-white rounded-lg text-gray-600 font-mono">
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
