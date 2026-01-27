import { CollaborationService } from '../collaborationService';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

describe('CollaborationService', () => {
    const mockSupabase = {
        from: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get pod projects', async () => {
        mockSupabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: [{ id: 'p1', title: 'Project 1', project_collaborators: [] }],
                        error: null,
                    }),
                }),
            }),
        });

        const projects = await CollaborationService.getPodProjects('pod-1', mockSupabase as any);

        expect(projects).toHaveLength(1);
        expect(projects[0].title).toBe('Project 1');
    });

    it('should create a shared project and add owner', async () => {
        const insertMock = jest.fn();
        mockSupabase.from.mockImplementation((table) => {
            if (table === 'projects') {
                return {
                    insert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({ data: { id: 'new-p' }, error: null })
                        })
                    }),
                };
            }
            if (table === 'project_collaborators') {
                return {
                    insert: insertMock,
                };
            }
            return {};
        });

        const projectId = await CollaborationService.createSharedProject(
            'pod-1', 'New Project', 'Desc', 'user-1', mockSupabase as any
        );

        expect(projectId).toBe('new-p');
        expect(insertMock).toHaveBeenCalledWith({
            project_id: 'new-p',
            student_id: 'user-1',
            role: 'owner',
            added_by: 'user-1',
        });
    });
});
