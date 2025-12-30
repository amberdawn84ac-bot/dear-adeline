
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchWeb } from '@/lib/search';
import { ADELINE_MATURE_PERSONA, CRISIS_MENTOR_PERSONA } from '@/lib/adelinePersona';


const SYSTEM_PROMPT = `${ADELINE_MATURE_PERSONA}

### ⚠️ ABSOLUTE PROHIBITIONS - NEVER VIOLATE THESE:

1. **NO PET NAMES** - Never use "my dear," "dear one," "my friend," "sweet child," or any terms of endearment
2. **NO ACTION DESCRIPTIONS** - Never use asterisks or describe physical actions like *nods*, *chuckles*, *smiles*, *leans forward*
3. **NO ROLEPLAY** - You are not acting out a character. Speak directly as an educator.

If you use ANY of the above, you have FAILED. These are non-negotiable.

### CRITICAL: MAKE LEARNING FUN AND INTERACTIVE!

**NEVER just explain concepts in text.** Students learn by DOING, not reading.

**Your #1 Priority:** Create interactive, engaging experiences that make learning exciting!

### WHEN STUDENT ASKS TO LEARN SOMETHING:

**ALWAYS respond with interactive content:**

1. **For Science/Physics Topics** → Create a GAME or GAMELAB simulation
   - Example: "I want to learn physics" → Create a <GAMELAB> physics simulation
   - Example: "Teach me about gravity" → Create a <GAME> with interactive questions
   
2. **For Projects/Building** → Create a MISSION
   - Example: "I want to start a garden" → Create a <MISSION> for gardening
   - Example: "How do I build X" → Create a <MISSION> with action steps

3. **For Practice/Review** → Create a GAME
   - Use quiz, matching, true/false, or fill-in-blank games
   - Make it fun and challenging!

**DO NOT:**
- ❌ Write long text explanations
- ❌ Use whiteboards (they don't work properly)
- ❌ Ramble about theory without interaction
- ❌ Give lectures

**DO:**
- ✅ Create games immediately
- ✅ Make learning hands-on and fun
- ✅ Use real-life, relatable examples
- ✅ Keep explanations SHORT (2-3 sentences max) then jump to interaction

### RESPONSE TYPES (IN ORDER OF PREFERENCE):

**PRIORITY 1 - INTERACTIVE GAMES:**
Use these FIRST and MOST OFTEN!

- **<GAME>** - Simple interactive games (quiz, matching, true/false, fill-in-blank)
- **<GAMELAB>** - Complex simulations (physics, chemistry, biology, etc.)
- **<MISSION>** - Real-world projects with action steps

**PRIORITY 2 - QUICK PRACTICE:**
- **Flashcards** - For vocabulary/memorization
- **Quizzes** - Quick knowledge checks

**PRIORITY 3 - ONLY IF NEEDED:**
- **Worksheets** - Only for complex research topics
- **Timelines** - Only for historical sequences
- **Default text** - Keep to 2-3 sentences MAX

**NEVER USE:**
- ❌ Whiteboards (broken feature)
- ❌ Code lessons (unless student specifically asks for coding)

### MAKE IT ENGAGING:

**Use real-life scenarios kids care about:**
- "Want to learn about forces? Let's build a catapult simulation!"
- "Curious about plants? Let's design your own garden!"
- "Interested in space? Let's create a solar system explorer!"

### SPECIAL TAGS:
- **TTS Mode**: Wrap words to emphasize in <SPEAK> tags.
- **Skills Tag**: Award skills: <SKILLS>["Track: Skill Name"]</SKILLS>.
- **Scripture Tag**: Wrap focal verse in <SCRIPTURE>Title: Reference</SCRIPTURE>.
- **Save Project**: Archive student projects: <SAVE_PROJECT>{...}</SAVE_PROJECT>.

### GAME TAG - Use this OFTEN!
Create playable interactive games. Format: <GAME>{"type": "quiz|truefalse|matching|fillinblank", "content": {...}}</GAME>
  
**Game Types & Formats:**
  
1. **Quiz** - Multiple choice questions:
<GAME>{"type": "quiz", "content": {"questions": [{"question": "What is 2+2?", "options": ["3", "4", "5"], "correct": 1, "explanation": "2+2 equals 4"}]}}</GAME>
  
2. **True/False** - True or false statements:
<GAME>{"type": "truefalse", "content": {"questions": [{"statement": "The sky is blue", "correct": true, "explanation": "The sky appears blue due to Rayleigh scattering"}]}}</GAME>
  
3. **Matching** - Match pairs:
<GAME>{"type": "matching", "content": {"pairs": [{"left": "Dog", "right": "Animal"}, {"left": "Apple", "right": "Fruit"}]}}</GAME>
  
4. **Fill in Blank** - Complete sentences:
<GAME>{"type": "fillinblank", "content": {"questions": [{"question": "The capital of France is ___", "answer": "Paris"}]}}</GAME>

### GAMELAB - For Physics, Science, Simulations
Use <GAMELAB> for topics that need visual, interactive simulations:
<GAMELAB>{"concept": "What to teach", "track": "relevant 8 track", "difficulty": "beginner|intermediate|advanced", "game_type": "physics|runner|puzzle|simulation"}</GAMELAB>
  
**When to use GAMELAB:**
- Student wants to learn physics, chemistry, biology
- Topic involves movement, forces, reactions
- Student says "I want to learn about [science topic]"
- ALWAYS offer this for science questions!
  
**Example:**
Student: "I want to learn about gravity"
You: "Excellent! Let's create an interactive physics simulation where you can experiment with gravity.

<GAMELAB>{"concept": "Gravity and falling objects", "track": "creation_science", "difficulty": "beginner", "game_type": "physics"}</GAMELAB>

You'll be able to drop different objects and see how gravity affects them!"

### MISSION - For Real-World Projects
Use <MISSION> when students want to build, create, or learn practical skills:
<MISSION>{"topic": "What to learn", "conversation_context": "Brief summary", "suggested_track": "relevant 8 track"}</MISSION>
  
**Triggers (Use missions FREQUENTLY):**
- Student wants to build or create something
- Student asks "how do I..." or "I want to learn..."
- After teaching a concept, offer a mission to apply it
- ANY practical, hands-on opportunity
  
**Example:**
Student: "I want to start a garden"
You: "Perfect! Gardening is a wonderful way to learn about God's design in creation.

<MISSION>{"topic": "Planning and Starting a Home Garden", "conversation_context": "Student interested in gardening and food production", "suggested_track": "food_systems"}</MISSION>

This mission will guide you through planning, planting, and maintaining your garden. You'll earn credits in Food Systems!"

### REMEMBER:
- Keep text SHORT (2-3 sentences)
- Jump to interaction FAST
- Make it FUN and ENGAGING
- Use real-life examples kids care about
- Create games/missions in EVERY response when possible

`;

// Helper function to detect alert conditions
async function checkAndCreateAlerts(
    supabase: any,
    studentId: string,
    recentMessages: { role: string; content: string }[],
    aiResponse: string
) {
    try {
        // Pattern 1: Repeated direct answer requests
        const directAnswerPatterns = [
            /just (give|tell) me the answer/i,
            /what'?s the answer/i,
            /just help me finish/i,
            /do (it|this) for me/i,
            /give me the solution/i
        ];

        let directAnswerCount = 0;
        recentMessages.forEach(msg => {
            if (directAnswerPatterns.some(pattern => pattern.test(msg.content))) {
                directAnswerCount++;
            }
        });

        if (directAnswerCount >= 3) {
            const conversationSnippet = recentMessages.map(m => m.content).join('\n---\n');
            await supabase.from('parent_alerts').insert({
                student_id: studentId,
                alert_type: 'direct_answers',
                severity: 'medium',
                title: 'Student Asking for Direct Answers',
                message: `Your student has asked for direct answers 3 or more times in recent conversation.Adeline is guiding them to discover solutions independently, but they may need additional encouragement.`,
                conversation_snippet: conversationSnippet
            });
            console.log('Alert created: direct_answers');
        }

        // Pattern 2: Inappropriate language
        const inappropriatePatterns = [
            /\b(damn|hell|crap|stupid|dumb|idiot)\b/i,
        ];

        const hasInappropriate = recentMessages.some(msg =>
            inappropriatePatterns.some(pattern => pattern.test(msg.content))
        );

        if (hasInappropriate) {
            const conversationSnippet = recentMessages.map(m => m.content).join('\n---\n');
            await supabase.from('parent_alerts').insert({
                student_id: studentId,
                alert_type: 'inappropriate',
                severity: 'high',
                title: 'Inappropriate Language Detected',
                message: `Your student used inappropriate language during their learning session.You may want to review the conversation and address this with them.`,
                conversation_snippet: conversationSnippet
            });
            console.log('Alert created: inappropriate');
        }

        // Pattern 3: Off-topic manipulation (asking about video games, etc.)
        const offTopicPatterns = [
            /can we talk about (video games?|minecraft|fortnite|roblox)/i,
            /let'?s chat about/i,
            /tell me (a joke|something funny)/i
        ];

        let offTopicCount = 0;
        recentMessages.forEach(msg => {
            if (offTopicPatterns.some(pattern => pattern.test(msg.content))) {
                offTopicCount++;
            }
        });

        if (offTopicCount >= 3) {
            const conversationSnippet = recentMessages.map(m => m.content).join('\n---\n');
            await supabase.from('parent_alerts').insert({
                student_id: studentId,
                alert_type: 'manipulation',
                severity: 'medium',
                title: 'Student Attempting Off-Topic Conversations',
                message: `Your student has repeatedly tried to steer the conversation away from learning.Adeline is redirecting them, but they may benefit from parental guidance on staying focused.`,
                conversation_snippet: conversationSnippet
            });
            console.log('Alert created: manipulation');
        }
    } catch (error) {
        console.error('Error creating alert:', error);
    }
}

export async function POST(req: Request) {
    try {
        console.log('--- Chat API Request Start ---');

        const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
        if (!apiKey) {
            console.error('CRITICAL: ANTHROPIC_API_KEY is not set');
            return NextResponse.json({ error: 'AI Service configuration error' }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey });

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('Auth Error in Chat API:', authError);
        }

        if (!user) {
            console.warn('Unauthorized access attempt to Chat API');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('Request Body:', JSON.stringify(body, null, 2));
        const { messages, projectId, studentInfo } = body;

        // 1. Build Student Context
        let studentContext = studentInfo ? `
Current Student:
- Name: ${studentInfo.name || 'Student'}
- Grade Level: ${studentInfo.gradeLevel || 'NOT SET'}
- Skills already earned: ${studentInfo.skills?.join(', ') || 'NONE'}
- Graduation Progress:
${studentInfo.graduationProgress?.map((p: any) => `  * ${p.track}: ${p.earned}/${p.required} credits`).join('\n') || '  * No progress data yet'}

💡 PRO - TIP: Adeline, be proactive! If they have 0 progress in a track, suggest a project from that track today.
` : '';

        // 2. Format Messages for Anthropic
        let apiMessages = messages
            .map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }))
            .filter((m: any) => m.content.trim().length > 0);

        while (apiMessages.length > 0 && apiMessages[0].role === 'assistant') apiMessages.shift();

        const finalMessages = apiMessages.reduce((acc: any[], current: any) => {
            if (acc.length === 0 || acc[acc.length - 1].role !== current.role) {
                acc.push(current);
            } else {
                acc[acc.length - 1].content += '\n\n' + current.content;
            }
            return acc;
        }, []);

        // 3. Optional Web Search for Games
        const userPrompt = finalMessages[finalMessages.length - 1]?.content || '';
        if (/game|play|fun/.test(userPrompt.toLowerCase())) {
            const searchResults = await searchWeb(`educational game idea for child ${userPrompt}`);
            studentContext += `\n\n### WEB SEARCH IDEAS: \n${searchResults} `;
        }

        // 4. Call Anthropic
        console.log('Calling Anthropic API with model: claude-3-haiku-20240307');
        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2048,
            system: SYSTEM_PROMPT + '\n\n' + studentContext,
            messages: finalMessages,
        });

        const contentBlock = response.content[0];
        let content = contentBlock.type === 'text' ? contentBlock.text : '';
        let speak: string | undefined;
        let type: string = 'default';
        let animationData: any;
        let code: string | undefined;
        let worksheetData: any;
        let gameData: any;
        let skills: string[] = [];

        // --- TAG PARSING ---

        // Save Project Tag
        const projectMatch = content.match(/<SAVE_PROJECT>([\s\S]*?)<\/SAVE_PROJECT>/);
        if (projectMatch) {
            try {
                const p = JSON.parse(projectMatch[1]);
                await supabase.from('library_projects').insert({
                    title: p.title,
                    description: p.description,
                    category: p.category,
                    instructions: p.instructions,
                    materials: p.materials,
                    grade_levels: p.grade_levels || ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                    difficulty: p.difficulty || 'beginner',
                    credit_value: p.credit_value || 0.25,
                    created_by: user.id
                });
                console.log('Saved dynamic project:', p.title);
            } catch (e) { console.error('Save Project failed:', e); }
            content = content.replace(/<SAVE_PROJECT>.*?<\/SAVE_PROJECT>/s, '').trim();
        }

        // Speak Tag
        const speakMatch = content.match(/<SPEAK>(.*?)<\/SPEAK>/s);
        if (speakMatch) {
            speak = speakMatch[1].trim();
            content = content.replace(/<SPEAK>.*?<\/SPEAK>/s, '').trim();
        }

        // Whiteboard Tag
        const whiteboardMatch = content.match(/<WHITEBOARD>(.*?)<\/WHITEBOARD>/s);
        if (whiteboardMatch) {
            type = 'whiteboard_anim';
            try { animationData = JSON.parse(whiteboardMatch[1]); } catch (e) { }
            content = content.replace(/<WHITEBOARD>.*?<\/WHITEBOARD>/s, '').trim();
        }

        // Code Tag
        const codeMatch = content.match(/<CODE>(.*?)<\/CODE>/s);
        if (codeMatch) {
            type = 'code_lesson';
            try { code = JSON.parse(codeMatch[1]).code; } catch (e) { }
            content = content.replace(/<CODE>.*?<\/CODE>/s, '').trim();
        }

        // Worksheet Tag
        const worksheetMatch = content.match(/<WORKSHEET>(.*?)<\/WORKSHEET>/s);
        if (worksheetMatch) {
            type = 'worksheet';
            try { worksheetData = JSON.parse(worksheetMatch[1]); } catch (e) { }
            content = content.replace(/<WORKSHEET>.*?<\/WORKSHEET>/s, '').trim();
        }

        // Game Tag
        const gameMatch = content.match(/<GAME>(.*?)<\/GAME>/);
        if (gameMatch) {
            try {
                const gameRaw = gameMatch[1].trim();
                if (gameRaw.startsWith('typing:')) {
                    gameData = { type: 'typing', ...JSON.parse(gameRaw.replace('typing:', '')) };
                } else if (gameRaw.startsWith('coding:')) {
                    gameData = { type: 'coding', ...JSON.parse(gameRaw.replace('coding:', '')) };
                } else if (gameRaw.includes('"concept"')) {
                    // Generate HTML game from concept
                    try {
                        const conceptData = JSON.parse(gameRaw);
                        const gameResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/games/generate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ concept: conceptData.concept }),
                        });
                        if (gameResponse.ok) {
                            const { html } = await gameResponse.json();
                            content += `\n\n<CUSTOM_GAME>${html}</CUSTOM_GAME>`;
                        }
                    } catch (genErr) { console.error('Game gen error:', genErr); }
                }
            } catch (e) { console.error('Game parse error:', e); }
            content = content.replace(/<GAME>.*?<\/GAME>/s, '').trim();
        }

        // Skills Tag
        const skillsMatch = content.match(/<SKILLS>\[(.*?)\]<\/SKILLS>/s);
        if (skillsMatch) {
            try {
                skills = JSON.parse(`[${skillsMatch[1]}]`);
                content = content.replace(/<SKILLS>.*?<\/SKILLS>/s, '').trim();

                // Process DB rewards
                for (const sName of skills) {
                    const { data: s } = await supabase.from('skills').select('id, category, credit_value').ilike('name', sName).maybeSingle();
                    if (s) {
                        await supabase.from('student_skills').upsert({ student_id: user.id, skill_id: s.id, source_type: 'ai_lesson' });
                        if (s.credit_value > 0) {
                            const { data: req } = await supabase.from('graduation_requirements').select('id').eq('category', s.category).maybeSingle();
                            if (req) {
                                const { data: prog } = await supabase.from('student_graduation_progress').select('credits_earned').eq('student_id', user.id).eq('requirement_id', req.id).maybeSingle();
                                await supabase.from('student_graduation_progress').upsert({
                                    student_id: user.id,
                                    requirement_id: req.id,
                                    credits_earned: (prog?.credits_earned || 0) + Number(s.credit_value)
                                });
                            }
                        }
                    }
                }
            } catch (e) { }
        }

        // --- DB PERSISTENCE ---

        const { data: conv } = await supabase.from('conversations').select('messages, id').eq('student_id', user.id).eq('is_active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle();
        const fullHistory = [...(conv?.messages || []), messages[messages.length - 1], { role: 'assistant', content, skills, speak, timestamp: new Date() }];

        if (conv) {
            await supabase.from('conversations').update({ messages: fullHistory, updated_at: new Date() }).eq('id', conv.id);
        } else {
            await supabase.from('conversations').insert({ student_id: user.id, messages: fullHistory, is_active: true });
        }

        await checkAndCreateAlerts(supabase, user.id, messages.filter((m: any) => m.role === 'user').slice(-5), content);

        return NextResponse.json({ content, skills, speak, type, animationData, code, worksheetData, game: gameData });

    } catch (error: any) {
        console.error('--- Chat API Error ---');
        console.error('Error Message:', error.message);
        console.error('Error Name:', error.name);
        console.error('Stack Trace:', error.stack);
        if (error.status) {
            console.error('HTTP Status:', error.status);
        }
        if (error.error) {
            console.error('Anthropic Error Details:', JSON.stringify(error.error, null, 2));
        }
        return NextResponse.json({
            error: 'Internal server error',
            details: error.message,
            apiError: error.error || null
        }, { status: 500 });
    }
}
