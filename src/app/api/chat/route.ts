import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSystemPrompt } from '@/lib/services/promptService';
import { retrieveSimilarMemories } from '@/lib/services/memoryService';
import { handleToolCalls } from '@/lib/services/toolHandlerService';
import { persistConversation } from '@/lib/services/persistenceService';
import { startChat, continueChat } from '@/lib/services/chatService';
import { autoFormatSketchnote } from '@/lib/sketchnoteUtils';
import { LibraryService } from '@/lib/services/libraryService';
import { PhilosophyService } from '@/lib/services/philosophyService';
import { PDFService } from '@/lib/services/pdfService';
import { ModelRouter } from '@/lib/services/modelRouter';
import { AdaptiveDifficultyService } from '@/lib/services/adaptiveDifficultyService';
import { DailyPlanService } from '@/lib/services/dailyPlanService';
import { SkillGraphService } from '@/lib/services/skillGraphService';
import { CitationService } from '@/lib/services/citationService';

const apiKey = process.env.GOOGLE_API_KEY;
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

interface ChatMessage {
    role: 'user' | 'assistant' | 'ai';
    content: string;
}

interface FunctionCall {
    name: string;
    args: Record<string, unknown>;
}

export async function POST(req: Request) {
    console.log('🔵 /api/chat - Request received');

    try {
        if (!genAI) {
            console.error('❌ GOOGLE_API_KEY is missing!');
            return NextResponse.json({ error: 'API Key Missing' }, { status: 500 });
        }

        console.log('✅ genAI initialized');

        const { messages, userId, studentInfo, conversationId, imageData, mode } = await req.json(); // Added mode
        console.log('📦 Parsed request body:', { userId, conversationId, messageCount: messages?.length });

        // Gemini requires 'model' role, not 'assistant'
        const formattedHistory = (messages || []).map((m: ChatMessage) => ({
            role: m.role === 'assistant' || m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.content || "" }]
        }));

        const lastMessage = messages[messages.length - 1];
        const userPrompt = lastMessage.content;
        const history = formattedHistory.slice(0, -1);

        console.log('💬 User prompt:', userPrompt);

        // Check for daily plan - if conversation is new and user hasn't asked a specific question
        // Present the daily plan proactively
        const isNewConversation = messages.length <= 2;
        const isVaguePrompt = userPrompt.length < 20 || /^(hi|hey|hello|sup|what'?s up)/i.test(userPrompt);

        if (isNewConversation && isVaguePrompt) {
            const dailyPlan = await DailyPlanService.getTodaysPlan(userId, supabase);

            if (dailyPlan) {
                console.log('📅 Presenting daily lesson plan:', dailyPlan.subject);
                const planMessage = DailyPlanService.formatPlanForChat(dailyPlan);

                // Mark plan as started
                if (dailyPlan.id) {
                    await DailyPlanService.startPlan(dailyPlan.id, supabase);
                }

                // Persist conversation with plan message
                const { activeConversationId } = await persistConversation(
                    conversationId,
                    userPrompt,
                    planMessage,
                    messages,
                    userId,
                    supabase
                );

                return NextResponse.json({
                    content: planMessage,
                    conversationId: activeConversationId,
                    title: `Today's Plan: ${dailyPlan.subject}`,
                    dailyPlan: dailyPlan, // Include plan data for frontend
                });
            }
        }

        // Detect which AI model to use based on conversation content or explicit mode
        const route = ModelRouter.detectMode(userPrompt, mode);
        console.log(`🎯 Model Router: ${route.model} (${route.reason})`);

        // Retrieve context from multiple sources
        const similarMemories = await retrieveSimilarMemories(userPrompt, userId, supabase);
        const libraryContext = await LibraryService.search(userPrompt, supabase);

        // Retrieve teaching philosophy (Adeline's soul)
        const { formatted: philosophyContext } = await PhilosophyService.getPhilosophyForConversation(
            userPrompt,
            supabase
        );
        console.log(`🌱 Philosophy context loaded: ${philosophyContext ? 'yes' : 'no'}`);

        // Also search unified knowledge base (PDFs, articles, etc.)
        const knowledgeResults = await PDFService.searchKnowledge(userPrompt, supabase, {
            threshold: 0.7,
            maxResults: 5
        });
        const knowledgeContext = knowledgeResults ? PDFService.formatForPrompt(knowledgeResults) : '';
        if (knowledgeContext) {
            console.log(`📖 Knowledge base: Found ${knowledgeResults?.length || 0} relevant chunks`);
        }

        let systemInstruction = generateSystemPrompt(studentInfo, similarMemories, lastMessage);

        // Inject philosophy FIRST - this is Adeline's core identity
        if (philosophyContext) {
            systemInstruction = philosophyContext + '\n' + systemInstruction;
        }

        // Inject knowledge base context
        if (knowledgeContext) {
            systemInstruction += '\n' + knowledgeContext;
        }

        // Inject Investigation Mode context if routed to Grok
        if (route.model === 'grok') {
            systemInstruction += `\n\n=== INVESTIGATION MODE (CRITICAL PEDAGOGY) ===
\nPROTOCOL (Inquiry-Based Learning):
1. QUESTION AUTHORITY: "Who funded this study?" "Who benefits from this narrative?"
2. FOLLOW THE MONEY: Reveal corporate influences on policy and science.
3. HISTORICAL CONTEXT: Connect modern events to historical precedents (e.g. Rockefeller medicine).
4. SOCRATIC METHOD: Don't just give answers. Ask: "Why do you think they would say that?"
5. BE DIRECT: Prioritize hard truths over polite consensus.

STYLE: Investigative journalist meets critical theorist.
`;
            console.log('🕵️ Injected Investigation Mode prompt');
        }

        // Inject Deep Research context if routed to GPT-4
        if (route.model === 'gpt4') {
            systemInstruction += `\n\n=== DEEP RESEARCH MODE (ACADEMIC ANALYSIS) ===
\nPROTOCOL (Bloom's Taxonomy - Analysis & Evaluation):
1. MULTI-PERSPECTIVE ANALYSIS: Examine the topic from economic, historical, and scientific angles.
2. SYSTEMATIC REVIEW: Synthesize information like a literature review.
3. SCAFFOLDING: Break down complex concepts into constituent parts.
4. CITATION-HEAVY: Refer to specific historical events, documents, or logic chains.
5. STRUCTURED OUTPUT: Use clear headings, bullet points, and logical flow.

STYLE: Academic researcher meets patient mentor.
`;
            console.log('🧠 Injected Deep Research Mode prompt');
        }

        // Inject library context (truth documents) if found
        if (libraryContext && libraryContext.length > 0) {
            console.log(`📚 Found ${libraryContext.length} relevant library excerpts`);
            systemInstruction += '\n\n' + LibraryService.formatForPrompt(libraryContext);
        }

        // Inject standards context - show Adeline which standards to target
        if (studentInfo?.stateStandards && studentInfo?.gradeLevel) {
            try {
                const { StandardsService } = await import('@/lib/services/standardsService');
                const gradeNum = studentInfo.gradeLevel.replace(/th|st|nd|rd/gi, '').trim();
                const unmetStandards = await StandardsService.getUnmetStandards(
                    userId,
                    studentInfo.stateStandards,
                    gradeNum,
                    undefined, // All subjects
                    supabase
                );

                if (unmetStandards.length > 0) {
                    const topStandards = unmetStandards.slice(0, 8); // Top 8 priority standards
                    systemInstruction += `\n\n=== OKLAHOMA STATE STANDARDS TO ADDRESS ===

These are the student's highest-priority unmet standards. Look for opportunities to teach these concepts:

${topStandards.map(std => `- ${std.standard_code} (${std.subject}): ${std.statement_text}`).join('\n')}

When teaching, naturally mention which standard you're covering (e.g., "This is Oklahoma Math standard ${topStandards[0]?.standard_code}").
Track progress by using the log_activity tool with relevant skills after the student demonstrates understanding.
`;
                    console.log(`📋 Injected ${topStandards.length} unmet standards into context`);
                }
            } catch (e) {
                console.warn('Could not fetch standards for chat context:', e);
            }
        }

        // Inject learning path context for personalized, interest-driven teaching
        try {
            const { LearningPathService } = await import('@/lib/services/learningPathService');
            const learningPath = await LearningPathService.getPath(userId, supabase);

            if (learningPath && learningPath.interests.length > 0) {
                // Get next focus suggestion
                const nextFocus = await LearningPathService.suggestNextFocus(userId, supabase);
                const summary = await LearningPathService.getPathSummary(userId, supabase);

                // Get interest-specific teaching approaches
                const interestMappings = await LearningPathService.getInterestMappings(
                    learningPath.interests,
                    supabase
                );

                const currentMilestone = learningPath.milestones?.find(m => m.status === 'in_progress') ||
                                        learningPath.milestones?.find(m => m.status === 'upcoming');

                systemInstruction += `\n\n=== PERSONALIZED LEARNING PATH ===

Student Interests: ${learningPath.interests.join(', ')}
Current Focus: ${currentMilestone?.title || 'Not yet set'}
Progress: ${summary?.completed || 0}/${summary?.totalStandards || 0} milestones (${summary?.percentComplete || 0}%)
Learning Pace: ${learningPath.pace}

TEACHING APPROACHES FOR THIS STUDENT'S INTERESTS:
${interestMappings.map(m => `- ${m.interest.toUpperCase()} → ${m.subject}: ${m.approachDescription}
  Example: ${m.exampleActivity}`).join('\n')}

${nextFocus ? `NEXT PRIORITY: ${nextFocus.standardCode} (${nextFocus.subject})
"${nextFocus.statementText}"
Suggested approach: ${nextFocus.suggestedApproach}
${nextFocus.interestConnection ? `Connect to: ${nextFocus.interestConnection}` : ''}` : ''}

ADAPTATION TRIGGERS - Call update_learning_path when:
1. Student mentions a NEW interest ("I love cooking" → add to interests)
2. Student CHOOSES between options you offer (record their preference)
3. You learn NEW INFO about them (learning style, pace preference)
4. Student explicitly requests to focus on something specific
`;
                console.log(`🎯 Injected learning path context (${learningPath.interests.length} interests)`);
            }
        } catch (e) {
            console.warn('Could not fetch learning path for chat context:', e);
        }

        // Check for skill prerequisites and inject gap warnings
        const attemptedSkillId = await SkillGraphService.identifySkillFromMessage(userPrompt, supabase);
        if (attemptedSkillId && userId) {
            const gapCheck = await SkillGraphService.detectGap(userId, attemptedSkillId, supabase);

            if (gapCheck.hasGap && gapCheck.missingSkills.length > 0) {
                console.log(`⚠️ Gap detected! Missing prerequisites:`, gapCheck.missingSkills.map(s => s.name));

                const skillNames = gapCheck.missingSkills.map(s => s.name).join(', ');
                systemInstruction += `\n\n=== PREREQUISITE GAP DETECTED ===

CRITICAL: The student is attempting a skill they're not ready for yet.

Missing Prerequisites: ${skillNames}

You MUST:
1. PAUSE the current lesson immediately
2. Say: "${gapCheck.message || 'Hold on, let\'s back up. Before we do this, we need to cover some foundational skills first.'}"
3. Ask a quick diagnostic question to assess their level with the prerequisite
4. If they don't have it, teach the prerequisite FIRST
5. Only after they demonstrate understanding, return to the original topic

DO NOT proceed with the advanced topic until prerequisites are covered.
`;
            }
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

        // Student Game Design Instructions
        systemInstruction += `\n\n=== STUDENT GAME DESIGN ===

When a student asks to create or make a game:

1. CHECK UNDERSTANDING FIRST:
   - Before building a game about a skill, verify student understands the skill
   - Ask: "Before we build this game, can you [demonstrate understanding]?"
   - If student doesn't know it yet, say: "Love the idea! Let's learn [skill] first, then your game will be awesome."

2. CO-DESIGN CONVERSATION:
   Ask the student to make design choices:
   - "What kind of game? Matching? Sorting? Quiz? Labeling? Memory?"
   - "What subject?" (math, science, reading, etc.)
   - "Should I use YOUR photos (from projects) or draw diagrams?"
   - "Timer or no timer?"
   - "How many rounds/questions?"

3. BUILD THE MANIFEST:
   Once you have their choices, use generate_student_game tool with a complete manifest:
   - assets: {backgroundImage?, elements: [{id, type, content, position?, correctAnswer?, distractor?}]}
   - mechanics: {winCondition, lives?, timer, timerSeconds?}
   - pedagogy: {skillId, difficulty}

4. PRESENT & ITERATE:
   - After generating, say: "Here's your game! Try it out."
   - If they want changes: "What should we adjust?" and regenerate

IMPORTANT:
- Game creation IS learning (requires deep understanding to design)
- Student must be able to explain the rules
- Use their actual work (photos, projects) as game content when possible
`;

        // Voice and style
        systemInstruction += `\n\nHOW TO RESPOND:
- Talk like a real person, not a textbook. Be conversational and direct.
- Skip formulaic structures like "we observe... scientists model..." or "first, second, third."
- No endearments (dear, honey, grandma), no theatrics, no asterisk actions.
- If you don't know something, say so honestly.
- Keep it brief - 2-3 paragraphs max. Use diagrams for complex spatial concepts.
- Question narratives and expose institutional BS when relevant.

CREDIT TRACKING (CRITICAL - DO THIS AUTOMATICALLY):
After teaching a lesson or helping with a learning activity, you MUST call update_student_progress to log credits:
- Use 0.005 credits for quick activities (5-15 min practice/explanation)
- Use 0.01 credits for standard lessons (30-60 min of learning)
- Use 0.02 credits for extended work (2+ hours project discussion)
- Map subject correctly: "math", "science", "english", "history", "health", "economics", "government", "art"
- Do this SILENTLY - never mention you're tracking credits
- Call it AFTER you finish teaching, not before

FORMATTING RULES:
- Use ONLY simple HTML for formatting: <strong>bold</strong>, <em>italic</em>, <p>paragraphs</p>
- NEVER mix HTML and markdown (no **bold** or _italic_)
- NEVER use inline styles like <span style="font-size: 1.5em">
- Use emojis directly in text, not in HTML tags
- Keep formatting minimal and clean`;


        // ✅ FIX: Define tools for Gemini
        const tools = [{
            functionDeclarations: [
                {
                    name: "update_student_progress",
                    description: "REQUIRED: Call this AFTER teaching any lesson or helping with learning. Silently track graduation credits toward Oklahoma homeschool requirements. Never tell student you're tracking. 1 credit = 120 hours. Use 0.005 for 5-15 min, 0.01 for 30-60 min, 0.02 for 2+ hours. Call this every time you teach something, even quick explanations.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            subject: { type: SchemaType.STRING, description: "Subject area: math, science, english, history, health, economics, government, art, or general" },
                            credits: { type: SchemaType.NUMBER, description: "Credits earned (0.005 for quick help, 0.01 for standard lesson, 0.02 for extended work)" },
                            activity: { type: SchemaType.STRING, description: "Brief description of what they learned/practiced" }
                        },
                        required: ["subject", "credits", "activity"]
                    }
                },
                {
                    name: "create_game",
                    description: "Create interactive learning game",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            gameType: { type: SchemaType.STRING, enum: ["quiz", "matching", "typing", "coding"] },
                            subject: { type: SchemaType.STRING },
                            difficulty: { type: SchemaType.STRING, enum: ["easy", "medium", "hard"] }
                        },
                        required: ["gameType", "subject"]
                    }
                },
                {
                    name: "log_activity",
                    description: "Log daily activities for state compliance tracking. Translate real activities into academic standards.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            caption: { type: SchemaType.STRING, description: "What student actually did (e.g., 'Played Minecraft 2 hours')" },
                            translation: { type: SchemaType.STRING, description: "Academic category (e.g., 'Computer Science: Logic & Resource Management')" },
                            skills: { type: SchemaType.STRING, description: "Skills demonstrated (comma-separated)" },
                            grade: { type: SchemaType.STRING, description: "Grade level relevance (e.g., '8th grade')" }
                        },
                        required: ["caption", "translation"]
                    }
                },
                {
                    name: "generate_student_game",
                    description: "Generate a student-designed learning game based on their choices. Only call this after co-designing with the student (asking game type, subject, assets, mechanics). Student must understand the skill to design a game about it.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING, description: "Game title (student-chosen)" },
                            gameType: {
                                type: SchemaType.STRING,
                                enum: ["matching", "sorting", "labeling", "quiz", "memory", "path", "fill_blank"],
                                description: "Type of game"
                            },
                            subject: { type: SchemaType.STRING, description: "Subject area (math, science, reading, etc)" },
                            skillId: { type: SchemaType.STRING, description: "Skill ID being practiced (optional)" },
                            useStudentPhotos: { type: SchemaType.STRING, description: "Whether to use student's uploaded photos" },
                            manifest: {
                                type: SchemaType.OBJECT,
                                description: "Complete game manifest with assets, mechanics, and pedagogy"
                            }
                        },
                        required: ["title", "gameType", "subject", "manifest"]
                    }
                },
                {
                    name: "create_library_content",
                    description: "Create a lesson and/or project for the project library. Use when student asks for a project idea or when you create teaching content that would be valuable to save for later.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING, description: "Title of the lesson/project" },
                            category: { type: SchemaType.STRING, description: "Category (God's Creation & Science, Math, English/Lit, etc)" },
                            lesson_content: { type: SchemaType.STRING, description: "The teaching lesson (Life of Fred narrative style)" },
                            project_instructions: { type: SchemaType.STRING, description: "Hands-on project instructions" },
                            materials: { type: SchemaType.STRING, description: "Materials needed (comma-separated)" },
                            grade_levels: { type: SchemaType.STRING, description: "Applicable grades (comma-separated, e.g. '6th,7th,8th')" },
                            key_concepts: { type: SchemaType.STRING, description: "Key learning concepts (comma-separated)" }
                        },
                        required: ["title", "category", "lesson_content", "project_instructions"]
                    }
                },
                {
                    name: "remember_this",
                    description: "Save important information about the student for future conversations. Use for interests, preferences, goals, fears, learning styles, family details, or anything personal they share.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            content: { type: SchemaType.STRING, description: "What to remember (e.g., 'Student loves rocks and geology')" },
                            category: { type: SchemaType.STRING, description: "Category: interests, preferences, goals, family, learning_style, etc" }
                        },
                        required: ["content", "category"]
                    }
                },
                {
                    name: "share_sketchnote",
                    description: "Search for and share a visual sketchnote with the student. Sketchnotes are pre-made visual summaries of topics. Optionally add to student's journal. Use when a topic would benefit from a visual summary.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            topic: { type: SchemaType.STRING, description: "Topic to search for (e.g., 'fractions', 'photosynthesis')" },
                            subject: { type: SchemaType.STRING, description: "Subject area (math, science, reading, etc)" },
                            addToJournal: { type: SchemaType.STRING, description: "Whether to add to student's journal (true/false)" }
                        },
                        required: ["topic"]
                    }
                },
                {
                    name: "update_learning_path",
                    description: "Update the student's learning path adaptation. Call this when: 1) Student expresses a new interest, 2) Student makes a choice between options you offered, 3) You learn new info about them (pace, style), 4) Milestone is completed.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            action: {
                                type: SchemaType.STRING,
                                enum: ["add_interests", "complete_milestone", "record_choice", "new_info"],
                                description: "Type of update to perform"
                            },
                            interests: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: "List of new interests to add (for add_interests action)"
                            },
                            milestone_id: { type: SchemaType.STRING, description: "ID of completed milestone (for complete_milestone action)" },
                            engagement_score: { type: SchemaType.NUMBER, description: "1-10 score of engagement (for complete_milestone)" },
                            choice: { type: SchemaType.STRING, description: "The choice the student made (for record_choice)" },
                            new_info: { type: SchemaType.STRING, description: "The new information learned (for new_info)" }
                        },
                        required: ["action"]
                    }
                },
                {
                    name: "create_project",
                    description: "Create a new learning project in the student's journal. Use this when the student wants to start a big activity (e.g. 'Build a Garden'). Co-design the project first, then save the full plan here.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING, description: "Title of the project (e.g. 'Vegetable Garden')" },
                            description: { type: SchemaType.STRING, description: "Brief description of the goal" },
                            manifest: {
                                type: SchemaType.STRING,
                                description: "Markdown-formatted project plan including: Materials, Step-by-Step Instructions, Learning Goals, and Standards."
                            },
                            tags: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: "Tags for the project. MUST include 'project' and 'active'."
                            }
                        },
                        required: ["title", "description", "manifest"]
                    }
                },
                {
                    name: "add_to_portfolio",
                    description: "Add an accomplishment to the student's portfolio. Use when student shares something they created, built, learned, or accomplished (e.g., 'I built a treehouse', 'I baked cookies', 'I wrote a story'). Translate their activity into portfolio-worthy achievements with relevant skills.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: { type: SchemaType.STRING, description: "Title of the portfolio item (e.g., 'Built a Treehouse')" },
                            description: { type: SchemaType.STRING, description: "Detailed description of what they did and what they learned" },
                            type: {
                                type: SchemaType.STRING,
                                enum: ["project", "lesson", "artwork", "writing", "other"],
                                description: "Type of portfolio item"
                            },
                            skills_demonstrated: {
                                type: SchemaType.ARRAY,
                                items: { type: SchemaType.STRING },
                                description: "List of skills demonstrated (e.g., ['Planning', 'Building', 'Problem Solving'])"
                            }
                        },
                        required: ["title", "description", "type", "skills_demonstrated"]
                    }
                },
                {
                    name: "search_web",
                    description: "Search the web for current information, facts, or answers to questions you don't know. Use when student asks about recent events, specific facts, or topics outside your knowledge.",
                    parameters: {
                        type: SchemaType.OBJECT,
                        properties: {
                            query: { type: SchemaType.STRING, description: "Search query" }
                        },
                        required: ["query"]
                    }
                }
            ]
        }];

        console.log('🚀 Starting chat with Gemini...');

        // Track response time for adaptive difficulty
        const startTime = Date.now();

        // Map router model to actual model identifier
        let selectedModel = 'gemini-2.0-flash'; // default
        if (route.model === 'gemini') {
            selectedModel = 'gemini-2.0-flash';
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
            const toolParts = await handleToolCalls(functionCalls as FunctionCall[], userId, supabase);
            finalResponseText = await continueChat(chat, toolParts);
        }

        // Apply sketchnote formatting if appropriate
        finalResponseText = autoFormatSketchnote(userPrompt, finalResponseText);

        // Calculate performance metrics for adaptive difficulty
        const responseTime = Date.now() - startTime;

        // Calculate accuracy from tool calls (if student made progress)
        const toolCallsArray = functionCalls || [];
        const successfulTools = toolCallsArray.filter((call: FunctionCall) =>
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
        const { activeConversationId, newTitle, error: persistError } = await persistConversation(
            conversationId,
            userPrompt,
            finalResponseText,
            messages,
            userId,
            supabase
        );

        if (persistError) {
            console.warn('⚠️ Persistence warning:', persistError);
        }

        // Record citations for parent/teacher visibility (silent, non-blocking)
        if (knowledgeResults && knowledgeResults.length > 0) {
            CitationService.recordCitation(
                userId,
                {
                    conversationId: activeConversationId,
                    subject: subject,
                    sources: knowledgeResults.map((r: { id: string; source_title?: string; source_type?: string }) => ({
                        id: r.id,
                        type: r.source_type || 'knowledge',
                        title: r.source_title || 'Unknown Source'
                    })),
                    queryText: userPrompt.substring(0, 200) // Truncate for privacy
                },
                supabase
            ).catch(err => console.warn('[Citations] Recording failed:', err));
        }

        console.log('✅ Chat complete!');

        return NextResponse.json({
            content: finalResponseText,
            conversationId: activeConversationId,
            title: newTitle,
            persistError, // Include so frontend can show a warning toast
        });

    } catch (error: unknown) {
        console.error('❌❌❌ Chat API Error:', error);
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
            console.error('Error message:', error.message);
        }

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';

        // Provide user-friendly error messages
        let userMessage = "I'm having trouble connecting. Please try again.";
        if (errorMessage.includes('API key')) {
            userMessage = "There's a configuration issue. Please contact support.";
        } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            userMessage = "We're experiencing high demand. Please wait a moment and try again.";
        } else if (errorMessage.includes('model')) {
            userMessage = "The AI service is temporarily unavailable. Please try again shortly.";
        }

        return NextResponse.json({
            error: 'Chat processing failed',
            userMessage,
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
