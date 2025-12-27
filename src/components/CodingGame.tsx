'use client';

import React, { useState } from 'react';

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

    const runCode = () => {
        setStatus('running');
        setLogs(['> Initializing logic gates...', `> Connecting to ${puzzle.title} Controller...`]);

        setTimeout(() => {
            // If it's a custom puzzle, we might need a more flexible validation
            // or the custom puzzle provides its own validate string/fn
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
                setLogs(prev => [...prev, '> ERROR: Logic mismatch detected.', puzzle.hint]);
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
    };

    return (
        <div className="bg-[#fdfcf9] p-8 rounded-[3rem] border border-slate-100 h-full flex flex-col">
            <div className="mb-8">
                <h3 className="text-2xl font-bold serif text-slate-800">Logic Loop</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Build System Logic</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 flex-1 relative overflow-hidden flex flex-col">
                    <div className="absolute top-6 right-8 flex gap-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Puzzle {puzzle.id}: {puzzle.title}</span>
                    </div>
                    <div className="mb-6 text-indigo-200/50 text-xs italic">
            // Mission: {puzzle.mission}
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full flex-1 bg-transparent text-indigo-300 font-mono text-sm focus:outline-none resize-none selection:bg-[#76946a]/30"
                        spellCheck={false}
                    />

                    <div className="mt-4 border-t border-white/5 pt-6 bg-black/20 -mx-8 -mb-8 p-6">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3">System Logs</p>
                        <div className="space-y-1 min-h-[40px]">
                            {logs.map((log, i) => (
                                <p key={i} className={`font-mono text-[10px] ${log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-[#76946a]' : 'text-slate-400'}`}>{log}</p>
                            ))}
                            {status === 'running' && <div className="w-2 h-2 bg-[#76946a] rounded-full animate-pulse" />}
                        </div>
                    </div>
                </div>

                {status === 'success' && currentPuzzleIndex < PUZZLES.length - 1 ? (
                    <button
                        onClick={nextPuzzle}
                        className="w-full bg-[var(--ochre)] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all"
                    >
                        Next Puzzle Level
                    </button>
                ) : (
                    <button
                        onClick={runCode}
                        disabled={status === 'running' || status === 'success'}
                        className="w-full bg-[#76946a] text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {status === 'running' ? 'Compiling Logic...' : status === 'success' ? 'Mastery Verified' : 'Run Logic Test'}
                    </button>
                )}
            </div>
        </div>
    );
}
