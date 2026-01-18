import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { determineNextAction } from '@/lib/services/placementService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    // Get assessment
    const { data: assessment, error } = await supabase
      .from('placement_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (error || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.phase === 'warmup') {
      return NextResponse.json({ error: 'Warmup not complete' }, { status: 400 });
    }

    if (assessment.phase === 'complete') {
      return NextResponse.json({ complete: true, message: 'Assessment already complete' });
    }

    // Determine next action
    const nextAction = await determineNextAction(assessmentId, assessment);

    if (nextAction.action === 'complete') {
      return NextResponse.json({
        complete: true,
        message: nextAction.message
      });
    }

    if (nextAction.action === 'next_subject') {
      // Update current subject index
      await supabase
        .from('placement_assessments')
        .update({
          current_subject_index: assessment.current_subject_index + 1
        })
        .eq('id', assessmentId);

      return NextResponse.json({
        transition: true,
        nextSubject: nextAction.subject,
        message: nextAction.message
      });
    }

    // Return next question
    return NextResponse.json({
      question: {
        id: nextAction.question.id,
        type: nextAction.question.question_type,
        prompt: nextAction.question.prompt,
        options: nextAction.question.options,
        subject: nextAction.question.subject,
        estimatedSeconds: nextAction.question.estimated_seconds
      },
      gradeLevel: nextAction.gradeLevel,
      isProbeUp: nextAction.isProbeUp,
      isProbeDown: nextAction.isProbeDown,
      subjectIndex: assessment.current_subject_index,
      totalSubjects: assessment.subjects_to_assess.length
    });

  } catch (error: any) {
    console.error('Error getting question:', error);
    return NextResponse.json(
      { error: 'Failed to get question', details: error.message },
      { status: 500 }
    );
  }
}
