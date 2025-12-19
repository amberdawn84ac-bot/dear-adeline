import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI admin assistant for the Dear Adeline educational platform. You help admins manage the platform through natural language commands.

You can perform the following actions:
1. ADD projects to the library (art, farm, or science categories)
2. UPDATE user roles (student, teacher, admin)
3. ADD new skills
4. QUERY information about users, projects, or skills

When asked to perform an action, you should:
1. Parse the intent clearly
2. Confirm what you're about to do
3. Return your response with an action object if needed

For ADD project requests, extract:
- title
- description  
- category (art/farm/science)
- difficulty (beginner/intermediate/advanced)
- instructions (if provided)
- materials (if provided)

For UPDATE user role requests, extract:
- user identifier (email or name)
- new role

For queries, provide helpful summaries of the requested information.

Always be friendly and confirm actions before they're taken.

If asked something you can't do, explain what IS possible.`;

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
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: SYSTEM_PROMPT + '\n\n' + context,
            messages: [
                { role: 'user', content: message },
            ],
        });

        const contentBlock = response.content[0];
        let responseText = contentBlock.type === 'text' ? contentBlock.text : '';

        // Check for action patterns and execute them
        let actionTaken = false;

        // Pattern: Add project
        const addProjectMatch = message.toLowerCase().match(/add.*(?:project|activity).*(?:about|called|named|titled)\s+["']?([^"']+)["']?/i);
        if (addProjectMatch) {
            const title = addProjectMatch[1];
            let category: 'art' | 'farm' | 'science' = 'art';

            if (message.toLowerCase().includes('farm') || message.toLowerCase().includes('garden') || message.toLowerCase().includes('animal')) {
                category = 'farm';
            } else if (message.toLowerCase().includes('science') || message.toLowerCase().includes('experiment')) {
                category = 'science';
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

            if (message.toLowerCase().includes('math')) category = 'math';
            else if (message.toLowerCase().includes('science')) category = 'science';
            else if (message.toLowerCase().includes('english') || message.toLowerCase().includes('ela')) category = 'ela';
            else if (message.toLowerCase().includes('art')) category = 'fine_arts';
            else if (message.toLowerCase().includes('tech')) category = 'technology';

            await supabase.from('skills').insert({
                name: skillName.charAt(0).toUpperCase() + skillName.slice(1),
                category,
                credit_value: 0.25,
            });

            actionTaken = true;
            responseText = `✅ I've added a new skill called "${skillName}" in the ${category} category worth 0.25 credits. Students can now earn this skill!`;
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
