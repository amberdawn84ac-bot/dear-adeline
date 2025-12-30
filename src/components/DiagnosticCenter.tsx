'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Question {
    id: string;
    subject: string;
    text: string;
}

interface Answer {
    questionId: string;
    subject: string;
    questionText: string;
    answerText: string;
}

interface Assessment {
    subject: string;
    estimatedLevel: string;
    strengths: string[];
    gaps: string[];
}

interface DiagnosticResult {
    assessments: Assessment[];
    twoWeekPlan: string;
}

export const DiagnosticCenter: React.FC = () => {
    const [step, setStep] = useState<'welcome' | 'testing' | 'evaluating' | 'report'>('welcome');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const startTest = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/diagnostic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate_questions' }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error('No questions received from API');
            }

            setQuestions(data.questions);
            setStep('testing');
        } catch (e) {
            console.error('Error starting diagnostic:', e);
            alert('Failed to generate questions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const nextQuestion = () => {
        const newAnswers = [
            ...answers,
            {
                questionId: questions[currentIdx].id,
                subject: questions[currentIdx].subject,
                questionText: questions[currentIdx].text,
                answerText: currentAnswer
            }
        ];
        setAnswers(newAnswers);
        setCurrentAnswer('');

        if (currentIdx < questions.length - 1) {
            setCurrentIdx(prev => prev + 1);
        } else {
            finishTest(newAnswers);
        }
    };

    const finishTest = async (finalAnswers: Answer[]) => {
        setStep('evaluating');
        try {
            const response = await fetch('/api/diagnostic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'evaluate', answers: finalAnswers }),
            });

            const evaluation = await response.json();
            setResult(evaluation);
            setStep('report');
        } catch (e) {
            console.error(e);
            alert('Failed to evaluate responses. Please try again.');
        }
    };

    const progress = (questions && questions.length > 0) ? ((currentIdx + 1) / questions.length) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {step === 'welcome' && (
                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl text-center space-y-8 animate-fade-in">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mx-auto">🔍</div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-serif text-slate-900">Academic Compass</h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                            "To know where we are going, we must first understand where we stand."
                            Let's take 5-10 minutes to observe your current mastery levels across different subjects.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-100 max-w-md mx-auto">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-3">Diagnostic Focus:</h4>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">🟢 Math Reasoning</li>
                            <li className="flex items-center gap-2">🟢 Literary Analysis</li>
                            <li className="flex items-center gap-2">🟢 Science Logic</li>
                            <li className="flex items-center gap-2">🟢 Expressive Writing</li>
                        </ul>
                    </div>
                    <button
                        onClick={startTest}
                        disabled={isLoading}
                        className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> Preparing Assessment...</>
                        ) : (
                            'Begin Diagnostic'
                        )}
                    </button>
                </div>
            )}

            {step === 'testing' && questions[currentIdx] && (
                <div className="space-y-8 animate-slide-up">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-8">
                        <div className="flex justify-between items-center">
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">
                                {questions[currentIdx].subject}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{currentIdx + 1} of {questions.length}</span>
                            </div>
                        </div>

                        <h3 className="text-3xl font-serif text-slate-800 leading-snug">
                            {questions[currentIdx].text}
                        </h3>

                        <textarea
                            value={currentAnswer}
                            onChange={e => setCurrentAnswer(e.target.value)}
                            autoFocus
                            placeholder="Share your thoughts or work through the problem here..."
                            className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[200px] text-lg font-serif"
                        />

                        <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-400 font-serif italic">Take your time. There are no wrong steps in learning.</p>
                            <button
                                onClick={nextQuestion}
                                disabled={!currentAnswer.trim()}
                                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                            >
                                {currentIdx < questions.length - 1 ? 'Next Question →' : 'Finish Assessment →'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 'evaluating' && (
                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl text-center space-y-8">
                    <Loader2 className="w-20 h-20 text-indigo-600 mx-auto animate-spin" />
                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif text-slate-900">Reviewing your patterns...</h2>
                        <p className="text-slate-500">Adeline is discerning your current levels and identifying paths for growth.</p>
                    </div>
                </div>
            )}

            {step === 'report' && result && (
                <div className="space-y-8 animate-fade-in">
                    <header className="bg-slate-900 text-white p-12 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
                        <div className="z-10 text-center md:text-left space-y-2">
                            <h2 className="text-4xl font-serif">Diagnostic Summary</h2>
                            <p className="text-slate-400">Captured on {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="z-10 flex gap-6">
                            {result.assessments.map(a => (
                                <div key={a.subject} className="text-center group">
                                    <div className="text-3xl font-bold text-indigo-400">{a.estimatedLevel}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover:text-slate-300 transition-colors">{a.subject}</div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-600 rounded-full blur-[100px] opacity-10"></div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl text-slate-900">Subject Mastery Observed</h3>
                            <div className="space-y-4">
                                {result.assessments.map(a => (
                                    <div key={a.subject} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest">{a.subject}</h4>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">{a.estimatedLevel}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-green-600 uppercase">Strengths</span>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {a.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[10px] font-bold text-amber-600 uppercase">Gaps</span>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    {a.gaps.map((g, i) => <li key={i}>• {g}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="font-serif text-2xl text-slate-900">Your 2-Week Growth Plan</h3>
                            <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10 prose prose-invert prose-sm max-w-none text-lg leading-relaxed whitespace-pre-wrap">
                                    {result.twoWeekPlan}
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/20 relative z-10 flex justify-between items-center">
                                    <button
                                        onClick={() => {
                                            setStep('welcome');
                                            setQuestions([]);
                                            setCurrentIdx(0);
                                            setAnswers([]);
                                            setCurrentAnswer('');
                                            setResult(null);
                                        }}
                                        className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest"
                                    >
                                        Retake in 2 weeks
                                    </button>
                                    <button
                                        onClick={() => alert('Plan saved! Check your dashboard for progress tracking.')}
                                        className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50"
                                    >
                                        Commit to Plan
                                    </button>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <span className="text-9xl">📖</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .animate-fade-in { animation: fade 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide 0.6s ease-out forwards; }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
};
