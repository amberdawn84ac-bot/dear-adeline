import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const CATEGORY_SEARCH_QUERIES: Record<string, string[]> = {
    art: [
        'art contests for students',
        'youth art grants',
        'student art competitions',
        'creative arts scholarships',
        'visual arts opportunities for teens'
    ],
    writing: [
        'writing contests for students',
        'youth poetry competitions',
        'creative writing scholarships',
        'essay contests for high school',
        'student journalism opportunities'
    ],
    science: [
        'science fairs for students',
        'STEM competitions for youth',
        'math olympiad for students',
        'science research grants for teens',
        'robotics competitions for students'
    ],
    history: [
        'history essay contests',
        'social studies competitions for students',
        'historical research grants for youth',
        'debate tournaments for students',
        'model united nations conferences'
    ],
    entrepreneurship: [
        'business plan competitions for students',
        'entrepreneurship programs for youth',
        'startup grants for students',
        'young entrepreneur competitions',
        'business scholarships for high school'
    ],
    technology: [
        'coding competitions for students',
        'hackathons for youth',
        'app development contests',
        'cybersecurity competitions for students',
        'technology scholarships for teens'
    ],
    service: [
        'community service awards for students',
        'volunteer opportunities for youth',
        'leadership programs for students',
        'service scholarships for teens',
        'youth civic engagement programs'
    ],
    scholarships: [
        'academic scholarships for students',
        'merit scholarships for high school',
        'college scholarships for homeschoolers',
        'national scholarship programs',
        'local scholarships for students'
    ]
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

        // Get search queries for this category
        const searchQueries = CATEGORY_SEARCH_QUERIES[category] || [];

        // Build AI prompt to generate opportunities
        const ageGroupText = ageGroup === 'elementary' ? 'elementary school (K-5)' :
                           ageGroup === 'middle' ? 'middle school (6-8)' :
                           ageGroup === 'high' ? 'high school (9-12)' :
                           ageGroup === 'college' ? 'college students' : 'students of all ages';

        const scopeText = scope === 'local' ? 'local and state-level' :
                        scope === 'national' ? 'national' : 'all levels (local, national, and international)';

        const prompt = `Generate a list of 5-10 real, current opportunities for ${ageGroupText} in the category: ${category}.

Focus on ${scopeText} opportunities including:
${searchQueries.map(q => `- ${q}`).join('\n')}

For each opportunity, provide:
1. title: Official name of the opportunity
2. description: Brief description (2-3 sentences)
3. type: (contest, scholarship, grant, program, fair, competition, award)
4. organization: Organization hosting it
5. deadline: Approximate deadline or "Rolling" (use YYYY-MM-DD format)
6. amount: Prize/scholarship amount if applicable, or "N/A"
7. source_url: A plausible URL (real if you know it, or organization website)
8. scope: local, national, or international
9. age_group: elementary, middle, high, or college

Return ONLY valid JSON array, no markdown:
[
  {
    "title": "...",
    "description": "...",
    "type": "...",
    "organization": "...",
    "deadline": "...",
    "amount": "...",
    "source_url": "...",
    "scope": "...",
    "age_group": "..."
  }
]

Focus on well-known, legitimate opportunities. Include major national competitions and local opportunities.`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON from response
        let opportunities = [];
        try {
            // Extract JSON array from response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                opportunities = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return NextResponse.json({ error: 'Failed to parse opportunities' }, { status: 500 });
        }

        // Save opportunities to database
        const savedOpportunities = [];
        for (const opp of opportunities) {
            const { data: existing } = await supabase
                .from('opportunities')
                .select('id')
                .eq('title', opp.title)
                .single();

            if (!existing) {
                const { data: saved, error } = await supabase
                    .from('opportunities')
                    .insert({
                        title: opp.title,
                        description: opp.description,
                        type: opp.type || 'opportunity',
                        organization: opp.organization || 'N/A',
                        location: scope === 'local' ? 'Local/State' : scope === 'national' ? 'National' : 'International',
                        deadline: opp.deadline || null,
                        amount: opp.amount || 'N/A',
                        source_url: opp.source_url || '',
                        track_credits: {},
                        disciplines: [category],
                        tags: [category, ageGroup],
                        featured: false,
                        scope: opp.scope || scope || 'national',
                        age_group: opp.age_group || ageGroup || 'all',
                        category: category,
                    })
                    .select()
                    .single();

                if (!error && saved) {
                    savedOpportunities.push(saved);
                }
            }
        }

        return NextResponse.json({
            opportunities: savedOpportunities,
            count: savedOpportunities.length
        });

    } catch (error: any) {
        console.error('Opportunity search error:', error);
        return NextResponse.json({
            error: 'Search failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
