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

    // Get student profile for jurisdiction and grade
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, jurisdiction, declared_grade')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    const displayName = profile?.display_name || 'there';
    const jurisdiction = profile?.jurisdiction || 'Oklahoma';
    const declaredGrade = profile?.declared_grade || '5';

    // Check for recent completed assessment (within 30 days)
    const { data: existingAssessment } = await supabase
      .from('placement_assessments')
      .select('id, status, completed_at')
      .eq('student_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAssessment) {
      const completedDate = new Date(existingAssessment.completed_at);
      const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince < 30) {
        return NextResponse.json({
          alreadyCompleted: true,
          assessmentId: existingAssessment.id,
          message: 'Recent assessment found'
        });
      }
    }

    // Check for in-progress assessment
    const { data: inProgressAssessment, error: inProgressError } = await supabase
      .from('placement_assessments')
      .select('*')
      .eq('student_id', userId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (inProgressError && inProgressError.code !== 'PGRST116') {
      console.error('Error fetching in-progress assessment:', inProgressError);
    }

    if (inProgressAssessment && !inProgressError) {
      return NextResponse.json({
        assessmentId: inProgressAssessment.id,
        resumed: true,
        phase: inProgressAssessment.phase,
        currentSubjectIndex: inProgressAssessment.current_subject_index,
        warmupComplete: inProgressAssessment.phase !== 'warmup',
        firstMessage: getResumeMessage(inProgressAssessment.phase, displayName)
      });
    }

    // Create new assessment
    const { data: newAssessment, error } = await supabase
      .from('placement_assessments')
      .insert({
        student_id: userId,
        status: 'in_progress',
        phase: 'warmup',
        jurisdiction,
        declared_grade: declaredGrade,
        current_subject_index: 0,
        subjects_to_assess: ['Mathematics', 'English Language Arts', 'Science', 'Social Studies']
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }

    return NextResponse.json({
      assessmentId: newAssessment.id,
      phase: 'warmup',
      jurisdiction,
      declaredGrade,
      firstMessage: `Hi ${displayName}! I'm Adeline. Before we dive in, I'd love to get to know you a little.\n\nWhat's something you're really into right now? Could be a hobby, a game, something you're learning about - anything!`
    });

  } catch (error: any) {
    console.error('Error in placement start:', error);
    return NextResponse.json(
      { error: 'Failed to start placement', details: error.message },
      { status: 500 }
    );
  }
}

function getResumeMessage(phase: string, name: string): string {
  if (phase === 'warmup') {
    return `Welcome back, ${name}! Let's continue getting to know each other. What's something you enjoy doing?`;
  }
  return `Welcome back, ${name}! Let's continue where we left off.`;
}
