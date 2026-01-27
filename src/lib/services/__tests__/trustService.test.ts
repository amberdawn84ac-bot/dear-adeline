import { TrustService } from '../trustService';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

describe('TrustService', () => {
    const mockSupabase = {
        from: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return trust level for a student', async () => {
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { trust_score: 25, auto_publish: false },
                        error: null,
                    }),
                }),
            }),
        });

        const result = await TrustService.getTrustLevel('student-1', mockSupabase as any);

        expect(result.trustScore).toBe(25);
        expect(result.canAutoPublish).toBe(false);
    });

    it('should return default trust level if none exists', async () => {
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        });

        const result = await TrustService.getTrustLevel('student-1', mockSupabase as any);

        expect(result.trustScore).toBe(0);
        expect(result.canAutoPublish).toBe(false);
    });
});
