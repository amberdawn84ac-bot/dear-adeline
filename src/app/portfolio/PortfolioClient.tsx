'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    FolderOpen,
    Plus,
    Image as ImageIcon,
    FileText,
    Palette,
    Pencil,
    ExternalLink,
    Calendar,
    Tag,
    Home,
    Library,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    Save,
    Loader2,
    Trash2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PortfolioItem {
    id: string;
    title: string;
    description: string | null;
    type: 'project' | 'lesson' | 'artwork' | 'writing' | 'other';
    content: string | null;
    media_urls: string[] | null;
    skills_demonstrated: string[] | null;
    is_public: boolean;
    created_at: string;
}

interface Skill {
    id: string;
    name: string;
    category: string;
}

interface ActivityLog {
    id: string;
    caption: string;
    translation: string;
    skills: string | null;
    grade: string | null;
    created_at: string;
}

interface PortfolioClientProps {
    profile: { display_name: string | null } | null;
    portfolioItems: PortfolioItem[];
    allSkills: Skill[];
    activityLogs: ActivityLog[];
}

const typeConfig = {
    project: { icon: FolderOpen, color: 'bg-blue-100 text-blue-700', label: 'Project' },
    lesson: { icon: Sparkles, color: 'bg-green-100 text-green-700', label: 'Lesson' },
    artwork: { icon: Palette, color: 'bg-pink-100 text-pink-700', label: 'Artwork' },
    writing: { icon: Pencil, color: 'bg-purple-100 text-purple-700', label: 'Writing' },
    other: { icon: FileText, color: 'bg-gray-100 text-gray-700', label: 'Other' },
};

export default function PortfolioClient({
    profile,
    portfolioItems,
    allSkills,
    activityLogs,
}: PortfolioClientProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [saving, setSaving] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        type: 'project' as PortfolioItem['type'],
        content: '',
        is_public: false,
        skills_demonstrated: [] as string[], // Add skills_demonstrated
    });
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleAddItem = async () => {
        if (!newItem.title.trim()) return;

        setSaving(true);
        const supabase = createClient();

        try {
            await supabase.from('portfolio_items').insert({
                ...newItem,
                skills_demonstrated: selectedSkills, // Include selected skills
                student_id: (await supabase.auth.getUser()).data.user?.id,
            });

            setShowAddModal(false);
            setNewItem({
                title: '',
                description: '',
                type: 'project',
                content: '',
                is_public: false,
                skills_demonstrated: [],
            });
            setSelectedSkills([]); // Clear selected skills
            router.refresh();
        } catch (error) {
            console.error('Error adding item:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this portfolio item?')) return;

        const supabase = createClient();
        await supabase.from('portfolio_items').delete().eq('id', itemId);
        setSelectedItem(null);
        router.refresh();
    };

    const filteredItems = portfolioItems.filter(item =>
        filterType === 'all' || item.type === filterType
    );

    return (
        <div className="min-h-screen flex bg-[var(--cream)]">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full bg-[var(--cream-dark)]/30">
                    <div className="p-6 border-b border-[var(--forest)]/10 bg-[var(--forest)] text-[var(--cream)]">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--ochre)] flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight serif">Dear Adeline</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <Home className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/portfolio" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--forest)]/10 text-[var(--forest)] font-bold">
                            <FolderOpen className="w-5 h-5" />
                            <span>Portfolio</span>
                        </Link>
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <Library className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>Project Library</span>
                        </Link>
                        <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--forest)]/5 transition-colors font-medium">
                            <GraduationCap className="w-5 h-5 text-[var(--forest)]/60" />
                            <span>Graduation Tracker</span>
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-[var(--cream-dark)] space-y-1">
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                <header className="lg:hidden sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-semibold">My Portfolio</span>
                    <div className="w-6" />
                </header>

                <div className="p-4 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-normal serif text-[var(--forest)] mb-2">My Portfolio</h1>
                            <p className="text-[var(--charcoal-light)] font-medium">
                                A showcase of your learning journey and accomplishments
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary"
                        >
                            <Plus className="w-5 h-5" />
                            Add Item
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {['all', 'project', 'lesson', 'artwork', 'writing', 'other'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterType === type
                                    ? 'bg-[var(--sage)] text-white'
                                    : 'bg-white text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                    }`}
                            >
                                {type === 'all' ? 'All Items' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Portfolio Grid */}
                    {filteredItems.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => {
                                const config = typeConfig[item.type];
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={item.id}
                                        className="card hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        {/* Placeholder Image */}
                                        <div className="h-40 bg-gradient-to-br from-[var(--cream)] to-[var(--cream-dark)] rounded-lg -mx-2 -mt-2 mb-4 flex items-center justify-center">
                                            <Icon className="w-12 h-12 text-[var(--charcoal-light)]/30" />
                                        </div>

                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.color}`}>
                                                <Icon className="w-3 h-3" />
                                                {config.label}
                                            </span>
                                            {item.is_public && (
                                                <ExternalLink className="w-4 h-4 text-[var(--charcoal-light)]" />
                                            )}
                                        </div>

                                        <h3 className="font-semibold mb-2">{item.title}</h3>
                                        {item.description && (
                                            <p className="text-sm text-[var(--charcoal-light)] line-clamp-2 mb-3">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 text-xs text-[var(--charcoal-light)]">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <FolderOpen className="w-16 h-16 text-[var(--charcoal-light)] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Your portfolio is empty</h3>
                            <p className="text-[var(--charcoal-light)] mb-6">
                                Start adding items to showcase your learning journey
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-primary"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Item
                            </button>
                        </div>
                    )}

                    {/* Activity Log Section */}
                    {activityLogs.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-normal serif text-[var(--forest)] mb-4">
                                Learning Activities
                            </h2>
                            <p className="text-[var(--charcoal-light)] mb-6">
                                Here's what Adeline has been tracking from your conversations
                            </p>
                            <div className="space-y-3">
                                {activityLogs.slice(0, 20).map((log) => (
                                    <div
                                        key={log.id}
                                        className="card bg-gradient-to-r from-[var(--sage-light)]/30 to-[var(--cream)] border border-[var(--sage)]/20"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium text-[var(--charcoal)]">
                                                    {log.caption}
                                                </p>
                                                <p className="text-sm text-[var(--sage-dark)] mt-1">
                                                    <strong>Academic Credit:</strong> {log.translation}
                                                </p>
                                                {log.skills && (
                                                    <p className="text-xs text-[var(--charcoal-light)] mt-2">
                                                        <strong>Skills:</strong> {log.skills}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-xs text-[var(--charcoal-light)] flex items-center gap-1 whitespace-nowrap">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(log.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Add Portfolio Item</h2>
                            <button onClick={() => setShowAddModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem(p => ({ ...p, title: e.target.value }))}
                                    className="input w-full"
                                    placeholder="What did you create or learn?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(typeConfig).map(([type, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setNewItem(p => ({ ...p, type: type as PortfolioItem['type'] }))}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${newItem.type === type
                                                    ? 'border-[var(--sage)] bg-[var(--sage-light)]'
                                                    : 'border-[var(--cream-dark)] hover:border-[var(--sage-light)]'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-xs">{config.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={(e) => setNewItem(p => ({ ...p, description: e.target.value }))}
                                    className="input w-full h-24 resize-none"
                                    placeholder="Tell us about this piece..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Content / Reflection</label>
                                <textarea
                                    value={newItem.content}
                                    onChange={(e) => setNewItem(p => ({ ...p, content: e.target.value }))}
                                    className="input w-full h-32 resize-none"
                                    placeholder="Write your content or reflection here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Skills Demonstrated</label>
                                <select
                                    multiple
                                    value={selectedSkills}
                                    onChange={(e) => {
                                        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                        setSelectedSkills(options);
                                    }}
                                    className="input w-full h-32"
                                >
                                    {allSkills.map((skill) => (
                                        <option key={skill.id} value={skill.id}>
                                            {skill.name} ({skill.category})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple skills.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_public"
                                    checked={newItem.is_public}
                                    onChange={(e) => setNewItem(p => ({ ...p, is_public: e.target.checked }))}
                                    className="w-4 h-4 rounded border-[var(--cream-dark)]"
                                />
                                <label htmlFor="is_public" className="text-sm">
                                    Make this item public (shareable link)
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save Item
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Item Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${typeConfig[selectedItem.type].color} mb-2`}>
                                    {typeConfig[selectedItem.type].label}
                                </span>
                                <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                                <p className="text-sm text-[var(--charcoal-light)] flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(selectedItem.created_at).toLocaleDateString()}
                                    {selectedItem.is_public && (
                                        <span className="flex items-center gap-1 text-[var(--sage-dark)]">
                                            <ExternalLink className="w-4 h-4" />
                                            Public
                                        </span>
                                    )}
                                </p>
                            </div>
                            <button onClick={() => setSelectedItem(null)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {selectedItem.description && (
                            <p className="text-[var(--charcoal-light)] mb-6">{selectedItem.description}</p>
                        )}

                        {selectedItem.content && (
                            <div className="bg-[var(--cream)] p-6 rounded-xl mb-6 whitespace-pre-wrap">
                                {selectedItem.content}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDeleteItem(selectedItem.id)}
                                className="btn-secondary text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="btn-primary flex-1"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
