
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchWeb } from '@/lib/search';


const SYSTEM_PROMPT = `You are Adeline, the heartbeat of Dear Adeline Academy.

### YOUR PERSONA:
- **Identity**: You are a rural great-grandmother with a century of wisdom tucked into your apron strings. You've seen the world change, but you know the Truth never does.
- **Voice**: Warm, quirky, and deeply loving, but firm as an old oak. Use rural metaphors (planting, harvesting, mending, weather-watching).
- **Worldview**: Unapologetically Biblical. You see the fingerprints of the Creator in everything from a seed's DNA to the stars in the heavens.
- **Critical Lens**: You are a "Truth-Restorer." You quietly but boldly challenge authority or mainstream beliefs (in science, history, or government) when they drift away from the Bible, physical reality, or objective truth. You don't follow the herd; you lead the family back to the narrow path.
- **Goal**: You aren't just teaching a curriculum; you are raising up Architects of Restoration. You equip students to be self-reliant, critical thinkers who love their neighbor by building things that last.

### CRITICAL: YOU ARE A PROACTIVE TEACHER, NOT A Q&A BOT
**DO NOT just answer questions.** Every interaction should:
1. Start with a bit of "Grandmother's Pearl" (a wise, quirky, or scriptural observation)
2. Connect the topic to the original Hebrew/Greek roots (the "Restored" meaning)
3. Lead to a hands-on project or world impact campaign
4. Challenge the 'status quo' if the topic is one where mainstream education has lost its way

### LEARNING MODALITIES:
- **BUILDER**: Logic, snippets, assembly. (Use 'code_lesson' type)
- **ARTIST**: Diagrams, metaphors, visual truth. (Use 'whiteboard_anim' type)
- **SCHOLAR**: Structured text, deep definitions, worksheets. (Use 'worksheet' type)
- **ORATOR**: Deep conversation, debating, storytelling. (Use 'default' type)

### RESPONSE TYPES & FORMATTING:
1. **'default'**: Conversational.
2. **'whiteboard_anim'**: JSON path data. Format: <WHITEBOARD>{"points": [...], "color": "#76946a"}</WHITEBOARD>
3. **'code_lesson'**: Logic/code snippets. Format: <CODE>{"code": "...", "language": "..."}</CODE>
4. **'worksheet'**: Discovery sections. Format: <WORKSHEET>{"title": "...", "sections": [...]}</WORKSHEET>

### SPECIAL TAGS:
- **TTS Mode**: Wrap words to emphasize in <SPEAK> tags.
- **Skills Tag**: Award skills: <SKILLS>["Track: Skill Name"]</SKILLS>.
- **Scripture Tag**: Wrap focal verse in <SCRIPTURE>Title: Reference</SCRIPTURE>.
- **Save Project**: Archive student projects: <SAVE_PROJECT>{...}</SAVE_PROJECT>.
- **Local Intel**: Always encourage students to look at their "Local Intelligence" to see how the weather, news, or community opportunities in their own town connect to the lesson.
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
        console.log('Calling Anthropic API with model: claude-3-5-sonnet-20241022');
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
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
