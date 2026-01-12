'use client';

import React, { useState, useEffect } from 'react';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  type: 'concept' | 'scripture' | 'vocab' | 'fact';
  subject?: string;
  source?: string;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
}

interface ReviewStats {
  totalCards: number;
  dueToday: number;
  masteredCards: number;
  averageEF: number;
}

export default function SpacedRepetitionReview({ userId }: { userId: string }) {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    loadDueCards();
    loadStats();
  }, [userId]);

  const loadDueCards = async () => {
    try {
      const response = await fetch(`/api/flashcards?userId=${userId}&action=due`);
      const data = await response.json();
      setCards(data.dueCards || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load cards:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/flashcards?userId=${userId}&action=stats`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleReview = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard || reviewing) return;

    setReviewing(true);

    try {
      await fetch('/api/flashcards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard.id,
          userId,
          rating,
        }),
      });

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // All cards reviewed
        setCards([]);
        setCurrentIndex(0);
      }

      loadStats();
    } catch (error) {
      console.error('Failed to record review:', error);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading your review session...</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            All Caught Up! 🎉
          </h2>
          <p className="text-green-700 mb-6">
            You have no cards due for review right now. Great work on staying on top of your learning!
          </p>
          {stats && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-gray-800">{stats.totalCards}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>
              <div className="bg-white p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.masteredCards}</div>
                <div className="text-sm text-gray-600">Mastered</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          {stats && <span>{stats.dueToday} due today</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-8 min-h-[300px] flex flex-col justify-between cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div>
          {/* Card Type Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {currentCard.type === 'scripture' && '📜 Scripture'}
              {currentCard.type === 'concept' && '💡 Concept'}
              {currentCard.type === 'vocab' && '📚 Vocabulary'}
              {currentCard.type === 'fact' && '🎯 Fact'}
            </span>
            {currentCard.source && (
              <span className="ml-2 text-xs text-gray-500">
                {currentCard.source}
              </span>
            )}
          </div>

          {/* Front of Card */}
          <div className="text-xl font-semibold text-gray-800 mb-6">
            {currentCard.front}
          </div>

          {/* Back of Card (revealed) */}
          {showAnswer && (
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <div className="text-gray-700 whitespace-pre-wrap">
                {currentCard.back}
              </div>
            </div>
          )}
        </div>

        {/* Instruction */}
        {!showAnswer && (
          <div className="text-center text-gray-500 text-sm mt-6">
            Click to reveal answer
          </div>
        )}
      </div>

      {/* Review Buttons (only shown after answer revealed) */}
      {showAnswer && (
        <div className="mt-6 grid grid-cols-4 gap-3">
          <button
            onClick={() => handleReview(1)}
            disabled={reviewing}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-lg">Again</div>
            <div className="text-xs mt-1">{'<1m'}</div>
          </button>
          <button
            onClick={() => handleReview(2)}
            disabled={reviewing}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-lg">Hard</div>
            <div className="text-xs mt-1">{'<6m'}</div>
          </button>
          <button
            onClick={() => handleReview(3)}
            disabled={reviewing}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-lg">Good</div>
            <div className="text-xs mt-1">
              {currentCard.repetitions === 0 ? '1d' : currentCard.repetitions === 1 ? '6d' : `${Math.round(currentCard.interval * currentCard.easiness_factor)}d`}
            </div>
          </button>
          <button
            onClick={() => handleReview(4)}
            disabled={reviewing}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <div className="text-lg">Easy</div>
            <div className="text-xs mt-1">
              {currentCard.repetitions === 0 ? '4d' : `${Math.round(currentCard.interval * currentCard.easiness_factor * 1.3)}d`}
            </div>
          </button>
        </div>
      )}

      {/* Stats Footer */}
      {stats && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <div>
            {stats.totalCards} total cards • {stats.masteredCards} mastered • Average retention: {((stats.averageEF / 2.5) * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}
