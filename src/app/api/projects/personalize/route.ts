
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

export async function POST(req: Request) {
    try {
        const { project, gradeLevel, studentName } = await req.json();

        if (!genAI) {
            throw new Error('Google API key not configured');
        }

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

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(userPrompt);
        const content = result.response.text();

        console.log('🤖 Gemini response:', content);

        // Try to extract JSON - handle markdown code blocks
        let jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (!jsonMatch) {
            jsonMatch = content.match(/\{[\s\S]*\}/);
        }

        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            console.log('📦 Extracted JSON:', jsonStr);
            try {
                const parsed = JSON.parse(jsonStr);
                console.log('✅ Parsed successfully:', parsed);
                return NextResponse.json(parsed);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('Failed to parse:', jsonStr);
            }
        }

        console.log('⚠️ No valid JSON found, using fallback');
        return NextResponse.json({
            lesson: "Let me teach you about this first...\n\nEvery pattern in nature tells a story. Some patterns are so perfect, so precise, that they've puzzled humans for thousands of years. One of these magical patterns is called the Fibonacci sequence.\n\nImagine you start with just two numbers: 1 and 1. Now, to get the next number, you simply add the two numbers before it. So 1 + 1 = 2. Then 1 + 2 = 3. Then 2 + 3 = 5. Keep going: 3 + 5 = 8, then 5 + 8 = 13, and so on!\n\nHere's where it gets amazing: this simple pattern shows up EVERYWHERE in God's creation. Pinecones, sunflowers, seashells, even the spiral of a hurricane! It's like nature is using the same beautiful math over and over again.",
            personalizedInstructions: project.instructions,
            encouragement: "You're going to discover something amazing!",
            keyDiscovery: "Watch for patterns in God's creation."
        });

    } catch (error: any) {
        console.error('Project Voice Error:', error);
        console.error('Error details:', error?.message, error?.status);
        return NextResponse.json({
            error: 'Failed to personalize project voice',
            details: error?.message || 'Unknown error',
            hasApiKey: !!process.env.GOOGLE_API_KEY
        }, { status: 500 });
    }
}
