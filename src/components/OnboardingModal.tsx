
'use client';

import React, { useState } from 'react';
import {
    Sparkles,
    GraduationCap,
    MapPin,
    User,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Brain
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PlacementAssessment } from './PlacementAssessment';

interface OnboardingModalProps {
    userId: string;
    onComplete: (data: { display_name: string; grade_level: string; state_standards: string; city: string }) => void;
}

export function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [placementReport, setPlacementReport] = useState<any>(null);
    const [data, setData] = useState({
        display_name: '',
        grade_level: '',
        state_standards: '',
        city: ''
    });

    const isStepValid = () => {
        if (step === 1) return data.display_name.length >= 2;
        if (step === 2) return data.grade_level !== '';
        if (step === 3) return data.city.trim().length >= 3;
        if (step === 4) return data.state_standards !== '';
        return true;
    };

    const handleNext = async () => {
        console.log('handleNext called, current step:', step);
        if (step < 4) {
            setStep(step + 1);
        } else if (step === 4) {
            // Save profile data first, then proceed to placement
            await handleSaveProfile();
            setStep(5);
        } else {
            console.log('Final step, calling handleSave');
            handleSave();
        }
    };

    const handleSaveProfile = async () => {
        console.log('handleSaveProfile called with data:', data);
        setSaving(true);
        const supabase = createClient();

        try {
            // Get user email from auth
            const { data: { user } } = await supabase.auth.getUser();

            if (!user?.email) {
                alert('Unable to get user email. Please try logging in again.');
                setSaving(false);
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: user.email,
                    display_name: data.display_name,
                    grade_level: data.grade_level,
                    state_standards: data.state_standards,
                    city: data.city,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) {
                console.error('Error saving onboarding data:', error);
                alert(`Error saving profile: ${error.message}`);
                setSaving(false);
                return;
            }

            // Auto-seed starter projects for new students
            try {
                await fetch('/api/projects/seed-starter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });
            } catch (seedError) {
                console.error('Error seeding starter projects:', seedError);
                // Don't block onboarding if seeding fails
            }

            setSaving(false);
        } catch (err) {
            console.error('Unexpected error during save:', err);
            alert('An unexpected error occurred. Please try again.');
            setSaving(false);
        }
    };

    const handleSave = () => {
        console.log('Onboarding complete, calling onComplete');
        onComplete(data);
    };

    const handlePlacementComplete = (report: any) => {
        console.log('Placement assessment complete:', report);
        setPlacementReport(report);
        // Complete onboarding
        handleSave();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--cream)]/80 backdrop-blur-xl">
            <div className="card-glass max-w-lg w-full p-8 lg:p-12 shadow-2xl border-2 border-[var(--purple)]/10 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--gold)]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--blue)]/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--purple)] flex items-center justify-center shadow-lg transform -rotate-3">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold serif text-[var(--purple)]">Welcome to Adeline</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--gold)]">Let's Personalize Your Journey</p>
                        </div>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex gap-2 mb-12">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-12 bg-[var(--purple)]' :
                                    step > s ? 'w-4 bg-[var(--blue)]' : 'w-4 bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="min-h-[200px] mb-8">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Who are you?
                                </label>
                                <h3 className="text-xl font-bold serif text-[var(--purple)] mb-6">What name should Adeline use to address you?</h3>
                                <input
                                    type="text"
                                    autoFocus
                                    value={data.display_name}
                                    onChange={(e) => setData({ ...data, display_name: e.target.value })}
                                    placeholder="Enter your name..."
                                    className="w-full bg-white/50 border-2 border-[var(--purple)]/10 rounded-[2rem] px-8 py-6 text-2xl font-bold serif text-[var(--purple)] focus:outline-none focus:border-[var(--purple)]/30 transition-all shadow-inner"
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    The Level of Discovery
                                </label>
                                <h3 className="text-xl font-bold serif text-[var(--purple)] mb-6">What grade or level are you currently in?</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { v: 'K', l: 'K' }, { v: '1', l: '1st' }, { v: '2', l: '2nd' },
                                        { v: '3', l: '3rd' }, { v: '4', l: '4th' }, { v: '5', l: '5th' },
                                        { v: '6', l: '6th' }, { v: '7', l: '7th' }, { v: '8', l: '8th' },
                                        { v: '9', l: '9th' }, { v: '10', l: '10th' }, { v: '11', l: '11th' },
                                        { v: '12', l: '12th' }
                                    ].map((g) => (
                                        <button
                                            key={g.v}
                                            onClick={() => setData({ ...data, grade_level: g.v })}
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${data.grade_level === g.v
                                                ? 'bg-[var(--purple)] border-[var(--purple)] text-white shadow-lg scale-105'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-[var(--purple)]/20 hover:text-[var(--purple)]'
                                                }`}
                                        >
                                            {g.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Your Hub of Influence
                                </label>
                                <h3 className="text-xl font-bold serif text-[var(--purple)] mb-6">Which city are you in?</h3>
                                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                    Adeline uses this to gather local weather, news, and student opportunities specific to your city.
                                </p>
                                <input
                                    type="text"
                                    autoFocus
                                    value={data.city}
                                    onChange={(e) => setData({ ...data, city: e.target.value })}
                                    placeholder="e.g. Nowata"
                                    className="w-full bg-white/50 border-2 border-[var(--purple)]/10 rounded-[2rem] px-8 py-6 text-2xl font-bold serif text-[var(--purple)] focus:outline-none focus:border-[var(--purple)]/30 transition-all shadow-inner"
                                />
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Your Home State
                                </label>
                                <h3 className="text-xl font-bold serif text-[var(--purple)] mb-6">Which state do you live in?</h3>
                                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                    This helps Adeline align your journey with local requirements.
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[
                                        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
                                    ].map((state) => (
                                        <button
                                            type="button"
                                            key={state}
                                            onClick={() => setData({ ...data, state_standards: state.toLowerCase() })}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all font-bold text-sm ${data.state_standards === state.toLowerCase()
                                                ? 'bg-[var(--purple)] border-[var(--purple)] text-white shadow-lg'
                                                : 'bg-white border-slate-100 text-slate-400 hover:border-[var(--purple)]/20'
                                                }`}
                                        >
                                            {state}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Brain className="w-4 h-4" />
                                    Finding Your Starting Point
                                </label>
                                <h3 className="text-xl font-bold serif text-[var(--purple)] mb-6">Let's figure out where you are</h3>
                                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                                    Have a short conversation with Adeline so she knows where to start teaching you. This isn't a test - it's okay to say "I don't know!"
                                </p>
                                <PlacementAssessment
                                    userId={userId}
                                    onComplete={handlePlacementComplete}
                                />
                            </div>
                        )}
                    </div>

                    {step !== 5 && (
                        <div className="flex items-center justify-between">
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[var(--purple)] transition-colors"
                                >
                                    Previous
                                </button>
                            ) : <div />}

                            <button
                                onClick={handleNext}
                                disabled={!isStepValid() || saving}
                                className="flex items-center gap-3 px-8 py-4 bg-[var(--purple)] text-white rounded-[2rem] font-bold text-sm shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all group"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {step === 4 ? 'Continue to Assessment' : 'Next Step'}
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

