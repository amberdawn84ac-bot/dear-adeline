import { LearningGapService } from '../learningGapService';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('LearningGapService', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('resolveGaps', () => {
    it('should resolve matching gaps when skills are demonstrated', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [{ id: 'gap-1', skill_area: 'Baking' }],
                  error: null
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const result = await LearningGapService.resolveGaps('student-1', ['Baking', 'Math']);

      expect(result).toContain('Baking');
      expect(mockSupabase.from).toHaveBeenCalledWith('learning_gaps');
    });

    it('should return empty array when no gaps exist for student', async () => {
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

      const result = await LearningGapService.resolveGaps('student-1', ['Baking']);

      expect(result).toEqual([]);
    });

    it('should return empty array when skills do not match any gaps', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [{ id: 'gap-1', skill_area: 'Reading' }],
                  error: null
                }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await LearningGapService.resolveGaps('student-1', ['Math', 'Science']);

      expect(result).toEqual([]);
    });

    it('should match gaps case-insensitively', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [{ id: 'gap-1', skill_area: 'BAKING' }],
                  error: null
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const result = await LearningGapService.resolveGaps('student-1', ['baking']);

      expect(result).toContain('BAKING');
    });

    it('should resolve multiple matching gaps from one activity', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [
                    { id: 'gap-1', skill_area: 'Baking' },
                    { id: 'gap-2', skill_area: 'Math' },
                    { id: 'gap-3', skill_area: 'Science' }
                  ],
                  error: null
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const result = await LearningGapService.resolveGaps('student-1', ['Baking', 'Math']);

      expect(result).toContain('Baking');
      expect(result).toContain('Math');
      expect(result).not.toContain('Science');
      expect(result).toHaveLength(2);
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

      const result = await LearningGapService.resolveGaps('student-1', ['Baking']);

      expect(result).toEqual([]);
    });

    it('should not include gap in result when update fails', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'learning_gaps') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                is: jest.fn().mockResolvedValue({
                  data: [{ id: 'gap-1', skill_area: 'Baking' }],
                  error: null
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
            }),
          };
        }
        return {};
      });

      const result = await LearningGapService.resolveGaps('student-1', ['Baking']);

      expect(result).toEqual([]);
    });

    it('should use provided supabase client when passed', async () => {
      const customClient = {
        from: jest.fn().mockImplementation((table) => {
          if (table === 'learning_gaps') {
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  is: jest.fn().mockResolvedValue({
                    data: [{ id: 'gap-1', skill_area: 'Baking' }],
                    error: null
                  }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null }),
              }),
            };
          }
          return {};
        }),
      };

      const result = await LearningGapService.resolveGaps('student-1', ['Baking'], customClient as any);

      expect(result).toContain('Baking');
      expect(customClient.from).toHaveBeenCalledWith('learning_gaps');
      expect(createClient).not.toHaveBeenCalled();
    });
  });
});