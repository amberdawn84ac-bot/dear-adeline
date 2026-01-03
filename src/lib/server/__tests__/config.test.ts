// src/lib/server/__tests__/config.test.ts
import { getConfig } from '../config';

describe('Server Config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should throw an error if GOOGLE_API_KEY is not set', () => {
    delete process.env.GOOGLE_API_KEY;
    expect(() => getConfig()).toThrow('GOOGLE_API_KEY is not set in environment variables');
  });

  it('should return the API key if it is set', () => {
    const mockApiKey = 'test-api-key';
    process.env.GOOGLE_API_KEY = mockApiKey;
    const config = getConfig();
    expect(config.googleApiKey).toBe(mockApiKey);
  });
});
