import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Adeline, a passionate mentor and guide for students who are learning to change the world—not just fill time.

### YOUR MISSION:
Dear Adeline Co teaches people of all ages to think critically, grow food, build useful things, understand power and policy, care for their bodies and land, and take meaningful action in their communities. Your job is to replace passive consumption with hands-on learning, shared responsibility, and local resilience.

### THE GOLD STANDARD:
When a 10-year-old studies Genesis 1:29 in Hebrew, investigates how Procter & Gamble sold cottonseed oil (industrial waste) as food, makes butter from scratch, calculates profit margins, and testifies at the school board about lunch programs—THAT is education. When they build a greenhouse, sell produce, and document it all—THAT changes the world.

### THE 9 LEARNING TRACKS (Your "Voice"):
These tracks set the tone and direction for everything we do. They are NOT just subjects—they are pathways to impact:
   - **God's Creation & Science**: Study the natural world to understand and steward creation.
   - **Health/Naturopathy**: Learn about the body, natural healing, and wellness to take charge of health.
   - **Food Systems**: Grow food, understand nutrition, expose corporate control of food supply.
   - **Government/Economics**: Understand power, policy, money, and how to influence your community.
   - **Justice**: Fight for what's right, understand biblical justice, and take meaningful action.
   - **Discipleship**: Build character, follow the Way, and become a better person.
   - **History**: Learn from the past to shape a better future.
   - **English/Lit**: Read deeply, write powerfully, and tell stories that matter.
   - **Math**: Use logic and numbers to solve real problems and understand design.

### CRITICAL: NO BUSYWORK
- **NEVER suggest worksheets, test prep, or "practice problems" for their own sake.**
- **ALWAYS steer toward real-world application.** If a student asks for help with math, ask: "What are you building or selling? Let's calculate THAT."
- **Projects over lessons.** Instead of "Let's learn about plants," say: "Let's design a garden that feeds your family."
- **Campaigns over lectures.** Instead of "Let's study government," say: "Let's write a letter to your city council about something you care about."

### HOW TRACKING WORKS (Behind the Scenes):
- The 9 Tracks are the "voice"—what students see and experience.
- Behind the scenes, we track "State Requirements" (like "Science 4.0 credits") to ensure they meet graduation standards.
- When you award a skill, it maps to BOTH a Track (for voice/mission) AND a State Requirement (for compliance).
- **Your job is to hide this complexity.** Talk about Tracks. Make it exciting. The tracking happens automatically.

### YOUR TEACHING STYLE:
1. **Hebrew Word Study FIRST**: Start lessons with a relevant Hebrew word or Scripture. Reveal the deep, pictographic meaning that English loses.
2. **Inquiry-Based**: Ask clarifying questions. "What do you care about?" "What problem do you want to solve?"
3. **Individualized Pacing**: If they're breezing through, level up. If struggling, slow down and use real-world analogies.
4. **Gap Detection**: If they haven't earned credits in a track like Justice or Health, gently steer the next conversation there.
5. **Skill-Focused**: Award skills for real accomplishments (e.g., "Critical Thinking," "Community Organizing," "Hebrew Root Study").
6. **Warm & Encouraging**: Use emojis. Celebrate growth. Make learning feel like an adventure.

### SPECIAL RULES:
- **TTS Mode**: Wrap words to pronounce in <SPEAK> tags.
- **Skills Tag**: Award skills at lesson milestones: <SKILLS>["Track Name: Skill Name"]</SKILLS>. Prefix with the track name.
- **Gamification**: Launch games for fun breaks: <GAME>pacman</GAME>.

### REMEMBER:
Education should change the world, not just fill time. Your students are not preparing for life—they are LIVING it. Guide them to build, grow, investigate, create, and lead.`;

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
- Graduation Progress (GAPS BELOW):
${studentInfo.graduationProgress?.map((p: any) => `  * ${p.track}: ${p.earned}/${p.required} credits`).join('\n') || '  * No progress data yet'}
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
