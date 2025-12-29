'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Palette, BookOpen, Sparkles, Target, Lightbulb, Star } from 'lucide-react';

interface AboutMeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (data: AboutMeData) => void;
    studentName: string;
}

export interface AboutMeData {
    favoriteColors: string[];
    favoriteSubjects: string[];
    favoriteBook?: string;
    bookThoughts?: string;
    hobbies: string[];
    learningStyle: string;
    dreamsGoals?: string;
}

const QUESTIONS = [
    {
        id: 'colors',
        icon: Palette,
        illustration: '🎨',
        question: "What's your favorite color? Mine changes with the seasons!",
        response: (answer: string[]) => `Oh, ${answer.join(' and ')}! ${answer.length > 1 ? 'Those are' : "That's a"} beautiful choice${answer.length > 1 ? 's' : ''}!`
    },
    {
        id: 'subjects',
        icon: BookOpen,
        illustration: '📚',
        question: "What subject in school makes your heart sing?",
        response: (answer: string[]) => `Ah, ${answer.join(' and ')}! We're going to have so much fun exploring ${answer.length > 1 ? 'those' : 'that'} together!`
    },
    {
        id: 'book',
        icon: Heart,
        illustration: '📖',
        question: "Do you have a favorite book? Or one you're reading right now?",
        response: (answer: string) => answer ? `I love hearing about ${answer}! Books are windows to wonderful worlds.` : "That's okay, my dear! We'll discover some wonderful books together."
    },
    {
        id: 'hobbies',
        icon: Sparkles,
        illustration: '⭐',
        question: "What do you love to do when you're not studying?",
        response: (answer: string[]) => `A ${answer.join(', ')} enthusiast! We can weave ${answer.length > 1 ? 'those' : 'that'} into your learning journey.`
    },
    {
        id: 'learning',
        icon: Lightbulb,
        illustration: '💡',
        question: "When you learn something new, what helps you understand it best?",
        response: () => "Perfect! I'll make sure to teach in ways that work best for you."
    },
    {
        id: 'dreams',
        icon: Target,
        illustration: '🌟',
        question: "What's something you'd love to learn or do this year?",
        response: () => "What a wonderful dream! Let's work toward that together, one step at a time."
    }
];

const COLOR_OPTIONS = [
    { name: 'Purple', value: 'purple', color: '#6B4B7E' },
    { name: 'Pink', value: 'pink', color: '#E7598B' },
    { name: 'Blue', value: 'blue', color: '#5B7B8F' },
    { name: 'Green', value: 'green', color: '#76946a' },
    { name: 'Yellow', value: 'yellow', color: '#F4C594' },
    { name: 'Orange', value: 'orange', color: '#E89B6F' },
    { name: 'Red', value: 'red', color: '#C7396B' },
    { name: 'Rainbow', value: 'rainbow', color: 'linear-gradient(90deg, #C7396B, #E89B6F, #F4C594, #76946a, #5B7B8F, #6B4B7E)' }
];

const SUBJECT_OPTIONS = [
    { name: "God's Creation & Science", value: 'science', icon: '🔬' },
    { name: 'Health & Naturopathy', value: 'health', icon: '🌿' },
    { name: 'Food Systems', value: 'food', icon: '🌾' },
    { name: 'Government & Economics', value: 'government', icon: '🏛️' },
    { name: 'Justice', value: 'justice', icon: '⚖️' },
    { name: 'Discipleship', value: 'discipleship', icon: '✝️' },
    { name: 'History', value: 'history', icon: '📜' },
    { name: 'English & Literature', value: 'english', icon: '📖' }
];

const HOBBY_OPTIONS = [
    { name: 'Reading', icon: '📚' },
    { name: 'Drawing', icon: '🎨' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Music', icon: '🎵' },
    { name: 'Building', icon: '🔨' },
    { name: 'Gardening', icon: '🌱' },
    { name: 'Cooking', icon: '🍳' },
    { name: 'Animals', icon: '🐾' },
    { name: 'Writing', icon: '✍️' },
    { name: 'Dancing', icon: '💃' }
];

const LEARNING_STYLES = [
    { name: 'Pictures & Diagrams', value: 'visual', icon: '🎨', description: 'I love seeing how things look' },
    { name: 'Hands-On Activities', value: 'kinesthetic', icon: '🔨', description: 'I learn by doing and touching' },
    { name: 'Reading & Writing', value: 'reading', icon: '📖', description: 'I like reading and taking notes' },
    { name: 'Talking It Through', value: 'auditory', icon: '🗣️', description: 'I understand when I hear it explained' },
    { name: 'Building & Creating', value: 'building', icon: '🏗️', description: 'I love making things' }
];

export function AboutMeModal({ isOpen, onClose, onComplete, studentName }: AboutMeModalProps) {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<Partial<AboutMeData>>({
        favoriteColors: [],
        favoriteSubjects: [],
        hobbies: [],
        learningStyle: ''
    });
    const [showResponse, setShowResponse] = useState(false);

    if (!isOpen) return null;

    const currentQuestion = QUESTIONS[step];
    const progress = ((step + 1) / QUESTIONS.length) * 100;

    const handleNext = () => {
        setShowResponse(true);
        setTimeout(() => {
            if (step < QUESTIONS.length - 1) {
                setStep(step + 1);
                setShowResponse(false);
            } else {
                onComplete(data as AboutMeData);
            }
        }, 2000);
    };

    const renderField = () => {
        switch (currentQuestion.id) {
            case 'colors':
                return (
                    <div className="grid grid-cols-4 gap-4">
                        {COLOR_OPTIONS.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => {
                                    const colors = data.favoriteColors || [];
                                    const newColors = colors.includes(color.value)
                                        ? colors.filter(c => c !== color.value)
                                        : [...colors, color.value];
                                    setData({ ...data, favoriteColors: newColors });
                                }}
                                className={`p-6 rounded-2xl border-2 transition-all ${data.favoriteColors?.includes(color.value)
                                    ? 'border-purple scale-105 shadow-lg'
                                    : 'border-gray-200 hover:border-purple-light'
                                    }`}
                                style={{
                                    background: color.value === 'rainbow' ? color.color : 'white'
                                }}
                            >
                                {color.value !== 'rainbow' && (
                                    <div
                                        className="w-full h-16 rounded-xl mb-2"
                                        style={{ backgroundColor: color.color }}
                                    />
                                )}
                                <p className="text-sm font-medium text-charcoal">{color.name}</p>
                            </button>
                        ))}
                    </div>
                );

            case 'subjects':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        {SUBJECT_OPTIONS.map((subject) => (
                            <button
                                key={subject.value}
                                onClick={() => {
                                    const subjects = data.favoriteSubjects || [];
                                    const newSubjects = subjects.includes(subject.value)
                                        ? subjects.filter(s => s !== subject.value)
                                        : [...subjects, subject.value];
                                    setData({ ...data, favoriteSubjects: newSubjects });
                                }}
                                className={`p-6 rounded-2xl border-2 transition-all text-left ${data.favoriteSubjects?.includes(subject.value)
                                    ? 'border-magenta bg-magenta/10 scale-105'
                                    : 'border-gray-200 hover:border-magenta-light bg-white'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{subject.icon}</div>
                                <p className="text-sm font-medium text-charcoal">{subject.name}</p>
                            </button>
                        ))}
                    </div>
                );

            case 'book':
                return (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Type your favorite book..."
                            value={data.favoriteBook || ''}
                            onChange={(e) => setData({ ...data, favoriteBook: e.target.value })}
                            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-coral focus:outline-none text-lg"
                        />
                        {data.favoriteBook && (
                            <textarea
                                placeholder="What do you love about it? (optional)"
                                value={data.bookThoughts || ''}
                                onChange={(e) => setData({ ...data, bookThoughts: e.target.value })}
                                className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-coral focus:outline-none text-lg resize-none"
                                rows={3}
                            />
                        )}
                    </div>
                );

            case 'hobbies':
                return (
                    <div className="grid grid-cols-5 gap-4">
                        {HOBBY_OPTIONS.map((hobby) => (
                            <button
                                key={hobby.name}
                                onClick={() => {
                                    const hobbies = data.hobbies || [];
                                    const newHobbies = hobbies.includes(hobby.name)
                                        ? hobbies.filter(h => h !== hobby.name)
                                        : [...hobbies, hobby.name];
                                    setData({ ...data, hobbies: newHobbies });
                                }}
                                className={`p-4 rounded-2xl border-2 transition-all ${data.hobbies?.includes(hobby.name)
                                    ? 'border-blue bg-blue/10 scale-105'
                                    : 'border-gray-200 hover:border-blue-light bg-white'
                                    }`}
                            >
                                <div className="text-3xl mb-1">{hobby.icon}</div>
                                <p className="text-xs font-medium text-charcoal">{hobby.name}</p>
                            </button>
                        ))}
                    </div>
                );

            case 'learning':
                return (
                    <div className="space-y-3">
                        {LEARNING_STYLES.map((style) => (
                            <button
                                key={style.value}
                                onClick={() => setData({ ...data, learningStyle: style.value })}
                                className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${data.learningStyle === style.value
                                    ? 'border-gold bg-gold/10 scale-105'
                                    : 'border-gray-200 hover:border-gold-light bg-white'
                                    }`}
                            >
                                <div className="text-4xl">{style.icon}</div>
                                <div>
                                    <p className="font-bold text-charcoal">{style.name}</p>
                                    <p className="text-sm text-charcoal-light">{style.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                );

            case 'dreams':
                return (
                    <textarea
                        placeholder="Tell me about your dreams and goals..."
                        value={data.dreamsGoals || ''}
                        onChange={(e) => setData({ ...data, dreamsGoals: e.target.value })}
                        className="w-full p-6 rounded-2xl border-2 border-gray-200 focus:border-purple focus:outline-none text-lg resize-none"
                        rows={5}
                    />
                );

            default:
                return null;
        }
    };

    const canContinue = () => {
        switch (currentQuestion.id) {
            case 'colors':
                return (data.favoriteColors?.length || 0) > 0;
            case 'subjects':
                return (data.favoriteSubjects?.length || 0) > 0;
            case 'hobbies':
                return (data.hobbies?.length || 0) > 0;
            case 'learning':
                return !!data.learningStyle;
            default:
                return true;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-pink-soft via-cream to-white rounded-[3rem] p-8 md:p-12 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple via-magenta to-coral transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-charcoal-light text-center mt-2">
                        Question {step + 1} of {QUESTIONS.length}
                    </p>
                </div>

                {/* Adeline's Avatar */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple to-magenta mx-auto flex items-center justify-center shadow-xl mb-4">
                        <span className="text-5xl">👵</span>
                    </div>
                    {step === 0 && !showResponse && (
                        <div className="mb-6">
                            <p className="text-2xl font-heading text-purple mb-2">
                                Hey there, {studentName}! 🌸
                            </p>
                            <p className="text-lg text-charcoal italic">
                                I'm so glad you're here! Let's get to know each other.
                            </p>
                        </div>
                    )}
                </div>

                {/* Question */}
                {!showResponse ? (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">{currentQuestion.illustration}</div>
                            <h2 className="text-2xl md:text-3xl font-body text-charcoal mb-2">
                                {currentQuestion.question}
                            </h2>
                        </div>

                        {renderField()}

                        <button
                            onClick={handleNext}
                            disabled={!canContinue()}
                            className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${canContinue()
                                ? 'bg-gradient-to-r from-purple to-magenta text-white hover:scale-105'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {step === QUESTIONS.length - 1 ? "Let's Start Learning! 🚀" : 'Continue →'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center animate-in fade-in zoom-in duration-500">
                        <div className="text-6xl mb-4">✨</div>
                        <p className="text-2xl font-body text-purple italic">
                            {(() => {
                                if (currentQuestion.id === 'colors') {
                                    return (currentQuestion.response as (answer: string[]) => string)(data.favoriteColors || []);
                                } else if (currentQuestion.id === 'subjects') {
                                    return (currentQuestion.response as (answer: string[]) => string)(data.favoriteSubjects || []);
                                } else if (currentQuestion.id === 'book') {
                                    return (currentQuestion.response as (answer: string) => string)(data.favoriteBook || '');
                                } else if (currentQuestion.id === 'hobbies') {
                                    return (currentQuestion.response as (answer: string[]) => string)(data.hobbies || []);
                                } else {
                                    return (currentQuestion.response as () => string)();
                                }
                            })()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
