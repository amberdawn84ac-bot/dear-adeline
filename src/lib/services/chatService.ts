import { GoogleGenerativeAI } from '@google/generative-ai';

export const startChat = async (
    systemInstruction: string,
    tools: any[],
    prompt: string,
    genAI: GoogleGenerativeAI
) => {

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction,
        tools
    });

    const history: any[] = [];

    const chat = model.startChat({
        history
    });

    const result = await chat.sendMessage(prompt);
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
