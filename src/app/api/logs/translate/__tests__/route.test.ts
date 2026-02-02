
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { ActivityTranslationService } from '@/lib/services/activityTranslationService';
import { MasteryService } from '@/lib/services/masteryService';
import { LearningGapService } from '@/lib/services/learningGapService';
import { ActivitySuggestionService } from '@/lib/services/activitySuggestionService';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/services/activityTranslationService');
jest.mock('@/lib/services/masteryService');
jest.mock('@/lib/services/learningGapService');
jest.mock('@/lib/services/activitySuggestionService');

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: ResponseInit) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
  NextRequest: jest.fn((url: string, init?: RequestInit) => ({
    url,
    ...init,
    json: () => Promise.resolve(JSON.parse(init?.body as string)),
  })),
}));

describe('/api/logs/translate POST', () => {
  // Shared mock for activity_logs insert chain
  const mockActivityLogsSingle = jest.fn();
  const mockActivityLogsSelect = jest.fn(() => ({ single: mockActivityLogsSingle }));
  const mockActivityLogsInsert = jest.fn(() => ({ select: mockActivityLogsSelect }));

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
      // activity_logs table
      return {
        insert: mockActivityLogsInsert,
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

    mockActivityLogsSingle.mockResolvedValue({
      data: { id: 'log-1', caption: 'Cooked stuff' },
      error: null,
    });

    const req = {
      url: 'http://localhost/api/logs/translate',
      method: 'POST',
      json: async () => ({ caption: 'Cooked stuff' }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.analysis.translation).toBe('Chemistry 101');
    expect(body.mastery).toHaveLength(2);
    expect(body.mastery[0].status).toBe('Mastered');
    expect(body.resolvedGaps).toEqual(['Mixing']);
  });

  it('should return activity suggestions for remaining gaps after logging', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user' } },
      error: null,
    });

    (ActivityTranslationService.translate as jest.Mock).mockResolvedValue({
      translation: 'Baking Fundamentals',
      skills: ['Measuring', 'Mixing'],
      grade: '5th',
    });

    (MasteryService.processSkills as jest.Mock).mockResolvedValue([
      { skill: 'Measuring', status: 'Mastered', creditEarned: 0.25 },
    ]);

    (LearningGapService.resolveGaps as jest.Mock).mockResolvedValue([]);

    (ActivitySuggestionService.getSuggestionsForRemainingGaps as jest.Mock).mockResolvedValue([
      {
        skillArea: 'Fractions',
        description: 'Needs practice with fractions',
        severity: 'moderate',
        suggestions: ['Use fraction manipulatives', 'Practice with pizza slices'],
      },
    ]);

    mockActivityLogsSingle.mockResolvedValue({
      data: { id: 'log-1', caption: 'Made cookies' },
      error: null,
    });

    const req = {
      url: 'http://localhost/api/logs/translate',
      method: 'POST',
      json: async () => ({ caption: 'Made cookies' }),
    } as unknown as NextRequest;

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.suggestions).toBeDefined();
    expect(body.suggestions).toHaveLength(1);
    expect(body.suggestions[0].skillArea).toBe('Fractions');
    expect(body.suggestions[0].suggestions).toContain('Use fraction manipulatives');
    expect(ActivitySuggestionService.getSuggestionsForRemainingGaps).toHaveBeenCalledWith(
      'test-user',
      expect.anything()
    );
  });
});
