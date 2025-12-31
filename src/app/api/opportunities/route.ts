import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query') || '';
        const disciplines = searchParams.get('disciplines')?.split(',') || [];
        const location = searchParams.get('location') || '';

        // Build query for database search
        let dbQuery = supabase
            .from('opportunities')
            .select('*')
            .eq('status', 'active')
            .order('featured', { ascending: false })
            .order('deadline', { ascending: true });

        // Filter by disciplines if provided
        if (disciplines.length > 0) {
            dbQuery = dbQuery.overlaps('disciplines', disciplines);
        }

        // Filter by location if provided
        if (location) {
            dbQuery = dbQuery.or(`location.ilike.%${location}%,location.eq.National (USA)`);
        }

        // Text search in title/description if query provided
        if (query) {
            dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
        }

        const { data: opportunities, error } = await dbQuery.limit(20);

        if (error) throw error;

        return NextResponse.json({ opportunities: opportunities || [] });
    } catch (error) {
        console.error('Opportunities search error:', error);
        return NextResponse.json(
            { error: 'Failed to search opportunities' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, preferences } = await request.json();

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Build context from preferences
        const disciplineText = preferences?.disciplines?.join(", ") || "various disciplines";
        const context = preferences
            ? `The student is interested in ${disciplineText} at the ${preferences.experienceLevel} level, based in ${preferences.location}.`
            : "";

        // Use Claude to generate search results and recommendations
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: `${context}

Find and describe 5-7 relevant opportunities (grants, contests, scholarships, or contract work) for: ${query}

Focus on:
- Opportunities available to Oklahoma students
- National opportunities open to US students
- Real, currently available opportunities

For each opportunity, provide:
1. Title
2. Brief description
3. Organization/sponsor
4. Deadline (if known)
5. Award amount (if applicable)
6. How it relates to the student's interests

Format your response as a helpful summary, then list each opportunity clearly.`
            }]
        });

        const aiText = response.content[0].type === 'text' ? response.content[0].text : '';

        // Also get matching opportunities from database
        let dbQuery = supabase
            .from('opportunities')
            .select('*')
            .eq('status', 'active')
            .order('featured', { ascending: false })
            .limit(10);

        if (preferences?.disciplines?.length > 0) {
            dbQuery = dbQuery.overlaps('disciplines', preferences.disciplines);
        }

        const { data: dbOpportunities } = await dbQuery;

        return NextResponse.json({
            aiSummary: aiText,
            opportunities: dbOpportunities || []
        });
    } catch (error) {
        console.error('AI search error:', error);
        return NextResponse.json(
            { error: 'Failed to generate search results' },
            { status: 500 }
        );
    }
}
