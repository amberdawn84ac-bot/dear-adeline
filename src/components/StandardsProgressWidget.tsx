'use client';

import React, { useState } from 'react';

interface StandardProgress {
    standard_code: string;
    subject: string;
    statement_text: string;
    mastery_level: 'introduced' | 'developing' | 'proficient' | 'mastered';
    demonstrated_at: string;
}

interface StandardsProgressWidgetProps {
    standards: StandardProgress[];
    gradeLevel: string;
}

export default function StandardsProgressWidget({ standards, gradeLevel }: StandardsProgressWidgetProps) {
    const [selectedSubject, setSelectedSubject] = useState<string>('all');

    // Group standards by subject
    const standardsBySubject = standards.reduce((acc, std) => {
        if (!acc[std.subject]) {
            acc[std.subject] = [];
        }
        acc[std.subject].push(std);
        return acc;
    }, {} as Record<string, StandardProgress[]>);

    // Calculate mastery statistics
    const masteryStats = Object.entries(standardsBySubject).map(([subject, subjectStandards]) => {
        const total = subjectStandards.length;
        const mastered = subjectStandards.filter(s => s.mastery_level === 'mastered').length;
        const proficient = subjectStandards.filter(s => s.mastery_level === 'proficient').length;
        const developing = subjectStandards.filter(s => s.mastery_level === 'developing').length;
        const introduced = subjectStandards.filter(s => s.mastery_level === 'introduced').length;

        return {
            subject,
            total,
            mastered,
            proficient,
            developing,
            introduced,
            progress: ((mastered + proficient * 0.75 + developing * 0.5 + introduced * 0.25) / total * 100).toFixed(0)
        };
    });

    // Filter standards based on selected subject
    const filteredStandards = selectedSubject === 'all'
        ? standards
        : standards.filter(s => s.subject === selectedSubject);

    // Mastery level colors and emojis
    const masteryConfig = {
        mastered: { color: 'bg-green-100 text-green-800 border-green-300', emoji: '✅', label: 'Mastered' },
        proficient: { color: 'bg-blue-100 text-blue-800 border-blue-300', emoji: '📘', label: 'Proficient' },
        developing: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', emoji: '📙', label: 'Developing' },
        introduced: { color: 'bg-purple-100 text-purple-800 border-purple-300', emoji: '📕', label: 'Introduced' }
    };

    if (standards.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-md border-2 border-purple-200 p-6">
                <h2 className="text-2xl font-bold mb-4 text-purple-900" style={{ fontFamily: 'Fredoka, cursive' }}>
                    📋 Standards Progress
                </h2>
                <p className="text-gray-600" style={{ fontFamily: 'Comic Neue, cursive' }}>
                    Keep learning! Your progress on Oklahoma state standards will appear here as you work with Adeline.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border-2 border-purple-200 p-6">
            <h2 className="text-2xl font-bold mb-4 text-purple-900" style={{ fontFamily: 'Fredoka, cursive' }}>
                📋 Standards Progress
            </h2>

            {/* Subject Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setSelectedSubject('all')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        selectedSubject === 'all'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{ fontFamily: 'Fredoka, cursive' }}
                >
                    All Subjects
                </button>
                {Object.keys(standardsBySubject).map(subject => (
                    <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            selectedSubject === subject
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={{ fontFamily: 'Fredoka, cursive' }}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            {/* Subject Progress Bars */}
            {selectedSubject === 'all' && (
                <div className="mb-6 space-y-3">
                    {masteryStats.map(stat => (
                        <div key={stat.subject}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Comic Neue, cursive' }}>
                                    {stat.subject}
                                </span>
                                <span className="text-sm font-bold text-purple-600" style={{ fontFamily: 'Fredoka, cursive' }}>
                                    {stat.progress}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${stat.progress}%` }}
                                />
                            </div>
                            <div className="flex gap-3 mt-1 text-xs" style={{ fontFamily: 'Comic Neue, cursive' }}>
                                <span className="text-green-600">✅ {stat.mastered}</span>
                                <span className="text-blue-600">📘 {stat.proficient}</span>
                                <span className="text-yellow-600">📙 {stat.developing}</span>
                                <span className="text-purple-600">📕 {stat.introduced}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Standards List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStandards
                    .sort((a, b) => {
                        // Sort by mastery level priority
                        const priority = { introduced: 0, developing: 1, proficient: 2, mastered: 3 };
                        return priority[a.mastery_level] - priority[b.mastery_level];
                    })
                    .map((std) => {
                        const config = masteryConfig[std.mastery_level];
                        return (
                            <div
                                key={std.standard_code}
                                className={`p-3 rounded-xl border-2 ${config.color} transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{config.emoji}</span>
                                            <code className="text-xs font-mono bg-white bg-opacity-50 px-2 py-1 rounded">
                                                {std.standard_code}
                                            </code>
                                            <span className="text-xs font-bold">{config.label}</span>
                                        </div>
                                        <p className="text-sm" style={{ fontFamily: 'Comic Neue, cursive' }}>
                                            {std.statement_text}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {std.subject} • Demonstrated {new Date(std.demonstrated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {filteredStandards.length === 0 && selectedSubject !== 'all' && (
                <p className="text-center text-gray-500 py-8" style={{ fontFamily: 'Comic Neue, cursive' }}>
                    No {selectedSubject} standards demonstrated yet. Keep learning!
                </p>
            )}
        </div>
    );
}
