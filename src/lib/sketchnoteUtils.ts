export function autoFormatSketchnote(userPrompt: string, aiResponse: string): string {
    const triggers = ['summary', 'notes', 'sketchnote', 'visualize', 'diagram', 'takeaways'];
    const lowerPrompt = userPrompt.toLowerCase();

    // 1. Check if user asked for it
    const shouldTrigger = triggers.some(t => lowerPrompt.includes(t));

    // 2. Check if it's already formatted (don't double wrap)
    if (aiResponse.includes('<SKETCHNOTE>')) return aiResponse;

    if (shouldTrigger) {
        // Wrap the entire response in the tag
        return `<SKETCHNOTE>
${aiResponse}
</SKETCHNOTE>`;
    }

    return aiResponse;
}