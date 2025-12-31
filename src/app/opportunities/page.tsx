'use client';

import { useState, useEffect } from 'react';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';

interface Opportunity {
    id: string;
    title: string;
    description: string;
    type: string;
    organization: string;
    location: string;
    deadline: string;
    amount: string;
    source_url: string;
    track_credits: Record<string, number>;
    disciplines: string[];
    tags: string[];
    featured: boolean;
}

export default function OpportunitiesPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [aiSummary, setAiSummary] = useState('');
    const [savedIds, setSavedIds] = useState<string[]>([]);

    // Load saved opportunities on mount
    useEffect(() => {
        loadSavedOpportunities();
    }, []);

    const loadSavedOpportunities = async () => {
        try {
            const res = await fetch('/api/opportunities/saved');
            const data = await res.json();
            setSavedIds(data.saved?.map((s: any) => s.opportunity_id) || []);
        } catch (error) {
            console.error('Failed to load saved opportunities:', error);
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            setOpportunities(data.opportunities || []);
            setAiSummary(data.aiSummary || '');
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (opportunityId: string) => {
        try {
            const res = await fetch('/api/opportunities/saved', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunityId })
            });
            if (res.ok) {
                setSavedIds([...savedIds, opportunityId]);
            }
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const getTrackColor = (track: string) => {
        const colors: Record<string, string> = {
            creation_science: 'bg-purple-100 text-purple-700',
            economics: 'bg-green-100 text-green-700',
            english: 'bg-blue-100 text-blue-700',
            history: 'bg-amber-100 text-amber-700',
            justice: 'bg-rose-100 text-rose-700',
            food_systems: 'bg-lime-100 text-lime-700',
            health: 'bg-pink-100 text-pink-700',
            discipleship: 'bg-indigo-100 text-indigo-700',
            government: 'bg-slate-100 text-slate-700'
        };
        return colors[track] || 'bg-gray-100 text-gray-700';
    };

    const formatTrackName = (track: string) => {
        return track.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            <div className="max-w-6xl mx-auto p-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-4">
                        Projects & Opportunities
                    </h1>
                    <p className="text-xl text-[var(--charcoal-light)] max-w-2xl">
                        Discover real-world opportunities to earn credits, build your portfolio, and prepare for your future.
                    </p>
                </div>

                {/* Search */}
                <div className="card p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-2">
                                What are you looking for?
                            </h2>
                            <p className="text-[var(--charcoal-light)]">
                                Search for grants, contests, scholarships, and more
                            </p>
                        </div>
                        <div className="bg-[var(--rose-light)] text-[var(--rose)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[var(--rose)]">
                            AI Powered
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative group mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for art grants, writing contests, science fairs..."
                            className="input pl-12 pr-32 text-lg"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-3 btn-primary px-6 py-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Searching...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Search
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="flex gap-2">
                        {['Art Grants', 'Writing Contests', 'Science Fairs', 'Entrepreneurship'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => { setQuery(tag); setTimeout(() => handleSearch(), 10); }}
                                className="text-xs font-medium px-3 py-1.5 bg-[var(--cream)] text-[var(--charcoal-light)] rounded-full hover:bg-[var(--cream-dark)] transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Summary */}
                {aiSummary && (
                    <div className="card p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-5 h-5 text-[var(--rose)]" />
                            <h3 className="text-lg font-bold">Adeline's Findings</h3>
                        </div>
                        <p className="text-[var(--charcoal-light)] whitespace-pre-wrap leading-relaxed">
                            {aiSummary}
                        </p>
                    </div>
                )}

                {/* Opportunities Grid */}
                {opportunities.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[var(--sage)]" />
                                {opportunities.length} Opportunities Found
                            </h3>
                        </div>

                        {opportunities.map((opp) => (
                            <div key={opp.id} className="card p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {opp.featured && (
                                                <span className="bg-[var(--rose)] text-white text-xs font-bold px-2 py-1 rounded uppercase">
                                                    Featured
                                                </span>
                                            )}
                                            <span className="bg-[var(--cream)] text-[var(--charcoal-light)] text-xs font-medium px-2 py-1 rounded">
                                                {opp.type}
                                            </span>
                                        </div>

                                        <h4 className="text-xl font-bold text-[var(--charcoal)] mb-2">
                                            {opp.title}
                                        </h4>

                                        <p className="text-[var(--charcoal-light)] mb-4 line-clamp-2">
                                            {opp.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {Object.entries(opp.track_credits).map(([track, hours]) => (
                                                <span
                                                    key={track}
                                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getTrackColor(track)}`}
                                                >
                                                    {formatTrackName(track)}: {hours}h
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-[var(--charcoal-light)]">
                                            {opp.organization && (
                                                <span>📍 {opp.organization}</span>
                                            )}
                                            {opp.deadline && (
                                                <span>📅 Due: {new Date(opp.deadline).toLocaleDateString()}</span>
                                            )}
                                            {opp.amount && (
                                                <span>💰 {opp.amount}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleSave(opp.id)}
                                            disabled={savedIds.includes(opp.id)}
                                            className={`p-3 rounded-lg transition-colors ${savedIds.includes(opp.id)
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-[var(--cream)] text-[var(--charcoal-light)] hover:bg-[var(--cream-dark)]'
                                                }`}
                                            title={savedIds.includes(opp.id) ? 'Saved' : 'Save'}
                                        >
                                            {savedIds.includes(opp.id) ? (
                                                <BookmarkCheck className="w-5 h-5" />
                                            ) : (
                                                <Bookmark className="w-5 h-5" />
                                            )}
                                        </button>
                                        {opp.source_url && (
                                            <a
                                                href={opp.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-[var(--cream)] text-[var(--charcoal-light)] hover:bg-[var(--cream-dark)] rounded-lg transition-colors"
                                                title="View Source"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && opportunities.length === 0 && !aiSummary && (
                    <div className="card p-20 text-center">
                        <div className="w-16 h-16 bg-[var(--cream)] rounded-full flex items-center justify-center text-[var(--charcoal-light)] mx-auto mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <p className="text-[var(--charcoal-light)] font-medium">
                            Search for opportunities to get started!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
