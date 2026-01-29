'use client';

import { useState, useEffect } from 'react';
import { Search, Bookmark, BookmarkCheck, ExternalLink, Sparkles, TrendingUp, MapPin, Globe, Users, Calendar } from 'lucide-react';

import { OpportunityTracker } from '@/components/OpportunityTracker';

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
    scope: 'local' | 'national' | 'international';
    age_group: string;
    category: string;
    difficulty_level?: string;
    estimated_time?: string;
    learning_outcomes?: string[];
}

const CATEGORIES = [
    { id: 'all', name: 'All Opportunities', icon: Sparkles },
    { id: 'art', name: 'Art & Design', icon: Sparkles },
    { id: 'writing', name: 'Writing & Literature', icon: Sparkles },
    { id: 'science', name: 'Science & Math', icon: Sparkles },
    { id: 'history', name: 'History & Social Studies', icon: Sparkles },
    { id: 'entrepreneurship', name: 'Business & Entrepreneurship', icon: Sparkles },
    { id: 'technology', name: 'Technology & Engineering', icon: Sparkles },
    { id: 'service', name: 'Service & Leadership', icon: Sparkles },
    { id: 'scholarships', name: 'Scholarships & Awards', icon: Sparkles },
];

const AGE_GROUPS = [
    { id: 'all', label: 'All Ages' },
    { id: 'elementary', label: 'Elementary (K-5)' },
    { id: 'middle', label: 'Middle School (6-8)' },
    { id: 'high', label: 'High School (9-12)' },
    { id: 'college', label: 'College & Beyond' },
];

export default function OpportunitiesPage() {
    const [viewMode, setViewMode] = useState<'browse' | 'tracker'>('browse');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]); // Full saved objects
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedScope, setSelectedScope] = useState<'all' | 'local' | 'national'>('all');
    const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
    const [searchingCategory, setSearchingCategory] = useState<string | null>(null);

    // Load saved opportunities and initial data on mount
    useEffect(() => {
        loadSavedOpportunities();
        loadOpportunities();
    }, []);

    // Auto-search first category if database is empty
    useEffect(() => {
        if (!loading && opportunities.length === 0 && !searchingCategory) {
            console.log('No opportunities found, auto-searching scholarships...');
            handleSearchCategory('scholarships');
        }
    }, [loading, opportunities.length]);

    // Debounced search effect
    useEffect(() => {
        const searchOpportunities = async () => {
            if (query.trim().length < 2) return; // Don't search for 1 character

            setLoading(true);
            try {
                const res = await fetch(`/api/opportunities/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();

                if (data.opportunities && data.opportunities.length > 0) {
                    // Merge search results with existing opportunities (avoid duplicates)
                    setOpportunities(prev => {
                        const existing = new Set(prev.map(o => o.id));
                        const newOpps = data.opportunities.filter((o: Opportunity) => !existing.has(o.id));
                        return [...prev, ...newOpps];
                    });
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchOpportunities, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    const loadSavedOpportunities = async () => {
        try {
            const res = await fetch('/api/opportunities/saved');
            const data = await res.json();
            setSavedOpportunities(data.saved || []);
        } catch (error) {
            console.error('Failed to load saved opportunities:', error);
        }
    };

    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/opportunities');
            const data = await res.json();
            setOpportunities(data.data || []);
        } catch (error) {
            console.error('Failed to load opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchCategory = async (category: string) => {
        setSearchingCategory(category);
        try {
            const res = await fetch('/api/opportunities/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    ageGroup: selectedAgeGroup,
                    scope: selectedScope
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error('Search API Error:', errData);
                throw new Error(errData.error || 'Failed to fetch opportunities');
            }

            const data = await res.json();

            if (data.opportunities && data.opportunities.length > 0) {
                // Add new opportunities to the list
                setOpportunities(prev => {
                    const existing = new Set(prev.map(o => o.source_url));
                    const newOpps = data.opportunities.filter((o: Opportunity) => !existing.has(o.source_url));
                    return [...prev, ...newOpps];
                });
            } else {
                console.log('No opportunities found for this category.');
            }
        } catch (error) {
            console.error('Search failed:', error);
            // Optionally could use a toast here
            // alert('Could not generate opportunities at this time. Please try again.');
        } finally {
            setSearchingCategory(null);
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
                const data = await res.json();
                loadSavedOpportunities(); // Reload to get full object
                // Optional: switch to tracker view to show improvement
                if (confirm('Opportunity saved! Go to your Project Tracker to plan next steps?')) {
                    setViewMode('tracker');
                }
            }
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        // Optimistic update
        setSavedOpportunities(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        try {
            await fetch('/api/opportunities/saved', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
        } catch (error) {
            console.error('Failed to update status:', error);
            loadSavedOpportunities(); // Revert on error
        }
    };

    const handleUpdateChecklist = async (id: string, newChecklist: any[]) => {
        // Optimistic update
        setSavedOpportunities(prev => prev.map(s => s.id === id ? { ...s, checklist: newChecklist } : s));
        try {
            await fetch('/api/opportunities/saved', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, checklist: newChecklist })
            });
        } catch (error) {
            console.error('Failed to update checklist:', error);
            loadSavedOpportunities(); // Revert on error
        }
    };

    // Filter opportunities based on selections
    const savedIds = savedOpportunities.map(s => s.opportunity_id);
    const filteredOpportunities = opportunities.filter(opp => {
        if (selectedCategory !== 'all' && opp.category !== selectedCategory) return false;
        if (selectedScope !== 'all' && opp.scope !== selectedScope) return false;
        if (selectedAgeGroup !== 'all' && !opp.age_group?.includes(selectedAgeGroup)) return false;
        if (query && !opp.title.toLowerCase().includes(query.toLowerCase()) &&
            !opp.description.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    // Get counts by category
    const getCategoryCount = (categoryId: string) => {
        if (categoryId === 'all') return opportunities.length;
        return opportunities.filter(o => o.category === categoryId).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Opportunities & Real-World Projects
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            Discover contests, scholarships, and grants. Turn them into active learning projects.
                        </p>
                    </div>

                    {/* View Switcher */}
                    <div className="bg-white rounded-xl p-1 shadow-sm flex">
                        <button
                            onClick={() => setViewMode('browse')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${viewMode === 'browse' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            Browse
                        </button>
                        <button
                            onClick={() => setViewMode('tracker')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 relative ${viewMode === 'tracker' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            My Projects
                            {savedOpportunities.filter(s => s.status === 'in_progress').length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>
                    </div>
                </div>

                {viewMode === 'tracker' ? (
                    <OpportunityTracker
                        savedOpportunities={savedOpportunities}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateChecklist={handleUpdateChecklist}
                    />
                ) : (
                    <>
                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
                            <div className="relative group mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search opportunities..."
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            {/* Scope Filter */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="inline w-4 h-4 mr-1" />
                                    Scope
                                </label>
                                <div className="flex gap-2">
                                    {['all', 'local', 'national'].map(scope => (
                                        <button
                                            key={scope}
                                            onClick={() => setSelectedScope(scope as any)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedScope === scope
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {scope === 'all' ? 'All' : scope.charAt(0).toUpperCase() + scope.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age Group Filter */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users className="inline w-4 h-4 mr-1" />
                                    Age Group
                                </label>
                                <select
                                    value={selectedAgeGroup}
                                    onChange={(e) => setSelectedAgeGroup(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                                >
                                    {AGE_GROUPS.map(group => (
                                        <option key={group.id} value={group.id}>{group.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Results Count */}
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 shadow-sm text-white">
                                <div className="text-sm opacity-90 mb-1">Found</div>
                                <div className="text-3xl font-bold">{filteredOpportunities.length}</div>
                                <div className="text-sm opacity-90">opportunities</div>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="bg-white rounded-2xl p-4 shadow-md mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Browse by Category</h3>
                                <span className="text-sm text-gray-500">Click category to auto-search</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {CATEGORIES.map(category => {
                                    const count = getCategoryCount(category.id);
                                    const isSearching = searchingCategory === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setSelectedCategory(category.id);
                                                if (category.id !== 'all' && count === 0) {
                                                    handleSearchCategory(category.id);
                                                }
                                            }}
                                            disabled={isSearching}
                                            className={`relative p-4 rounded-xl border-2 transition-all ${selectedCategory === category.id
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                                } ${isSearching ? 'opacity-50' : ''}`}
                                        >
                                            <div className="text-sm font-medium text-gray-900 mb-1">{category.name}</div>
                                            <div className="text-xs text-gray-600">
                                                {isSearching ? (
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                                        Searching...
                                                    </span>
                                                ) : count === 0 ? (
                                                    <span className="text-purple-600">Click to search</span>
                                                ) : (
                                                    <span>{count} available</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Opportunities List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading opportunities...</p>
                                </div>
                            </div>
                        ) : filteredOpportunities.length > 0 ? (
                            <div className="space-y-4">
                                {filteredOpportunities.map((opp) => (
                                    <div key={opp.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                    {opp.featured && (
                                                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                            Featured
                                                        </span>
                                                    )}
                                                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                                                        {opp.type}
                                                    </span>
                                                    {opp.scope && (
                                                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${opp.scope === 'local' ? 'bg-blue-100 text-blue-700' :
                                                            opp.scope === 'national' ? 'bg-green-100 text-green-700' :
                                                                'bg-purple-100 text-purple-700'
                                                            }`}>
                                                            {opp.scope === 'local' ? '📍 Local' : opp.scope === 'national' ? '🇺🇸 National' : '🌍 International'}
                                                        </span>
                                                    )}
                                                    {opp.difficulty_level && (
                                                        <span className={`text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700`}>
                                                            {opp.difficulty_level}
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="text-xl font-bold text-gray-900 mb-2">
                                                    {opp.title}
                                                </h4>

                                                <p className="text-gray-600 mb-4 line-clamp-2">
                                                    {opp.description}
                                                </p>

                                                {/* Learning Outcomes / Skills */}
                                                {opp.learning_outcomes && opp.learning_outcomes.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {opp.learning_outcomes.map((outcome, idx) => (
                                                            <span key={idx} className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                                                                ✨ {outcome}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                                    {opp.organization && (
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="w-4 h-4" />
                                                            {opp.organization}
                                                        </span>
                                                    )}
                                                    {opp.deadline && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Due: {new Date(opp.deadline).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {opp.amount && (
                                                        <span className="font-semibold text-green-600">
                                                            💰 {opp.amount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleSave(opp.id)}
                                                    disabled={savedIds.includes(opp.id)}
                                                    className={`p-3 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${savedIds.includes(opp.id)
                                                        ? 'bg-green-100 text-green-600 cursor-default'
                                                        : 'bg-[var(--forest)] text-white hover:opacity-90 shadow-sm'
                                                        }`}
                                                >
                                                    {savedIds.includes(opp.id) ? (
                                                        <>
                                                            <BookmarkCheck className="w-4 h-4" />
                                                            Saved
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4" />
                                                            Start Project
                                                        </>
                                                    )}
                                                </button>
                                                {opp.source_url && (
                                                    <a
                                                        href={opp.source_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-3 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center"
                                                        title="View Details"
                                                    >
                                                        <ExternalLink className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-20 text-center shadow-md">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No opportunities found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Try selecting a category above to search for opportunities!
                                </p>
                                {selectedCategory !== 'all' && (
                                    <button
                                        onClick={() => handleSearchCategory(selectedCategory)}
                                        disabled={searchingCategory === selectedCategory}
                                        className="btn-primary"
                                    >
                                        <Sparkles className="w-5 h-5 inline mr-2" />
                                        Search {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
