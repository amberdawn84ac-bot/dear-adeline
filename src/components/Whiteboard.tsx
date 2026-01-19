'use client';

import React, { useRef, useState, useEffect } from 'react';

interface WhiteboardProps {
    onSave: (dataUrl: string) => void;
    initialData?: string;
    animationData?: string; // JSON path data
}

export function Whiteboard({ onSave, initialData, animationData }: WhiteboardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [color, setColor] = useState('#2F4731');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;

        if (initialData) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = initialData;
        }
    }, [initialData]);

    useEffect(() => {
        if (animationData) {
            try {
                const parsed = JSON.parse(animationData);
                const paths = Array.isArray(parsed) ? parsed : [parsed];
                animatePaths(paths);
            } catch (e) {
                console.warn("Invalid animation data", e);
            }
        }
    }, [animationData]);

    const animatePaths = async (paths: any[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsAnimating(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const path of paths) {
            ctx.beginPath();
            ctx.strokeStyle = path.color || '#2F4731';
            if (path.points && path.points.length > 0) {
                ctx.moveTo(path.points[0].x, path.points[0].y);

                for (let i = 1; i < path.points.length; i++) {
                    const p = path.points[i];
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                    await new Promise(r => setTimeout(r, 10)); // Slow draw for effect
                }
            }
        }
        setIsAnimating(false);
        onSave(canvas.toDataURL());
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (isAnimating) return;
        setIsDrawing(true);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) onSave(canvas.toDataURL());
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current || isAnimating) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.strokeStyle = color;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full relative">
            {isAnimating && (
                <div className="absolute inset-0 bg-[var(--forest)]/10 flex items-center justify-center z-10 cursor-wait backdrop-blur-[2px]">
                    <div className="bg-white px-6 py-3 rounded-full shadow-2xl border border-[var(--forest)]/20 flex items-center gap-3">
                        <div className="w-2 h-2 bg-[var(--forest)] rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--forest)]">Adeline is illustrating...</span>
                    </div>
                </div>
            )}
            <div className="p-3 bg-[var(--cream)] border-b flex justify-between items-center">
                <div className="flex gap-2">
                    {['#2F4731', '#BD6809', '#3D1419', '#1E1E1E'].map(c => (
                        <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
                <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0, 0, 800, 500)} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors">Clear Plate</button>
            </div>
            <canvas ref={canvasRef} width={800} height={500} onMouseDown={startDrawing} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={stopDrawing} onTouchMove={draw} className="flex-1 w-full touch-none cursor-crosshair bg-[var(--cream)]/30" />
        </div>
    );
}
