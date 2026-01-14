import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CATEGORY_SEARCH_QUERIES: Record<string, string> = {
    art: 'art contests competitions grants scholarships students youth 2025 2026',
    writing: 'writing poetry essay journalism contests competitions scholarships students 2025 2026',
    science: 'science STEM math robotics fair olympiad competitions grants students 2025 2026',
    history: 'history social studies debate essay contests competitions students 2025 2026',
    entrepreneurship: 'business entrepreneurship startup plan competitions grants students youth 2025 2026',
    technology: 'coding hackathon programming app development cybersecurity competitions students 2025 2026',
    service: 'community service leadership volunteer awards programs students youth 2025 2026',
    scholarships: 'scholarships grants financial aid merit academic students homeschool 2025 2026'
};

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { category, ageGroup, scope } = await req.json();

        if (!category || category === 'all') {
            return NextResponse.json({ error: 'Category required' }, { status: 400 });
        }

        // Check for Tavily API key
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Tavily API key not configured' }, { status: 500 });
        }

        // Get search query for this category
        const baseQuery = CATEGORY_SEARCH_QUERIES[category] || 'student opportunities 2025 2026';

        // Add age group filter to search
        const ageGroupText = ageGroup === 'elementary' ? 'elementary school K-5' :
                           ageGroup === 'middle' ? 'middle school grades 6-8' :
                           ageGroup === 'high' ? 'high school grades 9-12' :
                           ageGroup === 'college' ? 'college university' : '';

        // Add scope filter to search
        const scopeText = scope === 'local' ? 'local state' :
                        scope === 'national' ? 'national USA' : '';

        const searchQuery = `${baseQuery} ${ageGroupText} ${scopeText}`.trim();

        console.log('🔍 Searching for opportunities:', searchQuery);

        // Search the web using Tavily API
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: searchQuery,
                search_depth: 'advanced',
                max_results: 10,
            }),
        });

        if (!tavilyResponse.ok) {
            throw new Error('Tavily search failed');
        }

        const searchData = await tavilyResponse.json();
        const opportunities = searchData.results || [];

        // Save opportunities to database
        const savedOpportunities = [];
        for (const result of opportunities) {
            // Tavily returns: title, url, content, score
            const { data: existing } = await supabase
                .from('opportunities')
                .select('id')
                .eq('source_url', result.url)
                .single();

            if (!existing) {
                // Extract organization from URL domain
                let organization = 'N/A';
                try {
                    const hostname = new URL(result.url).hostname.replace('www.', '');
                    organization = hostname.split('.')[0];
                } catch (e) {
                    // Invalid URL, use N/A
                }

                // Determine type from title/content keywords
                const text = `${result.title} ${result.content}`.toLowerCase();
                const type = text.includes('scholarship') ? 'scholarship' :
                           text.includes('contest') || text.includes('competition') ? 'contest' :
                           text.includes('grant') ? 'grant' :
                           text.includes('award') ? 'award' :
                           text.includes('program') ? 'program' : 'opportunity';

                const { data: saved, error } = await supabase
                    .from('opportunities')
                    .insert({
                        title: result.title,
                        description: result.content,
                        type: type,
                        organization: organization,
                        location: scope === 'local' ? 'Local/State' : scope === 'national' ? 'National' : 'International',
                        deadline: null, // Not available from search results
                        amount: 'See website',
                        source_url: result.url,
                        track_credits: {},
                        disciplines: [category],
                        tags: [category, ageGroup],
                        featured: false,
                        scope: scope || 'national',
                        age_group: ageGroup || 'all',
                        category: category,
                    })
                    .select()
                    .single();

                if (!error && saved) {
                    savedOpportunities.push(saved);
                } else if (error) {
                    console.error('Error saving opportunity:', error);
                }
            }
        }

        console.log(`✅ Found and saved ${savedOpportunities.length} opportunities for ${category}`);

        return NextResponse.json({
            opportunities: savedOpportunities,
            count: savedOpportunities.length,
            searched: opportunities.length
        });

    } catch (error: unknown) {
        console.error('Opportunity search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Search failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
