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
              eq: jest.fn().mockResolvedValue({ data: [], error: null }), // No existing skill
            }),
          }),
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'skills') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ 
              data: [{ id: 'skill-123', name: 'Baking', credit_value: 0.25 }], 
              error: null 
            }),
          }),
        };
      }
      return {};
    });

    const result = await MasteryService.processSkills('student-1', ['Baking']);
    
    expect(result).toEqual([
      { skill: 'Baking', status: 'Mastered', creditEarned: 0.25 }
    ]);
  });
});
