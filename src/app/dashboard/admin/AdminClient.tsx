'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Users,
    BookOpen,
    Library,
    GraduationCap,
    Settings,
    LogOut,
    Menu,
    Plus,
    Edit2,
    Trash2,
    Search,
    Brain,
    Send,
    Loader2,
    UserPlus,
    Palette,
    Leaf,
    FlaskConical,
    Shield,
    User as UserIcon,
    School,
    BarChart3,
    X,
    Save,
    AlertCircle,
    Scale,
    Globe,
    Calculator,
    Heart
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface User {
    id: string;
    email: string;
    display_name: string | null;
    role: 'student' | 'teacher' | 'admin';
    grade_level: string | null;
    created_at: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    credit_value: number;
}

interface Skill {
    id: string;
    name: string;
    category: string;
    credit_value: number;
}

interface Requirement {
    id: string;
    name: string;
    category: string;
    required_credits: number;
}

interface AdminClientProps {
    profile: { display_name: string | null } | null;
    users: User[];
    projects: Project[];
    skills: Skill[];
    requirements: Requirement[];
    stats: {
        students: number;
        teachers: number;
        projects: number;
        skills: number;
    };
}

type ActiveTab = 'overview' | 'users' | 'library' | 'skills' | 'ai-editor';

export default function AdminClient({
    profile,
    users,
    projects,
    skills,
    requirements,
    stats,
}: AdminClientProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
        {
            role: 'assistant',
            content: "Hi! I'm your admin assistant. I can help you manage the platform. Try saying things like:\n\n• \"Add a new art project about watercolor painting\"\n• \"Create a skill called Creative Problem Solving\"\n• \"Change user john@email.com to a teacher role\"\n• \"Show me all students\"\n\nWhat would you like to do?",
        },
    ]);

    // Modal states
    const [showAddProject, setShowAddProject] = useState(false);
    const [showEditUser, setShowEditUser] = useState<User | null>(null);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        category: "God's Creation & Science",
        difficulty: 'beginner',
        instructions: '',
        materials: '',
        credit_value: 0.25,
    });

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleAiSubmit = async () => {
        if (!aiInput.trim() || aiLoading) return;

        const userMessage = aiInput.trim();
        setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setAiInput('');
        setAiLoading(true);

        try {
            const response = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await response.json();
            setAiMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

            if (data.action) {
                router.refresh();
            }
        } catch (error) {
            setAiMessages(prev => [...prev, {
                role: 'assistant',
                content: "I encountered an error. Please try again or make changes manually."
            }]);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddProject = async () => {
        const supabase = createClient();

        await supabase.from('library_projects').insert({
            ...newProject,
            materials: newProject.materials.split(',').map(m => m.trim()).filter(Boolean),
        });

        setShowAddProject(false);
        setNewProject({
            title: '',
            description: '',
            category: "God's Creation & Science",
            difficulty: 'beginner',
            instructions: '',
            materials: '',
            credit_value: 0.25,
        });
        router.refresh();
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        const supabase = createClient();
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        setShowEditUser(null);
        router.refresh();
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        const supabase = createClient();
        await supabase.from('library_projects').delete().eq('id', projectId);
        router.refresh();
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categoryIcon = (cat: string) => {
        switch (cat) {
            case "God's Creation & Science": return <FlaskConical className="w-4 h-4" />;
            case "Health/Naturopathy": return <Heart className="w-4 h-4" />;
            case "Food Systems": return <Leaf className="w-4 h-4" />;
            case "Government/Economics": return <BarChart3 className="w-4 h-4" />;
            case "Justice": return <Scale className="w-4 h-4" />;
            case "Discipleship": return <Sparkles className="w-4 h-4" />;
            case "History": return <Globe className="w-4 h-4" />;
            case "English/Lit": return <BookOpen className="w-4 h-4" />;
            case "Math": return <Calculator className="w-4 h-4" />;
            case 'art': return <Palette className="w-4 h-4" />;
            case 'farm': return <Leaf className="w-4 h-4" />;
            case 'science': return <FlaskConical className="w-4 h-4" />;
            default: return null;
        }
    };

    const roleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-purple-500" />;
            case 'teacher': return <School className="w-4 h-4 text-blue-500" />;
            default: return <UserIcon className="w-4 h-4 text-green-500" />;
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--cream)]">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[var(--cream-dark)]">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-semibold block">Admin Panel</span>
                                <span className="text-xs text-[var(--charcoal-light)]">Dear Adeline</span>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-purple-100 text-purple-700' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span>Overview</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-purple-100 text-purple-700' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Users</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'library' ? 'bg-purple-100 text-purple-700' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            <Library className="w-5 h-5" />
                            <span>Project Library</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'skills' ? 'bg-purple-100 text-purple-700' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            <GraduationCap className="w-5 h-5" />
                            <span>Skills & Credits</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('ai-editor')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'ai-editor' ? 'bg-purple-100 text-purple-700' : 'text-[var(--charcoal-light)] hover:bg-[var(--cream)]'
                                }`}
                        >
                            <Brain className="w-5 h-5" />
                            <span>AI Assistant</span>
                        </button>
                    </nav>

                    <div className="p-4 border-t border-[var(--cream-dark)] space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Sparkles className="w-5 h-5" />
                            <span>Student View</span>
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
                    <span className="font-semibold">Admin Panel</span>
                    <div className="w-6" />
                </header>

                <div className="p-4 lg:p-8">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.display_name || 'Admin'}!</h1>
                            <p className="text-[var(--charcoal-light)] mb-8">Here's what's happening with Dear Adeline</p>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.students}</p>
                                            <p className="text-sm text-[var(--charcoal-light)]">Students</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <School className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.teachers}</p>
                                            <p className="text-sm text-[var(--charcoal-light)]">Teachers</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <Library className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.projects}</p>
                                            <p className="text-sm text-[var(--charcoal-light)]">Projects</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                            <GraduationCap className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{stats.skills}</p>
                                            <p className="text-sm text-[var(--charcoal-light)]">Skills</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <button
                                    onClick={() => { setActiveTab('library'); setShowAddProject(true); }}
                                    className="card flex items-center gap-4 hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--sage-light)] flex items-center justify-center">
                                        <Plus className="w-6 h-6 text-[var(--sage-dark)]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Add Project</p>
                                        <p className="text-sm text-[var(--charcoal-light)]">Create a new library project</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('ai-editor')}
                                    className="card flex items-center gap-4 hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Brain className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">AI Assistant</p>
                                        <p className="text-sm text-[var(--charcoal-light)]">Make changes with AI help</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className="card flex items-center gap-4 hover:shadow-lg transition-shadow text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <UserPlus className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Manage Users</p>
                                        <p className="text-sm text-[var(--charcoal-light)]">View and edit user roles</p>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Users</h1>
                                    <p className="text-[var(--charcoal-light)]">Manage students, teachers, and admins</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input pl-12 w-full max-w-md"
                                    />
                                </div>
                            </div>

                            <div className="card overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[var(--cream)]">
                                            <tr>
                                                <th className="text-left p-4 font-medium">User</th>
                                                <th className="text-left p-4 font-medium">Role</th>
                                                <th className="text-left p-4 font-medium">Grade</th>
                                                <th className="text-left p-4 font-medium">Joined</th>
                                                <th className="text-left p-4 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--cream-dark)]">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-[var(--cream)]/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center text-white font-medium">
                                                                {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{user.display_name || 'No name'}</p>
                                                                <p className="text-sm text-[var(--charcoal-light)]">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                            user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {roleIcon(user.role)}
                                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[var(--charcoal-light)]">
                                                        {user.grade_level || '-'}
                                                    </td>
                                                    <td className="p-4 text-[var(--charcoal-light)]">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => setShowEditUser(user)}
                                                            className="p-2 hover:bg-[var(--cream)] rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Library Tab */}
                    {activeTab === 'library' && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Project Library</h1>
                                    <p className="text-[var(--charcoal-light)]">Manage art, farm, and science projects</p>
                                </div>
                                <button
                                    onClick={() => setShowAddProject(true)}
                                    className="btn-primary"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Project
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                                    <input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input pl-12 w-full max-w-md"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="card">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${project.category === 'English/Lit' ? 'bg-pink-100 text-pink-700' :
                                                project.category === "God's Creation & Science" ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {categoryIcon(project.category)}
                                                {project.category}
                                            </span>
                                            <div className="flex gap-1">
                                                <button className="p-2 hover:bg-[var(--cream)] rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProject(project.id)}
                                                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold mb-2">{project.title}</h3>
                                        <p className="text-sm text-[var(--charcoal-light)] line-clamp-2 mb-3">
                                            {project.description}
                                        </p>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--charcoal-light)]">{project.difficulty}</span>
                                            <span className="text-[var(--sage-dark)]">{project.credit_value} credits</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Skills Tab */}
                    {activeTab === 'skills' && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Skills & Credits</h1>
                                    <p className="text-[var(--charcoal-light)]">Manage skills and graduation requirements</p>
                                </div>
                                <button className="btn-primary">
                                    <Plus className="w-5 h-5" />
                                    Add Skill
                                </button>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Skills List */}
                                <div className="card">
                                    <h2 className="font-semibold mb-4">Skills ({skills.length})</h2>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {skills.map((skill) => (
                                            <div
                                                key={skill.id}
                                                className="flex items-center justify-between p-3 bg-[var(--cream)] rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{skill.name}</p>
                                                    <p className="text-xs text-[var(--charcoal-light)]">{skill.category}</p>
                                                </div>
                                                <span className="text-sm text-[var(--sage-dark)]">{skill.credit_value} cr</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className="card">
                                    <h2 className="font-semibold mb-4">Graduation Requirements</h2>
                                    <div className="space-y-4">
                                        {requirements.map((req) => (
                                            <div
                                                key={req.id}
                                                className="flex items-center justify-between p-3 bg-[var(--cream)] rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{req.name}</p>
                                                    <p className="text-xs text-[var(--charcoal-light)]">{req.category}</p>
                                                </div>
                                                <span className="text-sm font-medium">{req.required_credits} credits</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* AI Editor Tab */}
                    {activeTab === 'ai-editor' && (
                        <>
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
                                <p className="text-[var(--charcoal-light)]">Make changes to the platform using natural language</p>
                            </div>

                            <div className="card max-w-3xl">
                                <div className="flex items-center gap-3 p-4 border-b border-[var(--cream-dark)]">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Admin AI</p>
                                        <p className="text-sm text-[var(--charcoal-light)]">Your platform assistant</p>
                                    </div>
                                </div>

                                <div className="h-96 overflow-y-auto p-4 space-y-4">
                                    {aiMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'} max-w-[85%]`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {aiLoading && (
                                        <div className="flex justify-start">
                                            <div className="chat-bubble ai">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-[var(--cream-dark)]">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleAiSubmit(); }}
                                        className="flex gap-3"
                                    >
                                        <input
                                            type="text"
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            placeholder="Tell me what you'd like to change..."
                                            className="input flex-1"
                                            disabled={aiLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!aiInput.trim() || aiLoading}
                                            className="btn-primary px-4 disabled:opacity-50"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="mt-6 text-sm text-[var(--charcoal-light)]">
                                <p className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Changes made through AI are immediate and affect the live platform.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Add Project Modal */}
            {showAddProject && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Add New Project</h2>
                            <button onClick={() => setShowAddProject(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleAddProject(); }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={newProject.category}
                                    onChange={(e) => setNewProject(p => ({ ...p, category: e.target.value }))}
                                    className="input w-full"
                                >
                                    <option value="God's Creation & Science">God's Creation & Science</option>
                                    <option value="Health/Naturopathy">Health/Naturopathy</option>
                                    <option value="Food Systems">Food Systems</option>
                                    <option value="Government/Economics">Government/Economics</option>
                                    <option value="Justice">Justice</option>
                                    <option value="Discipleship">Discipleship</option>
                                    <option value="History">History</option>
                                    <option value="English/Lit">English/Lit</option>
                                    <option value="Math">Math</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
                                    className="input w-full h-24 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Instructions</label>
                                <textarea
                                    value={newProject.instructions}
                                    onChange={(e) => setNewProject(p => ({ ...p, instructions: e.target.value }))}
                                    className="input w-full h-32 resize-none"
                                    placeholder="Step by step instructions..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Materials (comma separated)</label>
                                <input
                                    type="text"
                                    value={newProject.materials}
                                    onChange={(e) => setNewProject(p => ({ ...p, materials: e.target.value }))}
                                    className="input w-full"
                                    placeholder="Paper, scissors, glue..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                                    <select
                                        value={newProject.difficulty}
                                        onChange={(e) => setNewProject(p => ({ ...p, difficulty: e.target.value }))}
                                        className="input w-full"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Credits</label>
                                    <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        value={newProject.credit_value}
                                        onChange={(e) => setNewProject(p => ({ ...p, credit_value: parseFloat(e.target.value) }))}
                                        className="input w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="btn-primary flex-1">
                                    <Save className="w-5 h-5" />
                                    Save Project
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddProject(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Edit User</h2>
                            <button onClick={() => setShowEditUser(null)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="font-medium">{showEditUser.display_name || showEditUser.email}</p>
                            <p className="text-sm text-[var(--charcoal-light)]">{showEditUser.email}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <div className="space-y-2">
                                {['student', 'teacher', 'admin'].map((role) => (
                                    <button
                                        key={role}
                                        onClick={() => handleUpdateUserRole(showEditUser.id, role)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${showEditUser.role === role
                                            ? "border-[var(--sage)] bg-[var(--sage-light)]"
                                            : "border-[var(--cream-dark)] hover:border-[var(--sage-light)]"
                                            }`}
                                    >
                                        {roleIcon(role)}
                                        <span className="font-medium">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowEditUser(null)}
                            className="btn-secondary w-full"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
