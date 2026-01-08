import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSystemPrompt } from '@/lib/services/promptService';
import { retrieveSimilarMemories } from '@/lib/services/memoryService';
import { handleToolCalls } from '@/lib/services/toolHandlerService';
import { persistConversation } from '@/lib/services/persistenceService';
import { startChat, continueChat } from '@/lib/services/chatService';

const apiKey = process.env.GOOGLE_API_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

let genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

export async function POST(req: Request) {
    try {
        if (!genAI) return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });

        const { messages, userId, studentInfo, conversationId, imageData } = await req.json();

        // FIX 1: THE AMNESIA KILLER
        // Gemini MUST see 'model', not 'assistant'. 
        const formattedHistory = (messages || []).map((m: any) => ({
            role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        const lastMessage = messages[messages.length - 1];
        const userPrompt = lastMessage.content;
        const history = formattedHistory.slice(0, -1);

        const similarMemories = await retrieveSimilarMemories(userPrompt, userId, supabase);
        let systemInstruction = generateSystemPrompt(studentInfo, similarMemories, lastMessage);
        
        // FIX 2: THE PERSONALITY ANCHOR
        systemInstruction += `\n\nSTRICT BEHAVIORAL PROTOCOL:
        - TONE: Sharp-witted, busy, and whimsical truth-seeker.
        - NO ENDEARMENTS: Never use terms like "dear," "honey," or "grandma."
        - BREVITY: Max 2 paragraphs. If it's complex, use a visual description or diagram.
        - QUIET TRACKING: Log graduation credits via tools. Do NOT mention them to the student.
        - SPATIAL LEARNING: Use diagrams (Mermaid.js) to show how things work.`;

        // Start Chat with correct history format
        const { functionCalls, chat, finalResponseText: initialResponse } = await startChat(
            systemInstruction, [], userPrompt, genAI, history, imageData
        );

        let finalResponseText = initialResponse || '';

        // Handle Tools (Search, Portfolio, Memory)
        if (functionCalls?.length > 0) {
            const toolParts = await handleToolCalls(functionCalls, userId, supabase);
            finalResponseText = await continueChat(chat, toolParts);
        }

        // FIX 3: THE SIDEBAR LINK
        // Ensure conversationId is passed back so the frontend stays on the same thread
        const { activeConversationId, newTitle } = await persistConversation(
            conversationId, userPrompt, finalResponseText, messages, userId, supabase
        );

        return NextResponse.json({ 
            content: finalResponseText, 
            conversationId: activeConversationId,
            title: newTitle 
        });

    } catch (error: any) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
