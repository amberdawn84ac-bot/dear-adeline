'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Users,
    UserPlus,
    GraduationCap,
    BookOpen,
    Library,
    Settings,
    LogOut,
    Menu,
    Search,
    ChevronRight,
    Trophy,
    Target,
    Mail,
    FolderOpen,
    X,
    Send,
    Loader2,
    School,
    AlertTriangle,
    Bell
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

interface Alert {
    id: string;
    student_id: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    conversation_snippet: string | null;
    viewed_at: string | null;
    created_at: string;
    student: {
        display_name: string | null;
        email: string;
    };
}

interface Student {
    id: string;
    email: string;
    display_name: string | null;
    grade_level: string | null;
    avatar_url: string | null;
    created_at: string;
    skills_earned: number;
    total_credits: number;
    track_credits?: Record<string, number>;
    recent_work: Array<{ id: string; title: string; created_at: string }>;
}

interface Project {
    id: string;
    title: string;
    category: string;
    difficulty: string;
}

interface TeacherClientProps {
    profile: { display_name: string | null } | null;
    students: Student[];
    projects: Project[];
}

export default function TeacherClient({
    profile,
    students,
    projects,
}: TeacherClientProps) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

    // Fetch alerts
    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await fetch('/api/alerts');
            if (response.ok) {
                const data = await response.json();
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        }
    };

    const handleMarkAlertViewed = async (alertId: string) => {
        try {
            const response = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId })
            });
            if (response.ok) {
                fetchAlerts();
                setSelectedAlert(null);
            }
        } catch (error) {
            console.error('Error marking alert:', error);
        }
    };

    const unviewedAlerts = alerts.filter(a => !a.viewed_at);
    const getSeverityColor = (severity: string) => {
        if (severity === 'high') return 'text-red-600 bg-red-50';
        if (severity === 'medium') return 'text-orange-600 bg-orange-50';
        return 'text-blue-600 bg-blue-50';
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const handleInviteStudent = async () => {
        if (!inviteEmail.trim()) return;

        setInviteLoading(true);
        setInviteError('');
        setInviteSuccess('');

        try {
            const response = await fetch('/api/teacher/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to invite student');
            }

            setInviteSuccess(`Successfully added ${inviteEmail} to your students!`);
            setInviteEmail('');
            router.refresh();
        } catch (error) {
            setInviteError(error instanceof Error ? error.message : 'Failed to invite student');
        } finally {
            setInviteLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex bg-[var(--cream)]">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[var(--cream-dark)]">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <School className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-semibold block">Teacher Hub</span>
                                <span className="text-xs text-[var(--charcoal-light)]">Dear Adeline</span>
                            </div>
                        </Link>
                    </div>

                    <div className="p-4 border-b border-[var(--cream-dark)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {profile?.display_name?.[0]?.toUpperCase() || 'T'}
                            </div>
                            <div>
                                <p className="font-medium">{profile?.display_name || 'Teacher'}</p>
                                <p className="text-sm text-[var(--charcoal-light)]">{students.length} students</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-100 text-blue-700">
                            <Users className="w-5 h-5" />
                            <span className="font-medium">My Students</span>
                        </div>
                        <Link href="/library" className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--charcoal-light)] hover:bg-[var(--cream)] transition-colors">
                            <Library className="w-5 h-5" />
                            <span>Project Library</span>
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
                    <span className="font-semibold">Teacher Hub</span>
                    <div className="w-6" />
                </header>

                <div className="p-4 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Students</h1>
                            <p className="text-[var(--charcoal-light)]">
                                Monitor progress and manage your assigned students
                            </p>
                        </div>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="btn-primary"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Student
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-12 w-full"
                            />
                        </div>
                    </div>

                    {/* Alerts Section */}
                    {unviewedAlerts.length > 0 && (
                        <div className="mb-6 p-4 bg-white rounded-xl shadow-md border-l-4 border-orange-500">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-orange-600" />
                                    <h3 className="font-semibold">Student Alerts ({unviewedAlerts.length})</h3>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {unviewedAlerts.slice(0, 3).map((alert) => (
                                    <div
                                        key={alert.id}
                                        onClick={() => setSelectedAlert(alert)}
                                        className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${getSeverityColor(alert.severity)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{alert.title}</p>
                                                <p className="text-xs mt-1 opacity-75">
                                                    {alert.student.display_name || alert.student.email} • {new Date(alert.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0" />
                                        </div>
                                    </div>
                                ))}
                                {unviewedAlerts.length > 3 && (
                                    <p className="text-xs text-slate-500 text-center pt-2">
                                        +{unviewedAlerts.length - 3} more alerts
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Students Grid */}
                    {filteredStudents.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center text-white text-xl font-semibold">
                                            {student.display_name?.[0]?.toUpperCase() || student.email[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">
                                                {student.display_name || 'Student'}
                                            </h3>
                                            <p className="text-sm text-[var(--charcoal-light)] truncate">
                                                {student.grade_level || 'Grade not set'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-[var(--cream)] p-3 rounded-lg text-center">
                                            <div className="flex items-center justify-center gap-1 text-[var(--sage-dark)]">
                                                <Trophy className="w-4 h-4" />
                                                <span className="font-bold">{student.skills_earned}</span>
                                            </div>
                                            <p className="text-xs text-[var(--charcoal-light)]">Skills</p>
                                        </div>
                                        <div className="bg-[var(--cream)] p-3 rounded-lg text-center">
                                            <div className="flex items-center justify-center gap-1 text-[var(--sage-dark)]">
                                                <GraduationCap className="w-4 h-4" />
                                                <span className="font-bold">{student.total_credits.toFixed(1)}</span>
                                            </div>
                                            <p className="text-xs text-[var(--charcoal-light)]">Credits</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--cream-dark)]">
                                        <span className="text-sm text-[var(--charcoal-light)]">
                                            {student.recent_work.length} recent items
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-[var(--charcoal-light)]" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <Users className="w-16 h-16 text-[var(--charcoal-light)] mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No students yet</h3>
                            <p className="text-[var(--charcoal-light)] mb-6">
                                Add students to start tracking their progress
                            </p>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="btn-primary"
                            >
                                <UserPlus className="w-5 h-5" />
                                Add Your First Student
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--sage)] to-[var(--sage-dark)] flex items-center justify-center text-white text-2xl font-semibold">
                                        {selectedStudent.display_name?.[0]?.toUpperCase() || selectedStudent.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {selectedStudent.display_name || 'Student'}
                                        </h2>
                                        <p className="text-[var(--charcoal-light)]">{selectedStudent.email}</p>
                                        <p className="text-sm text-[var(--charcoal-light)]">
                                            {selectedStudent.grade_level || 'Grade not set'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStudent(null)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-[var(--cream)] p-4 rounded-xl text-center">
                                    <Trophy className="w-6 h-6 mx-auto mb-2 text-[var(--gold)]" />
                                    <p className="text-2xl font-bold">{selectedStudent.skills_earned}</p>
                                    <p className="text-sm text-[var(--charcoal-light)]">Skills Earned</p>
                                </div>
                                <div className="bg-[var(--cream)] p-4 rounded-xl text-center">
                                    <GraduationCap className="w-6 h-6 mx-auto mb-2 text-[var(--sage)]" />
                                    <p className="text-2xl font-bold">{selectedStudent.total_credits.toFixed(1)}</p>
                                    <p className="text-sm text-[var(--charcoal-light)]">Total Credits</p>
                                </div>
                                <div className="bg-[var(--cream)] p-4 rounded-xl text-center">
                                    <FolderOpen className="w-6 h-6 mx-auto mb-2 text-[var(--dusty-rose)]" />
                                    <p className="text-2xl font-bold">{selectedStudent.recent_work.length}</p>
                                    <p className="text-sm text-[var(--charcoal-light)]">Portfolio Items</p>
                                </div>
                            </div>

                            {/* Track Progress Breakdown */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">Learning Tracks Breakdown</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(selectedStudent.track_credits || {}).map(([track, credits]) => (
                                        <div key={track} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-slate-600 truncate mr-2">{track}</span>
                                                <span className="text-xs font-bold text-slate-800">{credits.toFixed(1)}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                                                <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min((credits / 4.0) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedStudent.track_credits || Object.keys(selectedStudent.track_credits).length === 0) && (
                                        <p className="col-span-2 text-xs text-slate-400 italic text-center py-4">
                                            No track progress recorded yet.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Work */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">Recent Work</h3>
                                {selectedStudent.recent_work.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedStudent.recent_work.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between p-3 bg-[var(--cream)] rounded-lg"
                                            >
                                                <span className="font-medium">{item.title}</span>
                                                <span className="text-sm text-[var(--charcoal-light)]">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[var(--charcoal-light)] italic">
                                        No portfolio items yet
                                    </p>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-4">
                                <button className="btn-secondary flex-1">
                                    <BookOpen className="w-5 h-5" />
                                    View Full Progress
                                </button>
                                <button className="btn-primary flex-1">
                                    <Library className="w-5 h-5" />
                                    Assign Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Student Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Add Student</h2>
                            <button onClick={() => setShowInviteModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-[var(--charcoal-light)] mb-6">
                            Enter the email address of an existing student account to add them to your classroom.
                        </p>

                        {inviteError && (
                            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {inviteError}
                            </div>
                        )}

                        {inviteSuccess && (
                            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                                {inviteSuccess}
                            </div>
                        )}

                        <form onSubmit={(e) => { e.preventDefault(); handleInviteStudent(); }}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Student Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--charcoal-light)]" />
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="input pl-12 w-full"
                                        placeholder="student@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={inviteLoading}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    {inviteLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Add Student
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Alert Detail Modal */}
            {selectedAlert && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getSeverityColor(selectedAlert.severity)}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedAlert.title}</h2>
                                    <p className="text-sm text-slate-500">
                                        {selectedAlert.student.display_name || selectedAlert.student.email} • {new Date(selectedAlert.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAlert(null)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-semibold mb-2">Details</h3>
                            <p className="text-slate-700">{selectedAlert.message}</p>
                        </div>

                        {selectedAlert.conversation_snippet && (
                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Conversation Snippet</h3>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
                                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                                        {selectedAlert.conversation_snippet}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleMarkAlertViewed(selectedAlert.id)}
                                className="btn-primary flex-1"
                            >
                                Mark as Viewed
                            </button>
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="btn-secondary flex-1"
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
