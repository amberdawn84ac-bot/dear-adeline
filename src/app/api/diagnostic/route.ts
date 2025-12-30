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

        const { action, answers } = await request.json();

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        if (action === 'generate_questions') {
            // Generate diagnostic questions
            const prompt = `You are an educational assessment expert. Generate 8 diagnostic questions to assess a student's knowledge across these subjects:
- Math Reasoning (2 questions)
- Literary Analysis (2 questions)  
- Science Logic (2 questions)
- Expressive Writing (2 questions)

For each question:
1. Make it open-ended to assess depth of understanding
2. Target middle school to high school level
3. Allow for varied responses showing different mastery levels

CRITICAL: Return ONLY a valid JSON array, nothing else. No explanations, no markdown, just the JSON.

Format:
[
  {
    "id": "q1",
    "subject": "Math Reasoning",
    "text": "Question text here"
  },
  {
    "id": "q2",
    "subject": "Math Reasoning",
    "text": "Question text here"
  }
]

Make questions engaging and thought-provoking.`;

            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{ role: 'user', content: prompt }],
            });

            const content = response.content[0];
            if (content.type === 'text') {
                // Extract JSON from markdown code blocks if present
                let jsonText = content.text;
                const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (codeBlockMatch) {
                    jsonText = codeBlockMatch[1];
                }

                try {
                    const questions = JSON.parse(jsonText);
                    return NextResponse.json({ questions });
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Raw response:', content.text);
                    return NextResponse.json(
                        { error: 'Failed to parse AI response' },
                        { status: 500 }
                    );
                }
            }
        }

        if (action === 'evaluate' && answers) {
            // Evaluate student responses
            const prompt = `You are an educational assessment expert. Evaluate these student responses and provide a diagnostic assessment.

Student Responses:
${JSON.stringify(answers, null, 2)}

Provide:
1. For each subject (Math Reasoning, Literary Analysis, Science Logic, Expressive Writing):
   - Estimated grade level (e.g., "7th Grade", "9th Grade")
   - 2-3 specific strengths observed
   - 2-3 specific gaps or areas for growth

2. A personalized 2-week learning plan that:
   - Addresses the identified gaps
   - Builds on strengths
   - Provides specific, actionable steps
   - Is encouraging and motivating

Return JSON with this structure:
{
  "assessments": [
    {
      "subject": "Math Reasoning",
      "estimatedLevel": "8th Grade",
      "strengths": ["Clear logical thinking", "Good problem decomposition"],
      "gaps": ["Needs practice with fractions", "Could improve algebraic notation"]
    }
  ],
  "twoWeekPlan": "Detailed 2-week plan as a string"
}`;

            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 3000,
                messages: [{ role: 'user', content: prompt }],
            });

            const content = response.content[0];
            if (content.type === 'text') {
                // Extract JSON from markdown code blocks if present
                let jsonText = content.text;
                const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (codeBlockMatch) {
                    jsonText = codeBlockMatch[1];
                }

                let evaluation;
                try {
                    evaluation = JSON.parse(jsonText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Raw response:', content.text);
                    return NextResponse.json(
                        { error: 'Failed to parse evaluation response' },
                        { status: 500 }
                    );
                }

                // Save to database
                const { error: saveError } = await supabase
                    .from('diagnostic_results')
                    .insert({
                        student_id: user.id,
                        questions_answered: answers,
                        subject_assessments: evaluation.assessments,
                        two_week_plan: evaluation.twoWeekPlan,
                    });

                if (saveError) {
                    console.error('Error saving diagnostic:', saveError);
                }

                return NextResponse.json(evaluation);
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Diagnostic error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process diagnostic' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: results, error } = await supabase
            .from('diagnostic_results')
            .select('*')
            .eq('student_id', user.id)
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('Error fetching diagnostics:', error);
            return NextResponse.json(
                { error: 'Failed to fetch diagnostics' },
                { status: 500 }
            );
        }

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('Diagnostic fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch diagnostics' },
            { status: 500 }
        );
    }
}
