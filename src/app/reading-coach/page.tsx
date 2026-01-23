'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Volume2, CheckCircle, HelpCircle, Star, ChevronRight, Lightbulb } from 'lucide-react';

interface Passage {
    id: string;
    title: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    content: string;
    vocabulary: { word: string; definition: string }[];
    questions: { question: string; options: string[]; correct: number; explanation: string }[];
}

const PASSAGES: Passage[] = [
    {
        id: 'butterfly',
        title: 'The Life of a Butterfly',
        level: 'beginner',
        content: `Butterflies are beautiful insects that go through an amazing change called metamorphosis. They start their lives as tiny eggs laid on leaves. When the egg hatches, a caterpillar comes out.

The caterpillar is very hungry! It eats leaves all day long and grows bigger and bigger. After about two weeks, the caterpillar attaches itself to a branch and forms a chrysalis around its body.

Inside the chrysalis, something magical happens. The caterpillar's body completely changes. After about ten to fourteen days, a butterfly emerges with beautiful wings. At first, the wings are wet and crumpled, but soon they dry and the butterfly can fly away to find flowers and nectar.`,
        vocabulary: [
            { word: 'metamorphosis', definition: 'A complete change in form or structure' },
            { word: 'chrysalis', definition: 'The hard shell a caterpillar forms while transforming into a butterfly' },
            { word: 'emerges', definition: 'Comes out from inside something' },
            { word: 'nectar', definition: 'Sweet liquid found in flowers that butterflies drink' }
        ],
        questions: [
            {
                question: 'What does a butterfly start its life as?',
                options: ['A caterpillar', 'A tiny egg', 'A chrysalis', 'A flower'],
                correct: 1,
                explanation: 'The passage says "They start their lives as tiny eggs laid on leaves."'
            },
            {
                question: 'What is a chrysalis?',
                options: ['A type of flower', 'A butterfly wing', 'A protective shell for transformation', 'A kind of leaf'],
                correct: 2,
                explanation: 'The chrysalis is the hard shell that forms around the caterpillar while it transforms.'
            },
            {
                question: 'Why does the caterpillar eat so much?',
                options: ['Because it is bored', 'To grow bigger', 'To find friends', 'To build a nest'],
                correct: 1,
                explanation: 'The passage says the caterpillar "eats leaves all day long and grows bigger and bigger."'
            }
        ]
    },
    {
        id: 'solar-system',
        title: 'Our Solar System',
        level: 'intermediate',
        content: `Our solar system is a vast neighborhood in space, centered around a star we call the Sun. Eight planets orbit the Sun, each with its own unique characteristics and mysteries waiting to be discovered.

The four inner planets—Mercury, Venus, Earth, and Mars—are called terrestrial planets because they have solid, rocky surfaces. Earth is the only planet known to support life, thanks to its perfect distance from the Sun and its protective atmosphere.

The four outer planets—Jupiter, Saturn, Uranus, and Neptune—are called gas giants or ice giants. Jupiter is the largest planet in our solar system, so big that over 1,300 Earths could fit inside it! Saturn is famous for its spectacular rings made of ice and rock particles.

Beyond Neptune lies the Kuiper Belt, home to dwarf planets like Pluto and countless icy objects. Scientists continue to explore our solar system with spacecraft and telescopes, making new discoveries every year.`,
        vocabulary: [
            { word: 'terrestrial', definition: 'Related to Earth or land; having a solid surface' },
            { word: 'atmosphere', definition: 'The layer of gases surrounding a planet' },
            { word: 'orbit', definition: 'The curved path an object takes around another object in space' },
            { word: 'Kuiper Belt', definition: 'A region of icy objects beyond Neptune' }
        ],
        questions: [
            {
                question: 'How many planets orbit the Sun in our solar system?',
                options: ['Six', 'Seven', 'Eight', 'Nine'],
                correct: 2,
                explanation: 'The passage states "Eight planets orbit the Sun."'
            },
            {
                question: 'Why is Earth able to support life?',
                options: ['It has rings', 'It is the largest planet', 'Its distance from the Sun and protective atmosphere', 'It is made of gas'],
                correct: 2,
                explanation: 'The passage explains that Earth supports life "thanks to its perfect distance from the Sun and its protective atmosphere."'
            },
            {
                question: 'What are Saturn\'s rings made of?',
                options: ['Fire and lava', 'Ice and rock particles', 'Clouds and gas', 'Dust and sand'],
                correct: 1,
                explanation: 'The passage says Saturn\'s rings are "made of ice and rock particles."'
            }
        ]
    },
    {
        id: 'ancient-egypt',
        title: 'The Wonders of Ancient Egypt',
        level: 'advanced',
        content: `Ancient Egypt, one of the world's oldest and most influential civilizations, flourished along the banks of the Nile River for over three thousand years. The Egyptians developed a sophisticated society that made remarkable contributions to art, architecture, medicine, and writing.

The ancient Egyptians believed in an afterlife, which profoundly influenced their culture. They mummified their dead to preserve bodies for the journey to the next world. The pharaohs, considered living gods, built enormous pyramids as tombs to ensure their immortality. The Great Pyramid of Giza, built for Pharaoh Khufu around 2560 BCE, remained the tallest human-made structure for nearly four thousand years.

Hieroglyphics, the Egyptian writing system, used pictorial symbols to represent sounds and ideas. For centuries, scholars could not decipher these mysterious symbols until the discovery of the Rosetta Stone in 1799. This artifact, inscribed with the same text in three scripts, provided the key to unlocking the secrets of ancient Egyptian writing.

The legacy of ancient Egypt continues to captivate us today, from the treasures of Tutankhamun's tomb to the engineering marvels of the pyramids that still stand as testaments to human ingenuity and ambition.`,
        vocabulary: [
            { word: 'civilization', definition: 'An advanced society with its own culture, government, and achievements' },
            { word: 'mummified', definition: 'Preserved a dead body to prevent decay' },
            { word: 'hieroglyphics', definition: 'Ancient Egyptian writing using picture symbols' },
            { word: 'decipher', definition: 'To figure out the meaning of something that is hard to read or understand' },
            { word: 'artifact', definition: 'An object made by humans, especially one of historical interest' }
        ],
        questions: [
            {
                question: 'Why did ancient Egyptians mummify their dead?',
                options: ['To display them in museums', 'To preserve bodies for the afterlife', 'To scare away enemies', 'To study medicine'],
                correct: 1,
                explanation: 'The passage explains they "mummified their dead to preserve bodies for the journey to the next world."'
            },
            {
                question: 'What helped scholars finally understand hieroglyphics?',
                options: ['The pyramids', 'The Rosetta Stone', 'The pharaohs', 'The Nile River'],
                correct: 1,
                explanation: 'The Rosetta Stone "provided the key to unlocking the secrets of ancient Egyptian writing."'
            },
            {
                question: 'How long did the Great Pyramid remain the tallest human-made structure?',
                options: ['About 500 years', 'About 1,000 years', 'About 2,000 years', 'Nearly 4,000 years'],
                correct: 3,
                explanation: 'The passage states it "remained the tallest human-made structure for nearly four thousand years."'
            },
            {
                question: 'What does the word "testament" mean in the context of this passage?',
                options: ['A religious text', 'A legal document', 'Evidence or proof', 'A type of building'],
                correct: 2,
                explanation: 'In this context, "testaments" means evidence or proof of human ingenuity and ambition.'
            }
        ]
    }
];

type ReadingState = 'select' | 'reading' | 'vocabulary' | 'questions' | 'results';

export default function ReadingCoach() {
    const [state, setState] = useState<ReadingState>('select');
    const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
    const [currentParagraph, setCurrentParagraph] = useState(0);
    const [vocabIndex, setVocabIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startReading = (passage: Passage) => {
        setSelectedPassage(passage);
        setCurrentParagraph(0);
        setVocabIndex(0);
        setQuestionIndex(0);
        setAnswers([]);
        setScore(0);
        setShowExplanation(false);
        setState('reading');
    };

    const paragraphs = selectedPassage?.content.split('\n\n') || [];

    const handleNextParagraph = () => {
        if (currentParagraph < paragraphs.length - 1) {
            setCurrentParagraph(prev => prev + 1);
        } else {
            setState('vocabulary');
        }
    };

    const handleNextVocab = () => {
        if (selectedPassage && vocabIndex < selectedPassage.vocabulary.length - 1) {
            setVocabIndex(prev => prev + 1);
        } else {
            setState('questions');
        }
    };

    const handleAnswer = (answerIndex: number) => {
        if (showExplanation) return;

        const isCorrect = answerIndex === selectedPassage?.questions[questionIndex].correct;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setAnswers(prev => [...prev, answerIndex]);
        setShowExplanation(true);
    };

    const handleNextQuestion = () => {
        setShowExplanation(false);
        if (selectedPassage && questionIndex < selectedPassage.questions.length - 1) {
            setQuestionIndex(prev => prev + 1);
        } else {
            setState('results');
        }
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-700';
            case 'intermediate': return 'bg-blue-100 text-blue-700';
            case 'advanced': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Selection screen
    if (state === 'select') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Games
                    </Link>

                    <div className="text-center mb-12">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Reading Coach
                        </h1>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Choose a passage to read. I'll guide you through the text, teach you new vocabulary,
                            and check your understanding with questions.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {PASSAGES.map((passage) => (
                            <button
                                key={passage.id}
                                onClick={() => startReading(passage)}
                                className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {passage.title}
                                            </h2>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(passage.level)}`}>
                                                {passage.level}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {passage.vocabulary.length} vocabulary words • {passage.questions.length} comprehension questions
                                        </p>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Reading screen
    if (state === 'reading' && selectedPassage) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Progress */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Reading Progress</span>
                            <span className="text-sm text-gray-500">
                                Paragraph {currentParagraph + 1} of {paragraphs.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${((currentParagraph + 1) / paragraphs.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{selectedPassage.title}</h1>
                            <button
                                onClick={() => speakText(paragraphs[currentParagraph])}
                                className="p-3 bg-emerald-100 rounded-full hover:bg-emerald-200 transition-colors"
                                title="Listen to this paragraph"
                            >
                                <Volume2 className="w-5 h-5 text-emerald-600" />
                            </button>
                        </div>

                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            {paragraphs[currentParagraph]}
                        </p>

                        <button
                            onClick={handleNextParagraph}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            {currentParagraph < paragraphs.length - 1 ? 'Continue Reading' : 'Learn Vocabulary'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Vocabulary screen
    if (state === 'vocabulary' && selectedPassage) {
        const currentVocab = selectedPassage.vocabulary[vocabIndex];

        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Progress */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Vocabulary</span>
                            <span className="text-sm text-gray-500">
                                Word {vocabIndex + 1} of {selectedPassage.vocabulary.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-amber-500 h-2 rounded-full transition-all"
                                style={{ width: `${((vocabIndex + 1) / selectedPassage.vocabulary.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Vocabulary Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                            <Lightbulb className="w-8 h-8 text-amber-600" />
                        </div>

                        <div className="flex items-center justify-center gap-3 mb-4">
                            <h2 className="text-3xl font-bold text-gray-900">{currentVocab.word}</h2>
                            <button
                                onClick={() => speakText(currentVocab.word)}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Volume2 className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <p className="text-lg text-gray-600 mb-8">
                            {currentVocab.definition}
                        </p>

                        <button
                            onClick={handleNextVocab}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                        >
                            {vocabIndex < selectedPassage.vocabulary.length - 1 ? 'Next Word' : 'Start Questions'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Questions screen
    if (state === 'questions' && selectedPassage) {
        const currentQuestion = selectedPassage.questions[questionIndex];
        const userAnswer = answers[questionIndex];
        const isCorrect = userAnswer === currentQuestion.correct;

        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Progress */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Comprehension Check</span>
                            <span className="text-sm text-gray-500">
                                Question {questionIndex + 1} of {selectedPassage.questions.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${((questionIndex + 1) / selectedPassage.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="w-8 h-8 text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-900">{currentQuestion.question}</h2>
                        </div>

                        <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option, index) => {
                                let buttonClass = 'w-full p-4 rounded-xl font-medium text-left transition-all ';

                                if (showExplanation) {
                                    if (index === currentQuestion.correct) {
                                        buttonClass += 'bg-green-100 border-2 border-green-500 text-green-700';
                                    } else if (index === userAnswer && !isCorrect) {
                                        buttonClass += 'bg-red-100 border-2 border-red-500 text-red-700';
                                    } else {
                                        buttonClass += 'bg-gray-100 text-gray-500';
                                    }
                                } else {
                                    buttonClass += 'bg-gray-100 hover:bg-blue-100 hover:border-blue-300 border-2 border-transparent';
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={showExplanation}
                                        className={buttonClass}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option}</span>
                                            {showExplanation && index === currentQuestion.correct && (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {showExplanation && (
                            <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                                <p className={`font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                                    {isCorrect ? '✓ Excellent!' : '💡 Here\'s why:'}
                                </p>
                                <p className="text-gray-700 text-sm">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}

                        {showExplanation && (
                            <button
                                onClick={handleNextQuestion}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                {questionIndex < selectedPassage.questions.length - 1 ? 'Next Question' : 'See Results'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Results screen
    if (state === 'results' && selectedPassage) {
        const percentage = Math.round((score / selectedPassage.questions.length) * 100);

        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                            <Star className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {percentage >= 80 ? 'Outstanding!' : percentage >= 60 ? 'Good Work!' : 'Keep Reading!'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            You answered {score} out of {selectedPassage.questions.length} questions correctly!
                        </p>

                        <div className="text-5xl font-bold text-emerald-600 mb-4">
                            {percentage}%
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-8">
                            {selectedPassage.vocabulary.map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-full bg-amber-400" title={`Learned: ${selectedPassage.vocabulary[i].word}`} />
                            ))}
                        </div>

                        <p className="text-sm text-gray-500 mb-8">
                            You learned {selectedPassage.vocabulary.length} new vocabulary words!
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => startReading(selectedPassage)}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                            >
                                Read Again
                            </button>
                            <button
                                onClick={() => setState('select')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Choose Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
