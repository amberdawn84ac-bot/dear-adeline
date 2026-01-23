'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Target,
    Home,
    X,
    Plus,
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
    { id: 'creation', name: 'Creation', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50', border: 'border-amber-300' },
    { id: 'ancient', name: 'Ancient', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-300' },
    { id: 'classical', name: 'Classical', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', border: 'border-red-300' },
    { id: 'medieval', name: 'Medieval', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50', border: 'border-purple-300' },
    { id: 'reformation', name: 'Reformation', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-300' },
    { id: 'modern', name: 'Modern', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-300' },
    { id: 'current', name: 'Current', color: 'bg-teal-500', textColor: 'text-teal-700', bgLight: 'bg-teal-50', border: 'border-teal-300' },
];

export default function HistoryClient({ events, progress, userId }: Props) {
    const [selectedEvent, setSelectedEvent] = useState<TextbookEvent | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [showSuggestForm, setShowSuggestForm] = useState(false);
    const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Open chat with a pre-filled challenge prompt
    const handleTakeChallenge = () => {
        if (!selectedEvent) return;
        setChatInitialPrompt(`Give me a challenge about "${selectedEvent.title}" (${selectedEvent.date_display}). Ask me questions that require critical thinking about primary sources vs mainstream narratives.`);
        setShowChat(true);
    };

    const getProgressForEvent = (eventId: string) => {
        return progress.find(p => p.item_id === eventId);
    };

    const checkScrollButtons = () => {
        if (timelineRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        const timeline = timelineRef.current;
        if (timeline) {
            timeline.addEventListener('scroll', checkScrollButtons);
            return () => timeline.removeEventListener('scroll', checkScrollButtons);
        }
    }, [events]);

    const scroll = (direction: 'left' | 'right') => {
        if (timelineRef.current) {
            const scrollAmount = timelineRef.current.clientWidth * 0.8;
            timelineRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const scrollToEra = (eraId: string) => {
        const eraElement = document.getElementById(`era-${eraId}`);
        if (eraElement && timelineRef.current) {
            const containerRect = timelineRef.current.getBoundingClientRect();
            const eraRect = eraElement.getBoundingClientRect();
            const scrollLeft = eraRect.left - containerRect.left + timelineRef.current.scrollLeft - 50;
            timelineRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    // Group events by era
    const eventsByEra = ERAS.map(era => ({
        ...era,
        events: events.filter(e => e.era === era.id).sort((a, b) => a.sort_order - b.sort_order)
    })).filter(era => era.events.length > 0);

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
                            <h1 className="text-2xl font-bold text-[var(--forest)] font-serif">History Timeline</h1>
                            <p className="text-sm text-[var(--charcoal-light)]">From Creation to Current Events</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSuggestForm(true)}
                        className="flex items-center gap-2 bg-[var(--sage)] text-white px-4 py-2 rounded-xl hover:brightness-110 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Suggest Event</span>
                    </button>
                </div>
            </header>

            {/* Era Quick Navigation */}
            <div className="bg-white border-b sticky top-[72px] z-30">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {ERAS.map(era => {
                            const eraEvents = events.filter(e => e.era === era.id);
                            if (eraEvents.length === 0 && events.length > 0) return null;
                            return (
                                <button
                                    key={era.id}
                                    onClick={() => scrollToEra(era.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${era.color} text-white hover:brightness-110 transition-all`}
                                >
                                    {era.name}
                                    <span className="bg-white/30 px-1.5 rounded-full">{eraEvents.length}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="relative mt-4">
                {/* Scroll Buttons */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-[var(--forest)]" />
                    </button>
                )}
                {canScrollRight && events.length > 0 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6 text-[var(--forest)]" />
                    </button>
                )}

                {/* Horizontal Timeline */}
                <div
                    ref={timelineRef}
                    className="overflow-x-auto overflow-y-hidden pb-4"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {events.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <h2 className="text-xl font-bold text-[var(--charcoal)] mb-2">Timeline Coming Soon</h2>
                            <p className="text-[var(--charcoal-light)] mb-4">
                                Historical events are being added. Check back soon!
                            </p>
                            <button
                                onClick={() => setShowSuggestForm(true)}
                                className="inline-flex items-center gap-2 bg-[var(--forest)] text-white px-6 py-3 rounded-xl hover:brightness-110"
                            >
                                <Plus className="w-5 h-5" />
                                Suggest an Event
                            </button>
                        </div>
                    ) : (
                        <div className="inline-flex min-w-full px-8 pt-4">
                            {eventsByEra.map((era, eraIndex) => (
                                <div
                                    key={era.id}
                                    id={`era-${era.id}`}
                                    className="flex-shrink-0 mr-2"
                                >
                                    {/* Era Section */}
                                    <div className={`${era.bgLight} rounded-2xl border-2 ${era.border} overflow-hidden`}>
                                        {/* Era Header */}
                                        <div className={`${era.color} px-4 py-2`}>
                                            <h2 className="text-white font-bold text-center">{era.name}</h2>
                                        </div>

                                        {/* Events Container with Timeline */}
                                        <div className="p-4 min-h-[420px] relative">
                                            {/* Horizontal Timeline Line */}
                                            <div className={`absolute left-4 right-4 top-1/2 h-1 ${era.color} opacity-40 rounded-full`} />

                                            {/* Events */}
                                            <div className="flex gap-3 relative">
                                                {era.events.map((event, eventIndex) => {
                                                    const eventProgress = getProgressForEvent(event.id);
                                                    const isCompleted = eventProgress?.mastery_level === 'mastered';
                                                    const isAboveLine = eventIndex % 2 === 0;

                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className="flex flex-col items-center"
                                                            style={{ width: '180px' }}
                                                        >
                                                            {/* Card - positioned above or below */}
                                                            <div className={`flex flex-col items-center ${isAboveLine ? '' : 'flex-col-reverse'}`}>
                                                                {/* Event Card */}
                                                                <button
                                                                    onClick={() => setSelectedEvent(event)}
                                                                    className={`w-full p-3 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 text-left ${
                                                                        isCompleted
                                                                            ? 'bg-green-50 border-green-300'
                                                                            : 'bg-white border-gray-200 hover:border-[var(--forest)]'
                                                                    }`}
                                                                    style={{ height: '140px' }}
                                                                >
                                                                    <span className={`text-xs font-bold ${era.textColor}`}>
                                                                        {event.date_display}
                                                                    </span>
                                                                    <h3 className="font-bold text-[var(--forest)] text-sm mt-1 line-clamp-3">
                                                                        {event.title}
                                                                    </h3>
                                                                    {isCompleted && (
                                                                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                            Completed
                                                                        </span>
                                                                    )}
                                                                </button>

                                                                {/* Connector */}
                                                                <div className={`w-0.5 h-6 ${era.color} opacity-60`} />

                                                                {/* Timeline Node */}
                                                                <div className={`w-4 h-4 rounded-full ${era.color} border-4 border-white shadow-md flex-shrink-0`} />

                                                                {/* Spacer for opposite side */}
                                                                <div className="h-[170px]" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && !showChat && (
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
                                    onClick={() => {
                                        setChatInitialPrompt(null);
                                        setShowChat(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[var(--forest)] text-white py-3 rounded-xl hover:brightness-110 transition-all"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Ask Adeline
                                </button>
                                <button
                                    onClick={handleTakeChallenge}
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

            {/* Suggest Event Modal */}
            {showSuggestForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[var(--forest)]">Suggest an Event</h2>
                            <button
                                onClick={() => setShowSuggestForm(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-[var(--charcoal-light)] mb-4">
                            Know about a historical event that should be on the timeline? Tell Adeline!
                        </p>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const input = form.elements.namedItem('suggestion') as HTMLTextAreaElement;
                            const suggestion = input.value;
                            if (!suggestion.trim()) return;
                            try {
                                const res = await fetch('/api/textbooks/suggest', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ suggestion, type: 'event' })
                                });
                                if (res.ok) {
                                    alert('Thanks! Your suggestion has been sent to Adeline.');
                                    setShowSuggestForm(false);
                                } else {
                                    alert('Failed to send suggestion. Please try again.');
                                }
                            } catch (err) {
                                console.error(err);
                                alert('Error sending suggestion.');
                            }
                        }}>
                            <textarea
                                name="suggestion"
                                className="w-full h-32 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[var(--forest)] focus:outline-none mb-4"
                                placeholder="I want to learn about..."
                                required
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-[var(--forest)] text-white px-6 py-2 rounded-xl font-bold hover:brightness-110 transition-all"
                                >
                                    Send Suggestion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Panel */}
            {showChat && selectedEvent && (
                <TextbookChat
                    userId={userId}
                    title={selectedEvent.title}
                    context={`Historical Event: ${selectedEvent.title} (${selectedEvent.date_display}, ${selectedEvent.era} era). Mainstream narrative: "${selectedEvent.mainstream_narrative}". Primary sources say: "${selectedEvent.primary_sources}".`}
                    onClose={() => {
                        setShowChat(false);
                        setChatInitialPrompt(null);
                    }}
                    initialPrompt={chatInitialPrompt}
                />
            )}
        </div>
    );
}
