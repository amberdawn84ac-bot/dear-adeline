'use client';

import React, { useState } from 'react';
import {
    Heart,
    Zap,
    Users,
    Target,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Leaf,
    Code,
    Palette,
    Scale,
    Wrench,
    Globe,
    BookOpen,
    Music,
    Beaker,
    Mountain,
    Home
} from 'lucide-react';

interface CareerQuizProps {
    onComplete: (data: any) => void;
    initialData?: any;
}

// Interest categories with icons
const INTERESTS = [
    { id: 'creation_science', label: "God's Creation & Science", icon: Beaker, color: 'bg-green-100 text-green-700' },
    { id: 'health', label: 'Health & Natural Medicine', icon: Heart, color: 'bg-pink-100 text-pink-700' },
    { id: 'food_systems', label: 'Food Systems & Agriculture', icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
    { id: 'justice', label: 'Justice & Advocacy', icon: Scale, color: 'bg-purple-100 text-purple-700' },
    { id: 'technology', label: 'Technology & Innovation', icon: Code, color: 'bg-blue-100 text-blue-700' },
    { id: 'arts', label: 'Arts & Creative Expression', icon: Palette, color: 'bg-orange-100 text-orange-700' },
    { id: 'business', label: 'Entrepreneurship & Business', icon: Target, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'building', label: 'Building & Making Things', icon: Wrench, color: 'bg-gray-100 text-gray-700' },
    { id: 'community', label: 'Community & People Work', icon: Users, color: 'bg-indigo-100 text-indigo-700' },
    { id: 'education', label: 'Teaching & Discipleship', icon: BookOpen, color: 'bg-teal-100 text-teal-700' },
    { id: 'global', label: 'Global Impact & Missions', icon: Globe, color: 'bg-cyan-100 text-cyan-700' },
    { id: 'nature', label: 'Nature & Outdoors', icon: Mountain, color: 'bg-lime-100 text-lime-700' },
];

// Core values
const VALUES = [
    { id: 'truth', label: 'Biblical Truth', description: 'Living and speaking Gods truth' },
    { id: 'freedom', label: 'Freedom', description: 'Helping others break free from bondage' },
    { id: 'creativity', label: 'Creativity', description: 'Making beautiful, innovative things' },
    { id: 'justice', label: 'Justice', description: 'Fighting for what is right' },
    { id: 'compassion', label: 'Compassion', description: 'Caring deeply for others' },
    { id: 'excellence', label: 'Excellence', description: 'Doing things with mastery' },
    { id: 'community', label: 'Community', description: 'Building strong relationships' },
    { id: 'stewardship', label: 'Stewardship', description: 'Caring for Gods creation' },
    { id: 'wisdom', label: 'Wisdom', description: 'Seeking and sharing understanding' },
    { id: 'courage', label: 'Courage', description: 'Standing firm in the face of fear' },
];

// Work style preferences
const WORK_STYLES = [
    {
        question: 'I learn best by...',
        options: [
            { id: 'hands_on', label: 'Doing it myself hands-on', value: 'hands_on' },
            { id: 'reading', label: 'Reading and studying', value: 'reading' },
            { id: 'watching', label: 'Watching others demonstrate', value: 'watching' },
            { id: 'discussing', label: 'Talking through ideas with others', value: 'discussing' },
        ]
    },
    {
        question: 'I prefer working...',
        options: [
            { id: 'alone', label: 'Independently on my own', value: 'solo' },
            { id: 'small_team', label: 'With a small close-knit team', value: 'small_team' },
            { id: 'large_group', label: 'With lots of people around', value: 'large_group' },
            { id: 'leading', label: 'Leading and directing others', value: 'leading' },
        ]
    },
    {
        question: 'The work I find most satisfying involves...',
        options: [
            { id: 'solving', label: 'Solving complex problems', value: 'problem_solving' },
            { id: 'creating', label: 'Creating something new', value: 'creating' },
            { id: 'helping', label: 'Helping people directly', value: 'helping' },
            { id: 'organizing', label: 'Organizing and improving systems', value: 'organizing' },
        ]
    },
];

export default function CareerQuiz({ onComplete, initialData }: CareerQuizProps) {
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // Quiz state
    const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interest_areas || []);
    const [selectedValues, setSelectedValues] = useState<string[]>(initialData?.core_values || []);
    const [workStyle, setWorkStyle] = useState<Record<string, string>>(initialData?.work_style || {});
    const [dreamDay, setDreamDay] = useState(initialData?.dream_day || '');
    const [dreamImpact, setDreamImpact] = useState(initialData?.dream_impact || '');
    const [dreamLegacy, setDreamLegacy] = useState(initialData?.dream_legacy || '');

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleValue = (id: string) => {
        if (selectedValues.includes(id)) {
            setSelectedValues(prev => prev.filter(v => v !== id));
        } else if (selectedValues.length < 5) {
            setSelectedValues(prev => [...prev, id]);
        }
    };

    const handleWorkStyleAnswer = (questionIndex: number, value: string) => {
        setWorkStyle(prev => ({ ...prev, [`q${questionIndex}`]: value }));
    };

    const canProceed = () => {
        switch (step) {
            case 1: return selectedInterests.length >= 3;
            case 2: return selectedValues.length >= 3;
            case 3: return Object.keys(workStyle).length === WORK_STYLES.length;
            case 4: return dreamDay.length >= 20 && dreamImpact.length >= 20;
            case 5: return dreamLegacy.length >= 20;
            default: return true;
        }
    };

    const handleComplete = () => {
        const assessmentData = {
            interest_areas: selectedInterests,
            core_values: selectedValues,
            work_style: workStyle,
            dream_day: dreamDay,
            dream_impact: dreamImpact,
            dream_legacy: dreamLegacy,
            completed_sections: ['interests', 'values', 'work_style', 'dreams'],
            is_complete: true,
            completion_percentage: 100,
        };
        onComplete(assessmentData);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                        Step {step} of {totalSteps}
                    </span>
                    <span className="text-sm font-medium text-purple-600">
                        {Math.round((step / totalSteps) * 100)}% Complete
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step 1: Interests */}
            {step === 1 && (
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-purple-900 mb-2">What interests you?</h2>
                        <p className="text-gray-600">Select at least 3 areas that excite you. Pick as many as you want!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {INTERESTS.map(interest => {
                            const Icon = interest.icon;
                            const isSelected = selectedInterests.includes(interest.id);
                            return (
                                <button
                                    key={interest.id}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-left relative ${
                                        isSelected
                                            ? 'border-purple-500 bg-purple-50 scale-105'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {isSelected && (
                                        <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-purple-600" />
                                    )}
                                    <div className={`w-12 h-12 rounded-xl ${interest.color} flex items-center justify-center mb-3`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900">{interest.label}</h3>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {selectedInterests.length} selected {selectedInterests.length < 3 && `(need ${3 - selectedInterests.length} more)`}
                    </div>
                </div>
            )}

            {/* Step 2: Values */}
            {step === 2 && (
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-purple-900 mb-2">What matters most to you?</h2>
                        <p className="text-gray-600">Choose your top 3-5 core values</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {VALUES.map((value, index) => {
                            const isSelected = selectedValues.includes(value.id);
                            const rank = selectedValues.indexOf(value.id) + 1;
                            return (
                                <button
                                    key={value.id}
                                    onClick={() => toggleValue(value.id)}
                                    disabled={!isSelected && selectedValues.length >= 5}
                                    className={`p-5 rounded-2xl border-2 transition-all text-left relative ${
                                        isSelected
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                    } ${!isSelected && selectedValues.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            #{rank}
                                        </div>
                                    )}
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{value.label}</h3>
                                    <p className="text-sm text-gray-600">{value.description}</p>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {selectedValues.length} selected {selectedValues.length < 3 && `(need ${3 - selectedValues.length} more)`}
                    </div>
                </div>
            )}

            {/* Step 3: Work Style */}
            {step === 3 && (
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-purple-900 mb-2">How do you like to work?</h2>
                        <p className="text-gray-600">Answer these questions about your work style</p>
                    </div>

                    <div className="space-y-8">
                        {WORK_STYLES.map((styleQ, qIndex) => (
                            <div key={qIndex}>
                                <h3 className="font-bold text-lg text-gray-900 mb-4">{styleQ.question}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {styleQ.options.map(option => {
                                        const isSelected = workStyle[`q${qIndex}`] === option.value;
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleWorkStyleAnswer(qIndex, option.value)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 ${
                                                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                                    } flex items-center justify-center`}>
                                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{option.label}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Dream Scenarios */}
            {step === 4 && (
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-purple-900 mb-2">Dream big!</h2>
                        <p className="text-gray-600">Tell us about your ideal future</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block font-bold text-gray-900 mb-2">
                                <Sparkles className="inline w-5 h-5 mr-2 text-yellow-500" />
                                Describe your ideal workday 5 years from now
                            </label>
                            <textarea
                                value={dreamDay}
                                onChange={e => setDreamDay(e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                                rows={4}
                                placeholder="What are you doing? Where are you? Who are you with? What impact are you making?"
                            />
                            <div className="text-xs text-gray-500 mt-1">{dreamDay.length} characters (min 20)</div>
                        </div>

                        <div>
                            <label className="block font-bold text-gray-900 mb-2">
                                <Target className="inline w-5 h-5 mr-2 text-purple-500" />
                                What change do you want to see in the world?
                            </label>
                            <textarea
                                value={dreamImpact}
                                onChange={e => setDreamImpact(e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                                rows={4}
                                placeholder="What problem do you want to solve? What would you restore or heal?"
                            />
                            <div className="text-xs text-gray-500 mt-1">{dreamImpact.length} characters (min 20)</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 5: Legacy */}
            {step === 5 && (
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-purple-900 mb-2">Your legacy</h2>
                        <p className="text-gray-600">One final question...</p>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-900 mb-2">
                            <Heart className="inline w-5 h-5 mr-2 text-red-500" />
                            When you're old and looking back on your life, what do you want to be remembered for?
                        </label>
                        <textarea
                            value={dreamLegacy}
                            onChange={e => setDreamLegacy(e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                            rows={6}
                            placeholder="What will people say about you? What will your life have meant?"
                        />
                        <div className="text-xs text-gray-500 mt-1">{dreamLegacy.length} characters (min 20)</div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                {step > 1 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                ) : (
                    <div />
                )}

                {step < totalSteps ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        Next
                        <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handleComplete}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Assessment
                    </button>
                )}
            </div>
        </div>
    );
}
