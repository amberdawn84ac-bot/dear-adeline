// src/lib/server/config.ts

/**
 * Retrieves server-side configuration, ensuring that all necessary
 * environment variables are set.
 *
 * This function is intended to be used only in server-side code.
 *
 * @throws {Error} If a required environment variable is not set.
 * @returns An object containing the server-side configuration.
 */
export function getConfig() {
  const googleApiKey = process.env.GOOGLE_API_KEY;

  if (!googleApiKey) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }

  return {
    googleApiKey,
  };
}