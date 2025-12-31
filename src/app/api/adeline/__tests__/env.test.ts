// src/app/api/adeline/__tests__/env.test.ts

import { getAnthropicApiKey } from '@/lib/server/config';

describe('Anthropic API Key secure loading', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clears the cache for modules
    process.env = { ...originalEnv }; // Make a copy
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env
  });

  it('should return the API key when set correctly', () => {
    process.env.ANTHROPIC_API_KEY = 'test_anthropic_key_123';
    expect(getAnthropicApiKey()).toBe('test_anthropic_key_123');
  });

  it('should throw an error if ANTHROPIC_API_KEY is not set', () => {
    delete process.env.ANTHROPIC_API_KEY;
    expect(() => getAnthropicApiKey()).toThrow('ANTHROPIC_API_KEY is not set in environment variables.');
  });

  it('should throw an error if ANTHROPIC_API_KEY is an empty string', () => {
    process.env.ANTHROPIC_API_KEY = '';
    expect(() => getAnthropicApiKey()).toThrow('ANTHROPIC_API_KEY is not set in environment variables.');
  });

  // This test primarily asserts that we are NOT mistakenly using NEXT_PUBLIC_ for a sensitive key.
  // The implementation of getAnthropicApiKey *should not* look for NEXT_PUBLIC_ prefix.
  it('should NOT use NEXT_PUBLIC_ prefixed keys for secure server-side access', () => {
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY = 'exposed_key';
    delete process.env.ANTHROPIC_API_KEY; // Ensure the server-side key is not set
    expect(() => getAnthropicApiKey()).toThrow('ANTHROPIC_API_KEY is not set in environment variables.');
  });
});