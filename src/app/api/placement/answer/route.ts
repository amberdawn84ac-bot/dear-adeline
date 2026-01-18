import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scoreAnswer, getQuestionById } from '@/lib/services/placementService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { assessmentId, questionId, answer, gradeLevel, isProbeUp, isProbeDown, timeSpent } = await req.json();

    if (!assessmentId || !questionId || answer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the question
    const question = await getQuestionById(questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Score the answer
    const { isCorrect } = scoreAnswer(question, answer);

    // Store the response
    const { error: insertError } = await supabase
      .from('assessment_responses')
      .insert({
        assessment_id: assessmentId,
        question_id: questionId,
        student_answer: answer,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent || null,
        grade_level_tested: gradeLevel || question.grade_level,
        was_probe_up: isProbeUp || false,
        was_probe_down: isProbeDown || false
      });

    if (insertError) {
      console.error('Error storing response:', insertError);
      return NextResponse.json({ error: 'Failed to store response' }, { status: 500 });
    }

    // Return success (don't reveal correct/incorrect to frontend for UX reasons)
    return NextResponse.json({
      recorded: true,
      // Note: We intentionally don't return isCorrect to maintain friendly UX
    });

  } catch (error: any) {
    console.error('Error recording answer:', error);
    return NextResponse.json(
      { error: 'Failed to record answer', details: error.message },
      { status: 500 }
    );
  }
}
