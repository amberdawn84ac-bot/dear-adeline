'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    ArrowLeft,
    Save,
    User,
    GraduationCap,
    Globe,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState({
        display_name: '',
        grade_level: '',
        state_standards: 'oklahoma'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('display_name, grade_level, state_standards')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile({
                    display_name: data.display_name || '',
                    grade_level: data.grade_level || '',
                    state_standards: data.state_standards || 'oklahoma'
                });
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                display_name: profile.display_name,
                grade_level: profile.grade_level,
                state_standards: profile.state_standards,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (!error) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--sage)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--cream)] p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <Link href="/dashboard" className="flex items-center gap-2 text-[var(--charcoal-light)] hover:text-[var(--sage-dark)] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                </div>

                <div className="card-glass p-8">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={profile.display_name}
                                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                placeholder="How should Adeline address you?"
                                className="input w-full"
                                required
                            />
                        </div>

                        {/* Grade Level */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Grade Level
                            </label>
                            <select
                                value={profile.grade_level}
                                onChange={(e) => setProfile({ ...profile, grade_level: e.target.value })}
                                className="input w-full"
                                required
                            >
                                <option value="" disabled>Select your grade</option>
                                <option value="K">Kindergarten</option>
                                <option value="1">1st Grade</option>
                                <option value="2">2nd Grade</option>
                                <option value="3">3rd Grade</option>
                                <option value="4">4th Grade</option>
                                <option value="5">5th Grade</option>
                                <option value="6">6th Grade</option>
                                <option value="7">7th Grade</option>
                                <option value="8">8th Grade</option>
                                <option value="9">Freshman (9th)</option>
                                <option value="10">Sophomore (10th)</option>
                                <option value="11">Junior (11th)</option>
                                <option value="12">Senior (12th)</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-2">
                                This helps Adeline adjust how she explains concepts to you!
                            </p>
                        </div>

                        {/* State Standards */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Academic Standards
                            </label>
                            <select
                                value={profile.state_standards}
                                onChange={(e) => setProfile({ ...profile, state_standards: e.target.value })}
                                className="input w-full"
                                required
                            >
                                <option value="oklahoma">Oklahoma (Standard)</option>
                                <option value="national">National (Common Core)</option>
                                <option value="unstructured">Unstructured / Interest-Led</option>
                            </select>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            {success && (
                                <div className="flex items-center gap-2 text-emerald-600 animate-fade-in">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Settings saved!</span>
                                </div>
                            )}
                            <div className="flex-1" />
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
