'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Star, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { PathMilestone } from '@/lib/services/learningPathService';

interface LearningAdventureProps {
    milestones: PathMilestone[];
    studentName?: string;
}

export function LearningAdventure({ milestones, studentName }: LearningAdventureProps) {
    const router = useRouter();
    const currentMilestone = milestones.find(m => m.status === 'in_progress');
    const completedCount = milestones.filter(m => m.status === 'completed').length;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Rocket className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Your Learning Adventure</h1>
                </div>
                <p className="text-lg opacity-90">
                    {completedCount > 0
                        ? `Amazing! You've completed ${completedCount} milestone${completedCount > 1 ? 's' : ''}! 🎉`
                        : "Let's start your personalized learning journey!"}
                </p>
            </div>

            {/* Current Milestone */}
            {currentMilestone && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-purple-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            <h2 className="text-xl font-bold text-gray-800">Up Next</h2>
                        </div>
                        <span className="text-sm text-gray-500">~{currentMilestone.estimatedWeeks} weeks</span>
                    </div>

                    <h3 className="text-2xl font-bold text-purple-600 mb-3">
                        {currentMilestone.title}
                    </h3>

                    <p className="text-gray-700 mb-6">
                        {currentMilestone.description}
                    </p>

                    <button
                        onClick={() => {
                            const message = encodeURIComponent(`I'm ready to start: ${currentMilestone.title}`);
                            router.push(`/dashboard?message=${message}`);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                        Start This Adventure
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Upcoming Milestones */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Coming Up
                </h2>

                {milestones
                    .filter(m => m.status === 'upcoming')
                    .slice(0, 5)
                    .map((milestone, index) => (
                        <div
                            key={milestone.id}
                            className="bg-white rounded-lg shadow p-5 border border-gray-200 hover:border-purple-300 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-medium text-gray-500">
                                            #{milestone.sequenceOrder}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {milestone.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        {milestone.description}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500 ml-4">
                                    {milestone.estimatedWeeks}w
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Completed Milestones */}
            {completedCount > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Completed Adventures
                    </h2>
                    <div className="text-gray-600">
                        You've mastered {completedCount} milestone{completedCount > 1 ? 's' : ''}!
                        Check your portfolio to see everything you've learned.
                    </div>
                </div>
            )}
        </div>
    );
}
