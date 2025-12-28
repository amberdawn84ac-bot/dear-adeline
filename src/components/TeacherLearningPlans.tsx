'use client';

import { useState, useEffect } from 'react';
import { Target, Users, TrendingUp, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface StudentPlan {
    student_id: string;
    student_name: string;
    grade_level: string;
    state: string;
    yearly_goals: any;
    quarters: any[];
    monthly_themes: any[];
    current_week: number;
    current_month: string;
}

interface TeacherLearningPlansProps {
    students: Array<{
        id: string;
        display_name: string;
        grade_level: string;
        state_standards: string;
    }>;
}

export function TeacherLearningPlans({ students }: TeacherLearningPlansProps) {
    const [plans, setPlans] = useState<StudentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

    useEffect(() => {
        fetchAllPlans();
    }, [students]);

    const fetchAllPlans = async () => {
        try {
            const planPromises = students.map(async (student) => {
                const response = await fetch('/api/learning-plan/get', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ studentId: student.id }),
                });
                const data = await response.json();

                // If no plan exists, generate one
                if (!data.plan) {
                    const generateResponse = await fetch('/api/learning-plan/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: student.id,
                            gradeLevel: student.grade_level,
                            state: student.state_standards,
                        }),
                    });
                    const generated = await generateResponse.json();
                    return {
                        student_id: student.id,
                        student_name: student.display_name,
                        grade_level: student.grade_level,
                        state: student.state_standards,
                        ...generated.learningPlan,
                    };
                }

                return {
                    student_id: student.id,
                    student_name: student.display_name,
                    ...data.plan,
                };
            });

            const allPlans = await Promise.all(planPromises);
            setPlans(allPlans.filter(Boolean));
        } catch (error) {
            console.error('Error fetching learning plans:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-[var(--cream-dark)]">
                <div className="flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--sage)] animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-[var(--sage)]/20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[var(--burgundy)] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[var(--forest)]">Student Learning Plans</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--burgundy)]">
                        {plans.length} Students
                    </p>
                </div>
            </div>

            {/* Student List */}
            <div className="space-y-4">
                {plans.map((plan) => (
                    <div
                        key={plan.student_id}
                        className="border-2 border-[var(--cream-dark)] rounded-2xl overflow-hidden hover:border-[var(--sage)] transition-all"
                    >
                        {/* Student Header */}
                        <button
                            onClick={() => setExpandedStudent(expandedStudent === plan.student_id ? null : plan.student_id)}
                            className="w-full p-6 flex items-center justify-between hover:bg-[var(--cream)] transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[var(--sage)]/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-[var(--sage)]">
                                        {plan.student_name?.charAt(0) || '?'}
                                    </span>
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-[var(--forest)]">{plan.student_name}</h3>
                                    <p className="text-xs text-[var(--charcoal-light)]">
                                        {plan.grade_level} • {plan.state}
                                    </p>
                                </div>
                            </div>
                            {expandedStudent === plan.student_id ? (
                                <ChevronUp className="w-5 h-5 text-[var(--charcoal-light)]" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-[var(--charcoal-light)]" />
                            )}
                        </button>

                        {/* Expanded Content */}
                        {expandedStudent === plan.student_id && (
                            <div className="p-6 bg-[var(--cream)]/30 border-t border-[var(--cream-dark)] space-y-6">
                                {/* Yearly Goals */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className="w-5 h-5 text-[var(--burgundy)]" />
                                        <h4 className="font-bold text-[var(--forest)]">Year-End Goals</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(plan.yearly_goals || {}).map(([subject, goals]: any) => (
                                            <div key={subject} className="bg-white rounded-xl p-4">
                                                <div className="text-xs font-black uppercase tracking-widest text-[var(--ochre)] mb-2">
                                                    {subject}
                                                </div>
                                                <ul className="space-y-1">
                                                    {goals.slice(0, 3).map((goal: string, i: number) => (
                                                        <li key={i} className="text-xs text-[var(--charcoal)] flex items-start gap-2">
                                                            <span className="text-[var(--sage)] mt-0.5">•</span>
                                                            <span className="line-clamp-2">{goal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Month Focus */}
                                {plan.monthly_themes && plan.monthly_themes.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Calendar className="w-5 h-5 text-[var(--sage)]" />
                                            <h4 className="font-bold text-[var(--forest)]">Current Month</h4>
                                        </div>
                                        <div className="bg-white rounded-xl p-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(plan.monthly_themes[0] || {})
                                                    .filter(([key]) => key !== 'month' && key !== 'projects')
                                                    .map(([subject, topic]: any) => (
                                                        <div key={subject}>
                                                            <div className="text-xs font-bold text-[var(--charcoal-light)] mb-1">
                                                                {subject}
                                                            </div>
                                                            <p className="text-xs text-[var(--charcoal)]">{topic}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {plans.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 italic">No students assigned yet</p>
                </div>
            )}
        </div>
    );
}
