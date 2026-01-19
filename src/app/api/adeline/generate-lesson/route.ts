import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAIAPIKey } from '@/lib/server/config';
import { generateLessonPrompt } from '@/lib/services/promptService';

// Use the configured flash model
const GOOGLE_AI_MODEL = 'gemini-2.5-flash';

export async function POST(request: Request) {
    try {
        const googleApiKey = getGoogleAIAPIKey();
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({
            model: GOOGLE_AI_MODEL,
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const { interests, age } = await request.json();

        if (!interests || !Array.isArray(interests) || interests.length === 0) {
            return NextResponse.json({ error: 'Interests array is required.' }, { status: 400 });
        }

        const prompt = generateLessonPrompt(interests, age);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse JSON to ensure validity before returning
        let lessonData;
        try {
            lessonData = JSON.parse(text);
        } catch (_e) {
            console.error('Failed to parse AI response as JSON:', text);
            return NextResponse.json({ error: 'Failed to generate valid lesson format.' }, { status: 500 });
        }

        return NextResponse.json({ lesson: lessonData }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Google AI API Error:', error.message);
            return NextResponse.json({ error: 'Failed to generate lesson.' }, { status: 500 });
        }
        console.error('Unknown error in generate-lesson API:', error);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}
