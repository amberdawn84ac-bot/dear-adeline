'use client';

import Link from 'next/link';
import { Keyboard, Code, Globe, BookOpen, Mic } from 'lucide-react';

const GAMES = [
    {
        id: 'typing',
        title: 'Typing Practice',
        description: 'Improve your typing speed and accuracy with fun word challenges',
        icon: Keyboard,
        color: 'from-blue-500 to-cyan-500',
        href: '/games/typing'
    },
    {
        id: 'spelling',
        title: 'Spelling Bee',
        description: 'Listen to words and spell them correctly to build vocabulary',
        icon: Mic,
        color: 'from-purple-500 to-pink-500',
        href: '/games/spelling'
    },
    {
        id: 'coding',
        title: 'Code Quest',
        description: 'Learn programming logic through puzzles and challenges',
        icon: Code,
        color: 'from-green-500 to-emerald-500',
        href: '/games/coding'
    },
    {
        id: 'geography',
        title: 'World Explorer',
        description: 'Discover geography through maps, timelines, and location games',
        icon: Globe,
        color: 'from-orange-500 to-amber-500',
        href: '/games/geography'
    }
];

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
            <div className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Learning Games
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Build skills while having fun! Each game helps you master important abilities.
                    </p>
                </div>

                {/* Games Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {GAMES.map((game) => {
                        const Icon = game.icon;
                        return (
                            <Link
                                key={game.id}
                                href={game.href}
                                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {game.title}
                                </h2>
                                <p className="text-gray-600">
                                    {game.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {/* Reading Coach Link */}
                <div className="mt-12 text-center">
                    <Link
                        href="/reading-coach"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--sage)] to-[var(--forest)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <BookOpen className="w-6 h-6" />
                        Try the Reading Coach
                    </Link>
                    <p className="mt-3 text-gray-500 text-sm">
                        Guided reading with comprehension checks
                    </p>
                </div>
            </div>
        </div>
    );
}
