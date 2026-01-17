import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { LESSON_GENERATION_PROMPT } from '@/lib/prompts/adelineTeachingPrompt';

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

export async function POST(req: Request) {
    try {
        const { projectTitle, projectDescription, gradeLevel, category } = await req.json();

        if (!genAI) {
            throw new Error('Google API key not configured');
        }

        const userPrompt = `Create a teaching lesson for this hands-on project:

Project Title: ${projectTitle}
Description: ${projectDescription}
Grade Level: ${gradeLevel || 'elementary'}
Category: ${category || 'general'}

The lesson should TEACH the concepts the student needs to know BEFORE they start the hands-on project.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: LESSON_GENERATION_PROMPT
        });

        const result = await model.generateContent(userPrompt);
        const content = result.response.text();

        console.log('🤖 Gemini lesson response:', content);

        // Try to extract JSON - handle markdown code blocks
        let jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (!jsonMatch) {
            jsonMatch = content.match(/\{[\s\S]*\}/);
        }

        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            console.log('✅ Lesson generated successfully');
            return NextResponse.json(parsed);
        }

        throw new Error('No valid JSON found in response');

    } catch (error: any) {
        console.error('Lesson Generation Error:', error);
        return NextResponse.json({
            error: 'Failed to generate lesson',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
