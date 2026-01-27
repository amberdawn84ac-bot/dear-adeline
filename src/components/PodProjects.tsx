'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, Loader2 } from 'lucide-react';

interface SharedProject {
    id: string;
    title: string;
    description: string | null;
    updated_at: string;
    collaborators: Array<{
        student_id: string;
        role: string;
        profile?: { display_name: string };
    }>;
}

interface PodProjectsProps {
    podId: string;
    userId: string;
}

export function PodProjects({ podId, userId }: PodProjectsProps) {
    const [projects, setProjects] = useState<SharedProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadProjects();
    }, [podId]);

    const loadProjects = async () => {
        try {
            const res = await fetch(`/api/pods/${podId}/projects`);
            const data = await res.json();
            setProjects(data.projects || []);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;

        setCreating(true);
        try {
            const res = await fetch(`/api/pods/${podId}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDescription }),
            });

            if (res.ok) {
                setNewTitle('');
                setNewDescription('');
                setShowNewForm(false);
                loadProjects();
            }
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* New Project Button/Form */}
            {!showNewForm ? (
                <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Shared Project
                </button>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Project Title"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Description (optional)"
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newTitle.trim()}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            onClick={() => setShowNewForm(false)}
                            className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all cursor-pointer group"
                    >
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{project.title}</h3>
                        {project.description && (
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{project.collaborators.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {projects.length === 0 && !showNewForm && (
                <div className="text-center py-12 text-slate-500">
                    <p>No projects yet. Create one to get started!</p>
                </div>
            )}
        </div>
    );
}
