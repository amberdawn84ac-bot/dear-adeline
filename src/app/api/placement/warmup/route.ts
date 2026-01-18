import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WARMUP_QUESTIONS = [
  {
    key: 'interests',
    question: "What's something you're really into right now? Could be a hobby, a game, something you're learning about - anything!"
  },
  {
    key: 'learning_style',
    question: "How do you like to learn new things? Do you prefer reading, watching videos, hands-on activities, or something else?"
  },
  {
    key: 'subjects',
    question: "What subjects do you enjoy most? And are there any that feel harder for you?"
  }
];

export async function POST(req: Request) {
  try {
    const { assessmentId, response, questionKey } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    // Get current assessment
    const { data: assessment, error: fetchError } = await supabase
      .from('placement_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching assessment:', fetchError);
    }

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Store the response
    const warmupResponses = assessment.warmup_responses || {};
    if (questionKey && response) {
      warmupResponses[questionKey] = response;
    }

    // Determine which question to ask next
    const answeredKeys = Object.keys(warmupResponses);
    const nextQuestion = WARMUP_QUESTIONS.find(q => !answeredKeys.includes(q.key));

    if (!nextQuestion) {
      // Warmup complete - transition to assessment phase
      const { error: updateError } = await supabase
        .from('placement_assessments')
        .update({
          warmup_responses: warmupResponses,
          phase: 'assessment'
        })
        .eq('id', assessmentId);

      if (updateError) {
        console.error('Error updating assessment phase:', updateError);
      }

      return NextResponse.json({
        warmupComplete: true,
        transition: true,
        message: "Awesome! Now I'll show you a few questions so I know where to start. This isn't a test - just say \"I don't know\" if you're not sure!"
      });
    }

    // Update warmup responses and return next question
    const { error: updateError } = await supabase
      .from('placement_assessments')
      .update({ warmup_responses: warmupResponses })
      .eq('id', assessmentId);

    if (updateError) {
      console.error('Error updating warmup responses:', updateError);
    }

    return NextResponse.json({
      warmupComplete: false,
      questionKey: nextQuestion.key,
      question: nextQuestion.question
    });

  } catch (error: any) {
    console.error('Error in warmup:', error);
    return NextResponse.json(
      { error: 'Failed to process warmup', details: error.message },
      { status: 500 }
    );
  }
}
