'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Volume2, RotateCcw, Trophy, Check, X, Loader2 } from 'lucide-react';

const WORD_LISTS = {
    easy: [
        { word: 'apple', hint: 'A red or green fruit' },
        { word: 'happy', hint: 'Feeling of joy' },
        { word: 'water', hint: 'You drink this' },
        { word: 'house', hint: 'A place to live' },
        { word: 'music', hint: 'Sounds that form a melody' },
        { word: 'green', hint: 'Color of grass' },
        { word: 'friend', hint: 'Someone you like spending time with' },
        { word: 'school', hint: 'Where you learn' },
    ],
    medium: [
        { word: 'beautiful', hint: 'Very pretty' },
        { word: 'important', hint: 'Something that matters a lot' },
        { word: 'different', hint: 'Not the same' },
        { word: 'tomorrow', hint: 'The day after today' },
        { word: 'together', hint: 'With each other' },
        { word: 'remember', hint: 'To keep in your mind' },
        { word: 'surprise', hint: 'Something unexpected' },
        { word: 'favorite', hint: 'The one you like best' },
    ],
    hard: [
        { word: 'necessary', hint: 'Required or needed' },
        { word: 'definitely', hint: 'Without any doubt' },
        { word: 'embarrass', hint: 'To make someone feel awkward' },
        { word: 'occurrence', hint: 'Something that happens' },
        { word: 'accommodate', hint: 'To provide room or space for' },
        { word: 'conscientious', hint: 'Careful and thorough' },
        { word: 'millennium', hint: 'A period of 1000 years' },
        { word: 'maintenance', hint: 'Keeping something in good condition' },
    ]
};

type Difficulty = 'easy' | 'medium' | 'hard';

export default function SpellingBee() {
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'feedback' | 'finished'>('menu');
    const [words, setWords] = useState<typeof WORD_LISTS.easy>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [results, setResults] = useState<Array<{ word: string; userAnswer: string; correct: boolean }>>([]);
    const [showHint, setShowHint] = useState(false);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const speakWord = (word: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startGame = () => {
        const wordList = WORD_LISTS[difficulty];
        const shuffled = [...wordList].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setCurrentWordIndex(0);
        setInput('');
        setScore(0);
        setResults([]);
        setShowHint(false);
        setLastAnswerCorrect(null);
        setGameState('playing');
        setTimeout(() => {
            inputRef.current?.focus();
            speakWord(shuffled[0].word);
        }, 500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentWord = words[currentWordIndex];
        const isCorrect = input.trim().toLowerCase() === currentWord.word.toLowerCase();

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setResults(prev => [...prev, {
            word: currentWord.word,
            userAnswer: input.trim(),
            correct: isCorrect
        }]);

        setLastAnswerCorrect(isCorrect);
        setGameState('feedback');
    };

    const nextWord = () => {
        setInput('');
        setShowHint(false);
        setLastAnswerCorrect(null);

        if (currentWordIndex + 1 >= words.length) {
            setGameState('finished');
        } else {
            setCurrentWordIndex(prev => prev + 1);
            setGameState('playing');
            setTimeout(() => {
                inputRef.current?.focus();
                speakWord(words[currentWordIndex + 1].word);
            }, 300);
        }
    };

    useEffect(() => {
        if (gameState === 'playing') {
            inputRef.current?.focus();
        }
    }, [gameState]);

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Games
                    </Link>

                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                            <Volume2 className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Spelling Bee
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Listen to the word and spell it correctly. Use the hint if you need help!
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
                                                ? 'bg-purple-500 text-white shadow-lg'
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
                            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            Start Spelling!
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const percentage = Math.round((score / words.length) * 100);

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            You spelled {score} out of {words.length} words correctly!
                        </p>

                        <div className="text-5xl font-bold text-purple-600 mb-8">
                            {percentage}%
                        </div>

                        {/* Results List */}
                        <div className="mb-8 max-h-60 overflow-y-auto">
                            <div className="space-y-2">
                                {results.map((result, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between p-3 rounded-xl ${
                                            result.correct ? 'bg-green-50' : 'bg-red-50'
                                        }`}
                                    >
                                        <span className="font-mono font-medium">
                                            {result.word}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {!result.correct && (
                                                <span className="text-sm text-red-500 line-through">
                                                    {result.userAnswer}
                                                </span>
                                            )}
                                            {result.correct ? (
                                                <Check className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <X className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={startGame}
                                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
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

    // Playing or Feedback state
    const currentWord = words[currentWordIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Progress */}
                <div className="bg-white rounded-2xl p-4 shadow-lg mb-8 flex justify-between items-center">
                    <span className="text-gray-600">
                        Word {currentWordIndex + 1} of {words.length}
                    </span>
                    <span className="font-bold text-purple-600">
                        Score: {score}
                    </span>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                    {gameState === 'feedback' ? (
                        // Feedback View
                        <div>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                lastAnswerCorrect ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                                {lastAnswerCorrect ? (
                                    <Check className="w-10 h-10 text-green-500" />
                                ) : (
                                    <X className="w-10 h-10 text-red-500" />
                                )}
                            </div>

                            <h2 className="text-2xl font-bold mb-4">
                                {lastAnswerCorrect ? 'Correct!' : 'Not quite!'}
                            </h2>

                            {!lastAnswerCorrect && (
                                <div className="mb-6">
                                    <p className="text-gray-600 mb-2">The correct spelling is:</p>
                                    <p className="text-3xl font-mono font-bold text-purple-600">
                                        {currentWord.word}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        You wrote: <span className="line-through">{input}</span>
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={nextWord}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                {currentWordIndex + 1 >= words.length ? 'See Results' : 'Next Word'}
                            </button>
                        </div>
                    ) : (
                        // Playing View
                        <div>
                            <button
                                onClick={() => speakWord(currentWord.word)}
                                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8 hover:scale-110 transition-transform shadow-xl"
                            >
                                <Volume2 className="w-12 h-12 text-white" />
                            </button>

                            <p className="text-gray-600 mb-2">Click to hear the word again</p>

                            {showHint && (
                                <p className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-xl inline-block mb-4">
                                    Hint: {currentWord.hint}
                                </p>
                            )}

                            <form onSubmit={handleSubmit} className="mt-8">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full max-w-md mx-auto text-center text-2xl font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    placeholder="Type the word..."
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                />

                                <div className="flex justify-center gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowHint(true)}
                                        disabled={showHint}
                                        className="px-4 py-2 text-purple-600 border-2 border-purple-200 rounded-xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Show Hint
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!input.trim()}
                                        className="px-8 py-2 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Check Spelling
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
