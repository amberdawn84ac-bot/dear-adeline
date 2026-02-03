/**
 * Tests for real Gemini AI integration in GenUIOrchestrator
 * These tests verify that the orchestrator can call Gemini and parse responses
 */
import { GenUIOrchestrator } from '../genUIOrchestrator';
import { GeminiAdapter } from '@/lib/adeline/GeminiAdapter';

// Mock GeminiAdapter
jest.mock('@/lib/adeline/GeminiAdapter');

describe('GenUIOrchestrator - Real AI Integration', () => {
  let orchestrator: GenUIOrchestrator;
  let mockGemini: jest.Mocked<GeminiAdapter>;

  beforeEach(() => {
    // Create mock instance
    mockGemini = new GeminiAdapter() as jest.Mocked<GeminiAdapter>;
    orchestrator = new GenUIOrchestrator();

    // Replace orchestrator's gemini with our mock
    (orchestrator as any).gemini = mockGemini;
  });

  describe('composePageWithAI', () => {
    it('should call Gemini with properly formatted prompt', async () => {
      const mockAIResponse = JSON.stringify({
        dialogue: "Let's explore fractions!",
        components: [
          {
            type: 'dynamicLedger',
            props: {
              scenario: 'Pizza shop',
              items: [{ name: 'Pizza', wholesalePrice: 5, retailPrice: 10 }],
              learningGoal: 'Learn fractions'
            }
          }
        ],
        nextActions: []
      });

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      const result = await orchestrator.composePageWithAI('I want to learn fractions', {
        userId: 'test-123',
        currentInterests: ['math', 'pizza'],
        recentActivity: []
      });

      // Should have called Gemini
      expect(mockGemini.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('I want to learn fractions')
      );
      expect(mockGemini.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('math')
      );
      expect(mockGemini.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('pizza')
      );
    });

    it('should parse Gemini response into ComposedUIPage', async () => {
      const mockAIResponse = JSON.stringify({
        dialogue: "Welcome to the marketplace!",
        components: [
          {
            type: 'handDrawnIllustration',
            props: { src: '/doodles/market.svg', alt: 'Market' }
          }
        ],
        nextActions: []
      });

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      const result = await orchestrator.composePageWithAI('Teach me economics', {
        userId: 'test-123',
        currentInterests: [],
        recentActivity: []
      });

      expect(result).toHaveProperty('dialogue');
      expect(result.dialogue).toBe("Welcome to the marketplace!");
      expect(result.components).toHaveLength(1);
      expect(result.components[0].type).toBe('handDrawnIllustration');
    });

    it('should handle Gemini response with markdown code blocks', async () => {
      // Gemini often wraps JSON in ```json ``` blocks
      const mockAIResponse = '```json\n{"dialogue": "Test", "components": [], "nextActions": []}\n```';

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      const result = await orchestrator.composePageWithAI('Test', {
        userId: 'test-123',
        currentInterests: [],
        recentActivity: []
      });

      expect(result.dialogue).toBe("Test");
      expect(result.components).toEqual([]);
    });

    it('should include student interests in prompt', async () => {
      const mockAIResponse = JSON.stringify({
        dialogue: "Test",
        components: [],
        nextActions: []
      });

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      await orchestrator.composePageWithAI('Teach me', {
        userId: 'test-123',
        currentInterests: ['minecraft', 'space', 'coding'],
        recentActivity: []
      });

      const calledPrompt = mockGemini.generateContent.mock.calls[0][0];
      expect(calledPrompt).toContain('minecraft');
      expect(calledPrompt).toContain('space');
      expect(calledPrompt).toContain('coding');
    });

    it('should include available component types in prompt', async () => {
      const mockAIResponse = JSON.stringify({
        dialogue: "Test",
        components: [],
        nextActions: []
      });

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      await orchestrator.composePageWithAI('Teach me', {
        userId: 'test-123',
        currentInterests: [],
        recentActivity: []
      });

      const calledPrompt = mockGemini.generateContent.mock.calls[0][0];
      expect(calledPrompt).toContain('handDrawnIllustration');
      expect(calledPrompt).toContain('dynamicLedger');
      expect(calledPrompt).toContain('guidingQuestion');
    });

    it('should handle invalid JSON response gracefully', async () => {
      mockGemini.generateContent = jest.fn().mockResolvedValue('Invalid JSON response');

      await expect(
        orchestrator.composePageWithAI('Test', {
          userId: 'test-123',
          currentInterests: [],
          recentActivity: []
        })
      ).rejects.toThrow();
    });

    it('should fallback to mock if AI fails', async () => {
      mockGemini.generateContent = jest.fn().mockRejectedValue(new Error('API error'));

      const result = await orchestrator.composePageWithAIWithFallback('Test', {
        userId: 'test-123',
        currentInterests: [],
        recentActivity: []
      });

      // Should still return a valid page (fallback to mock)
      expect(result).toHaveProperty('dialogue');
      expect(result).toHaveProperty('components');
      expect(result.components.length).toBeGreaterThan(0);
    });

    it('should validate that components have required props', async () => {
      const mockAIResponse = JSON.stringify({
        dialogue: "Test",
        components: [
          {
            type: 'dynamicLedger',
            props: {
              scenario: 'Test scenario',
              items: [{ name: 'Item', wholesalePrice: 1, retailPrice: 2 }],
              learningGoal: 'Test goal'
            }
          }
        ],
        nextActions: []
      });

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      const result = await orchestrator.composePageWithAI('Test', {
        userId: 'test-123',
        currentInterests: [],
        recentActivity: []
      });

      const ledger = result.components[0];
      expect(ledger.props).toHaveProperty('scenario');
      expect(ledger.props).toHaveProperty('items');
      expect(ledger.props).toHaveProperty('learningGoal');
      expect(Array.isArray(ledger.props.items)).toBe(true);
    });

    it('should handle multiple components in AI response', async () => {
      const mockAIResponse = JSON.stringify({
        dialogue: "Multi-component lesson",
        components: [
          {
            type: 'handDrawnIllustration',
            props: { src: '/doodles/test.svg', alt: 'Test' }
          },
          {
            type: 'guidingQuestion',
            props: { text: 'What do you think?' }
          },
          {
            type: 'dynamicLedger',
            props: {
              scenario: 'Test',
              items: [{ name: 'X', wholesalePrice: 1, retailPrice: 2 }],
              learningGoal: 'Test'
            }
          }
        ],
        nextActions: [
          { id: 'next', label: 'Continue', action: 'continue' }
        ]
      });

      mockGemini.generateContent = jest.fn().mockResolvedValue(mockAIResponse);

      const result = await orchestrator.composePageWithAI('Complex lesson', {
        userId: 'test-123',
        currentInterests: [],
        recentActivity: []
      });

      expect(result.components).toHaveLength(3);
      expect(result.nextActions).toHaveLength(1);
    });
  });
});
