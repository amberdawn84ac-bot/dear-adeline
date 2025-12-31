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

import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../route'; // Assuming your route handler is an exported POST function
import { getAnthropicApiKey } from '@/lib/server/config';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');
jest.mock('@/lib/server/config');

describe('Adeline API Route', () => {
  const mockGetAnthropicApiKey = getAnthropicApiKey as jest.Mock;
  const mockAnthropicMessagesCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAnthropicApiKey.mockReturnValue('test_api_key');
    (Anthropic as jest.Mock).mockImplementation(() => ({
      messages: {
        create: mockAnthropicMessagesCreate,
      },
    }));
  });

  it('should return a 200 response with AI message on success', async () => {
    mockAnthropicMessagesCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'Hello from Adeline!' }],
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
    expect(data).toEqual({ message: 'Hello from Adeline!' });
    expect(mockAnthropicMessagesCreate).toHaveBeenCalledTimes(1);
    expect(mockAnthropicMessagesCreate).toHaveBeenCalledWith({
      model: 'claude-3-haiku-20240307', // Flash model
      max_tokens: 1024,
      messages: [{ role: 'user', content: 'Tell me a story.' }],
    });
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
    expect(mockAnthropicMessagesCreate).not.toHaveBeenCalled();
  });

  it('should return a 500 response if Anthropic API call fails', async () => {
    mockAnthropicMessagesCreate.mockRejectedValueOnce(new Error('Anthropic API error'));

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
    expect(data).toEqual({ error: 'Failed to get response from Anthropic API.' });
    expect(mockAnthropicMessagesCreate).toHaveBeenCalledTimes(1);
  });

  it('should return a 500 response if API key is not configured', async () => {
    mockGetAnthropicApiKey.mockImplementationOnce(() => {
      throw new Error('ANTHROPIC_API_KEY is not set');
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
    expect(mockAnthropicMessagesCreate).not.toHaveBeenCalled();
  });
});