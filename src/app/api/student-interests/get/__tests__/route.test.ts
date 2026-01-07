import { NextRequest } from 'next/server';
import { GET } from '../route';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}));

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, init) => ({
            json: () => Promise.resolve(data),
            status: init?.status || 200,
        })),
    },
    NextRequest: jest.fn((url, init) => ({
        url,
        ...init,
    })),
}));

describe('Student Interests API Route (Get)', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    order: jest.fn(() => ({
                        data: [{ id: '1', interest: 'coding' }, { id: '2', interest: 'robots' }],
                        error: null,
                    })),
                })),
            })),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    it('should return student interests successfully for an authenticated user', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user_id' } },
            error: null,
        });

        const request = new (NextRequest as any)('http://localhost/api/student-interests/get');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ data: [{ id: '1', interest: 'coding' }, { id: '2', interest: 'robots' }] });
        expect(mockSupabase.from).toHaveBeenCalledWith('student_interests');
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('user_id', 'test_user_id');
    });

    it('should return 401 if the user is not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        const request = new (NextRequest as any)('http://localhost/api/student-interests/get');
        const response = await GET(request);

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 500 if there is a database error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user_id' } },
            error: null,
        });
        mockSupabase.from.mockImplementation(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    order: jest.fn(() => ({
                        data: null,
                        error: { message: 'Database query failed' },
                    })),
                })),
            })),
        }));

        const request = new (NextRequest as any)('http://localhost/api/student-interests/get');
        const response = await GET(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data).toEqual({ error: 'Database query failed' });
    });
});