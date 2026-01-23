'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Trophy, Check, ArrowRight, ArrowDown, ArrowUp, Play, Lightbulb } from 'lucide-react';

interface Level {
    id: number;
    name: string;
    description: string;
    grid: string[][];
    robotStart: { x: number; y: number };
    goal: { x: number; y: number };
    maxMoves: number;
    hint: string;
}

const LEVELS: Level[] = [
    {
        id: 1,
        name: 'First Steps',
        description: 'Move the robot to the star!',
        grid: [
            ['.', '.', '.'],
            ['.', '.', '.'],
            ['.', '.', '.'],
        ],
        robotStart: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        maxMoves: 5,
        hint: 'Use RIGHT arrows to move across'
    },
    {
        id: 2,
        name: 'Turn the Corner',
        description: 'Navigate around the corner',
        grid: [
            ['.', '.', '.'],
            ['.', '.', '.'],
            ['.', '.', '.'],
        ],
        robotStart: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        maxMoves: 6,
        hint: 'Go right first, then down'
    },
    {
        id: 3,
        name: 'Avoid the Wall',
        description: 'Find a path around the obstacle',
        grid: [
            ['.', '#', '.'],
            ['.', '#', '.'],
            ['.', '.', '.'],
        ],
        robotStart: { x: 0, y: 0 },
        goal: { x: 2, y: 0 },
        maxMoves: 8,
        hint: 'Go around the wall by going down first'
    },
    {
        id: 4,
        name: 'Maze Runner',
        description: 'Navigate through the maze',
        grid: [
            ['.', '.', '#', '.'],
            ['#', '.', '#', '.'],
            ['.', '.', '.', '.'],
            ['.', '#', '#', '.'],
        ],
        robotStart: { x: 0, y: 0 },
        goal: { x: 3, y: 3 },
        maxMoves: 10,
        hint: 'Sometimes you need to go backwards to go forwards'
    },
    {
        id: 5,
        name: 'Efficiency Test',
        description: 'Reach the goal in minimum moves',
        grid: [
            ['.', '.', '.', '.', '.'],
            ['.', '#', '#', '#', '.'],
            ['.', '.', '.', '.', '.'],
            ['.', '#', '#', '#', '.'],
            ['.', '.', '.', '.', '.'],
        ],
        robotStart: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
        maxMoves: 12,
        hint: 'Zigzag through the openings'
    }
];

type Direction = 'up' | 'down' | 'left' | 'right';

export default function CodingGame() {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [robotPos, setRobotPos] = useState({ x: 0, y: 0 });
    const [commands, setCommands] = useState<Direction[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [completedLevels, setCompletedLevels] = useState<number[]>([]);

    const currentLevel = LEVELS[currentLevelIndex];

    const startLevel = (levelIndex: number) => {
        const level = LEVELS[levelIndex];
        setCurrentLevelIndex(levelIndex);
        setRobotPos({ ...level.robotStart });
        setCommands([]);
        setIsRunning(false);
        setShowHint(false);
        setGameState('playing');
    };

    const addCommand = (direction: Direction) => {
        if (commands.length < currentLevel.maxMoves && !isRunning) {
            setCommands([...commands, direction]);
        }
    };

    const removeLastCommand = () => {
        if (!isRunning) {
            setCommands(commands.slice(0, -1));
        }
    };

    const resetLevel = () => {
        setRobotPos({ ...currentLevel.robotStart });
        setCommands([]);
        setIsRunning(false);
        setShowHint(false);
        setGameState('playing');
    };

    const runCommands = async () => {
        if (commands.length === 0 || isRunning) return;

        setIsRunning(true);
        let pos = { ...currentLevel.robotStart };
        setRobotPos(pos);

        for (const cmd of commands) {
            await new Promise(resolve => setTimeout(resolve, 400));

            let newPos = { ...pos };
            switch (cmd) {
                case 'up': newPos.y = Math.max(0, pos.y - 1); break;
                case 'down': newPos.y = Math.min(currentLevel.grid.length - 1, pos.y + 1); break;
                case 'left': newPos.x = Math.max(0, pos.x - 1); break;
                case 'right': newPos.x = Math.min(currentLevel.grid[0].length - 1, pos.x + 1); break;
            }

            // Check for wall collision
            if (currentLevel.grid[newPos.y][newPos.x] !== '#') {
                pos = newPos;
                setRobotPos(pos);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        // Check win condition
        if (pos.x === currentLevel.goal.x && pos.y === currentLevel.goal.y) {
            setCompletedLevels(prev => [...new Set([...prev, currentLevel.id])]);
            setGameState('won');
        } else {
            setGameState('lost');
        }
        setIsRunning(false);
    };

    const nextLevel = () => {
        if (currentLevelIndex < LEVELS.length - 1) {
            startLevel(currentLevelIndex + 1);
        } else {
            setGameState('menu');
        }
    };

    if (gameState === 'menu') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                <div className="max-w-2xl mx-auto">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Games
                    </Link>

                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                            <Play className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Code Quest
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Program the robot to reach the star! Add commands and watch it execute.
                        </p>
                    </div>

                    {/* Level Selection */}
                    <div className="space-y-3">
                        {LEVELS.map((level, index) => (
                            <button
                                key={level.id}
                                onClick={() => startLevel(index)}
                                className="w-full bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all text-left flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                        completedLevels.includes(level.id)
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {completedLevels.includes(level.id) ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            level.id
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{level.name}</h3>
                                        <p className="text-sm text-gray-500">{level.description}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'won') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-white" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Level Complete!</h1>
                        <p className="text-gray-600 mb-8">
                            Great job programming the robot!
                        </p>

                        <div className="flex justify-center gap-4">
                            {currentLevelIndex < LEVELS.length - 1 ? (
                                <button
                                    onClick={nextLevel}
                                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                >
                                    Next Level
                                </button>
                            ) : (
                                <button
                                    onClick={() => setGameState('menu')}
                                    className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                                >
                                    All Levels Complete!
                                </button>
                            )}
                            <button
                                onClick={() => setGameState('menu')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Level Select
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'lost') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Try Again!</h1>
                        <p className="text-gray-600 mb-8">
                            The robot didn't reach the star. Adjust your commands!
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={resetLevel}
                                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Playing state
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setGameState('menu')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">
                        Level {currentLevel.id}: {currentLevel.name}
                    </h1>
                    <button
                        onClick={resetLevel}
                        className="p-2 text-gray-600 hover:text-gray-900"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Grid */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl">
                        <div
                            className="grid gap-1 mx-auto w-fit"
                            style={{ gridTemplateColumns: `repeat(${currentLevel.grid[0].length}, 1fr)` }}
                        >
                            {currentLevel.grid.map((row, y) =>
                                row.map((cell, x) => {
                                    const isRobot = robotPos.x === x && robotPos.y === y;
                                    const isGoal = currentLevel.goal.x === x && currentLevel.goal.y === y;
                                    const isWall = cell === '#';

                                    return (
                                        <div
                                            key={`${x}-${y}`}
                                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center text-2xl transition-all ${
                                                isWall
                                                    ? 'bg-gray-800'
                                                    : 'bg-gray-100'
                                            }`}
                                        >
                                            {isRobot && (
                                                <span className="text-2xl">🤖</span>
                                            )}
                                            {isGoal && !isRobot && (
                                                <span className="text-2xl">⭐</span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        {/* Command Queue */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">
                                    Commands ({commands.length}/{currentLevel.maxMoves})
                                </span>
                                <button
                                    onClick={removeLastCommand}
                                    disabled={commands.length === 0 || isRunning}
                                    className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
                                >
                                    Remove Last
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[48px] bg-gray-50 rounded-xl p-3">
                                {commands.map((cmd, i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                                    >
                                        {cmd === 'up' && <ArrowUp className="w-5 h-5 text-green-600" />}
                                        {cmd === 'down' && <ArrowDown className="w-5 h-5 text-green-600" />}
                                        {cmd === 'left' && <ArrowLeft className="w-5 h-5 text-green-600" />}
                                        {cmd === 'right' && <ArrowRight className="w-5 h-5 text-green-600" />}
                                    </div>
                                ))}
                                {commands.length === 0 && (
                                    <span className="text-gray-400 text-sm">Add commands below</span>
                                )}
                            </div>
                        </div>

                        {/* Direction Buttons */}
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
                                <div></div>
                                <button
                                    onClick={() => addCommand('up')}
                                    disabled={commands.length >= currentLevel.maxMoves || isRunning}
                                    className="w-14 h-14 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <ArrowUp className="w-6 h-6" />
                                </button>
                                <div></div>
                                <button
                                    onClick={() => addCommand('left')}
                                    disabled={commands.length >= currentLevel.maxMoves || isRunning}
                                    className="w-14 h-14 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => addCommand('down')}
                                    disabled={commands.length >= currentLevel.maxMoves || isRunning}
                                    className="w-14 h-14 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <ArrowDown className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => addCommand('right')}
                                    disabled={commands.length >= currentLevel.maxMoves || isRunning}
                                    className="w-14 h-14 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Run Button */}
                        <button
                            onClick={runCommands}
                            disabled={commands.length === 0 || isRunning}
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            <Play className="w-6 h-6" />
                            {isRunning ? 'Running...' : 'Run Program'}
                        </button>

                        {/* Hint */}
                        {showHint ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                                <Lightbulb className="w-4 h-4 inline mr-2" />
                                {currentLevel.hint}
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowHint(true)}
                                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Need a hint?
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
