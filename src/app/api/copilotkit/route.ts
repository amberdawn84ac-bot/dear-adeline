import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest } from 'next/server';
import { ComposedUIPageModel } from '@/lib/services/genUIOrchestrator';

/**
 * This API route is the entry point for all generative UI experiences.
 * Uses Vercel AI SDK to stream structured UI compositions from Gemini.
 */
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // TODO: Fetch the real, rich student context from the database.
    const mockStudentContext = {
      userId: 'user_123',
      currentInterests: ['medieval history', 'baking', 'economics'],
      recentActivity: [
        { type: 'read', topic: 'history_of_money' },
        { type: 'failed_question', topic: 'percentage_calculation' }
      ]
    };

    const interestsText = mockStudentContext.currentInterests.length > 0
      ? mockStudentContext.currentInterests.join(', ')
      : 'general learning';

    // Use AI SDK to stream structured object from Gemini
    const result = streamObject({
      model: google('gemini-2.0-flash-exp'),
      schema: ComposedUIPageModel,
      prompt: `You are Adeline, an AI tutor composing an interactive, personalized learning experience.

STUDENT MESSAGE: "${message}"

STUDENT CONTEXT:
- Interests: ${interestsText}
- Recent Activity: ${mockStudentContext.recentActivity.length > 0 ? JSON.stringify(mockStudentContext.recentActivity) : 'None'}

YOUR TASK:
Compose a rich, interactive "Journal Page" learning experience that responds to the student's message.

AVAILABLE COMPONENT TYPES:
1. handDrawnIllustration
   Props: { src: string (path to /doodles/*.svg), alt: string }
   Use for: Visual context, setting the scene

2. dynamicLedger
   Props: {
     scenario: string (engaging scenario description),
     items: Array<{ name: string, wholesalePrice: number, retailPrice: number }>,
     learningGoal: string
   }
   Use for: Math concepts (fractions, percentages, profit margins, ratios)

3. guidingQuestion
   Props: { text: string }
   Use for: Prompting reflection, discovery-based learning

DESIGN PRINCIPLES:
- Connect to student's interests (${interestsText})
- Use narrative, not lectures ("Let's step into a medieval marketplace...")
- Make it feel like an adventure, not homework
- Multi-component experiences are encouraged (image + tool + question)
- Keep dialogue warm but concise (2-3 sentences max)

IMPORTANT:
- Ensure all items in dynamicLedger have name, wholesalePrice, and retailPrice
- Make scenarios engaging and relevant to student interests
- Use Charlotte Mason principles (discovery, narration, real-world connections)`,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('GenUI Orchestration API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to compose UI experience.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
