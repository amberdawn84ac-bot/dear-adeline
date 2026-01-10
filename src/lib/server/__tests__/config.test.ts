// src/lib/server/__tests__/config.test.ts
import { getGoogleAIAPIKey } from '../config';

describe('Server Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should throw an error if GOOGLE_AI_API_KEY is not set', () => {
    delete process.env.GOOGLE_AI_API_KEY;
    expect(() => getGoogleAIAPIKey()).toThrow('Missing GOOGLE_AI_API_KEY environment variable');
  });

  it('should return the API key if it is set', () => {
    const mockApiKey = 'test-api-key';
    process.env.GOOGLE_AI_API_KEY = mockApiKey;
    const apiKey = getGoogleAIAPIKey();
    expect(apiKey).toBe(mockApiKey);
  });
});
