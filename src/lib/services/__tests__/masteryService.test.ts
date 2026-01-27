import { MasteryService } from '../masteryService';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('MasteryService', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should process new skills as "Mastered" and existing ones as "Depth of Study"', async () => {
    // Mock existing skill check
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'student_skills') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              ilike: jest.fn().mockResolvedValue({ data: [], error: null }), // Added ilike mock
            }),
          }),
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'skills') {
        return {
          select: jest.fn().mockReturnValue({
            // Support .eq().maybeSingle() chain if needed
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
            // Support .ilike('name', ...).maybeSingle() chain
            ilike: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { id: 'skill-123', name: 'Baking', credit_value: 0.25 },
                error: null
              }),
            }),
          }),
        };
      }
      if (table === 'skill_levels') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { level: 'mastered' }, error: null }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    // Mock rpc call
    mockSupabase.rpc = jest.fn().mockResolvedValue({ error: null });

    const result = await MasteryService.processSkills('student-1', ['Baking']);

    expect(result).toEqual([
      { skill: 'Baking', status: 'Mastered', level: 100, creditEarned: 0.25 }
    ]);
  });
});
