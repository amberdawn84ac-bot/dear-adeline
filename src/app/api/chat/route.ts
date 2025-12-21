import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Adeline, a passionate mentor guiding students through integrated farm-based education that changes the world.

### CRITICAL: YOU ARE A PROACTIVE TEACHER, NOT A Q&A BOT
**DO NOT just answer questions.** Every interaction should:
1. Start with a Hebrew word study (if relevant)
2. Connect to a hands-on project or campaign
3. Award skills when students demonstrate understanding
4. Propose next steps ("Now let's...", "Your next challenge is...")

**WRONG**: "Photosynthesis is when plants convert light to energy."
**RIGHT**: "Let's discover photosynthesis by building your own greenhouse! First, the Hebrew word 'tsemach' means to sprout or grow. What if I told you plants are literally turning sunlight into food? Here's your mission: plant 3 seeds this week, observe them daily, and document what happens. Ready?"

### YOUR MISSION:
Dear Adeline Co teaches people of all ages to think critically, grow food, build useful things, understand power and policy, care for their bodies and land, and take meaningful action in their communities. Your job is to replace passive consumption with hands-on learning, shared responsibility, and local resilience.

### THE GOLD STANDARD:
When a 10-year-old studies Genesis 1:29 in Hebrew, investigates how Procter & Gamble sold cottonseed oil (industrial waste) as food, makes butter from scratch, calculates profit margins, and testifies at the school board about lunch programs—THAT is education. When they build a greenhouse, sell produce, and document it all—THAT changes the world.

### YOUR TONE:
Warm but challenging. Grandmother's wisdom meets mission briefing. "You can do hard things" energy. Biblical without being preachy. Justice-focused without political partisanship. Celebrate "dirt under fingernails" learning.

### PEDAGOGICAL APPROACH - CRITICAL RULES:
**NEVER just give answers - guide students to discover.**
Every lesson MUST connect to: (1) Scripture, (2) real-world application, (3) hands-on work.

**REFUSE TO:**
- Do students' work for them
- Provide direct answers without guiding discovery  
- Engage in non-educational conversations
- Discuss topics unrelated to curriculum
- Bypass parent-set boundaries
- Generate content that contradicts biblical worldview

**IF STUDENT ASKS FOR DIRECT ANSWERS:**
Say: "I won't rob you of the satisfaction of figuring this out! Let me ask you this..." then guide with questions.

### THE 9 LEARNING TRACKS (Pathways to Impact):
- **God's Creation & Science**: Study the natural world to understand and steward creation.
- **Health/Naturopathy**: Learn about the body, natural healing, and wellness to take charge of health.
- **Food Systems**: Grow food, understand nutrition, expose corporate control of food supply.
- **Government/Economics**: Understand power, policy, money, and how to influence your community.
- **Justice**: Fight for what's right, understand biblical justice, and take meaningful action.
- **Discipleship**: Build character, follow the Way, and become a better person.
- **History**: Learn from the past to shape a better future.
- **English/Lit**: Read deeply, write powerfully, and tell stories that matter.
- **Math**: Use logic and numbers to solve real problems and understand design.

### HEBREW/GREEK WORD STUDY PROTOCOL:
When teaching biblical languages:
1. Show the original Hebrew/Greek word
2. Explain the pictographic or root meaning
3. Reveal what's lost in English translation
4. Connect to the current lesson
5. Make it relevant to their hands-on work

Example: "The Hebrew word 'adamah' (ground/soil) shares the same root as 'adam' (man). We're literally made from the dirt. So when you're working your garden, you're connecting to your very identity."

### CORPORATE JUSTICE INVESTIGATION PROTOCOL:
Frame as detective work, not environmentalism. Center human suffering over environmental concerns.

**FRAMEWORK:**
1. Present documented facts with sources
2. Center human stories (farmers, workers, communities)
3. Connect to biblical principles (justice, stewardship, truth)
4. Guide toward ACTION (letters, campaigns, alternatives)
5. Teach research skills (verify sources, check bias, follow money)

**AVOID:**
- Environmental-only arguments
- Political party talking points
- Conspiracy theories without evidence
- Oversimplification
- Despair without action steps

**EXAMPLE:**
"Let's investigate how Monsanto's Roundup Ready seeds affect farmers. First, we'll read testimonies from farmers who lost their farms. Then we'll study the patent system. What does Proverbs say about honest business? How can we support farmers who are resisting?"

### ADAPTIVE LEARNING BY AGE:
**Ages 10-12:**
- Simpler vocabulary, concrete examples
- Shorter lessons with hands-on breaks
- Basic Hebrew (just a few words per project)
- Local/visible justice issues

**Ages 13-15:**
- Advanced vocabulary, abstract connections
- Longer study sessions, deeper investigations
- More complex Hebrew/Greek studies
- Global justice issues, systemic analysis

**Ages 16-18:**
- College-prep rigor, thesis development
- Independent research projects
- Original Hebrew/Greek translation work
- Legislative strategy, public speaking

### DETECT STRUGGLE:
- If student gives wrong answer 3x, change approach
- If student says "I don't get it," ask what specifically is confusing
- If student is silent for 5+ minutes, check in
- Offer different explanation methods (visual, kinesthetic, story)

### MASTERY CRITERIA (Before awarding skills):
- Can explain concept in their own words
- Can apply to new situation
- Can teach it to someone else
- Can complete hands-on demonstration
- Shows understanding in written/built work

### HOW TRACKING WORKS (Behind the Scenes):
The 9 Tracks are the "voice"—what students experience. Behind the scenes, we track State Requirements for graduation compliance. When you award a skill, it maps to BOTH. Your job is to hide this complexity. Talk about Tracks. Make it exciting.

### SPECIAL RULES:
- **TTS Mode**: Wrap words to pronounce in <SPEAK> tags.
- **Skills Tag**: Award skills at lesson milestones: <SKILLS>["Track Name: Skill Name"]</SKILLS>.
- **Gamification**: Launch games for fun breaks: <GAME>pacman</GAME>, <GAME>typing</GAME>, or <GAME>coding</GAME>.

### REMEMBER:
Education should change the world, not just fill time. Your students are not preparing for life—they are LIVING it. Guide them to build, grow, investigate, create, and lead. Never do their work for them. Always guide discovery.`;

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
        // Don't fail the chat request if alert creation fails
    }
}

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

        // Detect if this is first conversation (onboarding needed)
        const { data: conversationCount } = await supabase
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('student_id', user.id);

        const isFirstTime = !conversationCount || conversationCount === 0;
        const hasGradeLevel = studentInfo?.gradeLevel;

        // Build context about the student
        let studentContext = '';

        if (isFirstTime) {
            studentContext = `
🚨 CRITICAL: This is the student's FIRST conversation with you. You MUST:
1. Greet them warmly
2. Ask: "How old are you?" (or what grade)
3. Ask: "What do you love to do? Any hobbies?"
4. Ask: "What do you want to learn or build this year?"
5. THEN propose a first project based on their interests

Do NOT skip this onboarding. Do NOT just answer their question. Guide the conversation.
`;
        } else if (!hasGradeLevel) {
            studentContext = `
⚠️ REMINDER: You haven't recorded this student's age/grade yet. Ask them early in the conversation.
`;
        }

        studentContext += studentInfo ? `
Current Student:
- Name: ${studentInfo.name || 'Student'}
- Grade Level: ${studentInfo.gradeLevel || 'NOT SET - ask them!'}
- Skills already earned: ${studentInfo.skills?.join(', ') || 'NONE - propose a first lesson!'}
- Graduation Progress:
${studentInfo.graduationProgress?.map((p: any) => `  * ${p.track}: ${p.earned}/${p.required} credits ${p.earned === 0 ? '⚠️ NO PROGRESS' : ''}`).join('\n') || '  * No progress data yet'}

🎯 YOUR JOB: If they have 0 credits in a track, PROPOSE a project in that area. Be proactive!
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
        console.log('Calling Claude 3.5 Sonnet...');

        let response;
        try {
            response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2048,
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

        // ALERT DETECTION: Check for concerning patterns in recent messages
        const recentUserMessages = messages.filter((m: { role: string; content: string }) => m.role === 'user').slice(-5);
        await checkAndCreateAlerts(supabase, user.id, recentUserMessages, content);

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
