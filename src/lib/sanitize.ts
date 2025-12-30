
// Basic sanitization to prevent prompt injection.
// This is not a comprehensive solution but a good first step.

export function sanitizeForPrompt(text: string): string {
    if (!text) {
        return '';
    }

    // Remove characters that could be used to manipulate the prompt
    // (e.g., creating fake system messages or injecting control characters)
    return text
        .replace(/</g, '')
        .replace(/>/g, '')
        .replace(/`/g, '')
        .replace(/{/g, '')
        .replace(/}/g, '');
}
