import { NextRequest } from 'next/server';
import { POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { ActivityTranslationService } from '@/lib/services/activityTranslationService';
import { MasteryService } from '@/lib/services/masteryService';
import { LearningGapService } from '@/lib/services/learningGapService';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/services/activityTranslationService');
jest.mock('@/lib/services/masteryService');
jest.mock('@/lib/services/learningGapService');

describe('/api/logs/translate POST', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { grade_level: '10th' },
                error: null,
              }),
            })),
          })),
        };
      }
      return {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      };
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should translate activity, process skills, and log the result', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    (ActivityTranslationService.translate as jest.Mock).mockResolvedValue({
      translation: 'Chemistry 101',
      skills: ['Mixing', 'Heating'],
      grade: '10th',
    });

    (MasteryService.processSkills as jest.Mock).mockResolvedValue([
      { skill: 'Mixing', status: 'Mastered', creditEarned: 0.25 },
      { skill: 'Heating', status: 'Depth of Study', creditEarned: 0 }
    ]);

    (LearningGapService.resolveGaps as jest.Mock).mockResolvedValue([
      'Mixing'
    ]);

    mockSupabase.from().insert().select().single.mockResolvedValue({
      data: { id: 'log-1', caption: 'Cooked stuff' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/logs/translate', {
      method: 'POST',
      body: JSON.stringify({ caption: 'Cooked stuff' }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.analysis.translation).toBe('Chemistry 101');
    expect(body.mastery).toHaveLength(2);
    expect(body.mastery[0].status).toBe('Mastered');
    expect(body.resolvedGaps).toEqual(['Mixing']);
  });
});
