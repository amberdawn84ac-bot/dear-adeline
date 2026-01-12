import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SpacedRepetitionService } from '@/lib/services/spacedRepetitionService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/flashcards?userId=xxx&action=due|stats
 * Get due cards or stats
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'due';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (action === 'stats') {
      const stats = await SpacedRepetitionService.getStats(userId, supabase);
      return NextResponse.json({ stats });
    }

    if (action === 'due') {
      const dueCards = await SpacedRepetitionService.getDueCards(userId, supabase, limit);
      return NextResponse.json({ dueCards });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Flashcards API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flashcards
 * Create a new flashcard
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, front, back, type, subject, source } = body;

    if (!userId || !front || !back) {
      return NextResponse.json(
        { error: 'userId, front, and back are required' },
        { status: 400 }
      );
    }

    const card = await SpacedRepetitionService.createCard(
      {
        user_id: userId,
        front,
        back,
        type: type || 'concept',
        subject,
        source,
      },
      supabase
    );

    if (!card) {
      return NextResponse.json(
        { error: 'Failed to create card' },
        { status: 500 }
      );
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('[Flashcards API] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/flashcards
 * Review a flashcard
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { cardId, userId, rating } = body;

    if (!cardId || !userId || !rating) {
      return NextResponse.json(
        { error: 'cardId, userId, and rating are required' },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'rating must be 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)' },
        { status: 400 }
      );
    }

    const review = await SpacedRepetitionService.reviewCard(
      cardId,
      userId,
      rating,
      supabase
    );

    if (!review) {
      return NextResponse.json(
        { error: 'Failed to record review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('[Flashcards API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
