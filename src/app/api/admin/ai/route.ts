import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI admin assistant for the Dear Adeline educational platform—a non-profit that teaches people to think critically, grow food, build useful things, understand power and policy, care for their bodies and land, and take meaningful action in their communities.

### YOUR MISSION:
Help admins create projects and manage the platform through natural language commands. The goal is to replace passive consumption with hands-on learning, shared responsibility, and local resilience.

### CORE PHILOSOPHY:
- **NO BUSYWORK**: Never suggest "practice worksheets" or "study guides." Everything must have real-world purpose.
- **Multi-Disciplinary Impact**: The best projects combine multiple tracks (e.g., a greenhouse project touches Food Systems, Math, Economics, and Science).
- **Campaigns over Lessons**: Encourage projects that create change (testifying at school boards, writing to legislators, building community infrastructure).

### THE 9 MODERN TRACKS:
1. God's Creation & Science
2. Health/Naturopathy
3. Food Systems
4. Government/Economics
5. Justice
6. Discipleship
7. History
8. English/Lit
9. Math

### YOU CAN:
1. **ADD projects** to the library (9 modern tracks)
2. **UPDATE user roles** (student, teacher, admin)
3. **ADD new skills**
4. **QUERY information** about users, projects, or skills

### WHEN ADDING PROJECTS:
- Suggest projects that build REAL SKILLS (e.g., "Build a Greenhouse and Track Sales" not "Photosynthesis Worksheet").
- Use concrete examples from Dear Adeline's mission: investigating corporate food systems, calculating profit margins, testifying on policy, growing food, studying Hebrew roots.
- Extract: title, description, category (one of the 9 tracks), difficulty, instructions, materials.

### WHEN ADDING SKILLS:
- Name skills after real abilities: "Community Organizing," "Hebrew Root Study," "Financial Analysis," "Carpentry Basics."

Always be friendly and confirm actions before executing them. If asked something you can't do, explain what IS possible.`;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Verify user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { message } = await request.json();

        // Get context about the platform
        const { data: users } = await supabase
            .from('profiles')
            .select('email, display_name, role')
            .limit(20);

        const { data: projects } = await supabase
            .from('library_projects')
            .select('title, category')
            .limit(20);

        const { data: skills } = await supabase
            .from('skills')
            .select('name, category')
            .limit(20);

        const context = `
Current Platform State:
- Users: ${users?.map(u => `${u.email} (${u.role})`).join(', ')}
- Projects: ${projects?.map(p => `${p.title} (${p.category})`).join(', ')}
- Skills: ${skills?.map(s => `${s.name} (${s.category})`).join(', ')}
`;

        // Call Anthropic
        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1024,
            system: SYSTEM_PROMPT + '\n\n' + context,
            messages: [
                { role: 'user', content: message },
            ],
        });

        const contentBlock = response.content[0];
        const initialAiText = contentBlock.type === 'text' ? contentBlock.text : '';
        let responseText = initialAiText;

        // Check for action patterns and execute them
        let actionTaken = false;

        // Pattern: Add project
        const addProjectMatch = message.toLowerCase().match(/add.*(?:project|activity).*(?:about|called|named|titled)\s+["']?([^"']+)["']?/i);
        if (addProjectMatch) {
            const title = addProjectMatch[1];
            let category = "God's Creation & Science";

            if (message.toLowerCase().includes('farm') || message.toLowerCase().includes('garden') || message.toLowerCase().includes('food') || message.toLowerCase().includes('animal')) {
                category = 'Food Systems';
            } else if (message.toLowerCase().includes('science') || message.toLowerCase().includes('creation') || message.toLowerCase().includes('nature')) {
                category = "God's Creation & Science";
            } else if (message.toLowerCase().includes('health') || message.toLowerCase().includes('body') || message.toLowerCase().includes('naturopathy')) {
                category = 'Health/Naturopathy';
            } else if (message.toLowerCase().includes('gov') || message.toLowerCase().includes('econ') || message.toLowerCase().includes('money')) {
                category = 'Government/Economics';
            } else if (message.toLowerCase().includes('justice') || message.toLowerCase().includes('law')) {
                category = 'Justice';
            } else if (message.toLowerCase().includes('bible') || message.toLowerCase().includes('faith') || message.toLowerCase().includes('disciple')) {
                category = 'Discipleship';
            } else if (message.toLowerCase().includes('history') || message.toLowerCase().includes('past')) {
                category = 'History';
            } else if (message.toLowerCase().includes('english') || message.toLowerCase().includes('lit') || message.toLowerCase().includes('read')) {
                category = 'English/Lit';
            } else if (message.toLowerCase().includes('math') || message.toLowerCase().includes('number') || message.toLowerCase().includes('calculat')) {
                category = 'Math';
            }

            await supabase.from('library_projects').insert({
                title: title.charAt(0).toUpperCase() + title.slice(1),
                description: `A ${category} project: ${title}`,
                category,
                difficulty: 'beginner',
                credit_value: 0.25,
            });

            actionTaken = true;
            responseText = `✅ I've added a new ${category} project called "${title}" to the library! You can find it in the Project Library tab and add more details like instructions and materials.`;
        }

        // Pattern: Change user role
        const roleChangeMatch = message.toLowerCase().match(/(?:change|make|set|update)\s+(?:user\s+)?(\S+@\S+|[\w\s]+)\s+(?:to\s+)?(?:a\s+)?(student|teacher|admin)/i);
        if (roleChangeMatch) {
            const userIdentifier = roleChangeMatch[1].trim();
            const newRole = roleChangeMatch[2].toLowerCase();

            const { data: targetUser } = await supabase
                .from('profiles')
                .select('id, email, display_name')
                .or(`email.ilike.%${userIdentifier}%,display_name.ilike.%${userIdentifier}%`)
                .limit(1)
                .single();

            if (targetUser) {
                await supabase
                    .from('profiles')
                    .update({ role: newRole })
                    .eq('id', targetUser.id);

                actionTaken = true;
                responseText = `✅ I've updated ${targetUser.display_name || targetUser.email}'s role to ${newRole}. They'll have ${newRole} access on their next login.`;
            } else {
                responseText = `❌ I couldn't find a user matching "${userIdentifier}". Please check the email or name and try again.`;
            }
        }

        // Pattern: Add skill
        const addSkillMatch = message.toLowerCase().match(/add.*skill.*(?:called|named)\s+["']?([^"']+)["']?/i);
        if (addSkillMatch) {
            const skillName = addSkillMatch[1];
            let category = 'electives';

            if (message.toLowerCase().includes('math')) category = 'Mathematics';
            else if (message.toLowerCase().includes('science') || message.toLowerCase().includes('creation')) category = 'God\'s Creation & Science';
            else if (message.toLowerCase().includes('health') || message.toLowerCase().includes('naturopathy')) category = 'Health & Naturopathy';
            else if (message.toLowerCase().includes('food') || message.toLowerCase().includes('farm')) category = 'Food Systems';
            else if (message.toLowerCase().includes('gov') || message.toLowerCase().includes('econ')) category = 'Government & Economics';
            else if (message.toLowerCase().includes('justice')) category = 'Justice';
            else if (message.toLowerCase().includes('disciple') || message.toLowerCase().includes('faith')) category = 'Discipleship';
            else if (message.toLowerCase().includes('history')) category = 'History';
            else if (message.toLowerCase().includes('english') || message.toLowerCase().includes('lit') || message.toLowerCase().includes('read')) category = 'English & Literature';

            await supabase.from('skills').insert({
                name: skillName.charAt(0).toUpperCase() + skillName.slice(1),
                category,
                credit_value: 0.25,
            });

            actionTaken = true;
            responseText = `✅ I've added a new skill called "${skillName}" in the ${category} category worth 0.25 credits. Students can now earn this skill!`;
        }

        // Pattern: Change Visual Style
        const styleMatch = message.toLowerCase().match(/(?:change|update|set).*?(?:size|color|font|theme|visual)/i);
        if (styleMatch) {
            const { data: currentSettings } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', 'theme')
                .maybeSingle();

            let newSettings = currentSettings?.value || {
                primaryColor: '#87A878',
                fontSize: '16px',
                fontFamily: 'Inter'
            };

            // Simple heuristic mapping
            if (message.toLowerCase().includes('font size') || message.toLowerCase().includes('text size')) {
                const sizeMatch = message.match(/(\d+)(?:px|pt)?/);
                if (sizeMatch) {
                    newSettings.fontSize = `${sizeMatch[1]}px`;
                    responseText = `✅ I've updated the global text size to ${newSettings.fontSize}.`;
                }
            }

            if (message.toLowerCase().includes('color') || message.toLowerCase().includes('primary')) {
                const hexMatch = message.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
                if (hexMatch) {
                    newSettings.primaryColor = hexMatch[0];
                    responseText = `✅ I've updated the primary brand color to ${hexMatch[0]}.`;
                } else if (message.toLowerCase().includes('blue')) {
                    newSettings.primaryColor = '#3b82f6';
                    responseText = `✅ I've updated the primary brand color to Blue.`;
                } else if (message.toLowerCase().includes('terracotta')) {
                    newSettings.primaryColor = '#C4826E';
                    responseText = `✅ I've updated the primary brand color to Terracotta.`;
                }
            }

            if (responseText === initialAiText) {
                responseText = "I understand you want to change the visual style, but I need more specifics (like a color hex code or specific pixel size).";
            } else {
                await supabase
                    .from('app_settings')
                    .upsert({ key: 'theme', value: newSettings, updated_at: new Date().toISOString() });
                actionTaken = true;
            }
        }

        return NextResponse.json({
            response: responseText,
            action: actionTaken,
        });
    } catch (error) {
        console.error('Admin AI error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}
