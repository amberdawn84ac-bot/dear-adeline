'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Target,
    BookOpen,
    Home,
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import TextbookChat from '@/components/TextbookChat';

interface TextbookEvent {
    id: string;
    title: string;
    date_display: string;
    era: string;
    century?: number;
    decade?: number;
    mainstream_narrative: string;
    primary_sources: string;
    source_citations: any[];
    scripture_references: any[];
    sort_order: number;
}

interface Progress {
    item_id: string;
    mastery_level: string;
    completed_at: string | null;
}

interface Props {
    events: TextbookEvent[];
    progress: Progress[];
    userId: string;
}

const ERAS = [
    { id: 'creation', name: 'Creation & Early Earth', color: 'bg-amber-500' },
    { id: 'ancient', name: 'Ancient World', color: 'bg-orange-500' },
    { id: 'classical', name: 'Classical Era', color: 'bg-red-500' },
    { id: 'medieval', name: 'Medieval Period', color: 'bg-purple-500' },
    { id: 'reformation', name: 'Reformation & Renaissance', color: 'bg-blue-500' },
    { id: 'modern', name: 'Modern Era', color: 'bg-green-500' },
    { id: 'current', name: 'Current Events', color: 'bg-teal-500' },
];

export default function HistoryClient({ events, progress, userId }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<TextbookEvent | null>(null);
    const [zoomLevel, setZoomLevel] = useState<'era' | 'century' | 'decade'>('era');
    const [selectedEra, setSelectedEra] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);

    const getProgressForEvent = (eventId: string) => {
        return progress.find(p => p.item_id === eventId);
    };

    const filteredEvents = selectedEra
        ? events.filter(e => e.era === selectedEra)
        : events;

    const groupedByEra = ERAS.map(era => ({
        ...era,
        events: events.filter(e => e.era === era.id),
    }));

    return (
        <div className="min-h-screen bg-[var(--cream)]">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-[var(--charcoal-light)] hover:text-[var(--forest)] transition-colors">
                            <Home className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--forest)] serif">History Timeline</h1>
                            <p className="text-sm text-[var(--charcoal-light)]">From Creation to Current Events</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoomLevel('era')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${zoomLevel === 'era' ? 'bg-[var(--forest)] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            Eras
                        </button>
                        <button
                            onClick={() => setZoomLevel('century')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${zoomLevel === 'century' ? 'bg-[var(--forest)] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            Centuries
                        </button>
                        <button
                            onClick={() => setZoomLevel('decade')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${zoomLevel === 'decade' ? 'bg-[var(--forest)] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            Decades
                        </button>
                    </div>
                </div>
            </header>

            {/* Timeline */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Era Navigation */}
                <div className="relative mb-8">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--forest)]/20 -translate-y-1/2" />
                    <div className="flex justify-between relative">
                        {groupedByEra.map((era) => (
                            <button
                                key={era.id}
                                onClick={() => {
                                    setSelectedEra(selectedEra === era.id ? null : era.id);
                                    setZoomLevel('century');
                                }}
                                className={`flex flex-col items-center group ${selectedEra === era.id ? 'scale-110' : ''} transition-transform`}
                            >
                                <div className={`w-6 h-6 rounded-full ${era.color} border-4 border-white shadow-lg group-hover:scale-125 transition-transform ${selectedEra === era.id ? 'ring-4 ring-[var(--forest)]/30' : ''}`} />
                                <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${selectedEra === era.id ? 'text-[var(--forest)] font-bold' : 'text-[var(--charcoal-light)]'}`}>
                                    {era.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {era.events.length} events
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Era Events or All Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="w-16 h-16 mx-auto text-[var(--charcoal-light)]/30 mb-4" />
                        <h2 className="text-xl font-bold text-[var(--charcoal)] mb-2">Timeline Coming Soon</h2>
                        <p className="text-[var(--charcoal-light)]">
                            Historical events are being added. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEvents.map((event) => {
                            const eventProgress = getProgressForEvent(event.id);
                            const isCompleted = eventProgress?.mastery_level === 'mastered';

                            return (
                                <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-lg ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-[var(--forest)]'}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ochre)]">
                                            {event.date_display}
                                        </span>
                                        {isCompleted && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-[var(--forest)] mb-2">{event.title}</h3>
                                    <p className="text-sm text-[var(--charcoal-light)] line-clamp-2">
                                        {event.mainstream_narrative.substring(0, 100)}...
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ochre)]">
                                    {selectedEvent.date_display}
                                </span>
                                <h2 className="text-xl font-bold text-[var(--forest)]">{selectedEvent.title}</h2>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Mainstream Narrative */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📺</span>
                                    <h3 className="font-bold text-red-800">Mainstream Narrative</h3>
                                </div>
                                <p className="text-red-900/80 text-sm italic">
                                    {selectedEvent.mainstream_narrative}
                                </p>
                            </div>

                            {/* Primary Sources */}
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📜</span>
                                    <h3 className="font-bold text-green-800">Primary Sources & Truth</h3>
                                </div>
                                <p className="text-green-900/80 text-sm">
                                    {selectedEvent.primary_sources}
                                </p>
                                {selectedEvent.scripture_references && selectedEvent.scripture_references.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                        <p className="text-xs font-bold text-green-700 mb-1">Scripture References:</p>
                                        <p className="text-sm text-green-800">
                                            {selectedEvent.scripture_references.join(', ')}
                                        </p>
                                    </div>
                                )}
                                {selectedEvent.source_citations && selectedEvent.source_citations.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                        <p className="text-xs font-bold text-green-700 mb-1">Sources:</p>
                                        <ul className="text-xs text-green-700 space-y-1">
                                            {selectedEvent.source_citations.map((citation: any, i: number) => (
                                                <li key={i}>• {typeof citation === 'string' ? citation : citation.text}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--forest)] text-white py-3 rounded-xl hover:brightness-110 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Ask Adeline
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--ochre)] text-white py-3 rounded-xl hover:brightness-110 transition-all"
                                >
                                    <Target className="w-5 h-5" />
                                    Take Challenge
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Panel */}
            {showChat && selectedEvent && (
                <TextbookChat
                    userId={userId}
                    title={selectedEvent.title}
                    context={`History Event: ${selectedEvent.title} (${selectedEvent.date_display}). Era: ${selectedEvent.era}. Mainstream Narrative: "${selectedEvent.mainstream_narrative}". Primary Sources/Truth: "${selectedEvent.primary_sources}".`}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    );
}
