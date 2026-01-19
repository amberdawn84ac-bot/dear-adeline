'use client';

import { Calendar, MapPin } from 'lucide-react';

interface TimelineEvent {
    year: string;
    title: string;
    description: string;
}

interface TimelineProps {
    title: string;
    events: TimelineEvent[];
}

export function Timeline({ title, events }: TimelineProps) {
    return (
        <div className="h-full bg-gradient-to-br from-[var(--burgundy)]/5 to-[var(--cream)] rounded-3xl p-8 overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="w-16 h-16 bg-[var(--burgundy)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-[var(--burgundy)]" />
                </div>
                <h3 className="text-2xl font-bold serif text-[var(--forest)]">{title}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--forest)]/50 mt-2">
                    Historical Timeline
                </p>
            </div>

            {/* Timeline */}
            <div className="relative max-w-4xl mx-auto">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--burgundy)] via-[var(--ochre)] to-[var(--sage)]" />

                {/* Events */}
                <div className="space-y-12">
                    {events.map((event, index) => (
                        <div key={index} className="relative pl-24 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 100}ms` }}>
                            {/* Year badge */}
                            <div className="absolute left-0 top-0 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-[var(--cream)]">
                                <span className="text-sm font-black text-[var(--burgundy)]">{event.year}</span>
                            </div>

                            {/* Connector dot */}
                            <div className="absolute left-8 top-6 w-4 h-4 bg-[var(--ochre)] rounded-full border-4 border-white shadow-lg" />

                            {/* Content card */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-[var(--cream-dark)] hover:border-[var(--ochre)]">
                                <div className="flex items-start gap-3 mb-3">
                                    <MapPin className="w-5 h-5 text-[var(--ochre)] flex-shrink-0 mt-1" />
                                    <h4 className="text-lg font-bold text-[var(--forest)] leading-tight">{event.title}</h4>
                                </div>
                                <p className="text-sm text-[var(--charcoal-light)] leading-relaxed pl-8">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* End marker */}
                <div className="relative pl-24 mt-12">
                    <div className="absolute left-0 top-0 w-16 h-16 bg-gradient-to-br from-[var(--sage)] to-[var(--forest)] rounded-2xl shadow-lg flex items-center justify-center border-4 border-[var(--cream)]">
                        <span className="text-2xl">✓</span>
                    </div>
                    <div className="bg-[var(--sage-light)] rounded-2xl p-6 border-2 border-[var(--sage)]">
                        <p className="text-sm font-bold text-[var(--forest)] italic text-center">
                            End of Timeline
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
