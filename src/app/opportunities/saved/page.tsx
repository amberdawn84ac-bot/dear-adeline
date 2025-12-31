'use client';

import { useState, useEffect } from 'react';
import { BookmarkCheck, ExternalLink, Trash2, Filter } from 'lucide-react';

type OpportunityStatus = 'saved' | 'applied' | 'shortlisted' | 'rejected' | 'awarded';

interface SavedOpportunity {
    id: string;
    opportunity_id: string;
    status: OpportunityStatus;
    saved_at: string;
    notes: string;
    opportunity: {
        title: string;
        description: string;
        type: string;
        organization: string;
        source_url: string;
        track_credits: Record<string, number>;
    };
}

export default function SavedOpportunitiesPage() {
    const [saved, setSaved] = useState<SavedOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OpportunityStatus | 'all'>('all');

    useEffect(() => {
        loadSaved();
    }, []);

    const loadSaved = async () => {
        try {
            const res = await fetch('/api/opportunities/saved');
            const data = await res.json();
            setSaved(data.saved || []);
        } catch (error) {
            console.error('Failed to load saved opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: OpportunityStatus) => {
        try {
            const res = await fetch('/api/opportunities/saved', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                setSaved(saved.map(s => s.id === id ? { ...s, status } : s));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const removeSaved = async (id: string) => {
        if (!confirm('Remove this opportunity from your saved list?')) return;

        try {
            const res = await fetch(`/api/opportunities/saved?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSaved(saved.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Failed to remove:', error);
        }
    };

    const statusColors: Record<OpportunityStatus, string> = {
        saved: 'bg-slate-100 text-slate-600',
        applied: 'bg-blue-100 text-blue-600',
        shortlisted: 'bg-purple-100 text-purple-600',
        rejected: 'bg-red-100 text-red-600',
        awarded: 'bg-green-100 text-green-600'
    };

    const statuses: OpportunityStatus[] = ['saved', 'applied', 'shortlisted', 'rejected', 'awarded'];

    const filteredSaved = filter === 'all'
        ? saved
        : saved.filter(s => s.status === filter);

    const getTrackColor = (track: string) => {
        const colors: Record<string, string> = {
            creation_science: 'bg-purple-100 text-purple-700',
            economics: 'bg-green-100 text-green-700',
            english: 'bg-blue-100 text-blue-700',
            history: 'bg-amber-100 text-amber-700',
            justice: 'bg-rose-100 text-rose-700'
        };
        return colors[track] || 'bg-gray-100 text-gray-700';
    };

    const formatTrackName = (track: string) => {
        return track.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[var(--sage)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--charcoal-light)]">Loading saved opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            <div className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">
                            Saved Opportunities
                        </h1>
                        <p className="text-[var(--charcoal-light)]">
                            Track your progress and manage your applications
                        </p>
                    </div>
                    <div className="card px-4 py-2 text-sm font-semibold text-[var(--charcoal)]">
                        {saved.length} Opportunities Tracking
                    </div>
                </div>

                {/* Filter */}
                <div className="card p-4 mb-6 flex items-center gap-4">
                    <Filter className="w-5 h-5 text-[var(--charcoal-light)]" />
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-[var(--charcoal)] text-white'
                                    : 'bg-[var(--cream)] text-[var(--charcoal-light)] hover:bg-[var(--cream-dark)]'
                                }`}
                        >
                            All ({saved.length})
                        </button>
                        {statuses.map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === status
                                        ? 'bg-[var(--charcoal)] text-white'
                                        : 'bg-[var(--cream)] text-[var(--charcoal-light)] hover:bg-[var(--cream-dark)]'
                                    }`}
                            >
                                {status} ({saved.filter(s => s.status === status).length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Opportunities List */}
                {filteredSaved.length === 0 ? (
                    <div className="card p-20 text-center">
                        <div className="w-16 h-16 bg-[var(--cream)] rounded-full flex items-center justify-center text-[var(--charcoal-light)] mx-auto mb-4">
                            <BookmarkCheck className="w-8 h-8" />
                        </div>
                        <p className="text-[var(--charcoal-light)] font-medium">
                            {filter === 'all'
                                ? 'No saved opportunities yet. Start exploring to find your next mission!'
                                : `No ${filter} opportunities`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSaved.map((item) => (
                            <div key={item.id} className="card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${statusColors[item.status]}`}>
                                                {item.status}
                                            </span>
                                            <h3 className="text-lg font-bold text-[var(--charcoal)]">
                                                {item.opportunity.title}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-[var(--charcoal-light)] mb-4 line-clamp-2">
                                            {item.opportunity.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {Object.entries(item.opportunity.track_credits).map(([track, hours]) => (
                                                <span
                                                    key={track}
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full ${getTrackColor(track)}`}
                                                >
                                                    {formatTrackName(track)}: {hours}h
                                                </span>
                                            ))}
                                        </div>

                                        <div className="text-xs text-[var(--charcoal-light)]">
                                            Saved {new Date(item.saved_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <div className="flex flex-wrap gap-1">
                                            {statuses.map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(item.id, status)}
                                                    className={`px-2 py-1 rounded text-xs font-bold transition-all capitalize ${item.status === status
                                                            ? 'bg-[var(--charcoal)] text-white'
                                                            : 'bg-[var(--cream)] text-[var(--charcoal-light)] hover:bg-[var(--cream-dark)]'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-[var(--cream)]">
                                            <a
                                                href={item.opportunity.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs font-bold text-[var(--sage-dark)] hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View Source
                                            </a>
                                            <button
                                                onClick={() => removeSaved(item.id)}
                                                className="text-xs font-bold text-[var(--rose)] hover:text-[var(--rose-dark)] flex items-center gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
