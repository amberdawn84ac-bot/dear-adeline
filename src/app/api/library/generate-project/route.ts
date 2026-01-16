import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { PROJECT_GENERATION_PROMPT } from '@/lib/prompts/adelineTeachingPrompt';

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

export async function POST(req: Request) {
    try {
        const { lessonContent, keyConcepts, gradeLevel, category } = await req.json();

        if (!genAI) {
            throw new Error('Google API key not configured');
        }

        const userPrompt = `Create a hands-on project for students who have just learned these concepts:

Key Concepts Taught:
${keyConcepts?.join('\n') || 'See lesson content'}

Lesson Summary:
${lessonContent?.substring(0, 500) || 'Not provided'}...

Grade Level: ${gradeLevel || 'elementary'}
Category: ${category || 'general'}

The project should let students APPLY what they learned through hands-on exploration.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: PROJECT_GENERATION_PROMPT
        });

        const result = await model.generateContent(userPrompt);
        const content = result.response.text();

        console.log('🤖 Gemini project response:', content);

        // Try to extract JSON - handle markdown code blocks
        let jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (!jsonMatch) {
            jsonMatch = content.match(/\{[\s\S]*\}/);
        }

        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            console.log('✅ Project generated successfully');
            return NextResponse.json(parsed);
        }

        throw new Error('No valid JSON found in response');

    } catch (error: any) {
        console.error('Project Generation Error:', error);
        return NextResponse.json({
            error: 'Failed to generate project',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
