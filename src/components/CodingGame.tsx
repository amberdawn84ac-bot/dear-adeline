'use client';

import React, { useState } from 'react';
import { Lightbulb, BookOpen, AlertCircle, X, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CodingGameProps {
    onComplete: (score: number) => void;
    customPuzzles?: any[];
}

const DEFAULT_PUZZLES = [
    {
        id: "01",
        title: "Smart Light",
        mission: "Turn the light on if there is motion, otherwise turn it off.",
        initialCode: 'if (sensor === "motion") {\n  light = "on";\n} else {\n  light = "off";\n}',
        validate: (code: string) => {
            const normalized = code.replace(/\s/g, '').toLowerCase();
            return normalized.includes('sensor==="motion"') && normalized.includes('light="on"') && (normalized.includes('else') && normalized.includes('light="off"'));
        },
        hint: "Tip: Ensure you have an 'else' block to turn the light 'off'."
    },
    {
        id: "02",
        title: "Water Pump",
        mission: "Activate the pump only if moisture is below 30 and pump is not already running.",
        initialCode: 'if (moisture < 30 && !pumpRunning) {\n  pump = "start";\n}',
        validate: (code: string) => {
            const normalized = code.replace(/\s/g, '').toLowerCase();
            return normalized.includes('moisture<30') && (normalized.includes('!pumprunning') || normalized.includes('pumprunning===false')) && normalized.includes('pump="start"');
        },
        hint: "Tip: Use '&&' for multiple conditions and '!' for negation."
    }
];

export function CodingGame({ onComplete, customPuzzles }: CodingGameProps) {
    const puzzles = customPuzzles || DEFAULT_PUZZLES;
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const puzzle = puzzles[currentPuzzleIndex];
    const [code, setCode] = useState(puzzle.initialCode);
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'fail'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [showDocs, setShowDocs] = useState(false);

    const runCode = () => {
        setStatus('running');
        setLogs(['> Initializing logic gates...', `> Connecting to ${puzzle.title} Controller...`]);
        setShowHint(false);

        setTimeout(() => {
            const isCorrect = typeof puzzle.validate === 'function'
                ? puzzle.validate(code)
                : code.replace(/\s/g, '').toLowerCase().includes(puzzle.validate.toLowerCase());

            if (isCorrect) {
                setLogs(prev => [...prev, '> Logic verified: System operational.', '> SUCCESS: Mission accomplished.']);
                setStatus('success');
                if (currentPuzzleIndex === puzzles.length - 1) {
                    onComplete(100);
                }
            } else {
                setLogs(prev => [...prev, '> ERROR: Logic mismatch detected.', '> Analyzing failure pattern...']);
                setStatus('fail');
            }
        }, 1500);
    };

    const nextPuzzle = () => {
        const nextIndex = currentPuzzleIndex + 1;
        setCurrentPuzzleIndex(nextIndex);
        setCode(puzzles[nextIndex].initialCode);
        setStatus('idle');
        setLogs([]);
        setShowHint(false);
    };

    return (
        <div className="bg-[#fdfcf9] p-8 rounded-[3rem] border border-slate-100 h-full flex flex-col md:flex-row gap-6">
            {/* Main Game Area */}
            <div className="flex-1 flex flex-col h-full">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-bold serif text-slate-800">Logic Loop</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Build System Logic</p>
                    </div>
                    <button
                        onClick={() => setShowDocs(!showDocs)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <BookOpen className="w-4 h-4" />
                        {showDocs ? 'Hide Reference' : 'Reference Manual'}
                    </button>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 flex-1 relative overflow-hidden flex flex-col">
                        <div className="absolute top-6 right-8 flex gap-2">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Puzzle {puzzle.id}: {puzzle.title}</span>
                        </div>
                        <div className="mb-6 text-indigo-200/50 text-xs italic font-mono border-l-2 border-indigo-500/30 pl-3">
                            // Mission: {puzzle.mission}
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full flex-1 bg-transparent text-indigo-300 font-mono text-sm focus:outline-none resize-none selection:bg-[#76946a]/30"
                            spellCheck={false}
                        />

                        {/* Logs Panel */}
                        <div className="mt-4 border-t border-white/5 pt-6 bg-black/20 -mx-8 -mb-8 p-6">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">System Logs</p>
                                {status === 'fail' && !showHint && (
                                    <button
                                        onClick={() => setShowHint(true)}
                                        className="text-[10px] font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1 transition-colors animate-pulse"
                                    >
                                        <Lightbulb className="w-3 h-3" />
                                        Need a hint?
                                    </button>
                                )}
                            </div>

                            <div className="space-y-1 min-h-[60px] max-h-[100px] overflow-y-auto">
                                {logs.map((log, i) => (
                                    <p key={i} className={`font-mono text-[10px] ${log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-[#76946a]' : 'text-slate-400'}`}>
                                        {log}
                                    </p>
                                ))}
                                {showHint && (
                                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <p className="text-yellow-500 text-[10px] font-mono flex gap-2">
                                            <Lightbulb className="w-3 h-3 flex-shrink-0" />
                                            {puzzle.hint}
                                        </p>
                                    </div>
                                )}
                                {status === 'running' && <div className="w-2 h-2 bg-[#76946a] rounded-full animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {status === 'success' && currentPuzzleIndex < puzzles.length - 1 ? (
                        <button
                            onClick={nextPuzzle}
                            className="w-full bg-[var(--ochre)] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Next Puzzle Level <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={runCode}
                            disabled={status === 'running' || status === 'success'}
                            className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50
                                ${status === 'success' ? 'bg-[#76946a] text-white' : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'}`}
                        >
                            {status === 'running' ? (
                                <>Compiling Logic...</>
                            ) : status === 'success' ? (
                                <><CheckCircle2 className="w-4 h-4" /> Mastery Verified</>
                            ) : (
                                'Run Logic Test'
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Reference Panel (Desktop Sidebar) */}
            {showDocs && (
                <div className="w-full md:w-64 bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-lg animate-in slide-in-from-right-10 overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 text-sm">Reference</h4>
                        <button onClick={() => setShowDocs(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conditions</p>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-600">
                                <div className="mb-2">
                                    <span className="text-purple-600">if</span> (condition) {'{'}
                                    <br />&nbsp;&nbsp;// code
                                    <br />{'}'} <span className="text-purple-600">else</span> {'{'}
                                    <br />&nbsp;&nbsp;// otherwise
                                    <br />{'}'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Comparison</p>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-600 space-y-1">
                                <p><span className="text-blue-600">===</span> : Equals</p>
                                <p><span className="text-blue-600">!==</span> : Not Equals</p>
                                <p><span className="text-blue-600">&lt;</span> : Less than</p>
                                <p><span className="text-blue-600">&gt;</span> : Greater than</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logic</p>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-600 space-y-1">
                                <p><span className="text-orange-500">&&</span> : AND (both true)</p>
                                <p><span className="text-orange-500">||</span> : OR (one true)</p>
                                <p><span className="text-orange-500">!</span> : NOT (inverse)</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
