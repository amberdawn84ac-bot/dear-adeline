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
        from: jest.fn(() => ({
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
            upsert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(),
                    maybeSingle: jest.fn(),
                })),
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

        // Mock finding existing record (none)
        mockSupabase.from.mockImplementation((table) => {
            if (table === 'student_interests') {
                return {
                    upsert: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            single: jest.fn().mockResolvedValue({
                                data: { id: 'new_record_id' },
                                error: null
                            })
                        })
                    })
                }
            }
            return {};
        });

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
    });

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
        });

        const request = new (NextRequest as any)('http://localhost/api/student-interests/save', {
            method: 'POST',
            body: JSON.stringify({ interests: ['coding'] }),
        });

        const response = await POST(request);
        expect(response.status).toBe(401);
    });
});
