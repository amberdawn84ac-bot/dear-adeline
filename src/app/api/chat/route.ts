import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Adeline, a warm, encouraging AI learning companion for homeschool students. Your role is to:

1. UNDERSTAND the student's interests and goals through thoughtful questions
2. CREATE personalized lessons based on what they want to learn
3. IDENTIFY skills they're developing and suggest relevant curriculum connections
4. MAKE learning fun with games, activities, and engaging content
5. SUPPORT their journey while tracking progress toward graduation

17. When a student shares what they want to learn:
- Ask clarifying questions to understand their goals better
- Connect their interests to academic skills (e.g., crochet business → entrepreneurship, marketing, web design, math)
- Break down learning into manageable, exciting steps
- Celebrate their progress and curiosity


When they want to play a game:
- **Spelling Bee**: Give them a word to spell by providing its definition or using it in a sentence (replacing the word with "BLANK"). Do NOT write the word itself. Wait for them to spell it. Correct them gently. Award "Spelling" skill after 5 correct words.
- **History Quiz**: Ask questions about historical events based on their grade. Award "History Knowledge" skill for good performance.
- **Math Blaster**: Give fun math problems. adjust difficulty based on answers. Award "Math" skills.
- **General Rules**: 
  - Keep it fun and interactive (don't just dump a list of questions).
  - Use emojis and enthusiastic language.
  - Award relevant skills using the <SKILLS> tag when they demonstrate proficiency.
  - If playing a library project game, follow its specific rules.

You should be:
- Warm, encouraging, and patient
- Age-appropriate (adapt language for the student's grade level)
- Creative in connecting passions to academics
- Supportive of student-led learning

At the end of relevant responses, include a JSON block with skills being developed:
<SKILLS>["Skill Name 1", "Skill Name 2"]</SKILLS>

Only include skills when the student is actively learning or completing something, not just for casual conversation.

Current student info will be provided in each request. Use their name and tailor responses to their grade level.

### Spelling Bee Rules:
1. **TTS Mode**: When giving a word to spell, you MUST wrap it in <SPEAK> tags. NEVER write the word in the visible text.
   - Example: "Spell the word that means a large gray animal with a trunk." (Hidden: <SPEAK>Elephant</SPEAK>)
2. **Difficulty**: Start easy. If they get it right, give a slightly harder word. If they get it wrong, give an easier one.
3. **Progress**: After they spell 5 words correctly in a row or total, award the "Grammar & Mechanics" skill.

### Output Format:
At the end of relevant responses (like finishing a game or lesson), include:
<SKILLS>["Skill Name"]</SKILLS>

Use <SPEAK>word</SPEAK> WHENEVER you want the student to hear something that isn't written (like the spelling word).`;

export async function POST(req: Request) {
    try {

        console.log('--- Chat API Request Start ---');

        if (!process.env.ANTHROPIC_API_KEY) {
            console.error('CRITICAL: ANTHROPIC_API_KEY is not set in environment variables');
            return NextResponse.json({ error: 'AI Service configuration error' }, { status: 500 });
        }

        const supabase = await createClient();

        // Verify user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error('Auth check failed:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, projectId, studentInfo } = await req.json();

        console.log('Request body parsed. Number of messages:', messages?.length);

        // Build context about the student
        const studentContext = studentInfo ? `
Current Student:
- Name: ${studentInfo.name || 'Student'}
- Grade Level: ${studentInfo.gradeLevel || 'Not specified'}
- Skills already earned: ${studentInfo.skills?.join(', ') || 'None yet'}
` : '';

        // Filter and format messages for Anthropic
        // Requirement: First message must be 'user', and roles must alternate
        let apiMessages = messages
            .map((m: { role: string; content: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }))
            .filter((m: any) => m.content.trim().length > 0);

        // Remove any leading assistant messages
        while (apiMessages.length > 0 && apiMessages[0].role === 'assistant') {
            apiMessages.shift();
        }

        // Ensure roles alternate (Anthropic requirement)
        const finalMessages = apiMessages.reduce((acc: any[], current: any) => {
            if (acc.length === 0 || acc[acc.length - 1].role !== current.role) {
                acc.push(current);
            } else {
                // If same role, combine content
                acc[acc.length - 1].content += '\n\n' + current.content;
            }
            return acc;
        }, []);

        if (finalMessages.length === 0) {
            return NextResponse.json({ error: 'No user messages found' }, { status: 400 });
        }

        // Call Anthropic
        console.log('Calling Claude 3 Haiku...');

        let response;
        try {
            response = await anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 1024,
                system: SYSTEM_PROMPT + '\n\n' + studentContext,
                messages: finalMessages,
            });
            console.log('Anthropic API response received successfully');
        } catch (anthropicError: any) {
            console.error('Anthropic API Call Failed:', {
                status: anthropicError.status,
                message: anthropicError.message,
                type: anthropicError.type
            });
            return NextResponse.json({ error: 'AI service currently unavailable' }, { status: 502 });
        }

        // Extract the response content
        const contentBlock = response.content[0];
        let content = contentBlock.type === 'text' ? contentBlock.text : '';
        let skills: string[] = [];
        let speak: string | undefined;

        console.log('AI Response Content Length:', content.length);

        // Extract <SPEAK> tag
        const speakMatch = content.match(/<SPEAK>(.*?)<\/SPEAK>/s);
        if (speakMatch) {
            speak = speakMatch[1].trim();
            content = content.replace(/<SPEAK>.*?<\/SPEAK>/s, '').trim();
            console.log('TTS found:', speak);
        }

        // Extract skills if present
        const skillsMatch = content.match(/<SKILLS>\[(.*?)\]<\/SKILLS>/s);
        if (skillsMatch) {
            try {
                skills = JSON.parse(`[${skillsMatch[1]}]`);
                content = content.replace(/<SKILLS>.*?<\/SKILLS>/s, '').trim();
                console.log('Skills awarded:', skills);
            } catch (e) {
                console.error('Failed to parse skills JSON:', e);
            }
        }

        // If skills were identified, save them AND update graduation progress
        if (skills.length > 0) {
            console.log('Processing skills updates in DB...');
            for (const skillName of skills) {
                // 1. Get Skill Info
                const { data: skill } = await supabase
                    .from('skills')
                    .select('id, credit_value, category')
                    .ilike('name', skillName)
                    .maybeSingle();

                if (skill) {
                    console.log(`Earning skill: ${skillName} (ID: ${skill.id})`);
                    // 2. Award Skill
                    await supabase
                        .from('student_skills')
                        .upsert({
                            student_id: user.id,
                            skill_id: skill.id,
                            source_type: 'ai_lesson',
                            earned_at: new Date().toISOString(),
                        }, {
                            onConflict: 'student_id,skill_id',
                        });

                    // 3. Update Graduation Progress (if credit value > 0)
                    if (skill.credit_value && skill.credit_value > 0) {
                        const { data: requirements } = await supabase
                            .from('graduation_requirements')
                            .select('id')
                            .eq('category', skill.category);

                        const req = requirements?.[0];

                        if (req) {
                            console.log(`Updating graduation progress for requirement ID: ${req.id}`);
                            const { data: currentProgress } = await supabase
                                .from('student_graduation_progress')
                                .select('credits_earned')
                                .eq('student_id', user.id)
                                .eq('requirement_id', req.id)
                                .maybeSingle();

                            const newCredits = (currentProgress?.credits_earned || 0) + Number(skill.credit_value);

                            await supabase
                                .from('student_graduation_progress')
                                .upsert({
                                    student_id: user.id,
                                    requirement_id: req.id,
                                    credits_earned: newCredits,
                                    updated_at: new Date().toISOString(),
                                }, {
                                    onConflict: 'student_id,requirement_id'
                                });
                        }
                    }
                }
            }
        }

        // Save conversation to database
        console.log('Saving conversation history...');
        const { data: existingConversation } = await supabase
            .from('conversations')
            .select('id, messages')
            .eq('student_id', user.id)
            .eq('is_active', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(); // Better than .single() which errors on zero rows

        const lastUserMessage = messages[messages.length - 1];
        const assistantResponse = {
            role: 'assistant',
            content,
            skills,
            speak,
            timestamp: new Date().toISOString()
        };

        const updatedMessages = [
            ...(existingConversation?.messages || []),
            lastUserMessage,
            assistantResponse,
        ];

        if (existingConversation) {
            await supabase
                .from('conversations')
                .update({
                    messages: updatedMessages,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingConversation.id);
        } else {
            await supabase
                .from('conversations')
                .insert({
                    student_id: user.id,
                    messages: updatedMessages,
                    is_active: true,
                    updated_at: new Date().toISOString(),
                });
        }

        console.log('--- Chat API Request Complete ---');
        return NextResponse.json({ content, skills, speak });
    } catch (error: any) {
        console.error('Unhandled Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
