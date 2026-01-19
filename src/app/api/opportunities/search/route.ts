import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    tools: [{
        googleSearchRetrieval: {
            dynamicRetrievalConfig: {
                mode: "dynamic" as any,
                dynamicThreshold: 0.7,
            },
        },
    }],
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING },
                    organization: { type: SchemaType.STRING },
                    location: { type: SchemaType.STRING },
                    deadline: { type: SchemaType.STRING, description: "YYYY-MM-DD or null if unknown" },
                    amount: { type: SchemaType.STRING },
                    source_url: { type: SchemaType.STRING },
                    scope: { type: SchemaType.STRING },
                    category: { type: SchemaType.STRING },
                    featured: { type: SchemaType.BOOLEAN }
                },
                required: ["title", "description", "type", "organization"]
            }
        }
    }
});

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

        console.log(`🤖 generating opportunities for ${category} (${ageGroup}, ${scope}) using Gemini...`);

        const prompt = `
        Search for and list 5 ACTUAL, VERIFIED, REAL-WORLD student opportunities (scholarships, contests, grants) for:
        - Category: ${category}
        - Age Group: ${ageGroup || 'all'}
        - Geographic Scope: ${scope || 'national'}

        CRITICAL Rules:
        1. DO NOT fabricate or hallucinate opportunities. Only list ones that actually exist in 2025/2026.
        2. Verify the URL exists.
        3. If you cannot find 5 real ones, return fewer. Quality > Quantity.

        For each opportunity, provide:
        - Real title
        - Short description
        - Organization name
        - Approximate deadline (YYYY-MM-DD) or null
        - Award amount or "N/A"
        - Official URL (must be valid)
        - Scope (local/national/international)
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const generatedOpps = JSON.parse(text) as any[] || [];

        console.log(`✅ Gemini generated ${generatedOpps.length} items`);

        // Save opportunities to database
        const savedOpportunities = [];
        for (const item of generatedOpps) {
            // Check formatted URL to avoid duplicates
            // Create a fake URL if one wasn't provided or is obviously empty
            const url = item.source_url && item.source_url.length > 5 ? item.source_url : `https://google.com/search?q=${encodeURIComponent(item.title)}`;

            // Check if exists
            const { data: existing } = await supabase
                .from('opportunities')
                .select('id')
                .eq('title', item.title) // Check title since URL might be generated
                .maybeSingle();

            if (!existing) {
                const { data: saved, error } = await supabase
                    .from('opportunities')
                    .insert({
                        title: item.title,
                        description: item.description,
                        type: item.type || 'opportunity',
                        organization: item.organization,
                        location: item.location || 'Online',
                        deadline: item.deadline || null,
                        amount: item.amount || 'See details',
                        source_url: url,
                        track_credits: {},
                        disciplines: [category],
                        tags: [category, ageGroup],
                        featured: item.featured || false,
                        scope: (item.scope?.toLowerCase() as any) || scope || 'national',
                        age_group: ageGroup || 'all',
                        category: category,
                    })
                    .select()
                    .single();

                if (!error && saved) {
                    savedOpportunities.push(saved);
                } else if (error) {
                    console.error('Error saving generated opportunity:', error);
                }
            } else {
                // If it exists, we might want to return it anyway so the user sees it
                const { data: existingRecord } = await supabase
                    .from('opportunities')
                    .select('*')
                    .eq('id', existing.id)
                    .single();
                if (existingRecord) savedOpportunities.push(existingRecord);
            }
        }

        return NextResponse.json({
            opportunities: savedOpportunities,
            count: savedOpportunities.length,
            searched: generatedOpps.length
        });

    } catch (error: unknown) {
        console.error('Opportunity generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Generation failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
