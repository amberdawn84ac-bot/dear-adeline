'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Share2, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { GameProject } from '@/types/learning';
import { formatTrack } from '@/types/learning';

interface GameLabProps {
    gameProject?: GameProject;
    onComplete?: () => void;
    onShare?: () => void;
    onBack?: () => void;
}

export function GameLab({ gameProject: initialGameProject, onComplete, onShare, onBack }: GameLabProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [gameProject, setGameProject] = useState<GameProject | null>(initialGameProject || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Auto-generate game from pending topic on mount
    useEffect(() => {
        const pendingTopic = localStorage.getItem('pendingGameTopic');
        const pendingTrack = localStorage.getItem('pendingGameTrack');
        const pendingDifficulty = localStorage.getItem('pendingGameDifficulty');
        const pendingGameType = localStorage.getItem('pendingGameType');

        if (pendingTopic && !gameProject) {
            setIsGenerating(true);

            // Call API to generate game
            fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    concept: pendingTopic,
                    track: pendingTrack || 'creation_science',
                    difficulty: pendingDifficulty || 'beginner',
                    game_type: pendingGameType || 'educational',
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.game) {
                        setGameProject(data.game);
                        setShowInstructions(true);
                    } else {
                        setError('Failed to generate game');
                    }
                })
                .catch(err => {
                    console.error('Game generation error:', err);
                    setError('Failed to generate game. Please try again.');
                })
                .finally(() => {
                    setIsGenerating(false);
                    // Clear pending topic
                    localStorage.removeItem('pendingGameTopic');
                    localStorage.removeItem('pendingGameTrack');
                    localStorage.removeItem('pendingGameDifficulty');
                    localStorage.removeItem('pendingGameType');
                });
        }
    }, [gameProject]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    // Execute game code when playing
    useEffect(() => {
        if (!canvasRef.current || !isPlaying || !gameProject) return;

        // Cleanup previous game instance
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        try {
            setError(null);
            const canvas = canvasRef.current;
            canvas.width = 800;
            canvas.height = 600;

            // Clear canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }

            // Create a safe execution context with proper cleanup
            const executeGameCode = () => {
                try {
                    // Wrap the game code to ensure it returns a cleanup function
                    const wrappedCode = `
            (function(canvas) {
              ${gameProject.game_code}
              
              // Ensure runGame is called and returns cleanup
              if (typeof runGame === 'function') {
                return runGame(canvas);
              } else {
                throw new Error('runGame function not found in game code');
              }
            })
          `;

                    const gameFunction = new Function('canvas', `return ${wrappedCode}`);
                    const cleanup = gameFunction()(canvas);

                    if (typeof cleanup === 'function') {
                        cleanupRef.current = cleanup;
                    }
                } catch (err) {
                    console.error('Game execution error:', err);
                    throw err;
                }
            };

            executeGameCode();

        } catch (err) {
            console.error('Game execution error:', err);
            setError('Failed to start game. The game code may have an error.');
            setIsPlaying(false);
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [isPlaying, gameProject]);

    const handleStart = () => {
        setShowInstructions(false);
        setIsPlaying(true);
    };

    const handleReset = () => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 100);
    };

    const handlePause = () => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsPlaying(false);
    };

    const handleStop = () => {
        handlePause();
        setShowInstructions(true);
    };

    if (isGenerating) {
        return (
            <div className="bg-gradient-to-br from-purple/10 to-blue/10 rounded-3xl p-12 border-2 border-purple/20">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-purple mx-auto mb-4 animate-spin" />
                    <h3 className="text-2xl font-heading text-purple mb-2">Architecting Your Learning Simulation...</h3>
                    <p className="text-charcoal/70">Adeline is crafting a custom educational game just for you!</p>
                </div>
            </div>
        );
    }

    if (!gameProject) {
        return (
            <div className="bg-gradient-to-br from-purple/10 to-blue/10 rounded-3xl p-12 border-2 border-purple/20">
                <div className="text-center">
                    <Sparkles className="w-16 h-16 text-purple mx-auto mb-4" />
                    <h3 className="text-2xl font-heading text-purple mb-2">No Game Loaded</h3>
                    <p className="text-charcoal/70 mb-6">Ask Adeline to create a game for you in the chat!</p>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-6 py-3 bg-purple text-white rounded-2xl font-bold hover:scale-105 transition-all"
                        >
                            Back to Chat
                        </button>
                    )}
                </div>
            </div>
        );
    }

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
                <div className="flex gap-2">
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="p-3 rounded-xl bg-white hover:bg-purple/10 transition-all"
                            title="Share to Community Library"
                        >
                            <Share2 className="w-5 h-5 text-purple" />
                        </button>
                    )}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-purple/10 transition-all text-sm font-medium text-purple"
                        >
                            Back to Chat
                        </button>
                    )}
                </div>
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
                            <p className="text-sm mb-4">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                            >
                                Dismiss
                            </button>
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
