import { SupabaseClient } from '@supabase/supabase-js';

/**
 * SPACED REPETITION SERVICE
 *
 * Implements the SM-2 algorithm (used by Anki, SuperMemo) for optimal memory retention.
 *
 * How it works:
 * 1. Student reviews a flashcard
 * 2. Rates difficulty (Again, Hard, Good, Easy)
 * 3. Algorithm calculates next review date
 * 4. Interval grows exponentially for correct answers
 * 5. Resets to day 1 for forgotten cards
 *
 * Innovation: Biblical memory verses with Hebrew/Greek vocab tracking
 */

export interface FlashCard {
  id?: string;
  user_id: string;
  front: string;
  back: string;
  type: 'concept' | 'scripture' | 'vocab' | 'fact';
  subject?: string;
  source?: string; // e.g., "Genesis 1:1", "Photosynthesis lesson"
  created_at?: string;
}

export interface CardReview {
  card_id: string;
  user_id: string;
  rating: 1 | 2 | 3 | 4; // 1=Again, 2=Hard, 3=Good, 4=Easy
  easiness_factor: number;
  interval: number; // days until next review
  repetitions: number;
  next_review: string;
  reviewed_at: string;
}

export interface DueCard extends FlashCard {
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  last_reviewed?: string;
}

export class SpacedRepetitionService {

  /**
   * Create a new flashcard
   */
  static async createCard(
    card: FlashCard,
    supabase: SupabaseClient
  ): Promise<FlashCard | null> {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          user_id: card.user_id,
          front: card.front,
          back: card.back,
          type: card.type,
          subject: card.subject,
          source: card.source,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[SRS] Create card error:', error);
        return null;
      }

      // Initialize review state
      await supabase.from('card_reviews').insert({
        card_id: data.id,
        user_id: card.user_id,
        easiness_factor: 2.5, // SM-2 default
        interval: 0,
        repetitions: 0,
        next_review: new Date().toISOString(), // Due immediately
      });

      return data;
    } catch (error) {
      console.error('[SRS] Create card failed:', error);
      return null;
    }
  }

  /**
   * Get cards due for review
   */
  static async getDueCards(
    userId: string,
    supabase: SupabaseClient,
    limit: number = 20
  ): Promise<DueCard[]> {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('flashcards')
        .select(`
          *,
          card_reviews (
            easiness_factor,
            interval,
            repetitions,
            next_review,
            reviewed_at
          )
        `)
        .eq('user_id', userId)
        .lte('card_reviews.next_review', now)
        .order('card_reviews.next_review', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('[SRS] Get due cards error:', error);
        return [];
      }

      return (data || []).map((card: any) => ({
        ...card,
        easiness_factor: card.card_reviews?.[0]?.easiness_factor || 2.5,
        interval: card.card_reviews?.[0]?.interval || 0,
        repetitions: card.card_reviews?.[0]?.repetitions || 0,
        next_review: card.card_reviews?.[0]?.next_review || new Date().toISOString(),
        last_reviewed: card.card_reviews?.[0]?.reviewed_at,
      }));
    } catch (error) {
      console.error('[SRS] Get due cards failed:', error);
      return [];
    }
  }

  /**
   * Record a review and calculate next interval using SM-2 algorithm
   */
  static async reviewCard(
    cardId: string,
    userId: string,
    rating: 1 | 2 | 3 | 4,
    supabase: SupabaseClient
  ): Promise<CardReview | null> {
    try {
      // Get current review state
      const { data: currentReview, error: fetchError } = await supabase
        .from('card_reviews')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !currentReview) {
        console.error('[SRS] Fetch review error:', fetchError);
        return null;
      }

      // SM-2 Algorithm
      const { easinessFactor, interval, repetitions } = this.calculateNextReview(
        currentReview.easiness_factor,
        currentReview.interval,
        currentReview.repetitions,
        rating
      );

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      const review: CardReview = {
        card_id: cardId,
        user_id: userId,
        rating,
        easiness_factor: easinessFactor,
        interval,
        repetitions,
        next_review: nextReview.toISOString(),
        reviewed_at: new Date().toISOString(),
      };

      // Update review state
      const { error: updateError } = await supabase
        .from('card_reviews')
        .update({
          easiness_factor: easinessFactor,
          interval,
          repetitions,
          next_review: nextReview.toISOString(),
          reviewed_at: review.reviewed_at,
        })
        .eq('card_id', cardId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('[SRS] Update review error:', updateError);
        return null;
      }

      // Log the review
      await supabase.from('review_history').insert({
        card_id: cardId,
        user_id: userId,
        rating,
        easiness_factor: easinessFactor,
        interval,
        reviewed_at: review.reviewed_at,
      });

      return review;
    } catch (error) {
      console.error('[SRS] Review card failed:', error);
      return null;
    }
  }

  /**
   * SM-2 Algorithm Implementation
   *
   * Based on SuperMemo's SM-2 algorithm
   * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
   */
  private static calculateNextReview(
    currentEF: number,
    currentInterval: number,
    currentReps: number,
    rating: 1 | 2 | 3 | 4
  ): { easinessFactor: number; interval: number; repetitions: number } {

    // Rating: 1=Again (0), 2=Hard (3), 3=Good (4), 4=Easy (5)
    const quality = rating === 1 ? 0 : rating === 2 ? 3 : rating === 3 ? 4 : 5;

    // Calculate new easiness factor
    let easinessFactor = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Clamp EF between 1.3 and 2.5
    if (easinessFactor < 1.3) easinessFactor = 1.3;
    if (easinessFactor > 2.5) easinessFactor = 2.5;

    let interval: number;
    let repetitions: number;

    if (quality < 3) {
      // Incorrect answer - reset to day 1
      interval = 1;
      repetitions = 0;
    } else {
      // Correct answer - increase interval
      if (currentReps === 0) {
        interval = 1;
      } else if (currentReps === 1) {
        interval = 6;
      } else {
        interval = Math.round(currentInterval * easinessFactor);
      }
      repetitions = currentReps + 1;
    }

    return { easinessFactor, interval, repetitions };
  }

  /**
   * Get review statistics
   */
  static async getStats(
    userId: string,
    supabase: SupabaseClient
  ): Promise<{
    totalCards: number;
    dueToday: number;
    masteredCards: number;
    averageEF: number;
  }> {
    try {
      const now = new Date().toISOString();

      const { data: totalData, error: totalError } = await supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      const { data: dueData, error: dueError } = await supabase
        .from('card_reviews')
        .select('card_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('next_review', now);

      const { data: masteredData, error: masteredError } = await supabase
        .from('card_reviews')
        .select('card_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('repetitions', 5)
        .gte('interval', 21); // 3 weeks+

      const { data: efData, error: efError } = await supabase
        .from('card_reviews')
        .select('easiness_factor')
        .eq('user_id', userId);

      const avgEF = efData && efData.length > 0
        ? efData.reduce((sum, r) => sum + r.easiness_factor, 0) / efData.length
        : 2.5;

      return {
        totalCards: totalData?.length || 0,
        dueToday: dueData?.length || 0,
        masteredCards: masteredData?.length || 0,
        averageEF: Math.round(avgEF * 100) / 100,
      };
    } catch (error) {
      console.error('[SRS] Get stats failed:', error);
      return {
        totalCards: 0,
        dueToday: 0,
        masteredCards: 0,
        averageEF: 2.5,
      };
    }
  }

  /**
   * Auto-generate flashcard from AI conversation
   */
  static async generateCardFromConversation(
    userId: string,
    concept: string,
    explanation: string,
    source: string,
    supabase: SupabaseClient
  ): Promise<FlashCard | null> {
    const card: FlashCard = {
      user_id: userId,
      front: concept,
      back: explanation,
      type: 'concept',
      source,
    };

    return this.createCard(card, supabase);
  }

  /**
   * Create Scripture memory card with Hebrew/Greek
   */
  static async createScriptureCard(
    userId: string,
    verse: string,
    reference: string,
    translation: string,
    hebrewGreek?: string,
    supabase?: SupabaseClient
  ): Promise<FlashCard | null> {
    const back = hebrewGreek
      ? `${translation}\n\n📜 Original: ${hebrewGreek}`
      : translation;

    const card: FlashCard = {
      user_id: userId,
      front: reference,
      back,
      type: 'scripture',
      source: reference,
    };

    return this.createCard(card, supabase!);
  }
}
