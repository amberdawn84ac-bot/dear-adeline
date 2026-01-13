import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CATEGORY_SEARCH_QUERIES: Record<string, string> = {
    Justice: 'youth advocacy social justice legal aid civil rights volunteer programs students',
    Community: 'community service volunteer programs youth engagement neighborhood projects students',
    Growth: 'youth development education mentoring tutoring programs students volunteer',
    Provision: 'food bank community kitchen homeless shelter poverty relief volunteer youth'
};

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { category } = await req.json();

        if (!category || category === 'All') {
            return NextResponse.json({ error: 'Category required' }, { status: 400 });
        }

        // Check for Tavily API key
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Tavily API key not configured' }, { status: 500 });
        }

        // Get search query for this category
        const searchQuery = CATEGORY_SEARCH_QUERIES[category] || 'youth volunteer community service programs';

        console.log('🔍 Searching for campaigns:', searchQuery);

        // Search the web using Tavily API
        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: searchQuery,
                search_depth: 'advanced',
                max_results: 8,
            }),
        });

        if (!tavilyResponse.ok) {
            throw new Error('Tavily search failed');
        }

        const searchData = await tavilyResponse.json();
        const results = searchData.results || [];

        // Transform web results into campaign format
        const campaigns = results.map((result: any, index: number) => {
            // Extract organization from URL domain
            let organization = 'N/A';
            try {
                const hostname = new URL(result.url).hostname.replace('www.', '');
                organization = hostname.split('.')[0];
            } catch (e) {
                // Invalid URL
            }

            return {
                id: `scraped-${category.toLowerCase()}-${index}`,
                title: result.title,
                objective: result.content,
                targetAudience: 'Youth volunteers, students, community members',
                metrics: ['Volunteer hours', 'Participants', 'Community impact', 'Skills gained'],
                resources: ['Time commitment', 'Training provided', 'Support materials'],
                timeline: 'Ongoing program - check website for details',
                category: category,
                icon: getIconForCategory(category),
                source_url: result.url,
                organization: organization,
                scraped: true
            };
        });

        console.log(`✅ Found ${campaigns.length} campaigns for ${category}`);

        return NextResponse.json({
            campaigns,
            count: campaigns.length
        });

    } catch (error: any) {
        console.error('Campaign search error:', error);
        return NextResponse.json({
            error: 'Search failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

function getIconForCategory(category: string): string {
    const icons: Record<string, string> = {
        Justice: 'Scale',
        Community: 'Users',
        Growth: 'GraduationCap',
        Provision: 'Leaf'
    };
    return icons[category] || 'Heart';
}
