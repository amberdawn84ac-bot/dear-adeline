import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeForPrompt } from '@/lib/sanitize';

// Initialize Gemini
const apiKey = process.env.GOOGLE_API_KEY;

// Initialize Supabase (Service Role for admin tasks if needed, or stick to user client if token passed)
// Using pure params for backend usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

let genAI: GoogleGenerativeAI | undefined;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `
IDENTITY
You are Adeline — a calm, experienced educator and guide.
You are not an authority figure. You do not issue verdicts.
You help learners develop discernment.

BEHAVIORAL LAW (NON-NEGOTIABLE)
1. Epistemic Humility:
   - Never present uncertainty as certainty.
   - Clearly distinguish fact, inference, and opinion.
   - If evidence is incomplete or contested, state that explicitly.

2. Discernment Lens:
   - You may ask “Who profits?” only after identifying:
     a) the claim
     b) the source
     c) documented stakeholders or incentives
   - If evidence is missing, say so.

3. Truth Anchor:
   - You affirm the dignity of human life and the existence of objective truth.
   - You do not claim divine authority.
   - You do not weaponize scripture or morality.

4. Science & History:
   - Explain mechanisms, not magic.
   - Teach cause and effect, not heroes and villains.
   - Avoid medical or legal prescriptions.

5. Agency Over Answers:
   - Prioritize teaching how to evaluate claims.
   - Offer verification steps and research prompts.
   - You succeed when the learner becomes less dependent on you.
   STYLE CONSTRAINT
- ABSOLUTELY NO endearments ("my dear", "sweet one", "little one", "child"). This is a hard constraint.
- Do NOT use roleplay gestures or theatrical asides (e.g., *nods*, *leans in*, *smiles*).
- Maintain professional, engaging clarity. You are a tutor, not a grandmother.
- Sound like a real educator: clear, direct, and focused.
### RESPONSE CONSTRAINTS
- MAX LENGTH: 3-5 sentences per response (unless Deep Dive).
- Answer the user's question IMMEDIATELY. No preambles like "That is a wonderful question."
- Stop talking after you have answered the core question.
- Do NOT offer unrequested validation ("You are doing great").
- Avoid teaching "how to think" unless explicitly asked.
- Default to concise, grounded responses.



FAILURE SAFEGUARD
If you lack sufficient evidence:
- Slow down
- Declare limits
- Redirect to method, not conclusion

INTERNAL RESPONSE PROTOCOL (SILENT)
For every message:
1. Identify the claim or question
2. Check evidence availability
3. Assess incentives only if evidence exists
4. Check moral consistency
5. Respond clearly and cautiously

CRITICAL INSTRUCTION: You are the 'Guardian of Truth'. When discussing Scripture, YOU MUST reference the original Hebrew/Greek context. When discussing History or Science, YOU MUST question 'Who funded this?' and mention primary sources (like the Flexner Report) that contradict mainstream narratives.
`;

import { EmbeddingService } from '@/lib/embeddingService';

// Tool Definition
const tools: any[] = [
    {
        functionDeclarations: [
            {
                name: "log_activity",
                description: "Save a learning activity to the transcript.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        type: { type: SchemaType.STRING, enum: ["text", "photo"] },
                        caption: { type: SchemaType.STRING, description: "Brief description of the activity" },
                        translation: { type: SchemaType.STRING, description: "Academic translation (e.g. Baking -> Chemistry)" },
                        skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        grade: { type: SchemaType.STRING, description: "Approximate grade level" }
                    },
                    required: ["caption", "translation", "skills", "grade"]
                }
            },
            {
                name: "search_web",
                description: "Search the internet for current local events, grants, contests, or news facts.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        query: { type: SchemaType.STRING, description: "The search query (e.g. 'Science fairs in Tulsa June 2024')" },
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
        const { messages, userId, studentInfo, conversationId } = body;

        // CLEAN incoming messages so Gemini is not re-trained by UI persona text
        const cleanedMessages = (messages || []).filter(
            (m: any) => m?.role === 'user' || m?.role === 'assistant'
        );

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
        }

        const lastMessage = cleanedMessages[cleanedMessages.length - 1];
        const prompt = lastMessage.content;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
        }

        let systemPrompt = SYSTEM_PROMPT;

        if (lastMessage?.content?.startsWith('Deep Dive Study:')) {
            const passage = lastMessage.content.replace('Deep Dive Study:', '').trim();
            systemPrompt += `
        ### DEEP DIVE SCRIPTURE RULES
        - Focus ONLY on the following passage: "${passage}".
        - Immediately show the original Hebrew or Greek text.
        - Include literal translations or alternate meanings that modern English versions might obscure.
        - Provide concise historical and cultural context (2–3 sentences max).
        - Do NOT open with validation, affection, or praise.
        - Keep responses strictly educational and factual.
        `;
        }

        const grade = studentInfo?.gradeLevel ?? '10';
        const age = typeof grade === 'number' ? grade : parseInt(grade.toString().replace(/\D/g, '')) || 10;

        console.log('AGE USED:', age);

        systemPrompt += `
You are Adeline, a joyful learning guide for CHILDREN.

Student age: ${age}

CRITICAL RULES YOU MUST FOLLOW:

If age <= 10:
- Very short sentences.
- Simple words.
- One idea at a time.
- Use emojis like 📘✨🧠
- Use bullet points.
- NO long explanations.
- NO abstract theology.

If age 11–13:
- Short paragraphs only.
- Friendly tone.
- Clear headers.
- One emoji per section.

If age 14+:
- Normal explanations, still clear and structured.

ALWAYS:
- Use headers.
- Use spacing.
- Be visually engaging.
- Teach like a mentor, not a lecturer.
`;

        // 1. Build Student Context (Merged from remote)
        let studentContext = '';
        if (studentInfo) {
            interface GraduationProgress {
                track: string;
                earned: number;
                required: number;
            }
            const saneName = sanitizeForPrompt(studentInfo.name || 'Student');
            const saneGrade = sanitizeForPrompt(studentInfo.gradeLevel || 'NOT SET');
            const saneSkills = sanitizeForPrompt(studentInfo.skills?.map((s: any) => s.skill?.name || s).join(', ') || 'NONE');
            const saneProgress = studentInfo.graduationProgress?.map((p: GraduationProgress) =>
                `  * ${sanitizeForPrompt(p.track)}: ${sanitizeForPrompt(String(p.earned))}/${sanitizeForPrompt(String(p.required))} credits`
            ).join('\n') || '  * No progress data yet';

            studentContext = `
Current Student:
- Name: ${saneName}
- Grade Level: ${saneGrade}
- Skills already earned: ${saneSkills}
- Graduation Progress:
${saneProgress}

💡 PRO - TIP: Adeline, be proactive! If they have 0 progress in a track, suggest a project from that track today.
`;
        }

        // --- THE DISCERNMENT CHECK & MODEL ROUTING ---
        let currentSystemPrompt = systemPrompt;

        // Append Student Context if available
        if (studentContext) {
            currentSystemPrompt += `\n\n${studentContext}`;
        }

        // --- MEMORY RETRIEVAL (RAG) ---
        // Generate embedding for the user's prompt to find relevant past memories
        try {
            const promptEmbedding = await EmbeddingService.embed(prompt);
            if (promptEmbedding && userId) {
                const { data: similarMemories, error: matchError } = await supabase.rpc('match_memories', {
                    query_embedding: promptEmbedding,
                    match_threshold: 0.5, // 0.5 is a reasonable starting threshold for cosine similarity
                    match_count: 5,
                    p_student_id: userId
                });

                if (matchError) {
                    console.error('Memory Match Error:', matchError);
                } else if (similarMemories && similarMemories.length > 0) {
                    currentSystemPrompt += `\n\n### RECALLED MEMORIES (Use these if relevant):\n` +
                        similarMemories.map((m: any) => `- ${m.content}`).join('\n');
                    console.log(`[Memory]: Injected ${similarMemories.length} memories.`);
                }
            }
        } catch (memError) {
            console.error('Memory Retrieval Failed:', memError);
            // Continue without memory if it fails
        }

        let selectedModel = "gemini-1.5-flash";

        // If she sees a URL (that isn't our own image instruction), she enters "Deconstruct Mode"
        const isExternalLink = (prompt.includes('http') || prompt.includes('www.')) && !prompt.includes('source.unsplash.com');

        if (isExternalLink) {
            console.log("[Adeline]: External Link Detected. Engaging Truth Filter.");

            // 1. Use Flash (High Speed) or Pro (Reasoning) if available. Falling back to Flash for stability.
            selectedModel = "gemini-1.5-flash"; // "gemini-1.5-pro-latest" if enabled

            // 2. Inject Deconstruction Instructions
            currentSystemPrompt += `
            \n\n!!! ALERT: THE USER HAS SHARED AN EXTERNAL LINK. !!!
            Your Mode is now: DECONSTRUCTION.
            1. Ignore the "official" summary. 
            2. Follow the money: Who owns this outlet? Who funds this study?
            3. Point out logical fallacies (Appeal to Authority, Fear-mongering).
            4. Compare it against Biblical principles.
            `;
        }

        const model = genAI.getGenerativeModel({
            model: selectedModel,
            systemInstruction: currentSystemPrompt,
            tools: tools
        });

        // Start Chat with History (mapping standard roles to Gemini roles)
        const history = cleanedMessages.slice(0, -1).map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(m.content || '') }]
        }));


        const chat = model.startChat({
            history: history
        });

        // 1. Send Message
        const result = await chat.sendMessage(prompt);
        const response = await result.response;

        // 2. Handle Tool Calls
        const functionCalls = response.functionCalls();
        let finalResponseText = "";

        if (functionCalls && functionCalls.length > 0) {
            // Execute Tools
            const toolParts = [];
            for (const call of functionCalls) {
                if (call.name === 'log_activity') {
                    const args = call.args as any;
                    console.log("TOOL CALL: log_activity", args);

                    // Save to Supabase
                    const { error } = await supabase
                        .from('activity_logs')
                        .insert({
                            student_id: userId,
                            type: args.type || 'text',
                            caption: args.caption,
                            translation: args.translation,
                            skills: args.skills,
                            grade: args.grade
                        });

                    if (error) console.error("Database Log Error:", error);

                    toolParts.push({
                        functionResponse: {
                            name: 'log_activity',
                            response: { name: 'log_activity', content: { status: 'logged successfully' } }
                        }
                    });
                } else if (call.name === 'search_web') {
                    const args = call.args as any;
                    console.log(`[Adeline Eyes]: Searching web for "${args.query}"...`);

                    // Call Tavily Search API
                    // Note: Ensure TAVILY_API_KEY is in .env or deployed env vars
                    let searchResults = [];
                    try {
                        const tavilyApiKey = process.env.TAVILY_API_KEY;
                        if (tavilyApiKey) {
                            const response = await fetch("https://api.tavily.com/search", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    api_key: tavilyApiKey,
                                    query: args.query,
                                    search_depth: "basic",
                                    include_answer: true,
                                    max_results: 3
                                })
                            });
                            const data = await response.json();
                            searchResults = data.results || [];
                        } else {
                            console.warn("Tavily API Key missing. Returning mock data.");
                            searchResults = [{ title: "Mock Result", content: "TAVILY_API_KEY not found. Please add it to your environment variables." }];
                        }
                    } catch (e) {
                        console.error("Search Error:", e);
                        searchResults = [{ error: "Search failed." }];
                    }
                    toolParts.push({
                        functionResponse: {
                            name: 'search_web',
                            response: { name: 'search_web', content: { results: searchResults } }
                        }
                    });
                } else if (call.name === 'remember_this') {
                    const args = call.args as any;
                    console.log(`[Adeline Memory]: Saving "${args.content}"...`);

                    try {
                        const embedding = await EmbeddingService.embed(args.content);
                        if (embedding) {
                            const { error } = await supabase
                                .from('memories')
                                .insert({
                                    student_id: userId,
                                    content: args.content,
                                    embedding: embedding,
                                    metadata: { category: args.category || 'general' }
                                });

                            if (error) throw error;

                            toolParts.push({
                                functionResponse: {
                                    name: 'remember_this',
                                    response: { name: 'remember_this', content: { status: 'memory saved' } }
                                }
                            });
                        } else {
                            throw new Error('Failed to generate embedding');
                        }
                    } catch (e) {
                        console.error("Memory Save Error:", e);
                        toolParts.push({
                            functionResponse: {
                                name: 'remember_this',
                                response: { name: 'remember_this', content: { status: 'failed to save memory', error: String(e) } }
                            }
                        });
                    }
                }
            }

            // 3. Send Tool Result back to Model for Final Reply
            const finalResult = await chat.sendMessage(toolParts);
            finalResponseText = finalResult.response.text();
        } else {
            finalResponseText = response.text();
        }

        // Return standardize response
        // --- CHAT PERSISTENCE ---
        let activeConversationId = conversationId;
        let newTitle = null;

        try {
            const updatedMessages = [...cleanedMessages, { role: 'assistant', content: finalResponseText }];

            if (activeConversationId) {
                // Update existing conversation
                await supabase
                    .from('conversations')
                    .update({
                        messages: updatedMessages,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', activeConversationId);
            } else {
                // New Conversation - Generate Title
                // Simple title generation: First 5-6 words of prompt
                const simpleTitle = prompt.split(' ').slice(0, 6).join(' ') + '...';

                // Insert new conversation
                const { data: newConv, error: newConvError } = await supabase
                    .from('conversations')
                    .insert({
                        student_id: userId,
                        title: simpleTitle,
                        messages: updatedMessages,
                        topic: 'General',
                        is_active: true
                    })
                    .select('id')
                    .single();

                if (newConvError) {
                    console.error('Failed to create conversation:', newConvError);
                } else if (newConv) {
                    activeConversationId = newConv.id;
                    newTitle = simpleTitle;
                }
            }
        } catch (persistError) {
            console.error('Persistence Error:', persistError);
        }

        // Return standardize response
        const data: any = { content: finalResponseText, type: "default" };
        if (activeConversationId) {
            data.conversationId = activeConversationId;
            data.title = newTitle;
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
