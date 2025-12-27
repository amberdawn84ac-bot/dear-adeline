
import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { project, gradeLevel, studentName } = await req.json();

        const systemPrompt = `You are Adeline, a wise and warm learning companion for a child named ${studentName || 'the student'}. 
Your goal is to explain a project's instructions and objective in a way that is perfectly suited for a child in grade ${gradeLevel || 'their current grade'}.

Core Principles:
1. **Warmth & Wisdom**: Speak with the kindness of a mentor.
2. **Profound but Simple**: Don't dumb things down, but use analogies and vocabulary that resonate with someone of this age.
3. **Entrepreneurial Spark**: Frame the project as a "mission" or a "discovery" that has real-world value.
4. **Organic & Natural**: Avoid corporate or overly academic jargon. Use metaphors from nature, building, and stewardship.
5. **Original Context**: If the project has historical or biblical roots, explain them with an eye for the "Restored Truth."

Format your response as a JSON object with:
{
  "personalizedInstructions": "The instructions rewritten in your voice",
  "encouragement": "A short, inspiring message to start the project",
  "keyDiscovery": "One single thing they should look for or realize during this work"
}

Do not include any other text or markdown blocks. Only the JSON.`;

        const userPrompt = `Project Title: ${project.title}
Original Description: ${project.description}
Original Instructions: ${project.instructions}

Please adapt this for a grade ${gradeLevel} student.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        });

        const content = response.content[0].type === 'text' ? response.content[0].text : '';

        // Extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
        }

        return NextResponse.json({
            personalizedInstructions: project.instructions,
            encouragement: "You're going to do great things with this!",
            keyDiscovery: "Watch for how everything connect together."
        });

    } catch (error) {
        console.error('Project Voice Error:', error);
        return NextResponse.json({ error: 'Failed to personalize project voice' }, { status: 500 });
    }
}
