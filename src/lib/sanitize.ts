/**
 * Sanitizes a string to be safely included in an AI prompt.
 * This is a basic defense against prompt injection. It removes characters
 * that could be used to manipulate the prompt, such as backticks,
 * dollar signs, and curly braces.
 *
 * @param input The string to sanitize.
 * @returns The sanitized string.
 */
export function sanitizeForPrompt(input: string): string {
  if (!input) {
    return '';
  }
  // Remove characters that could be used for template literal injection or other manipulations.
  return input.replace(/[`${}<>]/g, '');
}
