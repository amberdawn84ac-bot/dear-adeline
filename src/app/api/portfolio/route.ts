import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/portfolio
 * Retrieve portfolio items for a student
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Portfolio API] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch portfolio items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ portfolioItems: data || [] });
  } catch (error) {
    console.error('[Portfolio API] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Create a new portfolio item
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, description, type, evidence, skills, tracks, credits } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      );
    }

    const portfolioItem = {
      student_id: userId,
      title,
      description: description || null,
      type: type || 'project',
      evidence: evidence || null,
      skills: skills || [],
      tracks: tracks || [],
      credits: credits || 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('portfolio_items')
      .insert(portfolioItem)
      .select()
      .single();

    if (error) {
      console.error('[Portfolio API] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create portfolio item' },
        { status: 500 }
      );
    }

    // Award skills if provided
    if (skills && skills.length > 0) {
      const skillRecords = skills.map((skillName: string) => ({
        student_id: userId,
        skill_name: skillName,
        portfolio_item_id: data.id,
        earned_at: new Date().toISOString(),
      }));

      const { error: skillError } = await supabase
        .from('student_skills')
        .insert(skillRecords);

      if (skillError) {
        console.warn('[Portfolio API] Skill insert error:', skillError);
      }
    }

    return NextResponse.json({ portfolioItem: data });
  } catch (error) {
    console.error('[Portfolio API] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
