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
        } else if (type === 'typing') {
            initTyping();
        } else if (type === 'coding') {
            initCoding();
        }
    }, [type]);

    const initTyping = () => {
        const typingWords = [
            'adamah', 'tsemach', 'righteousness', 'stewardship', 'justice',
            'greenhouse', 'community', 'heritage', 'agriculture', 'testimony',
            'covenant', 'restoration', 'creation', 'foundation', 'purpose'
        ];
        let currentWord = typingWords[Math.floor(Math.random() * typingWords.length)];
        let typedSoFar = '';
        let wordCount = 0;
        const maxWords = 10;

        const wordDisplay = document.createElement('div');
        wordDisplay.className = 'absolute inset-0 flex flex-col items-center justify-center';
        wordDisplay.innerHTML = `
            <div class="text-center">
                <p class="text-sm text-slate-400 mb-2">Type the word below:</p>
                <p class="text-4xl font-bold text-white mb-8 font-mono" id="target-word">${currentWord}</p>
                <p class="text-2xl font-mono text-green-400" id="typed-word">${typedSoFar}</p>
                <p class="text-xs text-slate-500 mt-8">${wordCount}/${maxWords} words completed</p>
            </div>
        `;
        canvasRef.current?.parentElement?.appendChild(wordDisplay);

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                const key = e.key.toLowerCase();
                if (currentWord[typedSoFar.length] === key) {
                    playScoreSound();
                    typedSoFar += key;
                    const typedWordEl = document.getElementById('typed-word');
                    if (typedWordEl) typedWordEl.textContent = typedSoFar;
                    setScore(s => s + 10);

                    if (typedSoFar === currentWord) {
                        wordCount++;
                        if (wordCount >= maxWords) {
                            playVictorySound();
                            setGameOver(true);
                            return;
                        }
                        currentWord = typingWords[Math.floor(Math.random() * typingWords.length)];
                        typedSoFar = '';
                        const targetWordEl = document.getElementById('target-word');
                        const typedWordEl2 = document.getElementById('typed-word');
                        const progressEl = document.querySelector('.text-xs.text-slate-500');
                        if (targetWordEl) targetWordEl.textContent = currentWord;
                        if (typedWordEl2) typedWordEl2.textContent = '';
                        if (progressEl) progressEl.textContent = `${wordCount}/${maxWords} words completed`;
                    }
                }
            }
        };

        window.addEventListener('keypress', handleKeyPress);

        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            wordDisplay.remove();
        };
    };

    const initCoding = () => {
        const challenges = [
            { question: 'Fix: if (x = 5)', answer: 'if (x == 5)' },
            { question: 'Complete: for (let i=0; i<10; __)', answer: 'i++' },
            { question: 'Fix: let name = "Aaron;', answer: 'let name = "Aaron";' },
            { question: 'Complete: function add(a,b) { return __ }', answer: 'a+b' },
            { question: 'Fix: console.log("Hello World)', answer: 'console.log("Hello World")' }
        ];
        let currentChallenge = 0;
        let input = '';

        const codingDisplay = document.createElement('div');
        codingDisplay.className = 'absolute inset-0 flex flex-col items-center justify-center p-6';
        codingDisplay.innerHTML = `
            <div class="w-full max-w-md text-center">
                <div class="bg-slate-800 rounded-lg p-4 mb-4">
                    <p class="text-xs text-slate-400 mb-2">Challenge ${currentChallenge + 1}/${challenges.length}</p>
                    <p class="text-sm text-white font-mono mb-4" id="challenge-text">${challenges[currentChallenge].question}</p>
                    <input 
                        type="text" 
                        id="code-input" 
                        class="w-full bg-slate-900 text-green-400 font-mono text-sm px-3 py-2 rounded border border-slate-600 focus:border-green-500 focus:outline-none"
                        placeholder="Type your answer..."
                        autocomplete="off"
                    />
                </div>
                <p class="text-xs text-slate-500">Press Enter to check answer</p>
            </div>
        `;
        canvasRef.current?.parentElement?.appendChild(codingDisplay);

        const codeInput = document.getElementById('code-input') as HTMLInputElement;
        if (codeInput) codeInput.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const answer = (document.getElementById('code-input') as HTMLInputElement)?.value || '';
                if (answer.trim() === challenges[currentChallenge].answer) {
                    playScoreSound();
                    setScore(s => s + 100);
                    currentChallenge++;

                    if (currentChallenge >= challenges.length) {
                        playVictorySound();
                        setGameOver(true);
                        return;
                    }

                    const challengeEl = document.getElementById('challenge-text');
                    const inputEl = document.getElementById('code-input') as HTMLInputElement;
                    const progressEl = document.querySelector('.text-xs.text-slate-400');

                    if (challengeEl) challengeEl.textContent = challenges[currentChallenge].question;
                    if (inputEl) inputEl.value = '';
                    if (progressEl) progressEl.textContent = `Challenge ${currentChallenge + 1}/${challenges.length}`;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            codingDisplay.remove();
        };
    };

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
