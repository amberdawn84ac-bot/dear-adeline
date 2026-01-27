'use client';

import React, { useState, useEffect } from 'react';
import { Folder, MessageSquare, Users, Loader2 } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'project_created' | 'project_updated' | 'discussion_created' | 'reply_added' | 'member_joined';
    actor_name: string;
    target_name: string;
    created_at: string;
}

interface PodActivityProps {
    podId: string;
}

export function PodActivity({ podId }: PodActivityProps) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivity();
    }, [podId]);

    const loadActivity = async () => {
        try {
            const res = await fetch(`/api/pods/${podId}/activity`);
            const data = await res.json();
            setActivities(data.activities || []);
        } catch (error) {
            console.error('Error loading activity:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'project_created':
            case 'project_updated':
                return Folder;
            case 'discussion_created':
            case 'reply_added':
                return MessageSquare;
            case 'member_joined':
                return Users;
            default:
                return Folder;
        }
    };

    const getMessage = (activity: ActivityItem) => {
        switch (activity.type) {
            case 'project_created':
                return `${activity.actor_name} created project "${activity.target_name}"`;
            case 'project_updated':
                return `${activity.actor_name} updated project "${activity.target_name}"`;
            case 'discussion_created':
                return `${activity.actor_name} started discussion "${activity.target_name}"`;
            case 'reply_added':
                return `${activity.actor_name} replied to "${activity.target_name}"`;
            case 'member_joined':
                return `${activity.actor_name} joined the pod`;
            default:
                return `${activity.actor_name} did something`;
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
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>

            {activities.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <p>No activity yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => {
                        const Icon = getIcon(activity.type);
                        return (
                            <div
                                key={activity.id}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100"
                            >
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700">{getMessage(activity)}</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(activity.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
