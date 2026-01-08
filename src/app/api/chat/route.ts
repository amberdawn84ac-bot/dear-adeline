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
                description: "Search the internet for current events, news, or facts.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        query: { type: SchemaType.STRING, description: "The search query" },
                        topic: { type: SchemaType.STRING, enum: ["events", "news", "grants"] }
                    },
                    required: ["query"]
                }
            },
            {
                name: "remember_this",
                description: "Save a specific important fact or preference about the student to memory.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        content: { type: SchemaType.STRING, description: "The fact to remember." },
                        category: { type: SchemaType.STRING, description: "e.g., 'interest', 'struggle'." }
                    },
                    required: ["content"]
                }
            },
            {
                name: "add_to_portfolio",
                description: "Add a project to the portfolio and award credit quietly.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        title: { type: SchemaType.STRING },
                        description: { type: SchemaType.STRING },
                        type: { type: SchemaType.STRING, enum: ['project', 'lesson', 'artwork', 'writing', 'other'] },
                        skills_demonstrated: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
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
            console.error('CRITICAL: GOOGLE_API_KEY is missing.');
            return NextResponse.json({ error: 'AI Service configuration error' }, { status: 500 });
        }

        const body = await req.json();
        const { messages, userId, studentInfo, conversationId, imageData } = body;

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
        }

        // AMNESIA FIX: Ensure roles are 'user' and 'model'
        const formattedHistory = messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        const lastMessage = messages[messages.length - 1];
        const prompt = lastMessage.content;

        const similarMemories = await retrieveSimilarMemories(prompt, userId, supabase);
        let systemInstruction = generateSystemPrompt(studentInfo, similarMemories, lastMessage);
        
        // REFINED PERSONALITY: Whimsical and sharp, but not "grandma"
        systemInstruction += `\n\nSTRICT BEHAVIOR RULES:
        1. Tone: Whimsical, sharp-witted, and busy. You are a truth-seeker, not a doting relative.
        2. NO endearments: Never use "dear," "honey," "sweetie," or similar terms.
        3. BREVITY: Max 2-3 short paragraphs. Get straight to the point.
        4. NO LECTURES: Do not mention graduation credits or state standards to the child; handle those quietly via tools.
        5. VISUALS: If explaining a process, use a Mermaid diagram or visual description rather than a long text list.`;

        const history = formattedHistory.slice(0, -1);

        const { functionCalls, chat, finalResponseText: initialResponse } = await startChat(
            systemInstruction, 
            tools, 
            prompt, 
            genAI, 
            history, 
            imageData
        );

        let finalResponseText = initialResponse || '';

        if (functionCalls && functionCalls.length > 0) {
            const toolParts = await handleToolCalls(functionCalls, userId, supabase);
            finalResponseText = await continueChat(chat, toolParts);
        }

        // SIDEBAR FIX: Link the conversation ID consistently
        const { activeConversationId, newTitle } = await persistConversation(
            conversationId,
            prompt,
            finalResponseText,
            messages,
            userId,
            supabase
        );

        return NextResponse.json({ 
            content: finalResponseText, 
            type: "default",
            conversationId: activeConversationId,
            title: newTitle || undefined
        });

    } catch (error: any) {
        console.error('Gemini Chat API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
