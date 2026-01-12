import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSystemPrompt } from '@/lib/services/promptService';
import { retrieveSimilarMemories } from '@/lib/services/memoryService';
import { handleToolCalls } from '@/lib/services/toolHandlerService';
import { persistConversation } from '@/lib/services/persistenceService';
import { startChat, continueChat } from '@/lib/services/chatService';
import { autoFormatSketchnote } from '@/lib/sketchnoteUtils';
import { LibraryService } from '@/lib/services/libraryService';
import { ModelRouter } from '@/lib/services/modelRouter';
import { AdaptiveDifficultyService } from '@/lib/services/adaptiveDifficultyService';

const apiKey = process.env.GOOGLE_API_KEY;
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
let genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

export async function POST(req: Request) {
    console.log('🔵 /api/chat - Request received');
    
    try {
        if (!genAI) {
            console.error('❌ GOOGLE_API_KEY is missing!');
            return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });
        }

        console.log('✅ genAI initialized');

        const { messages, userId, studentInfo, conversationId, imageData } = await req.json();
        console.log('📦 Parsed request body:', { userId, conversationId, messageCount: messages?.length });

        // Gemini requires 'model' role, not 'assistant'
        const formattedHistory = (messages || []).map((m: any) => ({
            role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        const lastMessage = messages[messages.length - 1];
        const userPrompt = lastMessage.content;
        const history = formattedHistory.slice(0, -1);

        console.log('💬 User prompt:', userPrompt);

        // Detect which AI model to use based on conversation content
        const route = ModelRouter.detectMode(userPrompt);
        console.log(`🎯 Model Router: ${route.model} (${route.reason})`);

        // Retrieve context from multiple sources
        const similarMemories = await retrieveSimilarMemories(userPrompt, userId, supabase);
        const libraryContext = await LibraryService.search(userPrompt, supabase);

        let systemInstruction = generateSystemPrompt(studentInfo, similarMemories, lastMessage);

        // Inject library context (truth documents) if found
        if (libraryContext && libraryContext.length > 0) {
            console.log(`📚 Found ${libraryContext.length} relevant library excerpts`);
            systemInstruction += '\n\n' + LibraryService.formatForPrompt(libraryContext);
        }

        // Get adaptive difficulty level and inject instructions
        const subject = 'general'; // TODO: Infer subject from conversation context
        const gradeLevel = studentInfo?.gradeLevel || '8th grade'; // Default to 8th grade
        const currentDifficulty = await AdaptiveDifficultyService.getStartingDifficulty(
            userId,
            subject,
            gradeLevel,
            supabase
        );
        console.log(`📊 Current difficulty level: ${currentDifficulty}`);
        const difficultyLevel = AdaptiveDifficultyService.getDifficultyLevel(currentDifficulty);
        systemInstruction += '\n' + AdaptiveDifficultyService.getDifficultyInstructions(difficultyLevel);

        // Voice and style
        systemInstruction += `\n\nHOW TO RESPOND:
- Talk like a real person, not a textbook. Be conversational and direct.
- Skip formulaic structures like "we observe... scientists model..." or "first, second, third."
- No endearments (dear, honey, grandma), no theatrics, no asterisk actions.
- If you don't know something, say so honestly.
- Keep it brief - 2-3 paragraphs max. Use diagrams for complex spatial concepts.
- Silently track activities via tools - never mention you're tracking.
- Question narratives and expose institutional BS when relevant.`;


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
                },
                {
                    name: "log_activity",
                    description: "Log daily activities for state compliance tracking. Translate real activities into academic standards.",
                    parameters: {
                        type: "object",
                        properties: {
                            caption: { type: "string", description: "What student actually did (e.g., 'Played Minecraft 2 hours')" },
                            translation: { type: "string", description: "Academic category (e.g., 'Computer Science: Logic & Resource Management')" },
                            skills: { type: "string", description: "Skills demonstrated (comma-separated)" },
                            grade: { type: "string", description: "Grade level relevance (e.g., '8th grade')" }
                        },
                        required: ["caption", "translation"]
                    }
                }
            ]
        }];

        console.log('🚀 Starting chat with Gemini...');

        // Track response time for adaptive difficulty
        const startTime = Date.now();

        // Map router model to actual model identifier
        let selectedModel = 'gemini-2.5-flash'; // default
        if (route.model === 'gemini') {
            selectedModel = 'gemini-2.5-flash';
        } else {
            console.warn(`⚠️ ${route.model} not yet implemented, falling back to Gemini`);
            // Future: Add Grok and GPT-4 API implementations here
        }

        // ✅ FIX: Call startChat with CORRECT parameter order!
        const { functionCalls, chat, finalResponseText: initialResponse } = await startChat(
            systemInstruction,  // 1st param: system instructions
            tools,              // 2nd param: tools array ✅ FIXED!
            userPrompt,         // 3rd param: user's message
            genAI,              // 4th param: AI client
            history,            // 5th param: conversation history ✅ FIXED!
            imageData,          // 6th param: optional image
            selectedModel       // 7th param: model name (NEW!)
        );

        console.log('✅ Got response from Gemini');

        let finalResponseText = initialResponse || '';

        // Handle tool calls
        if (functionCalls && functionCalls.length > 0) {
            console.log('🔧 Processing tool calls:', functionCalls.length);
            const toolParts = await handleToolCalls(functionCalls, userId, supabase);
            finalResponseText = await continueChat(chat, toolParts);
        }

        // Apply sketchnote formatting if appropriate
        finalResponseText = autoFormatSketchnote(userPrompt, finalResponseText);

        // Calculate performance metrics for adaptive difficulty
        const responseTime = Date.now() - startTime;

        // Calculate accuracy from tool calls (if student made progress)
        const toolCallsArray = functionCalls || [];
        const successfulTools = toolCallsArray.filter((call: any) =>
            call.name === 'update_student_progress' || call.name === 'log_activity'
        ).length;
        const accuracy = toolCallsArray.length > 0 ? successfulTools / toolCallsArray.length : 0.5;

        // Calculate engagement score from user message
        const messageLength = userPrompt.length;
        const questionAsked = userPrompt.includes('?');
        const messageFrequency = messages.length > 1 ? (messages.length / ((Date.now() - startTime) / 3600000)) : 1;
        const engagementScore = AdaptiveDifficultyService.calculateEngagement(
            messageLength,
            messageFrequency,
            questionAsked
        );

        // Track consecutive performance (simplified - ideally from session state)
        const consecutiveCorrect = accuracy >= 0.7 ? 1 : 0;
        const consecutiveIncorrect = accuracy < 0.7 ? 1 : 0;

        const metrics = {
            responseTime,
            accuracy,
            consecutiveCorrect,
            consecutiveIncorrect,
            engagementScore
        };

        // Analyze and track difficulty
        try {
            const recommendation = AdaptiveDifficultyService.analyzePerformance(
                metrics,
                currentDifficulty
            );

            console.log(`📊 Adaptive Difficulty: ${recommendation.action} (${currentDifficulty} → ${recommendation.newDifficulty})`);

            // Track performance in database
            await AdaptiveDifficultyService.trackDifficulty(
                userId,
                subject,
                recommendation.newDifficulty.level,
                metrics,
                supabase
            );
        } catch (difficultyError) {
            console.warn('⚠️ Adaptive difficulty tracking failed:', difficultyError);
            // Don't fail the request if difficulty tracking fails
        }

        console.log('💾 Persisting conversation...');

        // Persist conversation with same ID to maintain sidebar continuity
        const { activeConversationId, newTitle } = await persistConversation(
            conversationId, 
            userPrompt, 
            finalResponseText, 
            messages, 
            userId, 
            supabase
        );

        console.log('✅ Chat complete!');

        return NextResponse.json({ 
            content: finalResponseText, 
            conversationId: activeConversationId,
            title: newTitle 
        });

    } catch (error: any) {
        console.error('❌❌❌ Chat API Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        
        return NextResponse.json({ 
            error: 'Chat processing failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
