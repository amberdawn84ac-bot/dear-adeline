import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : undefined;

export async function POST(request: Request) {
    try {
        if (!genAI) {
            return NextResponse.json({ error: 'Google API Key Missing' }, { status: 500 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { studentId, gradeLevel, state = 'National' } = body;

        // While gradeLevel is helpful, we can default if missing to ensure generation
        const targetGrade = gradeLevel || '6th Grade';

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Generate a comprehensive yearly learning plan for a ${targetGrade} student in ${state}.

CRITICAL REQUIREMENT:
You MUST align this strictly with ${state} state educational standards. 
- If ${state} is "Texas", use TEKS.
- If "Virginia", use SOL.
- If "New York", use Next Generation Learning Standards.
- If "National" or generic, use Common Core.

Please CITE specific standard codes where possible in the descriptions (e.g. "TEKS 4.2(B)").

Provide:
1. YEARLY GOALS: Major skills and concepts they should master by end of year
2. QUARTERLY MILESTONES: Break down into 4 quarters
3. MONTHLY FOCUS AREAS: Key topics for each month
4. WEEKLY THEMES: General weekly progression

Format as specific JSON only (no markdown code blocks):
{
  "yearlyGoals": {
    "math": ["goal1 (Standard Code)", "goal2"],
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

Make it aligned with standards but flexible for homeschool adaptation. Ensure valid JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let learningPlan;
        try {
            // Clean up potential markdown formatting
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            learningPlan = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', responseText);
            return NextResponse.json({ error: 'Failed to generate valid plan format' }, { status: 500 });
        }

        // Use provided studentId or falling back to current user if matches
        const targetStudentId = studentId || user.id;

        // Save to database
        const { error: saveError } = await supabase
            .from('student_learning_plans')
            .upsert({
                student_id: targetStudentId,
                grade_level: targetGrade,
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
            return NextResponse.json({ error: 'Database save failed', details: saveError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            learningPlan
        });

    } catch (error: unknown) {
        console.error('Learning plan generation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate learning plan' },
            { status: 500 }
        );
    }
}
