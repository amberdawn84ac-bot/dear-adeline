import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, sessionId, displayName, grade, state } = await req.json();

    // Support both userId (logged-in users) and sessionId (pre-signup users)
    const trackingId = userId && userId !== 'temp' ? userId : null;
    const trackingSessionId = sessionId || null;

    if (!trackingId && !trackingSessionId) {
      return NextResponse.json({ error: 'User ID or Session ID required' }, { status: 400 });
    }

    // Build query based on what we have
    let existingQuery = supabase
      .from('placement_assessments')
      .select('id, status, completed_at, current_subject, responses');

    if (trackingId) {
      existingQuery = existingQuery.eq('student_id', trackingId);
    } else if (trackingSessionId) {
      existingQuery = existingQuery.eq('session_id', trackingSessionId);
    }

    // Check if there's an existing completed assessment (within 30 days)
    const { data: existingAssessment } = await existingQuery
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

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
    let inProgressQuery = supabase
      .from('placement_assessments')
      .select('id, current_subject, responses');

    if (trackingId) {
      inProgressQuery = inProgressQuery.eq('student_id', trackingId);
    } else if (trackingSessionId) {
      inProgressQuery = inProgressQuery.eq('session_id', trackingSessionId);
    }

    const { data: inProgressAssessment } = await inProgressQuery
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // Create first question
    const name = displayName || 'friend';
    // Learning Science: Start with "Interest-Based Learning" to build engagement and lower anxiety (Affective Filter).
    const firstQuestion = `Hi ${name}! I'm so glad you're here. To help me design the perfect learning path for you, I'd love to know: what are 2 or 3 things you are really curious about right now? (It could be anything - from space to horses to Minecraft!)`;

    // Create new assessment - use session_id for pre-signup, student_id for logged-in
    const insertData: any = {
      current_subject: 'introduction',
      status: 'in_progress',
      responses: {
        "0": {
          question: firstQuestion,
          answer: null,
          timestamp: new Date().toISOString()
        }
      }
    };

    if (trackingId) {
      insertData.student_id = trackingId;

      // START FIX: Ensure profile exists to prevent FK violation
      const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', trackingId).single();
      if (!profileCheck) {
        console.log(`Profile missing for ${trackingId}, creating fallback profile...`);
        const { error: profileError } = await supabase.from('profiles').insert({
          id: trackingId,
          display_name: displayName || 'Student',
          role: 'student', // Default to student
          // Add other required fields if any? usually email is good but we might not have it here. 
          // Hopefully email is not NOT NULL in profiles or we can skip it.
          // If email is required, we might fail. But let's try.
        });
        if (profileError) {
          console.error('Failed to create fallback profile:', profileError);
          // If this fails, the next insert likely fails too, but we proceed to let it throw standard error.
        }
      }
      // END FIX
    }
    if (trackingSessionId) {
      insertData.session_id = trackingSessionId;
    }

    const { data: newAssessment, error } = await supabase
      .from('placement_assessments')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating placement assessment:', error);
      return NextResponse.json({ error: 'Failed to create assessment', details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      assessmentId: newAssessment.id,
      firstQuestion
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
