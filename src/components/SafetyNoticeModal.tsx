'use client';

import { Shield, AlertTriangle, Heart, Phone } from 'lucide-react';

interface SafetyNoticeModalProps {
    alertType: 'self_harm' | 'violence' | 'inappropriate' | 'predatory';
    onClose: () => void;
}

interface CrisisResource {
    hotline: string;
    text?: string;
    name: string;
}

const CRISIS_RESOURCES: Record<string, CrisisResource> = {
    self_harm: {
        hotline: '988',
        text: 'Text HOME to 741741',
        name: 'National Suicide Prevention Lifeline'
    },
    violence: {
        hotline: '911',
        name: 'Emergency Services'
    },
    abuse: {
        hotline: '1-800-422-4453',
        name: 'Childhelp National Child Abuse Hotline'
    }
};

export function SafetyNoticeModal({ alertType, onClose }: SafetyNoticeModalProps) {
    const getResources = () => {
        if (alertType === 'self_harm') return CRISIS_RESOURCES.self_harm;
        if (alertType === 'violence') return CRISIS_RESOURCES.violence;
        if (alertType === 'predatory') return CRISIS_RESOURCES.abuse;
        return null;
    };

    const resources = getResources();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl border-2 border-[var(--burgundy)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-[var(--burgundy)] mx-auto flex items-center justify-center mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold serif text-[var(--burgundy)] text-center mb-6">
                    Safety Notice
                </h2>

                {/* Message */}
                <div className="bg-[var(--cream)] rounded-2xl p-8 mb-8 border-2 border-[var(--burgundy)]/20">
                    <p className="text-lg text-[var(--charcoal)] leading-relaxed font-serif text-center">
                        My dear child, I've shared our conversation with your teacher/parent because
                        keeping you safe is my most important job. They care deeply about you
                        and want to help. You are precious and valued.
                    </p>
                </div>

                {/* Resources */}
                {resources && (
                    <div className="bg-gradient-to-r from-[var(--burgundy)] to-[var(--burgundy-light)] rounded-2xl p-6 text-white mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="w-5 h-5" />
                            <span className="text-sm font-black uppercase tracking-widest">
                                Help is Available Right Now
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-2xl font-bold mb-1">{resources.hotline}</p>
                                <p className="text-sm opacity-80">{resources.name}</p>
                            </div>
                            {resources.text && (
                                <div>
                                    <p className="text-lg font-semibold">{resources.text}</p>
                                    <p className="text-sm opacity-80">Crisis Text Line</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Message */}
                <div className="bg-[var(--sage)]/10 rounded-2xl p-6 mb-8 border border-[var(--sage)]/20">
                    <div className="flex items-start gap-3">
                        <Heart className="w-6 h-6 text-[var(--sage)] flex-shrink-0 mt-1" />
                        <p className="text-[var(--charcoal)] font-serif">
                            Your safety and wellbeing matter more than anything else.
                            Your teacher is here to help and support you through this.
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-[var(--forest)] text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                    I Understand
                </button>
            </div>
        </div>
    );
}
