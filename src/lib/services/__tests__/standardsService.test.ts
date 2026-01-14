import { StandardsService } from '../standardsService';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('StandardsService', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('getOrCreateStandard', () => {
    it('should return existing standard if found', async () => {
      const mockStandard = {
        id: 'std-1',
        standard_code: 'OK.MATH.8.A.1',
        jurisdiction: 'Oklahoma',
        subject: 'Mathematics',
        grade_level: '8',
        statement_text: 'Understand rational and irrational numbers'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockStandard,
                error: null
              })
            })
          })
        })
      });

      const result = await StandardsService.getOrCreateStandard(
        'OK.MATH.8.A.1',
        'Oklahoma',
        mockSupabase
      );

      expect(result).toEqual(mockStandard);
      expect(mockSupabase.from).toHaveBeenCalledWith('state_standards');
    });

    it('should return null if standard not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' }
              })
            })
          })
        })
      });

      const result = await StandardsService.getOrCreateStandard(
        'OK.MATH.8.A.1',
        'Oklahoma',
        mockSupabase
      );

      expect(result).toBeNull();
    });
  });

  describe('getStandardsForSkill', () => {
    it('should return all standards mapped to a skill', async () => {
      const mockMappings = [
        {
          standard_id: 'std-1',
          state_standards: {
            id: 'std-1',
            standard_code: 'OK.MATH.8.A.1',
            statement_text: 'Rational numbers'
          }
        },
        {
          standard_id: 'std-2',
          state_standards: {
            id: 'std-2',
            standard_code: 'OK.MATH.8.A.2',
            statement_text: 'Irrational numbers'
          }
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockMappings,
            error: null
          })
        })
      });

      const result = await StandardsService.getStandardsForSkill('skill-1', mockSupabase);

      expect(result).toHaveLength(2);
      expect(result[0].standard_code).toBe('OK.MATH.8.A.1');
      expect(result[1].standard_code).toBe('OK.MATH.8.A.2');
    });
  });

  describe('recordStandardProgress', () => {
    it('should record new progress as developing', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'student_standards_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                  })
                })
              })
            }),
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    student_id: 'student-1',
                    standard_id: 'std-1',
                    mastery_level: 'developing'
                  },
                  error: null
                })
              })
            })
          };
        }
        return {};
      });

      const result = await StandardsService.recordStandardProgress(
        'student-1',
        'std-1',
        'activity_log',
        'activity-1',
        mockSupabase
      );

      expect(result?.mastery_level).toBe('developing');
    });

    it('should progress from developing to proficient', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'student_standards_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { mastery_level: 'developing' },
                    error: null
                  })
                })
              })
            }),
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    student_id: 'student-1',
                    standard_id: 'std-1',
                    mastery_level: 'proficient'
                  },
                  error: null
                })
              })
            })
          };
        }
        return {};
      });

      const result = await StandardsService.recordStandardProgress(
        'student-1',
        'std-1',
        'activity_log',
        undefined,
        mockSupabase
      );

      expect(result?.mastery_level).toBe('proficient');
    });
  });

  describe('getUnmetStandards', () => {
    it('should return standards not yet demonstrated by student', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'state_standards') {
          const queryChain = {
            eq: jest.fn().mockReturnThis(),
            data: [
              { id: 'std-1', standard_code: 'OK.MATH.8.A.1' },
              { id: 'std-2', standard_code: 'OK.MATH.8.A.2' },
              { id: 'std-3', standard_code: 'OK.MATH.8.A.3' }
            ],
            error: null
          };
          // Make queryChain thenable
          queryChain.then = jest.fn((resolve) => {
            return Promise.resolve().then(() =>
              resolve({ data: queryChain.data, error: queryChain.error })
            );
          });
          return {
            select: jest.fn().mockReturnValue(queryChain)
          };
        }
        if (table === 'student_standards_progress') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [
                  { standard_id: 'std-1' }
                ],
                error: null
              })
            })
          };
        }
        return {};
      });

      const result = await StandardsService.getUnmetStandards(
        'student-1',
        'Oklahoma',
        '8',
        'Mathematics',
        mockSupabase
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('std-2');
      expect(result[1].id).toBe('std-3');
    });
  });

  describe('getLearningComponents', () => {
    it('should return learning components for a standard', async () => {
      const mockComponents = [
        {
          id: 'lc-1',
          standard_id: 'std-1',
          component_text: 'Identify rational numbers',
          component_order: 1
        },
        {
          id: 'lc-2',
          standard_id: 'std-1',
          component_text: 'Convert between fractions and decimals',
          component_order: 2
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockComponents,
              error: null
            })
          })
        })
      });

      const result = await StandardsService.getLearningComponents('std-1', mockSupabase);

      expect(result).toHaveLength(2);
      expect(result[0].component_text).toBe('Identify rational numbers');
    });
  });
});
