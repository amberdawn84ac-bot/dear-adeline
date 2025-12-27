
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { city, topics } = await req.json();

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Tavily API key not found' }, { status: 500 });
    }

    try {
        const location = city || 'Nowata, OK';

        // 1. Get Weather via Tavily
        const weatherResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: `current weather and 3 day forecast for ${location}`,
                search_depth: 'basic',
                include_answer: true,
            }),
        });
        const weatherData = await weatherResponse.json();

        // 2. Get Relevant Local News
        const newsQuery = `latest local news in ${location} ${topics ? `related to ${topics}` : ''}`;
        const newsResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: newsQuery,
                search_depth: 'advanced',
                max_results: 5,
            }),
        });
        const newsData = await newsResponse.json();

        // 3. Get Local Opportunities (Contests, Scholarships, Bees, etc.)
        const oppsQuery = `local art contests, science competitions, spelling bees, community scholarships, and student opportunities in ${location}`;
        const oppsResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: oppsQuery,
                search_depth: 'advanced',
                max_results: 5,
            }),
        });
        const oppsData = await oppsResponse.json();

        return NextResponse.json({
            weather: weatherData.answer || 'Weather information temporarily unavailable.',
            news: newsData.results || [],
            opportunities: oppsData.results || [],
        });
    } catch (error) {
        console.error('Intelligence fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch local intelligence' }, { status: 500 });
    }
}
