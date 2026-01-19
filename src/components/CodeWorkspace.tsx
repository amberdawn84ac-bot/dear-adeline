'use client';

import React, { useState } from 'react';

interface CodeWorkspaceProps {
    initialCode: string;
    language: string;
    onCodeRun: (code: string) => void;
}

export function CodeWorkspace({ initialCode, language, onCodeRun }: CodeWorkspaceProps) {
    const [code, setCode] = useState(initialCode);

    return (
        <div className="bg-slate-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col h-full shadow-2xl">
            <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Workshop Terminal — {language}</span>
                </div>
                <button
                    onClick={() => onCodeRun(code)}
                    className="px-4 py-1.5 bg-[#76946a] text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                    Run Logic
                </button>
            </div>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-transparent p-6 text-indigo-300 font-mono text-sm focus:outline-none resize-none selection:bg-[#76946a]/30"
                spellCheck={false}
            />
        </div>
    );
}
