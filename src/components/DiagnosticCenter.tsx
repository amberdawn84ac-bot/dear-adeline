'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Brain } from 'lucide-react';

interface QuestionData {
    track: string;
    question: string;
    options: Record<string, string>;
    correctAnswer: string;
    explanation: string;
    difficulty: number;
}

interface Progress {
    current: number;
    total: number;
}

export const DiagnosticCenter: React.FC = () => {
    const [step, setStep] = useState<'welcome' | 'testing' | 'results'>('welcome');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
    const [progress, setProgress] = useState<Progress>({ current: 0, total: 20 });
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<any>(null);

    const startDiagnostic = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/diagnostic/start', { method: 'POST' });
            const data = await res.json();

            setSessionId(data.sessionId);
            setCurrentQuestion(data.question);
            setProgress(data.progress);
            setStep('testing');
        } catch (error) {
            console.error('Failed to start diagnostic:', error);
            alert('Failed to start diagnostic. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = async (answer: string) => {
        if (!sessionId || !currentQuestion) return;

        setSelectedAnswer(answer);
        setIsLoading(true);

        try {
            const res = await fetch('/api/diagnostic/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    answer,
                    questionData: currentQuestion
                })
            });

            const data = await res.json();

            // Show feedback
            setFeedback({
                correct: data.correct,
                explanation: data.explanation
            });

            // Wait 2 seconds before moving to next question
            setTimeout(async () => {
                if (data.complete) {
                    // Complete diagnostic
                    await completeDiagnostic();
                } else {
                    // Move to next question
                    setCurrentQuestion(data.nextQuestion);
                    setProgress(data.progress);
                    setSelectedAnswer(null);
                    setFeedback(null);
                }
            }, 2000);
        } catch (error) {
            console.error('Failed to submit answer:', error);
            alert('Failed to submit answer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const completeDiagnostic = async () => {
        if (!sessionId) return;

        try {
            const res = await fetch('/api/diagnostic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete', sessionId })
            });

            const data = await res.json();
            setReport(data.report);
            setStep('results');
        } catch (error) {
            console.error('Failed to complete diagnostic:', error);
            alert('Failed to complete diagnostic. Please try again.');
        }
    };

    // Welcome Screen
    if (step === 'welcome') {
        return (
            <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    <div className="card p-12 text-center space-y-8">
                        <div className="w-20 h-20 bg-[var(--sage)]/10 rounded-full flex items-center justify-center mx-auto">
                            <Brain className="w-10 h-10 text-[var(--sage)]" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-[var(--charcoal)] serif">
                                Academic Compass
                            </h1>
                            <p className="text-xl text-[var(--charcoal-light)]">
                                Let's discover where you are in your learning journey
                            </p>
                        </div>

                        <div className="bg-[var(--cream)] p-6 rounded-xl space-y-3 text-left">
                            <p className="text-sm text-[var(--charcoal-light)]">
                                <strong className="text-[var(--charcoal)]">What to expect:</strong>
                            </p>
                            <ul className="text-sm text-[var(--charcoal-light)] space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--sage)] mt-0.5 flex-shrink-0" />
                                    <span>18 questions across 9 learning tracks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--sage)] mt-0.5 flex-shrink-0" />
                                    <span>Questions adapt to your level</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--sage)] mt-0.5 flex-shrink-0" />
                                    <span>Takes about 10-15 minutes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--sage)] mt-0.5 flex-shrink-0" />
                                    <span>Get a personalized 2-week learning plan</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={startDiagnostic}
                            disabled={isLoading}
                            className="btn-primary px-12 py-4 text-lg disabled:opacity-50 flex items-center gap-3 mx-auto"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Starting...
                                </>
                            ) : (
                                <>
                                    Start Assessment
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Testing Screen
    if (step === 'testing' && currentQuestion) {
        const progressPercent = (progress.current / progress.total) * 100;

        return (
            <div className="min-h-screen bg-[var(--cream)] p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Progress Bar */}
                    <div className="card p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-[var(--charcoal)]">
                                Question {progress.current} of {progress.total}
                            </span>
                            <span className="text-xs text-[var(--charcoal-light)]">
                                {Math.round(progressPercent)}% Complete
                            </span>
                        </div>
                        <div className="w-full bg-[var(--cream)] rounded-full h-2">
                            <div
                                className="bg-[var(--sage)] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="card p-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-[var(--sage)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-6 h-6 text-[var(--sage)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--sage)] mb-2">
                                    {currentQuestion.track.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </p>
                                <p className="text-xl font-medium text-[var(--charcoal)] leading-relaxed">
                                    {currentQuestion.question}
                                </p>
                            </div>
                        </div>

                        {/* Answer Options */}
                        <div className="space-y-3">
                            {Object.entries(currentQuestion.options).map(([letter, text]) => (
                                <button
                                    key={letter}
                                    onClick={() => !feedback && submitAnswer(letter)}
                                    disabled={isLoading || feedback !== null}
                                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${selectedAnswer === letter
                                        ? feedback?.correct
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-red-500 bg-red-50'
                                        : 'border-[var(--cream-dark)] hover:border-[var(--sage)] hover:bg-[var(--cream)]'
                                        } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-[var(--cream-dark)] rounded-full flex items-center justify-center font-bold text-sm">
                                            {letter}
                                        </span>
                                        <span className="flex-1">{text}</span>
                                        {selectedAnswer === letter && feedback && (
                                            feedback.correct ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-600" />
                                            )
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Feedback */}
                        {feedback && (
                            <div className={`p-4 rounded-xl ${feedback.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <p className={`text-sm font-medium ${feedback.correct ? 'text-green-800' : 'text-red-800'}`}>
                                    {feedback.correct ? '✓ Correct!' : '✗ Not quite'}
                                </p>
                                <p className="text-sm text-[var(--charcoal-light)] mt-1">
                                    {feedback.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Results Screen
    if (step === 'results' && report) {
        return (
            <div className="min-h-screen bg-[var(--cream)] p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="card p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-[var(--charcoal)] serif">
                            Assessment Complete!
                        </h1>
                        <p className="text-xl text-[var(--charcoal-light)]">
                            Overall Level: <strong className="text-[var(--charcoal)]">{report.overallLevel}</strong>
                        </p>
                    </div>

                    {/* Track Levels */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-2xl font-bold text-[var(--charcoal)] serif">Your Learning Profile</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {report.subjectAssessments?.map((assessment: any, i: number) => (
                                <div key={i} className="p-4 bg-[var(--cream)] rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-[var(--charcoal)]">{assessment.track}</span>
                                        <span className="text-sm font-bold text-[var(--sage)]">{assessment.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-[var(--cream-dark)] rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${assessment.confidence === 'high' ? 'bg-green-500' :
                                                    assessment.confidence === 'medium' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}
                                                style={{ width: `${(assessment.correct / assessment.total) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-[var(--charcoal-light)]">
                                            {assessment.correct}/{assessment.total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Growth Areas */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card p-6 space-y-4">
                            <h3 className="text-xl font-bold text-[var(--charcoal)] serif">💪 Your Strengths</h3>
                            <ul className="space-y-2">
                                {report.strengths?.map((strength: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-[var(--charcoal-light)]">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card p-6 space-y-4">
                            <h3 className="text-xl font-bold text-[var(--charcoal)] serif">🌱 Growth Opportunities</h3>
                            <ul className="space-y-2">
                                {report.growthAreas?.map((area: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-[var(--charcoal-light)]">
                                        <Sparkles className="w-4 h-4 text-[var(--sage)]" />
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 2-Week Plan */}
                    <div className="card p-8 space-y-4">
                        <h2 className="text-2xl font-bold text-[var(--charcoal)] serif">Your 2-Week Learning Plan</h2>
                        <div className="prose prose-sm max-w-none text-[var(--charcoal-light)] whitespace-pre-wrap">
                            {report.twoWeekPlan}
                        </div>
                    </div>

                    <div className="text-center">
                        <a href="/dashboard" className="btn-primary px-12 py-4 text-lg inline-flex items-center gap-3">
                            Start Learning
                            <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
