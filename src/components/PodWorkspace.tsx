'use client';

import React, { useState } from 'react';
import { Folder, MessageSquare, Activity, ArrowLeft } from 'lucide-react';
import { PodProjects } from './PodProjects';
import { PodDiscussions } from './PodDiscussions';
import { PodActivity } from './PodActivity';

interface PodWorkspaceProps {
    podId: string;
    podName: string;
    userId: string;
    onBack: () => void;
}

type Tab = 'projects' | 'discussions' | 'activity';

export function PodWorkspace({ podId, podName, userId, onBack }: PodWorkspaceProps) {
    const [activeTab, setActiveTab] = useState<Tab>('projects');

    const tabs = [
        { id: 'projects' as Tab, label: 'Projects', icon: Folder },
        { id: 'discussions' as Tab, label: 'Discussions', icon: MessageSquare },
        { id: 'activity' as Tab, label: 'Activity', icon: Activity },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold serif text-slate-800">{podName}</h2>
                    <p className="text-sm text-slate-500">Collaboration Workspace</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'projects' && (
                    <PodProjects podId={podId} userId={userId} />
                )}
                {activeTab === 'discussions' && (
                    <PodDiscussions podId={podId} userId={userId} />
                )}
                {activeTab === 'activity' && (
                    <PodActivity podId={podId} />
                )}
            </div>
        </div>
    );
}
