'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Plus, CheckCircle, Clock, Rocket } from 'lucide-react';
import Link from 'next/link';
import DailyJournal from '@/components/DailyJournal';

interface Project {
    id: string;
    title: string;
    status: string;
    type: string;
    next_steps: string[];
}

export default function NewJournalClient() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [todayEntry, setTodayEntry] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDailyData();
        loadProjects();
    }, [currentDate]);

    const loadDailyData = async () => {
        const dateStr = currentDate.toISOString().split('T')[0];
        const response = await fetch(`/api/journal/daily?date=${dateStr}`);
        const data = await response.json();
        setTodayEntry(data.entry);
        setLoading(false);
    };

    const loadProjects = async () => {
        const response = await fetch('/api/projects/in-progress');
        const data = await response.json();
        setProjects(data.projects || []);
    };

    const handleSaveEntry = async (entryData: any) => {
        await fetch('/api/journal/daily', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
        });
        loadDailyData();
    };

    const goToPreviousDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const goToNextDay = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Don't allow going past tomorrow
        if (currentDate < tomorrow) {
            const newDate = new Date(currentDate);
            newDate.setDate(newDate.getDate() + 1);
            setCurrentDate(newDate);
        }
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = currentDate.toDateString() === new Date().toDateString();
    const isFuture = currentDate > new Date();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <p className="text-gray-600">Loading your journal...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                                <h1 className="text-2xl font-bold text-gray-900">My Learning Journal</h1>
                            </div>
                        </div>

                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPreviousDay}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>

                            {!isToday && (
                                <button
                                    onClick={goToToday}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors text-sm"
                                >
                                    Today
                                </button>
                            )}

                            <button
                                onClick={goToNextDay}
                                disabled={isFuture}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Daily Journal */}
                    <div className="lg:col-span-2">
                        <DailyJournal
                            onSave={handleSaveEntry}
                            initialData={todayEntry}
                            date={currentDate}
                        />
                    </div>

                    {/* Sidebar - Projects in Progress */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Projects in Progress</h3>
                                <Link
                                    href="/portfolio?new=project"
                                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </Link>
                            </div>

                            {projects.length === 0 ? (
                                <div className="text-center py-8">
                                    <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 mb-4">No projects yet</p>
                                    <Link
                                        href="/portfolio?new=project"
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Start a project →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {projects.map(project => (
                                        <div
                                            key={project.id}
                                            className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-gray-900 text-sm">{project.title}</h4>
                                                {project.status === 'completed' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 capitalize">{project.status}</p>
                                            {project.next_steps && project.next_steps.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs font-medium text-gray-700 mb-1">Next:</p>
                                                    <p className="text-xs text-gray-600">{project.next_steps[0]}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="text-sm font-bold uppercase tracking-wide opacity-80 mb-3">This Week</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-3xl font-bold">7</div>
                                    <div className="text-sm opacity-80">Days journaled</div>
                                </div>
                                <div className="h-px bg-white/20" />
                                <div>
                                    <div className="text-3xl font-bold">{projects.filter(p => p.status !== 'completed').length}</div>
                                    <div className="text-sm opacity-80">Active projects</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
