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

        const { scenarioId, chosenOption, reasoning } = await request.json();

        if (!scenarioId || chosenOption === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get the scenario
        const { data: scenario, error: scenarioError } = await supabase
            .from('wisdom_scenarios')
            .select('*')
            .eq('id', scenarioId)
            .single();

        if (scenarioError || !scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
        }

        // Get the chosen option details
        const options = scenario.options as any[];
        const chosen = options.find(opt => opt.id === chosenOption);

        if (!chosen) {
            return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
        }

        // Generate Adeline's feedback using Claude
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const feedbackPrompt = `You are Adeline, a wise and gentle grandmother mentor.

A student just completed a wisdom scenario and made a choice. Provide warm, encouraging feedback.

Scenario: ${scenario.scenario_text}

Their choice: ${chosen.text}
Their reasoning: ${reasoning || 'No reasoning provided'}

Wisdom level of choice: ${chosen.wisdom_level}
Consequence: ${chosen.consequence}
Scripture connection: ${chosen.scripture_connection}

Provide feedback that:
1. Acknowledges their thoughtfulness (even if the choice wasn't ideal)
2. Gently guides them to see the wisdom in the situation
3. References the scripture in a meaningful way
4. Encourages growth and learning
5. Is warm and grandmotherly in tone
6. Keeps it concise (2-3 short paragraphs)

Remember: Never be harsh or judgmental. Always encourage and guide with love.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            messages: [{ role: 'user', content: feedbackPrompt }],
        });

        const feedback = response.content[0].type === 'text' ? response.content[0].text : '';

        // Save the response
        const { data: savedResponse, error: saveError } = await supabase
            .from('wisdom_responses')
            .insert({
                student_id: user.id,
                scenario_id: scenarioId,
                chosen_option: chosenOption,
                reasoning: reasoning || null,
                adeline_feedback: feedback
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving wisdom response:', saveError);
            return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
        }

        return NextResponse.json({
            response: savedResponse,
            feedback,
            chosenOption: chosen,
            scriptureReference: scenario.scripture_reference,
            learningPoints: scenario.learning_points
        });

    } catch (error: any) {
        console.error('Wisdom respond error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process wisdom response' },
            { status: 500 }
        );
    }
}
