'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Trophy, Gamepad2, Keyboard, Code } from 'lucide-react';
import { TypingGame } from './TypingGame';
import { CodingGame } from './CodingGame';

interface GameCenterProps {
    type: 'pacman' | 'typing' | 'coding' | string;
    onClose: () => void;
    gameData?: any;
}

export function GameCenter({ type, onClose, gameData }: GameCenterProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Web Audio API
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    // Play sound effect
    const playSound = (frequency: number, duration: number = 0.1, type: OscillatorType = 'sine') => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    };

    // Victory sound
    const playVictorySound = () => {
        playSound(523, 0.15); // C
        setTimeout(() => playSound(659, 0.15), 150); // E
        setTimeout(() => playSound(784, 0.3), 300); // G
    };

    // Score sound
    const playScoreSound = () => {
        playSound(880, 0.05, 'square');
    };

    useEffect(() => {
        if (type === 'pacman') {
            initPacman();
        }
    }, [type]);



    const initPacman = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        // Game state
        const tileSize = 20;
        const player = { x: tileSize, y: tileSize, dx: 0, dy: 0, nextDx: 0, nextDy: 0 };
        const dots: { x: number, y: number }[] = [];

        // Simple map
        for (let i = 1; i < canvas.width / tileSize - 1; i++) {
            for (let j = 1; j < canvas.height / tileSize - 1; j++) {
                if (Math.random() > 0.1) dots.push({ x: i * tileSize + tileSize / 2, y: j * tileSize + tileSize / 2 });
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') { player.nextDx = 0; player.nextDy = -2; }
            if (e.key === 'ArrowDown') { player.nextDx = 0; player.nextDy = 2; }
            if (e.key === 'ArrowLeft') { player.nextDx = -2; player.nextDy = 0; }
            if (e.key === 'ArrowRight') { player.nextDx = 2; player.nextDy = 0; }
        };

        window.addEventListener('keydown', handleKeyDown);

        const draw = () => {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Dots
            ctx.fillStyle = '#ffd700';
            dots.forEach((dot, index) => {
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Collision with player
                const dist = Math.hypot(player.x + tileSize / 2 - dot.x, player.y + tileSize / 2 - dot.y);
                if (dist < 10) {
                    dots.splice(index, 1);
                    playScoreSound();
                    setScore(s => s + 10);
                }
            });

            // Update Player
            player.dx = player.nextDx;
            player.dy = player.nextDy;
            player.x += player.dx;
            player.y += player.dy;

            // Bounds
            if (player.x < 0) player.x = canvas.width;
            if (player.x > canvas.width) player.x = 0;
            if (player.y < 0) player.y = canvas.height;
            if (player.y > canvas.height) player.y = 0;

            // Draw Player (Pacman)
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(player.x + tileSize / 2, player.y + tileSize / 2, tileSize / 2, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.lineTo(player.x + tileSize / 2, player.y + tileSize / 2);
            ctx.fill();

            if (dots.length === 0) {
                playVictorySound();
                setGameOver(true);
                return;
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(animationId);
        };
    };

    const getGameIcon = () => {
        if (type === 'typing') return <Keyboard className="w-8 h-8 text-blue-400" />;
        if (type === 'coding') return <Code className="w-8 h-8 text-green-400" />;
        return <Gamepad2 className="w-8 h-8 text-yellow-400" />;
    };

    const getGameTitle = () => {
        if (type === 'typing') return 'Typing Practice';
        if (type === 'coding') return 'Code Challenge';
        return 'Pac-Learning';
    };

    if (type === 'typing') {
        return (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl h-[600px] relative">
                    <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                    <TypingGame
                        onComplete={(wpm) => {
                            setScore(wpm);
                            setGameOver(true);
                        }}
                        customText={gameData?.text}
                        customSource={gameData?.source}
                        customCategory={gameData?.category}
                    />
                </div>
            </div>
        );
    }

    if (type === 'coding') {
        return (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl h-[600px] relative">
                    <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 transition-colors">
                        <X className="w-8 h-8" />
                    </button>
                    <CodingGame
                        onComplete={(score) => {
                            setScore(score);
                            setGameOver(true);
                        }}
                        customPuzzles={gameData?.puzzles}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-square max-w-[400px] mx-auto bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className={`w-full h-full ${type !== 'pacman' ? 'hidden' : ''}`}
            />

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm font-bold">{score}</span>
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {gameOver && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center mb-4">
                        {getGameIcon()}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Great Job!</h3>
                    <p className="text-slate-300 mb-2">You mastered {getGameTitle()}!</p>
                    <p className="text-sm text-slate-400 mb-6">Final Score: {score}</p>
                    <button
                        onClick={onClose}
                        className="btn-primary w-full max-w-[200px]"
                    >
                        Back to Lesson
                    </button>
                </div>
            )}

            {!gameOver && score === 0 && type === 'pacman' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="bg-black/50 px-4 py-2 rounded-lg border border-white/10 animate-bounce">
                        <p className="text-white text-xs font-medium">Use Arrow Keys to Move!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
