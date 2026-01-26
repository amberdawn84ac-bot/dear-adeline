'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    BookHeart,
    Plus,
    Search,
    Calendar,
    Smile,
    Meh,
    Frown,
    Sparkles,
    Save,
    X
} from 'lucide-react';

interface JournalEntry {
    id: string;
    title: string | null;
    content: string;
    prompt: string | null;
    mood: string | null;
    tags: string[];
    created_at: string;
}

const MOOD_ICONS = {
    happy: { icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    neutral: { icon: Meh, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    sad: { icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50' },
};

export default function JournalClient() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [filter, setFilter] = useState<'all' | 'projects'>('all');

    useEffect(() => {
        loadEntries();
    }, [filter]);

    const loadEntries = async () => {
        try {
            setLoading(true);
            const query = filter === 'projects' ? '?tag=project' : '';
            const response = await fetch(`/api/journal/list${query}`);
            const data = await response.json();
            setEntries(data.entries || []);
        } catch (error) {
            console.error('Error loading entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;

        setSaving(true);
        try {
            const response = await fetch('/api/journal/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim() || null,
                    content: content.trim(),
                    mood,
                    tags: []
                })
            });

            if (response.ok) {
                setTitle('');
                setContent('');
                setMood(null);
                setShowEditor(false);
                loadEntries();
            }
        } catch (error) {
            console.error('Error saving entry:', error);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (showEditor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-white p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => setShowEditor(false)}
                            className="inline-flex items-center gap-2 text-[var(--charcoal-light)] hover:text-[var(--forest)] transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!content.trim() || saving}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--burgundy)] text-white rounded-2xl font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>

                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl border-2 border-[var(--sage)]/20 space-y-6">
                        {/* Title */}
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Entry title (optional)"
                            className="w-full text-3xl font-bold serif text-[var(--forest)] placeholder:text-[var(--charcoal-light)]/30 border-none focus:ring-0 p-0"
                        />

                        {/* Mood Selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black uppercase tracking-widest text-[var(--charcoal-light)]">
                                How are you feeling?
                            </span>
                            <div className="flex gap-2">
                                {Object.entries(MOOD_ICONS).map(([key, { icon: Icon, color, bg }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setMood(mood === key ? null : key)}
                                        className={`p-3 rounded-xl transition-all ${mood === key
                                            ? `${bg} ${color} scale-110`
                                            : 'bg-[var(--cream)] text-[var(--charcoal-light)] hover:scale-105'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your thoughts, prayers, reflections..."
                            className="w-full h-96 text-lg text-[var(--charcoal)] leading-relaxed font-serif placeholder:text-[var(--charcoal-light)]/50 border-none focus:ring-0 resize-none p-0"
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-white p-6">
            <div className="max-w-5xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-[var(--charcoal-light)] hover:text-[var(--forest)] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                {/* Header */}
                <div className="bg-gradient-to-r from-[var(--burgundy)] to-[var(--burgundy-light)] rounded-[3rem] p-12 text-white mb-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <BookHeart className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold serif">Spiritual Growth Journal</h1>
                                <p className="text-white/80 text-lg mt-2">Your private space for reflection and prayer</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEditor(true)}
                            className="px-8 py-4 bg-white text-[var(--burgundy)] rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            New Entry
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${filter === 'all'
                            ? 'bg-[var(--forest)] text-white shadow-lg scale-105'
                            : 'bg-white text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                            }`}
                    >
                        All Entries
                    </button>
                    <button
                        onClick={() => setFilter('projects')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${filter === 'projects'
                            ? 'bg-[var(--forest)] text-white shadow-lg scale-105'
                            : 'bg-white text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                            }`}
                    >
                        Projects
                    </button>
                </div>

                {/* Entries */}
                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-[var(--charcoal-light)]">Loading your journal...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-20 space-y-6">
                        <div className="w-24 h-24 rounded-full bg-[var(--cream)] mx-auto flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-[var(--sage)]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold serif text-[var(--forest)] mb-2">
                                {filter === 'projects' ? 'No Active Projects' : 'Start Your Journey'}
                            </h3>
                            <p className="text-[var(--charcoal-light)] mb-6">
                                {filter === 'projects'
                                    ? 'Ask Adeline to help you plan a project!'
                                    : 'Your journal is a sacred space for your thoughts, prayers, and reflections.'}
                            </p>
                            {filter !== 'projects' && (
                                <button
                                    onClick={() => setShowEditor(true)}
                                    className="px-8 py-4 bg-[var(--burgundy)] text-white rounded-2xl font-bold inline-flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Write Your First Entry
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {entries.map((entry) => {
                            const MoodIcon = entry.mood ? MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS]?.icon : null;
                            const moodColor = entry.mood ? MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS]?.color : '';
                            const moodBg = entry.mood ? MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS]?.bg : '';

                            return (
                                <div
                                    key={entry.id}
                                    className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--cream-dark)] hover:shadow-xl transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            {entry.title && (
                                                <h3 className="text-xl font-bold serif text-[var(--forest)] mb-2 flex items-center gap-2">
                                                    {entry.tags?.includes('project') && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Project
                                                        </span>
                                                    )}
                                                    {entry.title}
                                                </h3>
                                            )}
                                            <div className="flex items-center gap-3 text-sm text-[var(--charcoal-light)]">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(entry.created_at)}
                                                </div>
                                                {MoodIcon && (
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${moodBg}`}>
                                                        <MoodIcon className={`w-4 h-4 ${moodColor}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[var(--charcoal)] leading-relaxed font-serif line-clamp-4 whitespace-pre-wrap">
                                        {entry.content}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
