import { DiscussionService } from '../discussionService';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

describe('DiscussionService', () => {
    const mockSupabase = {
        from: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get pod discussions with reply count', async () => {
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnValue({
                        order: jest.fn().mockResolvedValue({
                            data: [{ id: 'd1', discussion_replies: [1, 2], profiles: { display_name: 'User' } }],
                            error: null,
                        }),
                    }),
                }),
            }),
        });

        const discussions = await DiscussionService.getPodDiscussions('pod-1', 'all', mockSupabase as any);

        expect(discussions).toHaveLength(1);
        expect(discussions[0].reply_count).toBe(2);
    });

    it('should prevent editing reply after 15 minutes', async () => {
        const oldDate = new Date();
        oldDate.setMinutes(oldDate.getMinutes() - 20);

        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { created_at: oldDate.toISOString(), author_id: 'user-1' },
                        error: null,
                    }),
                }),
            }),
        });

        const result = await DiscussionService.updateReply('r1', 'user-1', 'new body', mockSupabase as any);

        expect(result).toBe(false);
    });
});
