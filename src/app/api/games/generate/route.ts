import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { concept } = await request.json();

        if (!concept) {
            return NextResponse.json({ error: 'Game concept required' }, { status: 400 });
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const prompt = `You are a game developer creating educational HTML games for students.

Create a complete, self-contained HTML file with inline CSS and JavaScript based on this concept:
"${concept}"

REQUIREMENTS:
1. Must be playable immediately (no external dependencies)
2. Must have clear instructions for the student
3. Must have a Biblical worldview (if applicable to the concept)
4. Must be educational and engaging
5. Use simple, clean design with good UX
6. Include a score or progress indicator
7. Make it fun and interactive!

IMPORTANT: Return ONLY the raw HTML code. No markdown, no explanations, no code blocks. Just pure HTML starting with <!DOCTYPE html>.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        });

        const contentBlock = response.content[0];
        let gameHtml = contentBlock.type === 'text' ? contentBlock.text : '';

        // Clean up any markdown code blocks if Claude added them
        gameHtml = gameHtml.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

        // Ensure it starts with DOCTYPE
        if (!gameHtml.toLowerCase().startsWith('<!doctype')) {
            gameHtml = '<!DOCTYPE html>\n' + gameHtml;
        }

        return NextResponse.json({ html: gameHtml });
    } catch (error: unknown) {
        console.error('Game generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Failed to generate game' },
            { status: 500 }
        );
    }
}
