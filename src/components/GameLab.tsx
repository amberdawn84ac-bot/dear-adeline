'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Share2, BookOpen, Sparkles } from 'lucide-react';
import { GameProject } from '@/types/learning';
import { formatTrack } from '@/types/learning';

interface GameLabProps {
    gameProject: GameProject;
    onComplete?: () => void;
    onShare?: () => void;
}

export function GameLab({ gameProject, onComplete, onShare }: GameLabProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasRef.current || !isPlaying) return;

        try {
            setError(null);
            const canvas = canvasRef.current;
            canvas.width = 800;
            canvas.height = 600;

            // Execute the game code in a safe context
            const gameFunction = new Function('canvas', `
        ${gameProject.game_code}
        return runGame(canvas);
      `);

            const cleanup = gameFunction(canvas);
            cleanupRef.current = cleanup;

        } catch (err) {
            console.error('Game execution error:', err);
            setError('Failed to start game. Please try again.');
            setIsPlaying(false);
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [isPlaying, gameProject.game_code]);

    const handleStart = () => {
        setShowInstructions(false);
        setIsPlaying(true);
    };

    const handleReset = () => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 100);
    };

    const handlePause = () => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        setIsPlaying(false);
    };

    return (
        <div className="bg-gradient-to-br from-purple/10 to-blue/10 rounded-3xl p-6 border-2 border-purple/20">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-purple" />
                        <span className="text-xs font-bold text-purple uppercase tracking-wider">
                            Game Lab
                        </span>
                    </div>
                    <h3 className="text-2xl font-heading text-purple mb-2">{gameProject.title}</h3>
                    <p className="text-charcoal/70">{gameProject.description}</p>
                </div>
                {onShare && (
                    <button
                        onClick={onShare}
                        className="p-3 rounded-xl bg-white hover:bg-purple/10 transition-all"
                        title="Share to Community Library"
                    >
                        <Share2 className="w-5 h-5 text-purple" />
                    </button>
                )}
            </div>

            {/* Track Badge */}
            <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple/10 text-purple rounded-full text-sm font-medium">
                    {formatTrack(gameProject.primary_track)}
                </span>
            </div>

            {/* Learning Objectives */}
            <div className="mb-4 p-4 bg-white rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-magenta" />
                    <span className="text-sm font-bold text-magenta">Learning Objectives</span>
                </div>
                <ul className="text-sm text-charcoal/70 space-y-1">
                    {gameProject.learning_objectives.map((obj, i) => (
                        <li key={i}>• {obj}</li>
                    ))}
                </ul>
            </div>

            {/* Game Canvas */}
            <div className="relative bg-charcoal rounded-2xl overflow-hidden mb-4">
                {showInstructions && (
                    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-10">
                        <div className="text-center text-white p-8 max-w-md">
                            <h4 className="text-xl font-bold mb-4">How to Play</h4>
                            <p className="mb-4">{gameProject.instructions}</p>
                            <div className="mb-6 p-3 bg-white/10 rounded-xl">
                                <p className="text-sm font-bold mb-1">Controls</p>
                                <p className="text-sm text-white/80">{gameProject.controls}</p>
                            </div>
                            <button
                                onClick={handleStart}
                                className="px-8 py-3 bg-gradient-to-r from-purple to-magenta rounded-2xl font-bold hover:scale-105 transition-all"
                            >
                                <Play className="w-5 h-5 inline mr-2" />
                                Start Game
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center z-10">
                        <div className="text-center text-red-700 p-8 max-w-md bg-white rounded-2xl">
                            <p className="font-bold mb-2">Oops!</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    className="w-full"
                    style={{ aspectRatio: '4/3' }}
                />
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={isPlaying ? handlePause : handleStart}
                    className="flex-1 py-3 bg-purple text-white rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                    {isPlaying ? (
                        <><Pause className="w-5 h-5" />Pause</>
                    ) : (
                        <><Play className="w-5 h-5" />Play</>
                    )}
                </button>
                <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-white border-2 border-purple text-purple rounded-2xl font-bold hover:bg-purple/5 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                </button>
            </div>

            {/* Concepts Taught */}
            {gameProject.concepts_taught && gameProject.concepts_taught.length > 0 && (
                <div className="mt-4 p-4 bg-blue/10 rounded-2xl border border-blue/20">
                    <p className="text-xs font-bold text-blue uppercase tracking-wider mb-2">Concepts Taught</p>
                    <div className="flex flex-wrap gap-2">
                        {gameProject.concepts_taught.map((concept, i) => (
                            <span key={i} className="px-2 py-1 bg-white text-blue text-xs rounded-full">
                                {concept}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
