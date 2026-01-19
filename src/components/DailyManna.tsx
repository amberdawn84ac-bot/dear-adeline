'use client';

import { useEffect, useState } from 'react';
import { Scroll, FlaskConical, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DailyTruth {
    id: string;
    topic: string;
    title: string;
    content: string;
    original_text: string | null;
    translation_notes: string | null;
}

const topicIcons: Record<string, typeof BookOpen> = {
    Biblical: Scroll,
    History: BookOpen,
    Science: FlaskConical,
};

const topicColors: Record<string, string> = {
    Biblical: 'text-amber-800',
    History: 'text-amber-700',
    Science: 'text-amber-900',
};

export default function DailyManna() {
    const [truth, setTruth] = useState<DailyTruth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRandomTruth() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('daily_truths')
                    .select('*')
                    .limit(100); // Get a batch to randomize from

                if (error) {
                    console.error('Error fetching truth:', error);
                    setLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    // Pick a random truth from the results
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setTruth(data[randomIndex]);
                }
            } catch (error) {
                console.error('Error in fetchRandomTruth:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRandomTruth();
    }, []);

    if (loading) {
        return (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 font-serif">
                <div className="flex items-center gap-3 mb-4">
                    <Scroll className="w-5 h-5 text-amber-700" />
                    <h3 className="font-bold text-amber-800 text-lg">Daily Manna</h3>
                </div>
                <p className="text-amber-600 italic">Loading truth...</p>
            </div>
        );
    }

    if (!truth) {
        return null;
    }

    const Icon = topicIcons[truth.topic] || BookOpen;
    const topicColor = topicColors[truth.topic] || 'text-amber-800';

    return (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 font-serif shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-5 h-5 ${topicColor}`} />
                <h3 className={`font-bold ${topicColor} text-lg`}>Daily Manna</h3>
                <span className="text-xs text-amber-600 uppercase tracking-wider ml-auto">
                    {truth.topic}
                </span>
            </div>

            <h4 className="font-bold text-amber-900 text-xl mb-3">{truth.title}</h4>

            {truth.original_text && (
                <div className="bg-stone-800 text-white p-4 rounded-lg mb-4 font-mono text-center">
                    <p className="text-lg font-semibold">{truth.original_text}</p>
                    {truth.translation_notes && (
                        <p className="text-sm text-stone-300 mt-2 italic">
                            {truth.translation_notes}
                        </p>
                    )}
                </div>
            )}

            <p className="text-amber-900 leading-relaxed text-base">{truth.content}</p>
        </div>
    );
}
