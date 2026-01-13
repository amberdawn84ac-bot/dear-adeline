'use client';

import { useState } from 'react';
import { FolderOpen, Calendar, Sparkles, FileText, Palette, Pencil } from 'lucide-react';

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    type: 'project' | 'lesson' | 'artwork' | 'writing' | 'other';
    content: string | null;
    created_at: string;
}

interface ActivityLog {
    id: string;
    caption: string;
    translation: string;
    skills: string | null;
    created_at: string;
}

interface PublicPortfolioClientProps {
    profile: {
        id: string;
        display_name: string | null;
        avatar_url: string | null;
    };
    portfolioItems: PortfolioItem[];
    activityLogs: ActivityLog[];
}

const typeConfig = {
    project: { icon: FolderOpen, color: 'bg-blue-100 text-blue-700', label: 'Project' },
    lesson: { icon: Sparkles, color: 'bg-green-100 text-green-700', label: 'Lesson' },
    artwork: { icon: Palette, color: 'bg-pink-100 text-pink-700', label: 'Artwork' },
    writing: { icon: Pencil, color: 'bg-purple-100 text-purple-700', label: 'Writing' },
    other: { icon: FileText, color: 'bg-gray-100 text-gray-700', label: 'Other' },
};

export default function PublicPortfolioClient({
    profile,
    portfolioItems,
    activityLogs,
}: PublicPortfolioClientProps) {
    const [filterType, setFilterType] = useState<string>('all');

    const filteredItems = portfolioItems.filter(
        (item) => filterType === 'all' || item.type === filterType
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        {profile.avatar_url && (
                            <img
                                src={profile.avatar_url}
                                alt={profile.display_name || 'Student'}
                                className="w-16 h-16 rounded-full"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {profile.display_name || 'Student'}'s Portfolio
                            </h1>
                            <p className="text-gray-600">Learning Journey & Accomplishments</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'project', 'lesson', 'artwork', 'writing', 'other'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                filterType === type
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {type === 'all' ? 'All Items' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Portfolio Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredItems.map((item) => {
                            const config = typeConfig[item.type];
                            const Icon = config.icon;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {config.label}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>

                                    {item.description && (
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                            {item.description}
                                        </p>
                                    )}

                                    {item.content && (
                                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-3 line-clamp-4">
                                            {item.content}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 text-center mb-12">
                        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No items to display</h3>
                        <p className="text-gray-500">
                            {filterType === 'all'
                                ? 'This portfolio is currently empty'
                                : `No ${filterType} items found`}
                        </p>
                    </div>
                )}

                {/* Learning Activities */}
                {activityLogs.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Activities</h2>
                        <p className="text-gray-600 mb-6">
                            Real-world activities translated into academic credits
                        </p>
                        <div className="space-y-3">
                            {activityLogs.slice(0, 20).map((log) => (
                                <div
                                    key={log.id}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-purple-100"
                                >
                                    <p className="font-medium text-gray-900">{log.caption}</p>
                                    <p className="text-sm text-purple-700 mt-1">
                                        <strong>Academic Credit:</strong> {log.translation}
                                    </p>
                                    {log.skills && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            <strong>Skills:</strong> {log.skills}
                                        </p>
                                    )}
                                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(log.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>Powered by <strong>Dear Adeline</strong> - Homeschool Portfolio Platform</p>
                </div>
            </div>
        </div>
    );
}
