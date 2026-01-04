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
    NextRequest: jest.fn().mockImplementation((url, init) => ({
        url,
        ...init,
        json: () => Promise.resolve(JSON.parse(init?.body as string || '{}')),
    })),
}));

describe('Get Personalized Lessons API Route', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    order: jest.fn(),
                })),
            })),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    it('should retrieve lessons for the user', async () => {
        const mockLessons = [{ id: 1, title: 'Lesson 1' }];

        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user' } },
            error: null,
        });

        mockSupabase.from.mockImplementation(() => ({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    order: jest.fn().mockResolvedValue({
                        data: mockLessons,
                        error: null,
                    }),
                }),
            }),
        }));

        const request = new (NextRequest as any)('http://localhost/api/personalized-lessons/get', {
            method: 'GET',
        });

        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('data', mockLessons);
    });

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        const request = new (NextRequest as any)('http://localhost/api/personalized-lessons/get', {
            method: 'GET',
        });

        const response = await GET(request);
        expect(response.status).toBe(401);
    });
});
