// src/components/__tests__/ConversationUI.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConversationUI from '../ConversationUI';

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
    // Default mock response for interests check on mount
    (fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/student-interests/get') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { interests: ['coding', 'robots'] } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('renders correctly', async () => {
    render(<ConversationUI />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();

    // Check if initial interests are loaded
    await waitFor(() => {
      expect(screen.getByText('coding')).toBeInTheDocument();
      expect(screen.getByText('robots')).toBeInTheDocument();
    });

    // Check for Generate Lesson button (enabled since we have interests)
    expect(screen.getByRole('button', { name: /generate lesson/i })).toBeInTheDocument();
  });

  it('sends user message and displays AI response', async () => {
    // ... (existing test logic preserved) ...
    const mockResponse = { message: 'Hello from Adeline!' };

    (fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/student-interests/get') {
        return Promise.resolve({ ok: true, json: () => ({ data: { interests: ['coding'] } }) });
      }
      if (url === '/api/adeline') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) });
      }
      return Promise.resolve({ ok: false });
    });

    render(<ConversationUI />);
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hi' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello from Adeline!')).toBeInTheDocument();
    });
  });

  it('triggers lesson generation when button is clicked', async () => {
    const mockLesson = {
      title: "Build a Robot",
      description: "Let's build a simple robot!",
      subject: "Science",
      difficulty: "Beginner",
      steps: [{ title: "Step 1", instruction: "Get parts" }],
      materials: ["Cardboard", "Glue"],
      learning_goals: ["Engineering"]
    };

    (fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/student-interests/get') {
        return Promise.resolve({ ok: true, json: () => ({ data: { interests: ['coding'] } }) });
      }
      if (url === '/api/adeline/generate-lesson') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ lesson: mockLesson }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(<ConversationUI />);

    // Wait for interests to load (required for button to be enabled)
    await waitFor(() => {
      expect(screen.getByText('coding')).toBeInTheDocument();
    });

    const generateButton = screen.getByRole('button', { name: /generate lesson/i });
    fireEvent.click(generateButton);

    // Expect loading state or user message
    expect(screen.getByText(/Can you create a lesson plan/i)).toBeInTheDocument();

    // Expect Lesson Card to appear
    await waitFor(() => {
      expect(screen.getByText("Build a Robot")).toBeInTheDocument();
      expect(screen.getByText("Let's build a simple robot!")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/adeline/generate-lesson', expect.anything());
  });
});