'use client';

import React from 'react';

interface WorksheetSection {
    type: 'text' | 'question';
    content: string;
}

interface WorksheetData {
    title: string;
    sections: WorksheetSection[];
}

interface DigitalWorksheetProps {
    data: WorksheetData;
    onSubmit: (answers: Record<string, string>) => void;
}

export function DigitalWorksheet({ data, onSubmit }: DigitalWorksheetProps) {
    const [answers, setAnswers] = React.useState<Record<string, string>>({});

    const handleChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="h-full bg-white rounded-[2rem] border-2 border-[var(--forest)]/10 shadow-inner flex flex-col overflow-hidden text-[var(--burgundy)]">
            <div className="p-8 border-b-2 border-[var(--cream-dark)] flex justify-between items-center bg-[var(--cream)]/30">
                <div>
                    <h3 className="text-2xl font-bold serif text-[var(--forest)]">{data.title || 'Discovery Worksheet'}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--forest)]/40 mt-1">Guided Structured Learning</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--forest)]/5 flex items-center justify-center text-2xl shadow-sm">📝</div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                {data.sections?.map((section, idx) => (
                    <div key={idx} className="animate-in fade-in slide-in-from-bottom-4">
                        {section.type === 'text' ? (
                            <div className="prose prose-slate max-w-none">
                                <p className="text-[15px] leading-relaxed text-slate-600 font-medium bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                    {section.content}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="block text-[13px] font-bold text-[var(--forest)] ml-4 uppercase tracking-widest">
                                    {section.content}
                                </label>
                                <textarea
                                    value={answers[idx] || ''}
                                    onChange={(e) => handleChange(idx.toString(), e.target.value)}
                                    className="w-full p-6 bg-white border-2 border-[var(--cream-dark)] rounded-[2rem] focus:outline-none focus:border-[var(--ochre)] transition-all text-sm font-medium shadow-sm placeholder:text-slate-200"
                                    placeholder="Share your thoughts here..."
                                    rows={3}
                                />
                            </div>
                        )}
                    </div>
                ))}

                <div className="pt-6 border-t border-[var(--cream-dark)]">
                    <button
                        onClick={() => onSubmit(answers)}
                        className="w-full bg-[var(--burgundy)] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:brightness-110 transition-all shadow-xl active:scale-95"
                    >
                        Share Discovery with Adeline
                    </button>
                </div>
            </div>
        </div>
    );
}
