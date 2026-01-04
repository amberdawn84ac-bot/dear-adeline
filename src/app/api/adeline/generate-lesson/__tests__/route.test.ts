import { NextRequest } from 'next/server';
import { POST } from '../route';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getConfig } from '@/lib/server/config';

jest.mock('@google/generative-ai');
jest.mock('@/lib/server/config');

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

describe('Generate Lesson API Route', () => {
    const mockGetConfig = getConfig as jest.Mock;
    const mockGenerateContent = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetConfig.mockReturnValue({ googleApiKey: 'test_key' });
        (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
            getGenerativeModel: () => ({
                generateContent: mockGenerateContent,
            }),
        }));
    });

    it('should generate a lesson successfully', async () => {
        const mockLesson = { title: 'Test Lesson', steps: [] };
        mockGenerateContent.mockResolvedValueOnce({
            response: {
                text: () => JSON.stringify(mockLesson),
            },
        });

        const request = new (NextRequest as any)('http://localhost/api/adeline/generate-lesson', {
            method: 'POST',
            body: JSON.stringify({ interests: ['Robotics'], age: 10 }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('lesson');
        expect(data.lesson).toEqual(mockLesson);
    });

    it('should return 400 if interests are missing', async () => {
        const request = new (NextRequest as any)('http://localhost/api/adeline/generate-lesson', {
            method: 'POST',
            body: JSON.stringify({ age: 10 }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
