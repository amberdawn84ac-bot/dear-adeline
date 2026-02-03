import { GenUIOrchestrator } from '../genUIOrchestrator';
import type { InteractionEvent } from '@/hooks/useInteractionLogger';

// Mock GeminiAdapter
jest.mock('@/lib/adeline/GeminiAdapter');

describe('GenUIOrchestrator', () => {
  let orchestrator: GenUIOrchestrator;

  beforeEach(() => {
    orchestrator = new GenUIOrchestrator();
  });

  describe('composePage', () => {
    it('should return a ComposedUIPage structure', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: ['math', 'economics'],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('I want to learn about money', mockContext);

      expect(result).toHaveProperty('dialogue');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('nextActions');
    });

    it('should include dialogue introduction', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('Test message', mockContext);

      expect(result.dialogue).toBeDefined();
      expect(typeof result.dialogue).toBe('string');
      expect(result.dialogue.length).toBeGreaterThan(0);
    });

    it('should include components array', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('Test message', mockContext);

      expect(Array.isArray(result.components)).toBe(true);
      expect(result.components.length).toBeGreaterThan(0);
    });

    it('should include components with type and props', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('Test message', mockContext);

      result.components.forEach((component) => {
        expect(component).toHaveProperty('type');
        expect(component).toHaveProperty('props');
        expect(typeof component.type).toBe('string');
        expect(typeof component.props).toBe('object');
      });
    });

    it('should include nextActions', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('Test message', mockContext);

      expect(result.nextActions).toBeDefined();
      expect(Array.isArray(result.nextActions)).toBe(true);
    });

    it('should include actionable nextActions', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('Test message', mockContext);

      if (result.nextActions) {
        result.nextActions.forEach((action) => {
          expect(action).toHaveProperty('id');
          expect(action).toHaveProperty('label');
          expect(action).toHaveProperty('action');
        });
      }
    });
  });

  describe('processInteractionEvent', () => {
    it('should acknowledge high profit margin discovery', async () => {
      const event: InteractionEvent = {
        componentType: 'dynamicLedger',
        action: 'slider_change',
        data: {
          newPrice: 10,
          newProfit: 6,
        },
        timestamp: Date.now(),
      };

      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.processInteractionEvent(event, mockContext);

      expect(result).toBeDefined();
      expect(result?.responseType).toBe('acknowledgement');
      expect(result?.content).toHaveProperty('dialogue');
    });

    it('should return null for non-matching patterns', async () => {
      const event: InteractionEvent = {
        componentType: 'unknownComponent',
        action: 'unknown_action',
        data: {},
        timestamp: Date.now(),
      };

      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.processInteractionEvent(event, mockContext);

      expect(result).toBeNull();
    });

    it('should not acknowledge low profit margins', async () => {
      const event: InteractionEvent = {
        componentType: 'dynamicLedger',
        action: 'slider_change',
        data: {
          newPrice: 10,
          newProfit: 2, // Only 20% margin
        },
        timestamp: Date.now(),
      };

      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.processInteractionEvent(event, mockContext);

      // Should return null because margin < 50%
      expect(result).toBeNull();
    });

    it('should handle events with missing data gracefully', async () => {
      const event: InteractionEvent = {
        componentType: 'dynamicLedger',
        action: 'slider_change',
        data: {}, // Missing newPrice and newProfit
        timestamp: Date.now(),
      };

      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      // Should not throw an error
      const result = await orchestrator.processInteractionEvent(event, mockContext);

      expect(result).toBeDefined(); // May return null or handle gracefully
    });
  });

  describe('marketplace experience', () => {
    it('should include handDrawnIllustration component', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: ['medieval history'],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('I want to learn about money', mockContext);

      const illustrationComponent = result.components.find((c) => c.type === 'handDrawnIllustration');
      expect(illustrationComponent).toBeDefined();
      expect(illustrationComponent?.props).toHaveProperty('src');
      expect(illustrationComponent?.props).toHaveProperty('alt');
    });

    it('should include dynamicLedger component', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('I want to learn about money', mockContext);

      const ledgerComponent = result.components.find((c) => c.type === 'dynamicLedger');
      expect(ledgerComponent).toBeDefined();
      expect(ledgerComponent?.props).toHaveProperty('scenario');
      expect(ledgerComponent?.props).toHaveProperty('items');
      expect(ledgerComponent?.props).toHaveProperty('learningGoal');
    });

    it('should include guidingQuestion component', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('I want to learn about money', mockContext);

      const questionComponent = result.components.find((c) => c.type === 'guidingQuestion');
      expect(questionComponent).toBeDefined();
      expect(questionComponent?.props).toHaveProperty('text');
    });

    it('should provide items with wholesale and retail prices', async () => {
      const mockContext = {
        userId: 'test-user-123',
        currentInterests: [],
        recentActivity: [],
      };

      const result = await orchestrator.composePage('I want to learn about money', mockContext);

      const ledgerComponent = result.components.find((c) => c.type === 'dynamicLedger');
      expect(ledgerComponent?.props.items).toBeInstanceOf(Array);
      expect(ledgerComponent?.props.items.length).toBeGreaterThan(0);

      ledgerComponent?.props.items.forEach((item: any) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('wholesalePrice');
        expect(item).toHaveProperty('retailPrice');
        expect(typeof item.wholesalePrice).toBe('number');
        expect(typeof item.retailPrice).toBe('number');
      });
    });
  });
});
