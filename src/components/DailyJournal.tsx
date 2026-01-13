'use client';

import React, { useState } from 'react';
import {
    Calendar,
    Smile,
    Heart,
    Zap,
    Star,
    CloudRain,
    ThumbsUp,
    Brain,
    Save,
    Sparkles,
    Pencil
} from 'lucide-react';

interface DailyJournalProps {
    onSave: (entryData: any) => void;
    initialData?: any;
    date: Date;
}

const MOOD_OPTIONS = [
    { id: 'excited', label: 'Excited', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'curious', label: 'Curious', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'focused', label: 'Focused', icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'proud', label: 'Proud', icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'tired', label: 'Tired', icon: CloudRain, color: 'text-gray-600', bg: 'bg-gray-50' },
    { id: 'challenged', label: 'Challenged', icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function DailyJournal({ onSave, initialData, date }: DailyJournalProps) {
    const [textNotes, setTextNotes] = useState(initialData?.text_notes || '');
    const [learnedToday, setLearnedToday] = useState<string[]>(initialData?.learned_today || []);
    const [newLearning, setNewLearning] = useState('');
    const [mood, setMood] = useState(initialData?.mood || '');
    const [saving, setSaving] = useState(false);

    const addLearning = () => {
        if (newLearning.trim()) {
            setLearnedToday([...learnedToday, newLearning.trim()]);
            setNewLearning('');
        }
    };

    const removeLearning = (index: number) => {
        setLearnedToday(learnedToday.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        const entryData = {
            entry_date: date.toISOString().split('T')[0],
            text_notes: textNotes,
            learned_today: learnedToday,
            mood,
        };
        await onSave(entryData);
        setSaving(false);
    };

    const formatDate = (d: Date) => {
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with Date */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-6 h-6" />
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80">Today's Entry</span>
                </div>
                <h2 className="text-3xl font-bold">{formatDate(date)}</h2>
            </div>

            {/* Mood Selector */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">How are you feeling today?</h3>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                    {MOOD_OPTIONS.map(moodOption => {
                        const Icon = moodOption.icon;
                        const isSelected = mood === moodOption.id;
                        return (
                            <button
                                key={moodOption.id}
                                onClick={() => setMood(isSelected ? '' : moodOption.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                    isSelected
                                        ? `${moodOption.bg} border-${moodOption.color.replace('text-', 'border-')} scale-105`
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <Icon className={`w-6 h-6 ${isSelected ? moodOption.color : 'text-gray-400'}`} />
                                <span className={`text-xs font-medium ${isSelected ? moodOption.color : 'text-gray-600'}`}>
                                    {moodOption.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* What I Learned Today */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-gray-900">What I Learned Today</h3>
                </div>

                <div className="space-y-3 mb-4">
                    {learnedToday.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100 group"
                        >
                            <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                {index + 1}
                            </div>
                            <p className="flex-1 text-gray-900">{item}</p>
                            <button
                                onClick={() => removeLearning(index)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newLearning}
                        onChange={e => setNewLearning(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addLearning()}
                        placeholder="Add something you learned..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                    <button
                        onClick={addLearning}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Notes & Thoughts */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <Pencil className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900">Notes & Thoughts</h3>
                </div>
                <textarea
                    value={textNotes}
                    onChange={e => setTextNotes(e.target.value)}
                    placeholder="Write about your day, what you're thinking, questions you have, ideas you had..."
                    className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none font-handwriting text-lg"
                />
                <p className="text-xs text-gray-500 mt-2">This is your space to think, doodle with words, and capture your day.</p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Today\'s Entry'}
                </button>
            </div>
        </div>
    );
}
