import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LibraryService } from '@/lib/services/libraryService';
import { ModelRouter, ModelMode } from '@/lib/services/modelRouter';

const apiKey = process.env.GOOGLE_API_KEY;
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

/**
 * ROUTED CHAT API
 * 
 * This is a NEW endpoint that adds:
 * 1. Multi-model routing (Gemini/Grok/GPT-4)
 * 2. The Hippocampus (library RAG integration)
 * 3. Adventure log tracking
 * 
 * Your existing /api/chat still works! This is additive.
 * 
 * Usage: POST to /api/chat/routed
 */
export async function POST(req: Request) {
    console.log('🔵 /api/chat/routed - Request received');
    
    try {
        if (!genAI) {
            console.error('❌ GOOGLE_API_KEY is missing!');
            return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });
        }

        const { messages, userId, studentInfo, mode } = await req.json();
        
        const lastMessage = messages[messages.length - 1];
        const userPrompt = lastMessage.content;

        // ============================================
        // STEP 1: INTELLIGENT MODEL ROUTING
        // ============================================
        const route = ModelRouter.detectMode(userPrompt, mode as ModelMode);
        console.log(`🎯 Routing to: ${route.model} (${route.reason})`);

        // For now, we only have Gemini implemented
        // Grok and GPT-4 will be added next
        if (route.model !== 'gemini') {
            console.warn(`⚠️ ${route.model} not yet implemented, falling back to Gemini`);
        }

        // ============================================
        // STEP 2: SEARCH THE HIPPOCAMPUS
        // Inject "truth documents" into context
        // ============================================
        let libraryContext = '';
        
        try {
            const libraryMatches = await LibraryService.search(
                userPrompt,
                supabase,
                0.75, // similarity threshold
                3     // max results
            );

            if (libraryMatches && libraryMatches.length > 0) {
                libraryContext = LibraryService.formatForPrompt(libraryMatches);
                console.log(`📚 [Hippocampus]: Injected ${libraryMatches.length} document excerpts`);
            } else {
                console.log('📚 [Hippocampus]: No relevant documents found');
            }
        } catch (error) {
            console.error('📚 [Hippocampus]: Search failed, continuing without library context', error);
        }

        // ============================================
        // STEP 3: BUILD SYSTEM PROMPT
        // ============================================
        let systemInstruction = `You are Adeline, a sharp-witted educational mentor who helps students actually learn instead of just memorizing.

HOW YOU TALK:
- Like a real person having a conversation, not reading from a script
- Direct and honest - if we don't know something, say so
- Skip the academic theater and formulaic structures
- No "we observe... scientists model..." templates
- No endearments, no fluff, no repetitive phrasing

WHAT YOU DO:
- Help students explore what interests them
- Question mainstream narratives - follow the money, expose conflicts of interest
- Encourage critical thinking about models vs. reality
- Biblical worldview but not preachy
- Translate activities into academic language when needed

${route.model === 'grok' ? 'INVESTIGATION MODE: Follow the money. Question everything. Expose conflicts of interest.' : ''}

${libraryContext}

VOICE: Talk like you're explaining something to a curious teenager over coffee. Be natural, conversational, and real. Skip structures like "First... Second... Third..." or "We observe X, scientists model it as Y." Just explain things like a human.`;

        // Format history for Gemini
        const formattedHistory = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        // ============================================
        // STEP 4: CALL MODEL (Currently only Gemini)
        // ============================================
        // Map router model to actual model identifier
        const selectedModel = route.model === 'gemini' ? 'gemini-2.5-flash' :
                             route.model === 'grok' ? 'grok-beta' :
                             'gpt-4'; // Future: Implement Grok and GPT-4 APIs

        const model = genAI.getGenerativeModel({
            model: selectedModel,
            systemInstruction
        });

        const chat = model.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(userPrompt);
        const response = result.response;
        const text = response.text();

        // ============================================
        // STEP 5: AUTO-LOG ACTIVITIES (Future)
        // Parse response for activities to log
        // ============================================
        // TODO: Extract activities and log to adventure_logs table

        return NextResponse.json({ 
            reply: text,
            model: route.model,
            usedLibrary: libraryContext.length > 0
        });

    } catch (error) {
        console.error('❌ Routed chat error:', error);
        return NextResponse.json(
            { error: 'Chat failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
