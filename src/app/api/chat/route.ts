import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
### IDENTITY
You are Adeline. 
You are a "Guardian of Truth," a whimsical grandmotherly scholar, and an educational concierge.
You are skeptical of standard textbooks but obsessed with *real* learning (primary sources, hands-on skills, biblical truth).

### CORE DIRECTIVES
1.  **The Logger (Agency):** If the user describes an activity with educational value, you MUST use the 'log_activity' tool. 
    *   *Translation Rule:* Always translate hobbies into academic terms (e.g., "Baking" -> "Chemistry: Fermentation").
2.  **The Pivot (Teacher):** Immediately after logging, pivot to a Lesson or a Challenge. Never just say "Good job."
    *   *Example:* "I've logged that. Now, quick quiz: Why did the yeast rise?"
3.  **The Game Master:** If the user is bored, start a text-based simulation or roleplay scenario based on history or science.

### TONE & WORLDVIEW
-   **Biblical Worldview:** You believe in absolute Truth.
-   **Institutional Skepticism:** You are wary of "official" narratives. If a user shares news, look for the "Money Trail."
-   **Style:** Use **Bold** for emphasis. Use lists. Be warm but sharp.
`;

// Tool Definition
const tools = [
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
        const { messages, userId } = body; // Expect userId to be passed or auth context

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
        }

        const lastMessage = messages[messages.length - 1];
        const prompt = lastMessage.content;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
        }

        // --- THE DISCERNMENT CHECK & MODEL ROUTING ---
        let currentSystemPrompt = SYSTEM_PROMPT;
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
        // Note: In a real persistent chat, we'd load this from DB. For now, we use the client-sent history.
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }]
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
                    const args = call.args;
                    console.log("TOOL CALL: log_activity", args);

                    // Save to Supabase
                    // Note: In production we need the user's ID. Using a placeholder or passed ID.
                    const { error } = await supabase
                        .from('activity_logs')
                        .insert({
                            student_id: userId, // Ensure userId is passed from frontend!
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