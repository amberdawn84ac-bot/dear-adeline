// src/app/api/adeline/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '@/lib/server/config';

// Use the recommended "flash" model for speed and cost-effectiveness
const GOOGLE_AI_MODEL = 'gemini-2.5-flash';

export async function POST(request: Request) {
  try {
    const { googleApiKey } = getConfig();
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: GOOGLE_AI_MODEL });

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ message: text }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('GOOGLE_API_KEY')) {
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
      }
      console.error('Google AI API Error:', error.message);
      return NextResponse.json({ error: 'Failed to get response from Google AI API.' }, { status: 500 });
    }
    console.error('Unknown error in Adeline API route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
