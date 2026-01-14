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

describe('Save Lesson API Route', () => {
    const mockSupabase = {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
        })),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    });

    it('should save a lesson successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: 'test_user' } },
            error: null,
        });

        mockSupabase.from.mockImplementation(() => ({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                        data: { id: 'new_lesson_id' },
                        error: null,
                    }),
                }),
            }),
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const request = new (NextRequest as any)('http://localhost/api/personalized-lessons/save', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Robotics 101',
                content: { steps: [] },
                subject: 'Science',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('success', true);
    });
});
