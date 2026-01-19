// src/lib/server/config.ts
import 'server-only';

export const getGoogleAIAPIKey = (): string => {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_AI_API_KEY or GOOGLE_API_KEY environment variable');
  }
  return apiKey;
};