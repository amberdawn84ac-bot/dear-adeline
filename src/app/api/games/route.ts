import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateGameCode } from '@/services/gameGenerator';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { concept, track, difficulty, game_type } = body;

        if (!concept || !track || !difficulty) {
            return NextResponse.json(
                { error: 'Missing required fields: concept, track, difficulty' },
                { status: 400 }
            );
        }

        // Generate the game using AI
        const gameData = await generateGameCode({
            concept,
            track,
            difficulty,
            game_type: game_type || 'educational',
        });

        // Save to database
        const { data: savedGame, error: saveError } = await supabase
            .from('game_projects')
            .insert({
                student_id: user.id,
                ...gameData,
                is_public: false,
                play_count: 0,
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving game:', saveError);
            return NextResponse.json(
                { error: 'Failed to save game' },
                { status: 500 }
            );
        }

        return NextResponse.json({ game: savedGame });

    } catch (error: any) {
        console.error('Game generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate game' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const isPublic = searchParams.get('public') === 'true';

        let query = supabase
            .from('game_projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (isPublic) {
            query = query.eq('is_public', true);
        } else {
            query = query.eq('student_id', user.id);
        }

        const { data: games, error } = await query;

        if (error) {
            console.error('Error fetching games:', error);
            return NextResponse.json(
                { error: 'Failed to fetch games' },
                { status: 500 }
            );
        }

        return NextResponse.json({ games });

    } catch (error: any) {
        console.error('Game fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch games' },
            { status: 500 }
        );
    }
}
