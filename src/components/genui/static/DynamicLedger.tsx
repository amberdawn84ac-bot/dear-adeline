
'use client';

import React, { useState, useEffect } from 'react';
import { useInteractionLogger } from '@/hooks/useInteractionLogger';
import { DollarSign, TrendingUp } from 'lucide-react';

//================================================================================
// Type Definitions
//================================================================================

interface LedgerItem {
  name: string;
  wholesalePrice: number;
  retailPrice: number;
}

interface DynamicLedgerProps {
  scenario: string;
  items: LedgerItem[];
  learningGoal: string;
  onComplete?: (results: {
    itemsExplored: number;
    conceptsMastered: string[];
    score: number;
  }) => void;
}


//================================================================================
// DynamicLedger Component
//================================================================================

/**
 * An interactive "Static GenUI" component designed to teach mathematical
 * concepts like profit margins and percentages through a hands-on,
 * game-like experience, in line with constructivist learning principles.
 */
export function DynamicLedger({
  scenario,
  items,
  learningGoal,
  onComplete
}: DynamicLedgerProps) {
  // Hook for logging student interactions to the orchestration layer.
  const logInteraction = useInteractionLogger('dynamicLedger');

  const [prices, setPrices] = useState<Record<string, number>>(
    items.reduce((acc, item) => ({
      ...acc,
      [item.name]: item.retailPrice
    }), {})
  );

  const [exploredItems, setExploredItems] = useState<Set<string>>(new Set());

  const calculateProfit = (item: LedgerItem) => {
    const currentPrice = prices[item.name] || item.retailPrice;
    return currentPrice - item.wholesalePrice;
  };

  const calculateMargin = (item: LedgerItem) => {
    const profit = calculateProfit(item);
    const currentPrice = prices[item.name] || item.retailPrice;
    return currentPrice > 0 ? (profit / currentPrice) * 100 : 0;
  };

  const handlePriceChange = (itemName: string, newPrice: number) => {
    setPrices(prev => ({ ...prev, [itemName]: newPrice }));
    setExploredItems(prev => new Set([...prev, itemName]));

    // Log the interaction so Adeline can "see" what the student is doing.
    logInteraction('slider_change', { 
      item: itemName, 
      newPrice: newPrice,
      newProfit: newPrice - items.find(i => i.name === itemName)!.wholesalePrice,
    });
  };

  const handleComplete = () => {
    const results = {
      itemsExplored: exploredItems.size,
      conceptsMastered: ['profit margin', 'markup percentage'],
      score: Math.round((exploredItems.size / items.length) * 100)
    };
    logInteraction('complete_activity', { results });
    if (onComplete) {
      onComplete(results);
    }
  };

  return (
    <div className="bg-[#FFF9F0] border-2 border-[#2F4731] rounded-lg p-6 transform -rotate-1 shadow-lg max-w-2xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-['Architects_Daughter'] text-[#2F4731] mb-2">
          The Merchant's Ledger
        </h2>
        <p className="text-lg font-['Kalam'] text-[#2F4731]">
          {scenario}
        </p>
        <p className="text-sm text-[#8B4513] mt-2 italic">
          Your Goal: {learningGoal}
        </p>
      </div>

      {/* Items */}
      <div className="space-y-6">
        {items.map((item) => {
          const profit = calculateProfit(item);
          const margin = calculateMargin(item);
          const currentPrice = prices[item.name] || item.retailPrice;

          return (
            <div
              key={item.name}
              className="bg-white border border-gray-300 rounded-lg p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-['Fredoka'] text-[#2F4731]">
                  {item.name}
                </h3>
                <div className="text-right text-sm text-gray-600">
                  Cost: ${item.wholesalePrice.toFixed(2)}
                </div>
              </div>

              {/* Price Slider */}
              <div className="mb-4">
                <label
                  htmlFor={`${item.name}-price`}
                  className="block text-sm font-medium font-['Kalam'] text-gray-700 mb-2"
                >
                  Set Retail Price: <span className="font-bold text-lg text-green-700">${currentPrice.toFixed(2)}</span>
                </label>
                <input
                  id={`${item.name}-price`}
                  type="range"
                  min={item.wholesalePrice}
                  max={item.wholesalePrice * 3}
                  step={0.25}
                  value={currentPrice}
                  onChange={(e) => handlePriceChange(item.name, parseFloat(e.target.value))}
                  aria-label={`${item.name} retail price`}
                  className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
              </div>

              {/* Calculations */}
              <div className="grid grid-cols-2 gap-4 bg-green-50 rounded-lg p-3 text-center">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Profit</div>
                  <div className="text-2xl font-bold text-green-800 flex items-center justify-center gap-1">
                    <DollarSign size={20} />
                    <span>{profit.toFixed(2)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Margin</div>
                  <div className="text-2xl font-bold text-green-800 flex items-center justify-center gap-1">
                    <TrendingUp size={20} />
                    <span>{margin.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleComplete}
          disabled={exploredItems.size < items.length}
          className="bg-[#2F4731] text-white px-10 py-3 rounded-lg font-['Fredoka'] text-lg hover:bg-[#3F5741] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Done Exploring
        </button>
        <p className="text-sm text-gray-500 mt-2">
          {exploredItems.size < items.length 
            ? `Change the price of all items to finish.`
            : `Great job! You've explored all the items.`
          }
        </p>
      </div>
    </div>
  );
}
