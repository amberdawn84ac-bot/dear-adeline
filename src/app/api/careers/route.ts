
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface PortfolioItem {
    type: string;
    title: string;
    description: string;
}

interface Profile {
    display_name: string;
    grade_level: string;
    state_standards: string;
}

interface Assessment {
    is_complete: boolean;
    interest_areas: string[];
    core_values: string[];
    work_style: Record<string, unknown>;
    dream_day: string;
    dream_impact: string;
    dream_legacy: string;
}

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile, skills, topics, portfolio, assessment }: {
        profile: Profile;
        skills: string[];
        topics: string[];
        portfolio: PortfolioItem[];
        assessment: Assessment;
    } = await req.json();

    // Build enhanced assessment context if quiz was completed
    let assessmentContext = '';
    if (assessment?.is_complete) {
        assessmentContext = `
### CAREER DISCOVERY ASSESSMENT RESULTS:
**Interest Areas**: ${assessment.interest_areas?.join(', ') || 'Not specified'}
**Core Values** (Ranked): ${assessment.core_values?.join(', ') || 'Not specified'}
**Work Style Preferences**: ${JSON.stringify(assessment.work_style || {}, null, 2)}
**Dream Workday Vision**: "${assessment.dream_day || 'Not provided'}"
**Desired World Impact**: "${assessment.dream_impact || 'Not provided'}"
**Legacy Goal**: "${assessment.dream_legacy || 'Not provided'}"
`;
    }

    const prompt = `
You are the Career Restoration Architect for Dear Adeline Academy. Your mission is to synthesize a student's entire body of work, curiosity, character, AND personal vision into a singular, multifaceted "Restorative Blueprint."

CRITICAL PRINCIPLES:
1. INDIVIDUALIZED: Do NOT provide a list of options. Do NOT provide "1 of 4" choices. This child is unique.
2. NO EMPLOYEES: Every vision must be entrepreneurial—founding, leading, creating, or pioneering.
3. SYNTHESIS: Instead of separate careers, create one UNIFIED CALLING that integrates their different skills.
4. BEYOND LABELS: Avoid generic titles. Create a sophisticated, mission-aligned identity.
5. RESTORED MEDICINE: If the student leans toward healing, steer AWAY from standard Allopathic/Medical School paths (petroleum-based drugs, profit-driven systems). Instead, anchor them in Holistic, Natural, Herbal, and Preventative Restoration—the way God designed the body to heal.
6. IMPACT CAMPAIGNS: Integrate the student's vocation with our non-profit initiatives (Clemency, Bail Bonds, Diversion, Reentry, Women/Power Tools, Worker Cooperatives, Community Art, Addiction Replacement, Real Food). Their venture should ideally "Fuel" or "Lead" one of these missions.
7. HONOR THEIR VISION: If they completed the career assessment, weave their dream scenarios, values, and work style preferences deeply into the blueprint. Make it THEIR vision realized.

### STUDENT DATA DOSSIER:
- **DisplayName**: ${profile?.display_name || 'Student'}
- **Academic Context**: Grade ${profile?.grade_level || 'Unknown'} | ${profile?.state_standards} standards
- **Mastery Demonstrated**: ${skills?.join(', ') || 'Early discovery phase'}
- **Intellectual Curiosity**: ${topics?.slice(0, 15).join(', ')}
- **Concrete Evidence (Portfolio)**:
${portfolio?.map((p: PortfolioItem) => `- [${p.type}] ${p.title}: ${p.description}`).join('\n')}

${assessmentContext}

### THE BLUEPRINT OUTPUT (JSON):
Return a single JSON object with these fields:
- 'callingTitle': A sophisticated, unique title for their future self (e.g., "Architect of Hebraic Agricultural Systems").
- 'manifesto': A deep, wisdom-filled paragraph explaining HOW their specific portfolio work and studies prove this is their calling. Mention their specific projects.
- 'facets': An array of 3-4 specific entrepreneurial initiatives or business models that fall UNDER this one calling.
- 'immediateMission': One specific startup task they can launch tonight derived from their current portfolio.
- 'nextMastery': The next 3 advanced skills they must pursue to fulfill this blueprint.
- 'icon': A Lucide icon name (Rocket, Compass, Leaf, Sparkles, Shield, Anchor, Target).

Tone: "A life-mentor speaking a singular, powerful vision of the child's purpose."
`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
            system: "You only output raw JSON. Do not include markdown code blocks. Return a single object representing the child's unique blueprint."
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : '';

        // Clean markdown if present
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const cleanedJson = jsonMatch ? jsonMatch[0] : content;

        const data = JSON.parse(cleanedJson);

        return NextResponse.json(data);
    } catch (error: unknown) {
        console.error('Career analyzer error:', error);
        return NextResponse.json({ error: 'Failed to analyze career paths' }, { status: 500 });
    }
}
