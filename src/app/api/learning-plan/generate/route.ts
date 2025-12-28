import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { studentId, gradeLevel, state } = await request.json();

        if (!gradeLevel || !state) {
            return NextResponse.json({ error: 'Grade level and state required' }, { status: 400 });
        }

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const prompt = `Generate a comprehensive yearly learning plan for a ${gradeLevel} student in ${state}.

Based on ${state} state standards, provide:

1. YEARLY GOALS: Major skills and concepts they should master by end of year
2. QUARTERLY MILESTONES: Break down into 4 quarters
3. MONTHLY FOCUS AREAS: Key topics for each month
4. WEEKLY THEMES: General weekly progression

Format as JSON:
{
  "yearlyGoals": {
    "math": ["goal1", "goal2"],
    "english": ["goal1", "goal2"],
    "science": ["goal1", "goal2"],
    "history": ["goal1", "goal2"],
    "other": ["goal1", "goal2"]
  },
  "quarters": [
    {
      "quarter": 1,
      "months": ["August", "September", "October"],
      "focus": {
        "math": "description",
        "english": "description",
        "science": "description",
        "history": "description"
      }
    }
  ],
  "monthlyThemes": [
    {
      "month": "August",
      "math": "topic",
      "english": "topic",
      "science": "topic",
      "history": "topic",
      "projects": ["suggested project 1", "suggested project 2"]
    }
  ]
}

Make it aligned with ${state} standards but flexible for homeschool adaptation.`;

        const response = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        let learningPlan;

        if (content.type === 'text') {
            // Try to extract JSON from the response
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                learningPlan = JSON.parse(jsonMatch[0]);
            } else {
                learningPlan = { error: 'Could not parse learning plan' };
            }
        }

        // Save to database
        const { error: saveError } = await supabase
            .from('student_learning_plans')
            .upsert({
                student_id: studentId,
                grade_level: gradeLevel,
                state: state,
                yearly_goals: learningPlan.yearlyGoals,
                quarters: learningPlan.quarters,
                monthly_themes: learningPlan.monthlyThemes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'student_id,grade_level'
            });

        if (saveError) {
            console.error('Error saving learning plan:', saveError);
        }

        return NextResponse.json({
            success: true,
            learningPlan
        });

    } catch (error: any) {
        console.error('Learning plan generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate learning plan' },
            { status: 500 }
        );
    }
}
