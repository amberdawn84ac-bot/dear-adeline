'use client';

import React from 'react';
import { AdaptiveDifficultyService } from '@/lib/services/adaptiveDifficultyService';

interface DifficultyIndicatorProps {
    level: number; // 1-10
    trend?: 'improving' | 'declining' | 'stable';
    engagementScore?: number; // 0-1
    inFlowState?: boolean;
}

export default function DifficultyIndicator({
    level,
    trend = 'stable',
    engagementScore,
    inFlowState = false
}: DifficultyIndicatorProps) {
    const difficultyLabel = AdaptiveDifficultyService.getDifficultyLevel(level);

    // Get color based on trend
    const trendColor = trend === 'improving' ? 'text-green-500' :
                       trend === 'declining' ? 'text-red-500' :
                       'text-gray-500';

    const trendIcon = trend === 'improving' ? '📈' :
                      trend === 'declining' ? '📉' :
                      '➡️';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Learning Level
                </h3>
                {inFlowState && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                        🎯 Flow State
                    </span>
                )}
            </div>

            {/* Difficulty Level Display */}
            <div className="mb-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {level}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        / 10
                    </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {difficultyLabel.label}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(level / 10) * 100}%` }}
                />
            </div>

            {/* Trend Indicator */}
            {trend && (
                <div className={`flex items-center gap-2 mb-2 ${trendColor}`}>
                    <span>{trendIcon}</span>
                    <span className="text-xs font-medium capitalize">
                        {trend}
                    </span>
                </div>
            )}

            {/* Engagement Score */}
            {engagementScore !== undefined && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Engagement</span>
                        <span className="font-semibold">
                            {Math.round(engagementScore * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                        <div
                            className="bg-green-500 dark:bg-green-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${engagementScore * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Flow State Explanation */}
            {inFlowState && (
                <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-purple-900 dark:text-purple-200">
                    You're in the sweet spot - challenged but not overwhelmed!
                </div>
            )}
        </div>
    );
}
