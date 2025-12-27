
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile, requirements, progress, earnedSkills, portfolio, topics } = await req.json();

    const prompt = `
You are the Graduation Architect for Dear Adeline Academy. Your mission is to reveal how a student's unique passions, character, and skills converge into a life of service and impact.

### CORE PHILOSOPHY:
- NO STANDARDIZED TESTS: We do not graduate into a system; we graduate into a calling.
- LOVE OF NEIGHBOR: Every skill must be rooted in how it serves others and corrects a "brokenness" in the world.
- PASSION-LED: Discover the "Fire" in their portfolio. What do they love so much they would do it for free?
- WORLD CHANGER: How does their graduation project actually change the physical or spiritual world?

### STUDENT DOSSIER:
- **DisplayName**: ${profile?.display_name || 'Student'}
- **Current Mastery**: ${(earnedSkills || []).map((s: any) => s.skill?.name || 'Skill').join(', ') || 'Beginning journey'}
- **Portfolio Projects (Concrete Evidence)**: 
${(portfolio || []).map((p: any) => `- ${p.title || 'Untitled'}: ${p.description || 'No description'}`).join('\n') || 'No projects in portfolio yet'}

### TASK:
Construct a "Restorative Graduation Blueprint" that synthesizes their academic requirements into a high-level mission of service. Recommend at least ONE specific Impact Campaign that fits their "bent."

### OUTPUT JSON:
- 'missionTitle': A powerful, servant-leader title for their journey.
- 'strategy': 2-3 sentences on how their work (mention specific projects) transcends "testing" and enters the realm of "Restored Truth."
- 'characterVision': A vision of the specific "Best Version of Self" they are becoming (e.g., "The Courageous Healer" or "The Just Steward").
- 'worldImpact': One specific way their calling will "Love their Neighbor" or "Change the World" in a tangible way.
- 'milestones': 3 individualized milestones that are "Service and Passion" focused.
- 'finalDefense': A vision for their "Commencement Defense"—presenting their body of work as evidence of their character and contribution to the world.

Tone: "Prophetic, encouraging, high-call, and rejection of the generic."
`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
            system: "You only output valid JSON. Return a single object representing the graduation mission roadmap."
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : '';
        if (!content) {
            throw new Error('AI returned empty response');
        }

        let jsonStr = content.trim();
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }

        const data = JSON.parse(jsonStr);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Graduation planner error:', error);
        return NextResponse.json({ error: 'Failed to generate graduation mission' }, { status: 500 });
    }
}
