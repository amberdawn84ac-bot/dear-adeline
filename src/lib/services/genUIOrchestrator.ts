
import { GeminiAdapter } from '@/lib/adeline/GeminiAdapter';
import { z } from 'zod';
import type { InteractionEvent } from '@/hooks/useInteractionLogger';

//================================================================================
// Type Definitions
//================================================================================

/**
 * Defines the structure for an interactive component on a "Journal Page".
 */
export const UIComponentModel = z.object({
  type: z.string().describe("The type of the component (e.g., 'handDrawnIllustration', 'dynamicLedger', 'guidingQuestion')."),
  props: z.record(z.string(), z.any()).describe("The properties required to render the component."),
});
export type UIComponent = z.infer<typeof UIComponentModel>;

/**
 * Defines a suggested next action for the student.
 */
export const ActionModel = z.object({
  id: z.string(),
  label: z.string(),
  action: z.string().describe("The command to be executed when the action is triggered."),
});
export type Action = z.infer<typeof ActionModel>;

/**
 * Represents a fully composed "Journal Page" experience.
 */
export const ComposedUIPageModel = z.object({
  dialogue: z.string().optional().describe("Adeline's introductory narration for the experience."),
  components: z.array(UIComponentModel).describe("An array of UI components that make up the page."),
  nextActions: z.array(ActionModel).optional().describe("A list of suggested actions for the student to take next."),
});
export type ComposedUIPage = z.infer<typeof ComposedUIPageModel>;

/**
 * Represents Adeline's response to a specific student interaction.
 * This is often a smaller, more targeted update than a full page composition.
 */
export const InteractionResponseModel = z.object({
  responseType: z.enum(['dialogue', 'newComponent', 'acknowledgement']),
  content: z.any(),
});
export type InteractionResponse = z.infer<typeof InteractionResponseModel>;


// Placeholder for the student's context.
type StudentContext = {
  userId: string;
  currentInterests: string[];
  recentActivity: any[];
};


//================================================================================
// GenUIOrchestrator Service
//================================================================================

/**
 * Adeline's "brain" for composing and managing generative UI experiences.
 */
export class GenUIOrchestrator {
  private gemini: GeminiAdapter;

  constructor() {
    this.gemini = new GeminiAdapter('gemini-2.0-flash');
  }

  /**
   * Composes a full UI page based on a student's message and context.
   * Uses real Gemini AI to generate personalized learning experiences.
   */
  async composePage(studentMessage: string, context: StudentContext): Promise<ComposedUIPage> {
    console.log(`Composing page for message: "${studentMessage}"`, context);

    // Try to use real AI, fallback to mock if it fails
    return this.composePageWithAIWithFallback(studentMessage, context);
  }

  /**
   * Composes a page using real Gemini AI.
   * Throws error if AI call fails.
   */
  async composePageWithAI(studentMessage: string, context: StudentContext): Promise<ComposedUIPage> {
    const prompt = this.buildPrompt(studentMessage, context);

    try {
      const response = await this.gemini.generateContent(prompt);

      // Clean up markdown code blocks if present
      const cleanedResponse = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      // Parse JSON
      const composedPage = JSON.parse(cleanedResponse) as ComposedUIPage;

      return composedPage;
    } catch (error) {
      console.error('Failed to compose page with AI:', error);
      throw error;
    }
  }

  /**
   * Composes a page with AI, falling back to mock data if AI fails.
   * This ensures the app keeps working even if Gemini has issues.
   */
  async composePageWithAIWithFallback(studentMessage: string, context: StudentContext): Promise<ComposedUIPage> {
    try {
      return await this.composePageWithAI(studentMessage, context);
    } catch (error) {
      console.warn('AI page composition failed, using fallback:', error);
      return this.getMockMarketplaceExperience();
    }
  }

  /**
   * Builds the prompt for Gemini to compose a learning page.
   */
  private buildPrompt(studentMessage: string, context: StudentContext): string {
    const interestsText = context.currentInterests.length > 0
      ? context.currentInterests.join(', ')
      : 'general learning';

    return `You are Adeline, an AI tutor composing an interactive, personalized learning experience.

STUDENT MESSAGE: "${studentMessage}"

STUDENT CONTEXT:
- Interests: ${interestsText}
- Recent Activity: ${context.recentActivity.length > 0 ? JSON.stringify(context.recentActivity) : 'None'}

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

RESPONSE FORMAT:
Return ONLY valid JSON matching this structure:
{
  "dialogue": "Your warm 2-3 sentence introduction",
  "components": [
    { "type": "handDrawnIllustration", "props": {...} },
    { "type": "dynamicLedger", "props": {...} },
    { "type": "guidingQuestion", "props": {...} }
  ],
  "nextActions": [
    { "id": "explore", "label": "Explore More", "action": "explore_tool" },
    { "id": "ask", "label": "Ask a Question", "action": "open_chat" }
  ]
}

IMPORTANT:
- Return ONLY the JSON, no markdown, no explanations
- Ensure all items in dynamicLedger have name, wholesalePrice, and retailPrice
- Make scenarios engaging and relevant to student interests
- Use Charlotte Mason principles (discovery, narration, real-world connections)`;
  }

  /**
   * Processes a real-time interaction event from the student and decides
   * on a contextual response, enabling "Discovery Dialogue Patterns".
   *
   * @param event The interaction event from the frontend.
   * @param context The student's current learning context.
   * @returns A promise that resolves to an InteractionResponse or null.
   */
  async processInteractionEvent(event: InteractionEvent, context: StudentContext): Promise<InteractionResponse | null> {
    console.log('Processing interaction event:', event);

    // This is where the learning science-driven logic lives.
    // Adeline "watches" the student and provides scaffolding.
    
    // Pattern: Acknowledge Discovery
    if (
      event.componentType === 'dynamicLedger' &&
      event.action === 'slider_change'
    ) {
      const { newPrice, newProfit } = event.data;
      const margin = (newProfit / newPrice) * 100;

      if (margin > 50) {
        // TODO: This response should be generated by Gemini for variation.
        return {
          responseType: 'acknowledgement',
          content: {
            dialogue: "Excellent! A profit margin over 50% is quite strong. That's a sign of a savvy merchant."
          }
        };
      }
    }
    
    // Pattern: Prompt if Stuck (Example)
    // if (event.componentType === 'dynamicLedger' && event.action === 'no_change_for_30_seconds') {
    //   return { responseType: 'dialogue', content: { dialogue: "Feeling stuck? Try lowering the price of the Sweet Roll to see how it affects your profit." } };
    // }

    // If no specific pattern matches, return null.
    return null;
  }

  /**
   * Returns a mock "medieval marketplace" experience.
   */
  private getMockMarketplaceExperience(): ComposedUIPage {
    const merchantScenario = {
      scenario: "You are a merchant at a bustling medieval market trying to sell bread.",
      items: [
        { name: "Loaf of Bread", wholesalePrice: 2, retailPrice: 3 },
        { name: "Baguette", wholesalePrice: 1.5, retailPrice: 2.5 },
        { name: "Sweet Roll", wholesalePrice: 1, retailPrice: 2 },
      ],
      learningGoal: "Understand profit margins and percentages."
    };

    return {
      dialogue: "An excellent question! To truly understand money, let's step into a bustling medieval marketplace. You are a baker, and your goal is to sell your goods for a profit without being unfair to your customers.",
      components: [
        {
          type: 'handDrawnIllustration',
          props: {
            src: '/doodles/marketplace.svg',
            alt: 'A hand-drawn sketch of a medieval marketplace with stalls and people.'
          }
        },
        {
          type: 'dynamicLedger',
          props: merchantScenario
        },
        {
          type: 'guidingQuestion',
          props: {
            text: "What happens to your profit margin when you raise the price of a Sweet Roll by 50%?"
          }
        }
      ],
      nextActions: [
        { id: 'explore_ledger', label: 'Explore the Ledger', action: 'focus_tool(dynamicLedger)' },
        { id: 'ask_question', label: 'Ask a question', action: 'open_chat' },
        { id: 'move_on', label: 'I am finished', action: 'complete_activity' },
      ]
    };
  }
}
