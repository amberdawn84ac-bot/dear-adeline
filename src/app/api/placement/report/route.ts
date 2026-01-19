import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const assessmentId = searchParams.get('assessmentId');

    if (!userId && !assessmentId) {
      return NextResponse.json(
        { error: 'User ID or Assessment ID required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('placement_assessments')
      .select('*')
      .eq('status', 'completed');

    if (assessmentId) {
      query = query.eq('id', assessmentId);
    } else if (userId) {
      query = query.eq('student_id', userId);
    }

    const { data: assessments, error } = await query
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching placement report:', error);
      return NextResponse.json(
        { error: 'Failed to fetch placement report' },
        { status: 500 }
      );
    }

    if (!assessments || assessments.length === 0) {
      return NextResponse.json(
        { error: 'No completed placement assessment found' },
        { status: 404 }
      );
    }

    const assessment = assessments[0];

    // Get student info
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, grade_level')
      .eq('id', assessment.student_id)
      .single();

    // Format the placement report
    const placementReport = formatPlacementReport(assessment, profile);

    return NextResponse.json(placementReport);

  } catch (error: any) {
    console.error('Error in placement report:', error);
    return NextResponse.json(
      { error: 'Failed to get placement report', details: error.message },
      { status: 500 }
    );
  }
}

interface SubjectPlacement {
  currentLevel: string;
  mastered: SkillEval[];
  competent: SkillEval[];
  gaps: SkillEval[];
  notIntroduced: SkillEval[];
  recommendedAction: string;
}

interface SkillEval {
  skillName: string;
  level: string;
  evidence: string;
}

function formatPlacementReport(assessment: any, profile: any) {
  const skillEvaluations = assessment.skill_evaluations || [];
  const learningProfile = assessment.learning_profile || {};
  const recommendations = assessment.recommendations || {};

  // Group skills by subject
  const subjects: { [key: string]: SkillEval[] } = {
    math: [],
    reading: [],
    science: [],
    hebrew: []
  };

  for (const skill of skillEvaluations) {
    const subject = skill.subject?.toLowerCase() || 'other';
    if (subjects[subject]) {
      subjects[subject].push(skill);
    }
  }

  // Build subject placements
  const subjectPlacements: { [key: string]: SubjectPlacement } = {};

  for (const [subject, skills] of Object.entries(subjects)) {
    if (skills.length === 0) continue;

    const mastered = skills.filter(s => s.level === 'mastered');
    const competent = skills.filter(s => s.level === 'competent');
    const gaps = skills.filter(s => s.level === 'needs_instruction');
    const notIntroduced = skills.filter(s => s.level === 'not_introduced');

    // Determine current level based on mastered skills
    let currentLevel = 'Beginner';
    if (mastered.length >= 5) currentLevel = '7th-8th grade';
    else if (mastered.length >= 3) currentLevel = '5th-6th grade';
    else if (mastered.length >= 1) currentLevel = '3rd-4th grade';

    // Generate recommendation
    let recommendedAction = '';
    if (gaps.length > 0) {
      recommendedAction = `Fill ${gaps.length} gap(s) before advancing`;
    } else if (competent.length > gaps.length) {
      recommendedAction = 'Continue at current level with reinforcement';
    } else {
      recommendedAction = 'Ready to advance';
    }

    subjectPlacements[subject] = {
      currentLevel,
      mastered,
      competent,
      gaps,
      notIntroduced,
      recommendedAction
    };
  }

  return {
    studentId: assessment.student_id,
    assessmentId: assessment.id,
    date: assessment.completed_at,
    studentName: profile?.display_name || 'Student',
    gradeLevel: profile?.grade_level || 'Unknown',

    subjects: subjectPlacements,

    learningProfile: {
      style: learningProfile.style || 'mixed',
      pace: learningProfile.pace || 'moderate',
      interests: learningProfile.interests || [],
      needsBreaksWhenStuck: learningProfile.needsBreaksWhenStuck || false
    },

    recommendations: {
      startingPoint: recommendations.startingPoint || 'Begin with diagnostic work',
      criticalGaps: recommendations.criticalGaps || [],
      strengths: recommendations.strengths || []
    },

    summary: generateSummary(subjectPlacements, recommendations)
  };
}

function generateSummary(subjects: any, recommendations: any): string {
  const subjectNames = Object.keys(subjects);

  if (subjectNames.length === 0) {
    return 'Assessment incomplete - no subjects evaluated';
  }

  const strengths = recommendations.strengths || [];
  const gaps = recommendations.criticalGaps || [];

  let summary = `Placement assessment complete. `;

  if (strengths.length > 0) {
    summary += `Strong in: ${strengths.slice(0, 2).join(', ')}. `;
  }

  if (gaps.length > 0) {
    summary += `Focus areas: ${gaps.slice(0, 2).join(', ')}. `;
  }

  summary += `${recommendations.startingPoint || 'Ready to begin learning'}`;

  return summary;
}
