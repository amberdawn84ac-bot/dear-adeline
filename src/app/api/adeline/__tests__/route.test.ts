// src/app/api/adeline/__tests__/route.test.ts

const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({
  sendMessage: mockSendMessage,
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

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getGoogleAIAPIKey } from '@/lib/server/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      startChat: mockStartChat,
    })),
  })),
  SchemaType: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    ARRAY: 'ARRAY',
  },
}));
jest.mock('@/lib/server/config');
jest.mock('@/lib/supabase/server');

describe('Adeline API Route (Google AI)', () => {
  const mockGetGoogleAIAPIKey = getGoogleAIAPIKey as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGoogleAIAPIKey.mockReturnValue('test_google_api_key');
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockReturnValue({
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user-id' } },
                error: null,
            }),
        },
    });
  });

  it('should return a 200 response with AI message on success', async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: {
        text: () => 'Hello from Google AI!',
        functionCall: () => null,
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
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith('Tell me a story.');
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
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('should return a 500 response if Google AI API call fails', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('Google AI API error'));

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
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });

  it('should return a 500 response if API key is not configured', async () => {
    mockGetGoogleAIAPIKey.mockImplementationOnce(() => {
      throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
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
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});