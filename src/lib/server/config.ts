// src/lib/server/config.ts

export function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables.');
  }

  // In a real application, you might add checks here to ensure it's not a NEXT_PUBLIC_ key
  // For now, the error if not found is sufficient for "secure loading" test.

  return apiKey;
}
