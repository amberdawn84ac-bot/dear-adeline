import { GoogleGenerativeAI } from '@google/generative-ai';

export const startChat = async (
    systemInstruction: string,
    tools: any[],
    prompt: string,
    genAI: GoogleGenerativeAI,
    history: any[],
    imageData?: string, // Add imageData parameter
    modelName?: string // Add modelName parameter for router support
) => {

    const model = genAI.getGenerativeModel({
        model: modelName || "gemini-1.5-flash", // Use provided model or default to flash
        systemInstruction,
        tools
    });

    const chat = model.startChat({
        history // Use the provided history
    });

    // Explicitly type messageParts to allow both text and inlineData
    const messageParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [
        { text: prompt }
    ];

    if (imageData) {
        messageParts.push({
            inlineData: {
                data: imageData.split(',')[1], // remove the data:image/jpeg;base64, part
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
};

export const continueChat = async (
    chat: any,
    toolParts: any[],
) => {
    const finalResult = await chat.sendMessage(toolParts);
    return finalResult.response.text();
}
