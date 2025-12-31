// src/components/__tests__/ConversationUI.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConversationUI from './ConversationUI.tsx';

// Mock Next.js useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('ConversationUI', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    render(<ConversationUI />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends user message and displays AI response', async () => {
    const mockResponse = { message: 'Hello from Adeline!' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    render(<ConversationUI />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hi Adeline' } });
    fireEvent.click(sendButton);

    // Expect user message to be displayed
    expect(screen.getByText('Hi Adeline')).toBeInTheDocument();

    // Expect fetch to be called with the correct payload
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        '/api/adeline',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: 'Hi Adeline' }),
        })
      );
    });

    // Expect AI response to be displayed
    await waitFor(() => {
      expect(screen.getByText('Hello from Adeline!')).toBeInTheDocument();
    });
  });

  it('displays error message if API call fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'API Error' }),
    });

    render(<ConversationUI />);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Generate an error' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });
});