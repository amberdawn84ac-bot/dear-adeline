// src/app/api/adeline/route.ts

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicApiKey } from '@/lib/server/config';

// Use the recommended "flash" model
const ANTHROPIC_MODEL = 'claude-3-haiku-20240307'; 

export async function POST(request: Request) {
  try {
    const apiKey = getAnthropicApiKey();
    const anthropic = new Anthropic({ apiKey });

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    // Assuming the response structure has content[0].text
    const message = response.content[0]?.text || 'No response from AI.';

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
      }
      console.error('Anthropic API Error:', error.message);
      return NextResponse.json({ error: 'Failed to get response from Anthropic API.' }, { status: 500 });
    }
    console.error('Unknown error in Adeline API route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}