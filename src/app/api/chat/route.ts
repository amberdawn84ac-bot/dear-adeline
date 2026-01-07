import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSystemPrompt } from '@/lib/services/promptService';
import { retrieveSimilarMemories } from '@/lib/services/memoryService';
import { handleToolCalls } from '@/lib/services/toolHandlerService';
import { persistConversation } from '@/lib/services/persistenceService';
import { startChat, continueChat } from '@/lib/services/chatService';

// Initialize Gemini
const apiKey = process.env.GOOGLE_API_KEY;

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

let genAI: GoogleGenerativeAI | undefined;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

// Tool Definition
const tools: any[] = [
    {
        functionDeclarations: [
            {
                name: "search_web",
                description: "Search the internet for current local events, grants, contests, or news facts.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        query: { type: SchemaType.STRING, description: "The search query (e.g., 'Science fairs in Tulsa June 2024')" },
                        topic: { type: SchemaType.STRING, enum: ["events", "news", "grants"], description: "The category of search" }
                    },
                    required: ["query"]
                }
            },
            {
                name: "remember_this",
                description: "Save a specific important fact, preference, or detail about the student to your long-term memory.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        content: { type: SchemaType.STRING, description: "The exact fact or detail to remember (e.g., 'Student loves dinosaurs', 'Student struggles with fractions')." },
                        category: { type: SchemaType.STRING, description: "Category of the memory (e.g., 'interest', 'struggle', 'goal', 'personal')." }
                    },
                    required: ["content"]
                }
            },
            {
                name: "add_to_portfolio",
                description: "Add a completed project, artwork, or other achievement to the student's portfolio and award credit.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        title: { type: SchemaType.STRING, description: "The title of the portfolio item." },
                        description: { type: SchemaType.STRING, description: "A brief description of the item." },
                        type: { type: SchemaType.STRING, enum: ['project', 'lesson', 'artwork', 'writing', 'other'], description: "The type of portfolio item." },
                        skills_demonstrated: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "An array of skill names demonstrated." }
                    },
                    required: ["title", "description", "type", "skills_demonstrated"]
                }
            }
        ]
    }
];

export async function POST(req: Request) {
    try {
        if (!genAI) {
            console.error('CRITICAL: GOOGLE_API_KEY is missing or invalid.');
            return NextResponse.json({ error: 'AI Service configuration error' }, { status: 500 });
        }

        const body = await req.json();
        const { messages, userId, studentInfo, conversationId, imageData } = body;

        const cleanedMessages = (messages || []).filter(
            (m: any) => m?.role === 'user' || m?.role === 'assistant'
        );

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
        }

        const lastMessage = cleanedMessages[cleanedMessages.length - 1];
        const prompt = lastMessage.content;

        if (!prompt && !imageData) { // Allow image-only prompts
            return NextResponse.json({ error: 'Prompt or image is required.' }, { status: 400 });
        }

        const similarMemories = await retrieveSimilarMemories(prompt, userId, supabase);

        const systemInstruction = generateSystemPrompt(studentInfo, similarMemories, lastMessage);

        const history = cleanedMessages.slice(0, -1); // All messages except the last one

        const { functionCalls, chat, finalResponseText: initialResponse } = await startChat(systemInstruction, tools, prompt, genAI, history, imageData);

        let finalResponseText = initialResponse || '';

        if (functionCalls && functionCalls.length > 0) {
            const toolParts = await handleToolCalls(functionCalls, userId, supabase);
            finalResponseText = await continueChat(chat, toolParts);
        }

        const { activeConversationId, newTitle } = await persistConversation(
            conversationId,
            prompt,
            finalResponseText,
            cleanedMessages,
            userId,
            supabase
        );

        const data: any = { content: finalResponseText, type: "default" };
        if (activeConversationId) {
            data.conversationId = activeConversationId;
            if (newTitle) {
                data.title = newTitle;
            }
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Gemini Chat API Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}