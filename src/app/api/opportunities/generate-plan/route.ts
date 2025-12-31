import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { opportunityId, opportunityText } = await request.json();

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        // Get opportunity details from database if ID provided
        let opportunityDetails = opportunityText;
        if (opportunityId) {
            const { data: opp } = await supabase
                .from('opportunities')
                .select('*')
                .eq('id', opportunityId)
                .single();

            if (opp) {
                opportunityDetails = `${opp.title}\n\n${opp.description}\n\nOrganization: ${opp.organization}\nDeadline: ${opp.deadline}\nAmount: ${opp.amount}`;
            }
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 3000,
            messages: [{
                role: 'user',
                content: `Transform this opportunity into a mastery-based learning project for an Oklahoma high school student.

Opportunity:
${opportunityDetails}

Create a structured project plan in JSON format with:
1. mission: A clear, inspiring mission statement (1-2 sentences)
2. outcome: The expected outcome/deliverable
3. creditAreas: Array of subject areas this counts toward (e.g., ["Art", "Economics", "English"])
4. skills: Array of skills to master, each with {name: string, completed: boolean}
5. actionPlan: Step-by-step plan, each with {step: string, time: string}
6. evidenceRequirements: Array of what student needs to document/submit
7. oklahomaStandards: Brief note on relevant Oklahoma academic standards

Return ONLY valid JSON, no markdown or explanations.`
            }]
        });

        const aiText = response.content[0].type === 'text' ? response.content[0].text : '';

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = aiText;
        const codeBlockMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
            jsonText = codeBlockMatch[1];
        }

        const projectPlan = JSON.parse(jsonText);

        return NextResponse.json({ projectPlan });
    } catch (error) {
        console.error('Project plan generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate project plan' },
            { status: 500 }
        );
    }
}
