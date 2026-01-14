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
});