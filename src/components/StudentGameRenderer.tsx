'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, X, Trophy, RotateCcw, Timer } from 'lucide-react';

interface GameManifest {
  gameId: string;
  type: 'matching' | 'sorting' | 'labeling' | 'quiz' | 'memory' | 'path' | 'fill_blank';
  assets: {
    backgroundImage?: string;
    elements: GameElement[];
  };
  mechanics: {
    winCondition: string;
    lives?: number;
    timer?: boolean;
    timerSeconds?: number;
  };
  pedagogy: {
    skillId?: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

interface GameElement {
  id: string;
  type: 'text' | 'image' | 'hotspot';
  content: string;
  position?: { x: number; y: number };
  correctAnswer?: string | string[];
  distractor?: boolean;
}

interface StudentGameRendererProps {
  gameId: string;
  manifest: GameManifest;
  onComplete?: (score: number, timeSpent: number) => void;
}

export function StudentGameRenderer({ gameId, manifest, onComplete }: StudentGameRendererProps) {
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [selections, setSelections] = useState<Map<string, string>>(new Map());

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const resetGame = () => {
    setGameState('playing');
    setScore(0);
    setMistakes(0);
    setTimeElapsed(0);
    setSelections(new Map());
  };

  const checkWinCondition = () => {
    // Simple win condition: all elements correctly matched/answered
    const totalElements = manifest.assets.elements.filter(e => !e.distractor).length;
    if (selections.size >= totalElements) {
      setGameState('won');
      onComplete?.(score, timeElapsed);
    }
  };

  const renderGameByType = () => {
    switch (manifest.type) {
      case 'matching':
        return <MatchingGame manifest={manifest} onAnswer={handleAnswer} selections={selections} />;
      case 'quiz':
        return <QuizGame manifest={manifest} onAnswer={handleAnswer} />;
      case 'labeling':
        return <LabelingGame manifest={manifest} onAnswer={handleAnswer} selections={selections} />;
      default:
        return <div className="text-center text-gray-500">Game type "{manifest.type}" not yet implemented</div>;
    }
  };

  const handleAnswer = (elementId: string, answer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 10);
      setSelections(prev => new Map(prev).set(elementId, answer));
      setTimeout(checkWinCondition, 100);
    } else {
      setMistakes(prev => prev + 1);
      if (manifest.mechanics.lives && mistakes + 1 >= manifest.mechanics.lives) {
        setGameState('lost');
      }
    }
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-semibold text-gray-700">
            Score: <span className="text-[var(--forest)]">{score}</span>
          </div>
          {manifest.mechanics.lives && (
            <div className="text-sm font-semibold text-gray-700">
              Lives: <span className="text-red-600">{Math.max(0, manifest.mechanics.lives - mistakes)}</span>
            </div>
          )}
          {manifest.mechanics.timer && (
            <div className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
        <button
          onClick={resetGame}
          className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Game Area */}
      {gameState === 'playing' && renderGameByType()}

      {/* Win State */}
      {gameState === 'won' && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You Won!</h3>
          <p className="text-gray-600 mb-1">Final Score: {score}</p>
          <p className="text-gray-600 mb-6">Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-[var(--forest)] text-white rounded-lg hover:bg-[var(--forest-dark)] transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Loss State */}
      {gameState === 'lost' && (
        <div className="text-center py-12">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Over</h3>
          <p className="text-gray-600 mb-6">You ran out of lives. Try again!</p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-[var(--forest)] text-white rounded-lg hover:bg-[var(--forest-dark)] transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// Matching Game Component
function MatchingGame({
  manifest,
  onAnswer,
  selections
}: {
  manifest: GameManifest;
  onAnswer: (id: string, answer: string, correct: boolean) => void;
  selections: Map<string, string>;
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const leftItems = manifest.assets.elements.filter((_, idx) => idx % 2 === 0);
  const rightItems = manifest.assets.elements.filter((_, idx) => idx % 2 === 1);

  const handleSelect = (item: GameElement, side: 'left' | 'right') => {
    if (selections.has(item.id)) return; // Already matched

    if (side === 'left') {
      setSelectedLeft(item.id);
      if (selectedRight) {
        checkMatch(item.id, selectedRight);
      }
    } else {
      setSelectedRight(item.id);
      if (selectedLeft) {
        checkMatch(selectedLeft, item.id);
      }
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    const leftItem = manifest.assets.elements.find(e => e.id === leftId);
    const rightItem = manifest.assets.elements.find(e => e.id === rightId);

    if (!leftItem || !rightItem) return;

    const isCorrect = leftItem.correctAnswer === rightId || rightItem.correctAnswer === leftId;

    onAnswer(leftId, rightId, isCorrect);

    // Reset selection
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, isCorrect ? 500 : 1000);
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-3">
        {leftItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleSelect(item, 'left')}
            disabled={selections.has(item.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selections.has(item.id)
                ? 'bg-green-100 border-green-400 cursor-default'
                : selectedLeft === item.id
                ? 'bg-blue-100 border-blue-400'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          >
            {item.content}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {rightItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleSelect(item, 'right')}
            disabled={selections.has(item.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selections.has(item.id)
                ? 'bg-green-100 border-green-400 cursor-default'
                : selectedRight === item.id
                ? 'bg-blue-100 border-blue-400'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          >
            {item.content}
          </button>
        ))}
      </div>
    </div>
  );
}

// Quiz Game Component
function QuizGame({
  manifest,
  onAnswer
}: {
  manifest: GameManifest;
  onAnswer: (id: string, answer: string, correct: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentElement = manifest.assets.elements[currentIndex];

  if (!currentElement) {
    return <div className="text-center text-gray-500">No quiz questions available</div>;
  }

  const handleChoice = (choice: string) => {
    const isCorrect = choice === currentElement.correctAnswer;
    onAnswer(currentElement.id, choice, isCorrect);

    if (isCorrect && currentIndex < manifest.assets.elements.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 1000);
    }
  };

  // Extract choices from element (assumed to be in correctAnswer and other elements)
  const choices = [
    currentElement.correctAnswer as string,
    ...manifest.assets.elements
      .filter(e => e.id !== currentElement.id && e.content)
      .slice(0, 3)
      .map(e => e.content)
  ].sort(() => Math.random() - 0.5);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">Question {currentIndex + 1} of {manifest.assets.elements.length}</p>
        <h3 className="text-xl font-semibold text-gray-900">{currentElement.content}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoice(choice)}
            className="p-4 rounded-lg border-2 border-gray-300 hover:border-[var(--forest)] hover:bg-[var(--forest)]/5 transition-all text-left"
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

// Labeling Game Component (click hotspots on an image)
function LabelingGame({
  manifest,
  onAnswer,
  selections
}: {
  manifest: GameManifest;
  onAnswer: (id: string, answer: string, correct: boolean) => void;
  selections: Map<string, string>;
}) {
  const handleClick = (element: GameElement) => {
    if (selections.has(element.id)) return;

    // For labeling, clicking is the answer
    onAnswer(element.id, element.id, true);
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {manifest.assets.backgroundImage && (
        <img
          src={manifest.assets.backgroundImage}
          alt="Game background"
          className="w-full rounded-lg"
        />
      )}
      <div className="relative">
        {manifest.assets.elements.map(element => (
          <button
            key={element.id}
            onClick={() => handleClick(element)}
            disabled={selections.has(element.id)}
            className={`absolute w-12 h-12 rounded-full border-4 transition-all ${
              selections.has(element.id)
                ? 'bg-green-500 border-green-600 cursor-default'
                : 'bg-blue-500 border-blue-600 hover:bg-blue-600 animate-pulse'
            }`}
            style={{
              left: `${element.position?.x || 0}%`,
              top: `${element.position?.y || 0}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {selections.has(element.id) && <CheckCircle2 className="w-full h-full text-white" />}
          </button>
        ))}
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">Click all the highlighted points to label them!</p>
        <p className="text-xs text-gray-500 mt-1">
          {selections.size} / {manifest.assets.elements.length} labeled
        </p>
      </div>
    </div>
  );
}
