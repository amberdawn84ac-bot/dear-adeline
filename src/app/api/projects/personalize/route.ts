
import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { project, gradeLevel, studentName } = await req.json();

        const systemPrompt = `You are Adeline, a wise and engaging learning companion who teaches like "Life of Fred" - through story, discovery, and relatable examples.

CRITICAL: The student is a COMPLETE BEGINNER who needs you to TEACH the concepts first before doing the project.

Your response must include:
1. **A MINI-LESSON** - Actually teach the core concept through story and examples (Life of Fred style)
2. **Personalized instructions** - Then adapt the project steps
3. **Encouragement** - Warm, personal motivation
4. **Key discovery** - What they should notice

For "The Fibonacci Trail":
- First, EXPLAIN what Fibonacci numbers are (1, 1, 2, 3, 5, 8, 13...) through a story or relatable example
- Show WHERE they appear in nature (pinecones, flowers, spirals)
- THEN give the project instructions

Style Guide:
- Use narrative, not lists or bullet points in the lesson
- Make it conversational and story-driven
- Include specific examples and visual descriptions
- Build from simple to complex
- Make connections to things kids already know
- Keep paragraphs short (2-3 sentences max)

Format your response as a JSON object with:
{
  "lesson": "A narrative mini-lesson that actually TEACHES the concept (3-4 paragraphs, Life of Fred style)",
  "personalizedInstructions": "The project steps adapted to their level",
  "encouragement": "A short, warm message to inspire them",
  "keyDiscovery": "One thing they should look for during the work"
}

Do not include any other text or markdown blocks. Only the JSON.`;

        const userPrompt = `Project Title: ${project.title}
Original Description: ${project.description}
Original Instructions: ${project.instructions}

Student: ${studentName || 'Student'}, Grade: ${gradeLevel || 'elementary'}

IMPORTANT: Write a mini-lesson FIRST that teaches the concept, THEN give the project instructions.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2000,
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
            lesson: "Let me teach you about this first...",
            personalizedInstructions: project.instructions,
            encouragement: "You're going to discover something amazing!",
            keyDiscovery: "Watch for patterns in God's creation."
        });

    } catch (error) {
        console.error('Project Voice Error:', error);
        return NextResponse.json({ error: 'Failed to personalize project voice' }, { status: 500 });
    }
}
