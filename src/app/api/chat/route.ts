import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSystemPrompt } from '@/lib/services/promptService';
import { retrieveSimilarMemories } from '@/lib/services/memoryService';
import { handleToolCalls } from '@/lib/services/toolHandlerService';
import { persistConversation } from '@/lib/services/persistenceService';
import { startChat, continueChat } from '@/lib/services/chatService';

const apiKey = process.env.GOOGLE_API_KEY;
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
let genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

export async function POST(req: Request) {
    try {
        if (!genAI) {
            return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });
        }

        const { messages, userId, studentInfo, conversationId, imageData } = await req.json();

        // Gemini requires 'model' role, not 'assistant'
        const formattedHistory = (messages || []).map((m: any) => ({
            role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        const lastMessage = messages[messages.length - 1];
        const userPrompt = lastMessage.content;
        const history = formattedHistory.slice(0, -1);

        // Retrieve context
        const similarMemories = await retrieveSimilarMemories(userPrompt, userId, supabase);
        let systemInstruction = generateSystemPrompt(studentInfo, similarMemories, lastMessage);
        
        // Personality enforcement
        systemInstruction += `\n\nSTRICT BEHAVIORAL PROTOCOL:
- TONE: Sharp-witted, busy, whimsical truth-seeker. Never patronizing.
- NO ENDEARMENTS: Never use "dear," "honey," "grandma," or similar terms.
- BREVITY: Maximum 2 paragraphs. For complex topics, use visual diagrams.
- SILENT TRACKING: Log graduation credits via tools silently. Never mention tracking to student.
- VISUAL LEARNING: Use Mermaid.js diagrams to explain spatial/systems concepts.
- CONSISTENCY: Maintain personality across all responses, regardless of conversation length.`;

        // ✅ FIX: Define tools for Gemini
        const tools = [{
            function_declarations: [
                {
                    name: "update_student_progress",
                    description: "SILENTLY track graduation credits. Never tell student you're tracking.",
                    parameters: {
                        type: "object",
                        properties: {
                            subject: { type: "string", description: "Subject area (math, science, etc)" },
                            credits: { type: "number", description: "Credits earned (0.25 per meaningful activity)" },
                            activity: { type: "string", description: "What they did" }
                        },
                        required: ["subject", "credits", "activity"]
                    }
                },
                {
                    name: "create_game",
                    description: "Create interactive learning game",
                    parameters: {
                        type: "object",
                        properties: {
                            gameType: { type: "string", enum: ["quiz", "matching", "typing", "coding"] },
                            subject: { type: "string" },
                            difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                        },
                        required: ["gameType", "subject"]
                    }
                }
            ]
        }];

        // ✅ FIX: Call startChat with CORRECT parameter order!
        const { functionCalls, chat, finalResponseText: initialResponse } = await startChat(
            systemInstruction,  // 1st param: system instructions
            tools,              // 2nd param: tools array ✅ FIXED!
            userPrompt,         // 3rd param: user's message
            genAI,              // 4th param: AI client
            history,            // 5th param: conversation history ✅ FIXED!
            imageData           // 6th param: optional image
        );

        let finalResponseText = initialResponse || '';

        // Handle tool calls
        if (functionCalls && functionCalls.length > 0) {
            const toolParts = await handleToolCalls(functionCalls, userId, supabase);
            finalResponseText = await continueChat(chat, toolParts);
        }

        // Persist conversation with same ID to maintain sidebar continuity
        const { activeConversationId, newTitle } = await persistConversation(
            conversationId, 
            userPrompt, 
            finalResponseText, 
            messages, 
            userId, 
            supabase
        );

        return NextResponse.json({ 
            content: finalResponseText, 
            conversationId: activeConversationId,
            title: newTitle 
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ 
            error: 'Chat processing failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
