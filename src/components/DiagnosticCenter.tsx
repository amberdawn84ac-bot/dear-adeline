import React, { useState } from 'react';

export const DiagnosticCenter: React.FC = () => {
    const [step, setStep] = useState<'welcome' | 'testing' | 'evaluating' | 'report'>('welcome');

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
                        onClick={() => alert('Diagnostic system will be fully integrated soon! For now, chat with Adeline to assess your knowledge.')}
                        className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 mx-auto"
                    >
                        Begin Diagnostic (Coming Soon)
                    </button>
                </div>
            )}

            <style>{`
        .animate-fade-in { animation: fade 0.6s ease-out forwards; }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
        </div>
    );
};
