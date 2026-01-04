// src/app/api/adeline/__tests__/route.test.ts

// Mock Next.js server components
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

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getConfig } from '@/lib/server/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');
jest.mock('@/lib/server/config');

describe('Adeline API Route (Google AI)', () => {
  const mockGetConfig = getConfig as jest.Mock;
  const mockGenerateContent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfig.mockReturnValue({ googleApiKey: 'test_google_api_key' });
    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));
  });

  it('should return a 200 response with AI message on success', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => 'Hello from Google AI!',
      },
    });

    const request = new (NextRequest as any)('http://localhost/api/adeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'Tell me a story.' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ message: 'Hello from Google AI!' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledWith('Tell me a story.');
  });

  it('should return a 400 response if prompt is missing', async () => {
    const request = new (NextRequest as any)('http://localhost/api/adeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Missing prompt
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Prompt is required.' });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('should return a 500 response if Google AI API call fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Google AI API error'));

    const request = new (NextRequest as any)('http://localhost/api/adeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'What is the meaning of life?' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to get response from Google AI API.' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('should return a 500 response if API key is not configured', async () => {
    mockGetConfig.mockImplementationOnce(() => {
      throw new Error('GOOGLE_API_KEY is not set');
    });

    const request = new (NextRequest as any)('http://localhost/api/adeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'Hello' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Server configuration error.' });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});
