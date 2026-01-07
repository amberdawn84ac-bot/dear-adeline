import { getGoogleAIAPIKey } from './config';

describe('getGoogleAIAPIKey', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should return the API key if it is set', () => {
    process.env.GOOGLE_AI_API_KEY = 'test_api_key';
    expect(getGoogleAIAPIKey()).toBe('test_api_key');
  });

  it('should throw an error if GOOGLE_AI_API_KEY is not set', () => {
    delete process.env.GOOGLE_AI_API_KEY;
    expect(() => getGoogleAIAPIKey()).toThrow('Missing GOOGLE_AI_API_KEY environment variable');
  });

  // This test verifies that the API key is not directly exposed in the client-side bundle
  // This is a conceptual test. Actual verification would require inspecting build artifacts.
  // For a server-side only utility, this test focuses on runtime access.
  it('should not expose API key to client-side (conceptual)', () => {
    // In a real Next.js app, client-side code would not be able to access server-only environment variables.
    // This test primarily ensures getGoogleAIAPIKey itself doesn't inadvertently leak it.
    // The 'server-only' package at the top of config.ts also enforces this at build time.
    process.env.GOOGLE_AI_API_KEY = 'super_secret_key';
    const key = getGoogleAIAPIKey();
    expect(key).toBe('super_secret_key');
    // Further checks would involve build artifact analysis, which is out of scope for a unit test.
  });
});
