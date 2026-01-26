import { NextRequest } from 'next/server';
import { POST } from '../route';
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
        json: () => Promise.resolve(JSON.parse(init?.body as string)),
    })),
}));

describe('Student Interests API Route (Save)', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn((...args) => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    maybeSingle: jest.fn(),
                })),
            })),
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
            delete: jest.fn(() => ({
                eq: jest.fn(),
            })),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    it('should save interests successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user_id' } },
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({ error: null });
        const insertMock = jest.fn().mockReturnValue({ error: null });

        mockSupabase.from.mockImplementation((table) => {
            if (table === 'student_interests') {
                return {
                    delete: jest.fn().mockReturnValue({
                        eq: deleteMock,
                    }),
                    insert: insertMock,
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {} as any;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = new (NextRequest as any)('http://localhost/api/student-interests/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ interests: ['coding', 'art'] }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('success', true);
        expect(deleteMock).toHaveBeenCalledWith('student_id', 'test_user_id');
        expect(insertMock).toHaveBeenCalledWith([
            { student_id: 'test_user_id', interest: 'coding' },
            { student_id: 'test_user_id', interest: 'art' },
        ]);
    });

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = new (NextRequest as any)('http://localhost/api/student-interests/save', {
            method: 'POST',
            body: JSON.stringify({ interests: ['coding'] }),
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('should return 500 if delete fails', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user_id' } },
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({ error: { message: 'Delete failed' } });

        mockSupabase.from.mockImplementation((table) => {
            if (table === 'student_interests') {
                return {
                    delete: jest.fn().mockReturnValue({
                        eq: deleteMock,
                    }),
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {} as any;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = new (NextRequest as any)('http://localhost/api/student-interests/save', {
            method: 'POST',
            body: JSON.stringify({ interests: ['coding'] }),
        });

        const response = await POST(request);
        expect(response.status).toBe(500);
    });

    it('should return 500 if insert fails', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user_id' } },
            error: null,
        });

        const deleteMock = jest.fn().mockReturnValue({ error: null });
        const insertMock = jest.fn().mockReturnValue({ error: { message: 'Insert failed' } });

        mockSupabase.from.mockImplementation((table) => {
            if (table === 'student_interests') {
                return {
                    delete: jest.fn().mockReturnValue({
                        eq: deleteMock,
                    }),
                    insert: insertMock,
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return {} as any;
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = new (NextRequest as any)('http://localhost/api/student-interests/save', {
            method: 'POST',
            body: JSON.stringify({ interests: ['coding'] }),
        });

        const response = await POST(request);
        expect(response.status).toBe(500);
    });
});
