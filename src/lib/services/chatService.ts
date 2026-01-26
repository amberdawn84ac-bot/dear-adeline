import { GoogleGenerativeAI } from '@google/generative-ai';


export const startChat = async (
    systemInstruction: string,
    tools: any[],
    prompt: string,
    genAI: GoogleGenerativeAI,
    history: any[],
    imageData?: string,
    modelName: string = "gemini-2.0-flash"
) => {

    console.log(`🤖 Chat Service using model: ${modelName}`);

    // ROUTING LOGIC
    if (modelName.startsWith('gemini')) {
        // --- GEMINI (Google SDK) ---
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
            tools
        });

        const chat = model.startChat({
            history
        });

        // Explicitly type messageParts
        const messageParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
            { text: prompt }
        ];

        if (imageData) {
            messageParts.push({
                inlineData: {
                    data: imageData.split(',')[1],
                    mimeType: 'image/jpeg'
                }
            });
        }

        const result = await chat.sendMessage(messageParts);
        const response = await result.response;
        const functionCalls = response.functionCalls();

        let finalResponseText = "";

        if (functionCalls && functionCalls.length > 0) {
            return { functionCalls, chat };
        } else {
            finalResponseText = response.text();
        }

        return { finalResponseText, chat };

    } else if (modelName === 'grok') {
        // --- GROK (xAI) ---
        // Placeholder for xAI implementation
        // Since we don't have the SDK configured, we fallback or mock
        console.warn('⚠️ Grok requested but xAI SDK not configured. Falling back to Gemini.');
        return startChat(systemInstruction, tools, prompt, genAI, history, imageData, 'gemini-2.0-flash');

    } else if (modelName === 'gpt4') {
        // --- GPT-4 (OpenAI) ---
        // Placeholder for OpenAI implementation
        console.warn('⚠️ GPT-4 requested but OpenAI SDK not configured. Falling back to Gemini.');
        return startChat(systemInstruction, tools, prompt, genAI, history, imageData, 'gemini-2.0-flash');
    }

    // Fallback
    return startChat(systemInstruction, tools, prompt, genAI, history, imageData, 'gemini-2.0-flash');
};

export const continueChat = async (
    chat: any,
    toolParts: any[],
) => {
    // Note: This only works for Gemini chat sessions
    // For other models, we'd need to maintain conversation state differently
    if (chat.sendMessage) {
        const finalResult = await chat.sendMessage(toolParts);
        return finalResult.response.text();
    }
    return "Error: Chat session type not supported for continuation.";
}
