'use client';

import { useState } from 'react';
import { Printer, CheckCircle2, Lightbulb, Package, Target } from 'lucide-react';

interface ProjectProps {
    title: string;
    materials: string[];
    steps: string[];
    learningGoals: string[];
}

export function Project({ title, materials, steps, learningGoals }: ProjectProps) {
    const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

    const toggleStep = (index: number) => {
        const newChecked = new Set(checkedSteps);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedSteps(newChecked);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="h-full bg-white rounded-3xl overflow-y-auto">
            {/* Header - Print friendly */}
            <div className="bg-gradient-to-r from-[var(--ochre)] to-[var(--terracotta)] text-white p-8 print:bg-white print:text-black print:border-b-4 print:border-[var(--ochre)]">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-8 h-8" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-80">Hands-On Project</span>
                        </div>
                        <h2 className="text-3xl font-bold serif leading-tight">{title}</h2>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-[var(--ochre)] rounded-2xl font-bold hover:scale-105 transition-all shadow-lg print:hidden"
                    >
                        <Printer className="w-5 h-5" />
                        Print
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Learning Goals */}
                <section className="print:break-inside-avoid">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--sage-light)] flex items-center justify-center">
                            <Target className="w-5 h-5 text-[var(--sage-dark)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--forest)]">What You'll Learn</h3>
                    </div>
                    <ul className="space-y-2 ml-13">
                        {learningGoals.map((goal, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-[var(--sage)] mt-2 flex-shrink-0" />
                                <span className="text-[var(--charcoal)] leading-relaxed">{goal}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Materials */}
                <section className="print:break-inside-avoid">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--ochre-light)] flex items-center justify-center">
                            <Package className="w-5 h-5 text-[var(--ochre)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--forest)]">Materials Needed</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-13">
                        {materials.map((material, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-[var(--cream)] rounded-xl border-2 border-[var(--cream-dark)]">
                                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-[var(--ochre)]">{index + 1}</span>
                                </div>
                                <span className="text-sm font-medium text-[var(--charcoal)]">{material}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Steps */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--forest)]/10 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-[var(--forest)]" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--forest)]">Step-by-Step Instructions</h3>
                    </div>
                    <div className="space-y-4 ml-13">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className="print:break-inside-avoid group"
                            >
                                <div className="flex items-start gap-4 p-6 bg-white border-2 border-[var(--cream-dark)] rounded-2xl hover:border-[var(--forest)] transition-all">
                                    <button
                                        onClick={() => toggleStep(index)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all print:hidden ${checkedSteps.has(index)
                                                ? 'bg-[var(--forest)] border-[var(--forest)]'
                                                : 'border-[var(--cream-dark)] hover:border-[var(--forest)]'
                                            }`}
                                    >
                                        {checkedSteps.has(index) && <CheckCircle2 className="w-5 h-5 text-white" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-black uppercase tracking-widest text-[var(--forest)]/50">
                                                Step {index + 1}
                                            </span>
                                        </div>
                                        <p className={`text-[var(--charcoal)] leading-relaxed ${checkedSteps.has(index) ? 'line-through opacity-50' : ''
                                            }`}>
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <div className="mt-12 p-6 bg-[var(--cream)] rounded-2xl border-2 border-[var(--cream-dark)] text-center print:break-inside-avoid">
                    <p className="text-sm font-medium text-[var(--charcoal-light)] italic">
                        📸 Take photos of your completed project and share them with Adeline!
                    </p>
                </div>
            </div>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        margin: 1in;
                    }
                }
            `}</style>
        </div>
    );
}
