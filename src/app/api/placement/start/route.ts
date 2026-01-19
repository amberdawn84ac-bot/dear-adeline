import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if student already has a completed assessment
    const { data: existingAssessment } = await supabase
      .from('placement_assessments')
      .select('id, status, completed_at')
      .eq('student_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    // If they have a recent completed assessment (within 30 days), return it
    if (existingAssessment) {
      const completedDate = new Date(existingAssessment.completed_at);
      const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince < 30) {
        return NextResponse.json({
          message: 'Student has a recent placement assessment',
          assessmentId: existingAssessment.id,
          alreadyCompleted: true
        });
      }
    }

    // Check for in-progress assessment
    const { data: inProgressAssessment } = await supabase
      .from('placement_assessments')
      .select('id, current_subject, responses')
      .eq('student_id', userId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (inProgressAssessment) {
      // Resume existing assessment
      return NextResponse.json({
        assessmentId: inProgressAssessment.id,
        resumed: true,
        firstQuestion: getNextQuestionForSubject(
          inProgressAssessment.current_subject || 'introduction',
          inProgressAssessment.responses
        )
      });
    }

    // Create new assessment
    const { data: newAssessment, error } = await supabase
      .from('placement_assessments')
      .insert({
        student_id: userId,
        current_subject: 'introduction',
        status: 'in_progress'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating placement assessment:', error);
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }

    // Get student info for personalized greeting
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single();

    const displayName = profile?.display_name || 'there';

    return NextResponse.json({
      assessmentId: newAssessment.id,
      firstQuestion: `Hi ${displayName}! I'm Adeline. Before we dive into anything, I want to get to know you a little.\n\nWhat grade are you going into? Or are you homeschooled and don't really think in grades?`
    });

  } catch (error: any) {
    console.error('Error in placement start:', error);
    return NextResponse.json(
      { error: 'Failed to start placement', details: error.message },
      { status: 500 }
    );
  }
}

function getNextQuestionForSubject(subject: string, responses: any): string {
  // Helper function to resume an assessment
  switch (subject) {
    case 'introduction':
      return "Let's continue. What grade are you going into?";
    case 'math':
      return "Let's talk about math. What's the last math thing you remember working on?";
    case 'reading':
      return "Now let's talk about reading. What's the last book you read that you actually enjoyed?";
    case 'science':
      return "Let's talk about science. Do you know why plants need sunlight?";
    case 'hebrew':
      return "Your curriculum includes Hebrew word studies. Have you studied any Hebrew before?";
    default:
      return "Let's continue where we left off.";
  }
}
