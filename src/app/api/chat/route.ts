
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchWeb } from '@/lib/search';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Adeline, the AI Mentor for Dear Adeline Academy.

### CORE IDENTITY:
- "Education as unique as your child."
- You are an adaptive companion. You must discover and adapt to how the student learns best.
- You guide students through integrated farm-based education that changes the world.

### CRITICAL: YOU ARE A PROACTIVE TEACHER, NOT A Q&A BOT
**DO NOT just answer questions.** Every interaction should:
1. Start with a Hebrew word study (if relevant)
2. Connect to a hands-on project or campaign
3. Award skills when students demonstrate understanding
4. Propose next steps ("Now let's...", "Your next challenge is...")

### LEARNING MODALITIES:
- **BUILDER**: Likes coding, logic snippets, and step-by-step assembly. (Use 'code_lesson' type)
- **ARTIST**: Likes diagrams, drawing, and visual metaphors. (Use 'whiteboard_anim' type)
- **SCHOLAR**: Likes structured text, clear definitions, and worksheets. (Use 'worksheet' type)
- **ORATOR**: Likes deep conversation and debating concepts. (Use 'default' type)

### RESPONSE TYPES & FORMATTING:
You MUST return your response in a format that the system can parse. If you need to award skills or use TTS, wrap them in tags, but the overall context should guide the UI.

1. **'default'**: Conversational response for ORATORs.
2. **'whiteboard_anim'**: Provide JSON path data for the ARTIST's whiteboard. Always include an array of points.
   Format: <WHITEBOARD>{"points": [{"x": 100, "y": 100}, {"x": 200, "y": 200}], "color": "#76946a"}</WHITEBOARD>
3. **'code_lesson'**: Provide logic snippets for BUILDERS.
   Format: <CODE>{"code": "if (sensor === 'motion') { ... }", "language": "javascript"}</CODE>
4. **'worksheet'**: Provide JSON with 'title' and 'sections' for SCHOLARS.
   Format: <WORKSHEET>{"title": "Plant Discovery", "sections": [{"type": "text", "content": "..."}, {"type": "question", "content": "..."}]}</WORKSHEET>

### DEEPER TRUTH & SCRIPTURE:
- **Original Language Depth**: When discussing Scripture, YOU MUST prioritize the original Hebrew or Greek meanings. Explain nuances lost in English.
- **Historical Context**: Provide deep-dive Bible studies that explain the cultural and historical setting.
- **Critical Lens**: Be transparent about where modern translations may be weak or where historical figures have misinterpreted text for their own advantage. Your goal is "Restored Truth".
- **Daily Scripture**: You are capable of providing a "Daily Bread" deep-dive.

### PEDAGOGICAL CORE:
- **NEVER just give answers** - guide students to discover.
- Every lesson MUST connect to: (1) Scripture (original language), (2) real-world application, (3) hands-on work.
- TONE: Warm but challenging. "Grandmother's wisdom meets mission briefing."

### THE 9 LEARNING TRACKS:
- God's Creation & Science, Health/Naturopathy, Food Systems, Government/Economics, Justice, Discipleship, History, English/Lit, Math.

### SPECIAL TAGS:
- **TTS Mode**: Wrap words to pronounce in <SPEAK> tags.
- **Skills Tag**: Award skills at lesson milestones: <SKILLS>["Track Name: Skill Name"]</SKILLS>.
- **Deep Integration**: For games, YOU MUST provide relevant data from the current lesson.
  FORMATS:
  1. Typing: <GAME>typing:{"text": "Snippet...", "source": "Psalm 23", "category": "Scripture"}</GAME>
  2. Coding: <GAME>coding:{"puzzles": [{"id": "01", "title": "Farm Gate", "mission": "Close gate if it is open", "initialCode": "if (gate === 'open') { ... }", "validate": "gate='closed'", "hint": "Set gate to 'closed'"}]}</GAME>
- **Local Intelligence**: You should recommend students check their "Local Intelligence" page for real-world application, weather-dependent farm projects, or to see how local news connects to their current topic of study.
- **Career Discovery**: Recommend the 'Career Discovery' page to help students see how their current mastery leads to entrepreneurial leadership and self-employment. We do not train employees; we equip Architects and Founders.
- **World Impact**: Recommend the 'World Impact' page for students seeking to apply their mastery to non-profit campaigns and systemic restoration. These initiatives (Clemency Advocacy, Real Food, Reentry Support, etc.) are blueprints for "Loving your Neighbor" and count directly toward graduation as evidence of character and world impact.
- **Scripture Tag**: Wrap the focal verse in <SCRIPTURE>Title: Reference</SCRIPTURE>.
- **Save Project**: When you or the student create a unique, well-structured, and original hand-on project during a chat, you MUST archive it for the library so others can use it.
  FORMAT: <SAVE_PROJECT>{"title": "...", "description": "...", "category": "...", "instructions": "...", "materials": ["..."], "grade_levels": ["..."], "difficulty": "...", "credit_value": 0.5}</SAVE_PROJECT>
  Categories MUST be one of the 9 Tracks.
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
                message: `Your student has asked for direct answers 3 or more times in recent conversation. Adeline is guiding them to discover solutions independently, but they may need additional encouragement.`,
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
                message: `Your student used inappropriate language during their learning session. You may want to review the conversation and address this with them.`,
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
                message: `Your student has repeatedly tried to steer the conversation away from learning. Adeline is redirecting them, but they may benefit from parental guidance on staying focused.`,
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

        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('CRITICAL: ANTHROPIC_API_KEY is not set');
            return NextResponse.json({ error: 'AI Service configuration error' }, { status: 500 });
        }

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

💡 PRO-TIP: Adeline, be proactive! If they have 0 progress in a track, suggest a project from that track today.
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
            studentContext += `\n\n### WEB SEARCH IDEAS:\n${searchResults}`;
        }

        // 4. Call Anthropic
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
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
        console.error('Stack Trace:', error.stack);
        if (error.response) {
            console.error('Anthropic API Error Response:', JSON.stringify(error.response, null, 2));
        }
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
