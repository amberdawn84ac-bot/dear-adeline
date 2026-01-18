import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { finalizeAssessment } from '@/lib/services/placementService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { assessmentId } = await req.json();

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    // Get assessment
    const { data: assessment, error: fetchError } = await supabase
      .from('placement_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (fetchError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    if (assessment.status === 'completed') {
      return NextResponse.json({ error: 'Assessment already completed' }, { status: 400 });
    }

    // Finalize and get placements
    const placements = await finalizeAssessment(
      assessmentId,
      assessment.student_id,
      assessment.declared_grade || '5',
      assessment.subjects_to_assess
    );

    // Generate friendly summary
    const strengths = placements
      .filter(p => parseInt(p.comfortable_grade) >= parseInt(p.declared_grade))
      .map(p => p.subject);

    const growthAreas = placements
      .filter(p => parseInt(p.comfortable_grade) < parseInt(p.declared_grade))
      .map(p => p.subject);

    let message = "Thanks! I learned a lot about you. ";
    if (strengths.length > 0) {
      message += `You're really strong in ${strengths.join(' and ')}! `;
    }
    if (growthAreas.length > 0) {
      message += `We'll have fun exploring ${growthAreas.join(' and ')} together. `;
    }
    message += "Ready to start learning?";

    return NextResponse.json({
      completed: true,
      placements,
      message
    });

  } catch (error: any) {
    console.error('Error completing assessment:', error);
    return NextResponse.json(
      { error: 'Failed to complete assessment', details: error.message },
      { status: 500 }
    );
  }
}
