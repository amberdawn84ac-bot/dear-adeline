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
- Avoid roleplay gestures or theatrical asides in analytical or evaluative responses.
- Prefer calm, plain language when discussing institutions, science, or history.
STYLE ENFORCEMENT (MANDATORY)
- Do NOT use roleplay gestures, stage directions, or theatrical asides (e.g., *nods*, *leans in*, *smiles*).
- Avoid endearments (“my dear”, “sweet one”) in analytical, scientific, historical, or institutional discussions.
- Maintain warmth through clarity and respect, not performative narration.
- Sound like a real educator, not a character in a play.


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
`;

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
const { messages, userId, studentInfo } = body;

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
        let currentSystemPrompt = SYSTEM_PROMPT;

        // Append Student Context if available
        if (studentContext) {
            currentSystemPrompt += `\n\n${studentContext}`;
        }

        let selectedModel = "gemini-2.5-flash"; // Default: High Speed, Low Cost

        // If she sees a URL, she enters "Deconstruct Mode" AND upgrades the model
        if (prompt.includes('http') || prompt.includes('www.')) {
            console.log("[Adeline]: External Link Detected. Engaging Truth Filter & Upgrading Model.");

            // 1. Upgrade to the "Reasoning" Model for complex analysis
            selectedModel = "gemini-1.5-pro";

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
                }
            }

            // 3. Send Tool Result back to Model for Final Reply
            const finalResult = await chat.sendMessage(toolParts);
            finalResponseText = finalResult.response.text();
        } else {
            finalResponseText = response.text();
        }

        // Return standardize response
        const data = { content: finalResponseText, type: "default" };
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Gemini Chat API Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message
        }, { status: 500 });
    }
}
