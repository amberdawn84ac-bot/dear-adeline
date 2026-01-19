'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
    BookOpen,
    Sparkles,
    ArrowLeft,
    CalendarDays,
    GraduationCap,
    FlaskConical,
    ChefHat,
    Music,
    Dumbbell,
    Palette,
    Leaf
} from 'lucide-react';

interface ActivityLog {
    id: string;
    type: 'text' | 'photo';
    caption: string;
    translation: string;
    skills: string[];
    grade: string;
    created_at: string;
}

export default function JournalPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserId(user.id);
                const res = await fetch(`/api/logs?userId=${user.id}`);
                const data = await res.json();
                if (data.logs) {
                    setLogs(data.logs);
                }
            }
            setLoading(false);
        };

        fetchLogs();
    }, []);

    const getIconForTranslation = (translation: string) => {
        const t = translation.toLowerCase();
        if (t.includes('chemistry') || t.includes('science')) return <FlaskConical className="w-5 h-5" />;
        if (t.includes('home ec') || t.includes('baking') || t.includes('cooking')) return <ChefHat className="w-5 h-5" />;
        if (t.includes('art') || t.includes('design')) return <Palette className="w-5 h-5" />;
        if (t.includes('pe') || t.includes('physical')) return <Dumbbell className="w-5 h-5" />;
        if (t.includes('music')) return <Music className="w-5 h-5" />;
        if (t.includes('biology') || t.includes('nature')) return <Leaf className="w-5 h-5" />;
        return <Sparkles className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-[var(--cream)] p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 rounded-full hover:bg-[var(--forest)]/10 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-[var(--forest)]" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--forest)] serif flex items-center gap-2">
                            <BookOpen className="w-8 h-8 text-[var(--ochre)]" />
                            The Living Transcript
                        </h1>
                        <p className="text-[var(--charcoal-light)] mt-1">
                            "We don't do 'school'. We live life, and Adeline translates it."
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-[var(--forest)]/30">
                        <Sparkles className="w-12 h-12 text-[var(--ochre)] mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-[var(--forest)] mb-2">The Pages are Blank... for Now</h3>
                        <p className="text-[var(--charcoal-light)] max-w-md mx-auto">
                            Go tell Adeline about your day! Say "I baked cookies" or "I built a fort," and watch her fill this journal with academic credit.
                        </p>
                        <Link href="/dashboard" className="inline-block mt-6 px-6 py-3 bg-[var(--forest)] text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-[var(--forest-dark)] transition-all transform hover:-translate-y-1 shadow-lg">
                            Start an Adventure
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {logs.map((log) => (
                            <div key={log.id} className="bg-white rounded-2xl shadow-sm border border-[var(--cream-dark)] overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 grid md:grid-cols-[1fr_2fr] gap-6">

                                    {/* Left: The "Real Life" Input */}
                                    <div className="border-r border-[var(--cream-dark)] pr-6 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--ochre)] mb-2">
                                            <CalendarDays className="w-4 h-4" />
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </div>
                                        <p className="text-lg font-medium text-[var(--charcoal)] italic">
                                            "{log.caption}"
                                        </p>
                                        <div className="mt-4 flex gap-2">
                                            {log.type === 'photo' && <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-1 rounded">📸 Photo Proof</span>}
                                        </div>
                                    </div>

                                    {/* Right: The "Academic" Translation */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-2 bg-[var(--forest)]/10 rounded-lg text-[var(--forest)]">
                                                {getIconForTranslation(log.translation)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[var(--forest)] text-lg leading-tight">
                                                    {log.translation}
                                                </h3>
                                                <p className="text-xs text-[var(--charcoal-light)] uppercase tracking-wider font-semibold">
                                                    Grade Level: {log.grade}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skills Credited</p>
                                            <div className="flex flex-wrap gap-2">
                                                {log.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-[var(--cream)] border border-[var(--ochre)]/20 text-[var(--burgundy)] text-xs font-medium rounded-lg flex items-center gap-1.5">
                                                        <GraduationCap className="w-3 h-3 opacity-50" />
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
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
