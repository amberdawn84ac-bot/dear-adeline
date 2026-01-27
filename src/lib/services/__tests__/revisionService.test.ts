import { RevisionService } from '../revisionService';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

describe('RevisionService', () => {
    const mockSupabase = {
        from: jest.fn(),
    };

    it('should create a revision snapshot', async () => {
        const insertMock = jest.fn().mockResolvedValue({ error: null });
        mockSupabase.from.mockReturnValue({
            insert: insertMock,
        });

        await RevisionService.createRevision(
            'project-1',
            'editor-1',
            { title: 'Test', content: 'Hello' },
            'Initial version',
            mockSupabase as any
        );

        expect(insertMock).toHaveBeenCalledWith({
            project_id: 'project-1',
            editor_id: 'editor-1',
            content_snapshot: { title: 'Test', content: 'Hello' },
            change_summary: 'Initial version',
        });
    });

    it('should get revision history for a project', async () => {
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [
                            { id: 'rev-1', change_summary: 'First', created_at: '2026-01-18T10:00:00Z' },
                            { id: 'rev-2', change_summary: 'Second', created_at: '2026-01-18T11:00:00Z' },
                        ],
                        error: null,
                    }),
                }),
            }),
        });

        const revisions = await RevisionService.getRevisions('project-1', mockSupabase as any);

        expect(revisions).toHaveLength(2);
        expect(revisions[0].id).toBe('rev-1');
    });
});
