import { ActivitySuggestionService, ActivitySuggestion } from '../activitySuggestionService';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('ActivitySuggestionService', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('getSuggestionsForRemainingGaps', () => {
    it('should return suggestions for open learning gaps', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'gap-1',
                      skill_area: 'Fractions',
                      description: 'Struggles with adding fractions',
                      severity: 'moderate',
                      suggested_activities: ['Practice with visual fraction models', 'Use fraction manipulatives']
                    }
                  ],
                  error: null
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1');

      expect(result).toHaveLength(1);
      expect(result[0].skillArea).toBe('Fractions');
      expect(result[0].suggestions).toContain('Practice with visual fraction models');
    });

    it('should return empty array when no open gaps exist', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [],
                  error: null
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1');

      expect(result).toEqual([]);
    });

    it('should handle gaps with no pre-defined suggestions', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'gap-1',
                      skill_area: 'Reading Comprehension',
                      description: 'Difficulty understanding main ideas',
                      severity: 'minor',
                      suggested_activities: null
                    }
                  ],
                  error: null
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1');

      expect(result).toHaveLength(1);
      expect(result[0].skillArea).toBe('Reading Comprehension');
      expect(result[0].suggestions).toEqual([]);
    });

    it('should return empty array when database query fails', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' }
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1');

      expect(result).toEqual([]);
    });

    it('should prioritize gaps by severity', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [
                    { id: 'gap-1', skill_area: 'Minor Gap', severity: 'minor', suggested_activities: [] },
                    { id: 'gap-2', skill_area: 'Significant Gap', severity: 'significant', suggested_activities: [] },
                    { id: 'gap-3', skill_area: 'Moderate Gap', severity: 'moderate', suggested_activities: [] }
                  ],
                  error: null
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1');

      expect(result[0].skillArea).toBe('Significant Gap');
      expect(result[1].skillArea).toBe('Moderate Gap');
      expect(result[2].skillArea).toBe('Minor Gap');
    });

    it('should use provided supabase client when passed', async () => {
      const customClient = {
        from: jest.fn().mockImplementation((table) => {
          if (table === 'learning_gaps') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  is: jest.fn().mockResolvedValue({
                    data: [{ id: 'gap-1', skill_area: 'Math', suggested_activities: [] }],
                    error: null
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1', customClient as any);

      expect(customClient.from).toHaveBeenCalledWith('learning_gaps');
      expect(createClient).not.toHaveBeenCalled();
    });

    it('should return properly formatted ActivitySuggestion objects with all fields', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'gap-1',
                      skill_area: 'Division',
                      description: 'Difficulty with long division',
                      severity: 'significant',
                      suggested_activities: ['Practice division worksheets', 'Use visual aids']
                    }
                  ],
                  error: null
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await ActivitySuggestionService.getSuggestionsForRemainingGaps('student-1');

      expect(result).toHaveLength(1);
      const suggestion = result[0];

      // Verify all required fields are present and correctly formatted
      expect(suggestion).toHaveProperty('skillArea', 'Division');
      expect(suggestion).toHaveProperty('description', 'Difficulty with long division');
      expect(suggestion).toHaveProperty('severity', 'significant');
      expect(suggestion).toHaveProperty('suggestions');
      expect(Array.isArray(suggestion.suggestions)).toBe(true);
      expect(suggestion.suggestions).toHaveLength(2);
    });
  });
});
