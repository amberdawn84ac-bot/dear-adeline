// src/app/api/adeline/route.test.ts

import { POST } from './route';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({
  sendMessage: mockSendMessage,
}));

// Mock the GoogleGenerativeAI library
jest.mock('@google/generative-ai', () => {
  return {
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
  };
});

// Mock the config and Supabase
jest.mock('@/lib/server/config', () => ({
  getGoogleAIAPIKey: jest.fn(() => 'test-api-key'),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => ({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
  })),
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


describe('POST /api/adeline', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSendMessage.mockClear();
    mockStartChat.mockClear();
  });

  it('should return a successful response from the AI', async () => {
    const mockResponse = {
      response: {
        text: () => 'Hello, I am Adeline.',
        functionCall: () => null,
      },
    };
    mockSendMessage.mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost/api/adeline', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Hello' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe('Hello, I am Adeline.');
    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
  });

  it('should return an error when the AI call fails', async () => {
    mockSendMessage.mockRejectedValue(new Error('AI is sleeping'));

    const request = new NextRequest('http://localhost/api/adeline', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Hello' }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to get response from Google AI API.');
  });

  it('should return a 400 error if prompt is missing', async () => {
    const request = new NextRequest('http://localhost/api/adeline', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Prompt is required.');
  });
});
