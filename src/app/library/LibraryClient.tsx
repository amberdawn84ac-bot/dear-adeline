'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Sparkles,
    Palette,
    Leaf,
    FlaskConical,
    Search,
    Filter,
    Clock,
    Star,
    CheckCircle2,
    Play,
    ChevronRight,
    Home,
    FolderOpen,
    Library,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft,
    Gamepad2,
    Heart,
    BarChart3,
    Scale,
    Globe,
    BookOpen,
    Calculator
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    instructions: string;
    materials: string[];
    skills_awarded: string[];
    credit_value: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    grade_levels: string[];
    estimated_time: string;
    image_url: string | null;
}

interface StudentProject {
    id: string;
    project_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    started_at: string | null;
    completed_at: string | null;
}

interface LibraryClientProps {
    projects: Project[];
    studentProjects: StudentProject[];
    userRole: string;
    gradeLevel: string | null;
}

const categoryConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
    'God\'s Creation & Science': {
        icon: FlaskConical,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        label: 'Creation & Science',
    },
    'Health/Naturopathy': {
        icon: Heart,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        label: 'Health & Wellness',
    },
    'Food Systems': {
        icon: Leaf,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        label: 'Food Systems',
    },
    'Government/Economics': {
        icon: BarChart3,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Gov & Economics',
    },
    'Justice': {
        icon: Scale,
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
        label: 'Justice',
    },
    'Discipleship': {
        icon: Sparkles,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        label: 'Discipleship',
    },
    'History': {
        icon: Globe,
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-50',
        label: 'History',
    },
    'English/Lit': {
        icon: BookOpen,
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50',
        label: 'English & Literature',
    },
    'Math': {
        icon: Calculator,
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50',
        label: 'Mathematics',
    },
    'game': {
        icon: Gamepad2,
        color: 'from-slate-400 to-slate-600',
        bgColor: 'bg-slate-100',
        label: 'Games',
    },
};

const difficultyConfig = {
    beginner: { label: 'Beginner', color: 'text-green-600 bg-green-100' },
    intermediate: { label: 'Intermediate', color: 'text-yellow-600 bg-yellow-100' },
    advanced: { label: 'Advanced', color: 'text-red-600 bg-red-100' },
};

export default function LibraryClient({
    projects,
    studentProjects,
    userRole,
    gradeLevel,
}: LibraryClientProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getProjectStatus = (projectId: string) => {
        return studentProjects.find(sp => sp.project_id === projectId)?.status || 'not_started';
    };

    const filteredProjects = projects.filter(project => {
        if (selectedCategory !== 'all' && project.category !== selectedCategory) return false;
        if (difficultyFilter !== 'all' && project.difficulty !== difficultyFilter) return false;
        if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !project.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleStartProject = async (projectId: string) => {
        const supabase = createClient();

        await supabase.from('student_projects').upsert({
            project_id: projectId,
            status: 'in_progress',
            started_at: new Date().toISOString(),
        }, {
            onConflict: 'student_id,project_id',
        });

        router.refresh();
    };

    const handleCompleteProject = async (projectId: string) => {
        const supabase = createClient();

        await supabase.from('student_projects').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
        }).eq('project_id', projectId);

        router.refresh();
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex bg-[var(--cream)]">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[var(--cream-dark)]">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold">Dear Adeline</span>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Home className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/portfolio" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <FolderOpen className="w-5 h-5" />
                            <span>Portfolio</span>
                        </Link>
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--sage-light)] text-[var(--sage-dark)]">
                            <Library className="w-5 h-5" />
                            <span className="font-medium">Project Library</span>
                        </Link>
                        <Link href="/tracker" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <GraduationCap className="w-5 h-5" />
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
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-[var(--sage)]" />
                        <span className="font-semibold">Project Library</span>
                    </div>
                    <div className="w-6" />
                </header>

                <div className="p-4 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Project Library</h1>
                        <p className="text-[var(--charcoal-light)]">
                            Hands-on projects that earn skills toward graduation
                        </p>
                    </div>

                    {/* Category Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {(Object.entries(categoryConfig) as [keyof typeof categoryConfig, typeof categoryConfig.art][]).map(([key, config]) => {
                            const count = projects.filter(p => p.category === key).length;
                            const completed = studentProjects.filter(sp =>
                                projects.find(p => p.id === sp.project_id && p.category === key) && sp.status === 'completed'
                            ).length;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
                                    className={`card p-6 text-left transition-all ${selectedCategory === key ? 'ring-2 ring-[var(--sage)] shadow-lg' : ''
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center mb-4`}>
                                        <config.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">{config.label}</h3>
                                    <p className="text-sm text-[var(--charcoal-light)]">
                                        {completed} / {count} completed
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-12 w-full"
                            />
                        </div>
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
                            className="input w-full sm:w-48"
                        >
                            <option value="all">All Difficulties</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    {/* Projects Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => {
                            const config = categoryConfig[project.category];
                            const status = getProjectStatus(project.id);
                            const diffConfig = difficultyConfig[project.difficulty];

                            return (
                                <div
                                    key={project.id}
                                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    {/* Project Image or Placeholder */}
                                    <div className={`h-40 rounded-t-xl -mx-8 -mt-8 mb-4 ${config.bgColor} flex items-center justify-center`}>
                                        <config.icon className="w-16 h-16 text-white/50" />
                                    </div>

                                    {/* Status Badge */}
                                    {status !== 'not_started' && (
                                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {status === 'completed' ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Completed
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Play className="w-3 h-3" /> In Progress
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                                    <p className="text-sm text-[var(--charcoal-light)] mb-4 line-clamp-2">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${diffConfig.color}`}>
                                            {diffConfig.label}
                                        </span>
                                        {project.estimated_time && (
                                            <span className="px-2 py-1 rounded-full text-xs bg-[var(--cream)] text-[var(--charcoal-light)] flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {project.estimated_time}
                                            </span>
                                        )}
                                        <span className="px-2 py-1 rounded-full text-xs bg-[var(--sage-light)] text-[var(--sage-dark)] flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            {project.credit_value} credits
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--cream-dark)]">
                                        <span className="text-sm text-[var(--charcoal-light)]">
                                            Grades: {project.grade_levels.slice(0, 3).join(', ')}
                                            {project.grade_levels.length > 3 && '...'}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-[var(--charcoal-light)]" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <Library className="w-16 h-16 text-[var(--charcoal-light)] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                            <p className="text-[var(--charcoal-light)]">
                                Try adjusting your filters or search query
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Project Detail Modal */}
            {selectedProject && (() => {
                const SelectedIcon = categoryConfig[selectedProject.category].icon;
                return (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className={`h-48 ${categoryConfig[selectedProject.category].bgColor} flex items-center justify-center relative`}>
                                <SelectedIcon className="w-24 h-24 text-white/50" />
                                <button
                                    onClick={() => setSelectedProject(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>


                            <div className="p-8">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${difficultyConfig[selectedProject.difficulty].color} mb-2`}>
                                            {difficultyConfig[selectedProject.difficulty].label}
                                        </span>
                                        <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold gradient-text">{selectedProject.credit_value}</div>
                                        <div className="text-sm text-[var(--charcoal-light)]">credits</div>
                                    </div>
                                </div>

                                <p className="text-[var(--charcoal-light)] mb-6">{selectedProject.description}</p>

                                {selectedProject.materials && selectedProject.materials.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-3">Materials Needed</h3>
                                        <ul className="space-y-2">
                                            {selectedProject.materials.map((material, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-[var(--sage)]" />
                                                    {material}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedProject.instructions && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-3">Instructions</h3>
                                        <div className="bg-[var(--cream)] p-4 rounded-xl text-sm whitespace-pre-wrap">
                                            {selectedProject.instructions}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    {getProjectStatus(selectedProject.id) === 'not_started' && (
                                        <button
                                            onClick={() => {
                                                handleStartProject(selectedProject.id);
                                                setSelectedProject(null);
                                            }}
                                            className="btn-primary flex-1"
                                        >
                                            <Play className="w-5 h-5" />
                                            Start Project
                                        </button>
                                    )}
                                    {getProjectStatus(selectedProject.id) === 'in_progress' && (
                                        <button
                                            onClick={() => {
                                                handleCompleteProject(selectedProject.id);
                                                setSelectedProject(null);
                                            }}
                                            className="btn-primary flex-1"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            Mark as Complete
                                        </button>
                                    )}
                                    {getProjectStatus(selectedProject.id) === 'completed' && (
                                        <div className="flex-1 text-center py-3 bg-green-100 text-green-700 rounded-full font-medium">
                                            ✓ Project Completed
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setSelectedProject(null)}
                                        className="btn-secondary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })()}
        </div>
    );
}
