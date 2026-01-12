import { SupabaseClient } from '@supabase/supabase-js';

/**
 * ADAPTIVE DIFFICULTY ENGINE
 *
 * Dynamically adjusts lesson difficulty based on student performance
 * to keep them in the "Zone of Proximal Development" (ZPD) - not too hard, not too easy.
 *
 * Features:
 * - Real-time difficulty scaling
 * - Flow state optimization
 * - Struggle detection (too hard)
 * - Boredom detection (too easy)
 * - ZPD targeting (Vygotsky's theory)
 *
 * Innovation: Biblical wisdom scaling based on spiritual maturity
 */

export interface PerformanceMetrics {
  responseTime: number; // milliseconds
  accuracy: number; // 0-1
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  engagementScore: number; // 0-1 (based on message length, frequency)
}

export interface DifficultyLevel {
  level: number; // 1-10 scale
  label: string; // 'Beginner', 'Intermediate', 'Advanced', etc.
  description: string;
}

export interface AdaptiveRecommendation {
  action: 'increase' | 'decrease' | 'maintain';
  reason: string;
  newDifficulty: DifficultyLevel;
  scaffolding?: string; // Specific help to provide
}

export class AdaptiveDifficultyService {

  /**
   * Analyze performance and recommend difficulty adjustment
   */
  static analyzePerformance(
    metrics: PerformanceMetrics,
    currentDifficulty: number
  ): AdaptiveRecommendation {

    // BOREDOM DETECTION: Too easy
    if (
      metrics.accuracy > 0.9 &&
      metrics.consecutiveCorrect >= 3 &&
      metrics.responseTime < 5000 // Quick responses
    ) {
      return {
        action: 'increase',
        reason: 'Student is excelling - time to challenge them more',
        newDifficulty: this.getDifficultyLevel(Math.min(currentDifficulty + 1, 10)),
      };
    }

    // STRUGGLE DETECTION: Too hard
    if (
      metrics.accuracy < 0.5 &&
      metrics.consecutiveIncorrect >= 2 &&
      metrics.responseTime > 30000 // Long pauses
    ) {
      return {
        action: 'decrease',
        reason: 'Student is struggling - need to scaffold down',
        newDifficulty: this.getDifficultyLevel(Math.max(currentDifficulty - 1, 1)),
        scaffolding: 'Break this down into smaller steps. Let me simplify...',
      };
    }

    // DISENGAGEMENT DETECTION: Losing interest
    if (
      metrics.engagementScore < 0.3 &&
      metrics.responseTime > 20000
    ) {
      return {
        action: 'decrease',
        reason: 'Student appears disengaged - make it more accessible',
        newDifficulty: this.getDifficultyLevel(Math.max(currentDifficulty - 1, 1)),
        scaffolding: 'This might be getting tedious. Let me make it more interesting...',
      };
    }

    // OPTIMAL ZONE: Maintain current difficulty
    if (
      metrics.accuracy >= 0.6 &&
      metrics.accuracy <= 0.85 &&
      metrics.engagementScore > 0.5
    ) {
      return {
        action: 'maintain',
        reason: 'Student is in the optimal learning zone (ZPD)',
        newDifficulty: this.getDifficultyLevel(currentDifficulty),
      };
    }

    // Default: Maintain
    return {
      action: 'maintain',
      reason: 'Insufficient data for adjustment',
      newDifficulty: this.getDifficultyLevel(currentDifficulty),
    };
  }

  /**
   * Get difficulty level descriptor
   */
  static getDifficultyLevel(level: number): DifficultyLevel {
    const levels: Record<number, DifficultyLevel> = {
      1: { level: 1, label: 'Very Simple', description: 'Elementary explanations with lots of examples' },
      2: { level: 2, label: 'Simple', description: 'Clear, straightforward explanations' },
      3: { level: 3, label: 'Beginner', description: 'Basic concepts with some detail' },
      4: { level: 4, label: 'Developing', description: 'More depth, connecting ideas' },
      5: { level: 5, label: 'Intermediate', description: 'Standard grade-level complexity' },
      6: { level: 6, label: 'Proficient', description: 'Above grade-level, nuanced thinking' },
      7: { level: 7, label: 'Advanced', description: 'Complex analysis and synthesis' },
      8: { level: 8, label: 'Expert', description: 'College-level depth and rigor' },
      9: { level: 9, label: 'Mastery', description: 'Graduate-level critical thinking' },
      10: { level: 10, label: 'Genius', description: 'Research-level original thought' },
    };

    return levels[level] || levels[5];
  }

  /**
   * Calculate engagement score from conversation metrics
   */
  static calculateEngagement(
    messageLength: number,
    messageFrequency: number, // messages per hour
    questionAsked: boolean
  ): number {
    let score = 0;

    // Message length (0-0.4 points)
    if (messageLength > 100) score += 0.4;
    else if (messageLength > 50) score += 0.3;
    else if (messageLength > 20) score += 0.2;
    else if (messageLength > 5) score += 0.1;

    // Message frequency (0-0.3 points)
    if (messageFrequency > 10) score += 0.3;
    else if (messageFrequency > 5) score += 0.2;
    else if (messageFrequency > 2) score += 0.1;

    // Question asked (0-0.3 points) - indicates curiosity
    if (questionAsked) score += 0.3;

    return Math.min(score, 1.0);
  }

  /**
   * Track student difficulty history
   */
  static async trackDifficulty(
    userId: string,
    subject: string,
    difficulty: number,
    performance: PerformanceMetrics,
    supabase: SupabaseClient
  ): Promise<void> {
    try {
      await supabase.from('difficulty_history').insert({
        user_id: userId,
        subject,
        difficulty_level: difficulty,
        accuracy: performance.accuracy,
        response_time: performance.responseTime,
        engagement_score: performance.engagementScore,
        tracked_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Adaptive] Failed to track difficulty:', error);
    }
  }

  /**
   * Get recommended starting difficulty for a new subject
   */
  static async getStartingDifficulty(
    userId: string,
    subject: string,
    gradeLevel: string,
    supabase: SupabaseClient
  ): Promise<number> {
    try {
      // Check if student has prior performance data
      const { data, error } = await supabase
        .from('difficulty_history')
        .select('difficulty_level, accuracy')
        .eq('user_id', userId)
        .order('tracked_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        // No history - use grade level estimate
        return this.estimateDifficultyFromGrade(gradeLevel);
      }

      // Calculate average performance
      const avgDifficulty = data.reduce((sum, d) => sum + d.difficulty_level, 0) / data.length;
      const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length;

      // Adjust based on accuracy
      if (avgAccuracy > 0.85) return Math.min(Math.round(avgDifficulty + 1), 10);
      if (avgAccuracy < 0.60) return Math.max(Math.round(avgDifficulty - 1), 1);

      return Math.round(avgDifficulty);
    } catch (error) {
      console.error('[Adaptive] Failed to get starting difficulty:', error);
      return 5; // Default to intermediate
    }
  }

  /**
   * Estimate difficulty from grade level
   */
  private static estimateDifficultyFromGrade(gradeLevel: string): number {
    const grade = gradeLevel.toLowerCase();

    if (grade.includes('k') || grade.includes('kindergarten')) return 1;
    if (grade.includes('1st') || grade.includes('2nd')) return 2;
    if (grade.includes('3rd') || grade.includes('4th')) return 3;
    if (grade.includes('5th') || grade.includes('6th')) return 4;
    if (grade.includes('7th') || grade.includes('8th')) return 5;
    if (grade.includes('9th') || grade.includes('10th')) return 6;
    if (grade.includes('11th') || grade.includes('12th')) return 7;
    if (grade.includes('college')) return 8;

    return 5; // Default
  }

  /**
   * Generate difficulty-adjusted prompt instruction
   */
  static getDifficultyInstructions(difficulty: DifficultyLevel): string {
    const instructions: Record<number, string> = {
      1: 'Explain this like I\'m 5 years old. Use very simple words, lots of examples, and maybe a story.',
      2: 'Use simple, clear language. Break concepts into small steps.',
      3: 'Explain clearly with some detail. Use examples when helpful.',
      4: 'Provide good depth. Connect ideas. Challenge thinking a bit.',
      5: 'Standard grade-level explanation. Balance clarity with complexity.',
      6: 'Above grade-level. Introduce nuance. Expect critical thinking.',
      7: 'Advanced complexity. Use technical terms. Expect analysis and synthesis.',
      8: 'College-level rigor. Deep dive into theory. Expect original thinking.',
      9: 'Graduate-level. Philosophical depth. Challenge assumptions.',
      10: 'Research-level. Engage with cutting-edge ideas. Expect genius-level insights.',
    };

    return instructions[difficulty.level] || instructions[5];
  }

  /**
   * Biblical Wisdom Difficulty Scaling
   *
   * Adjusts moral scenarios based on spiritual maturity
   */
  static getWisdomDifficulty(age: number, spiritualMaturity: number): number {
    // Base difficulty on age
    let difficulty = Math.floor(age / 2);

    // Adjust based on spiritual maturity (1-10 scale)
    difficulty += Math.floor(spiritualMaturity / 3);

    return Math.max(1, Math.min(difficulty, 10));
  }
}
