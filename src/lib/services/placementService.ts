import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
export interface AssessmentQuestion {
  id: string;
  skill_id: string | null;
  standard_id: string | null;
  question_type: 'multiple_choice' | 'fill_blank' | 'drag_sort' | 'true_false' | 'activity';
  prompt: string;
  options: { text: string; isCorrect: boolean }[] | null;
  correct_answer: string | null;
  activity_config: any | null;
  grade_level: string;
  subject: string;
  is_gateway: boolean;
  difficulty_weight: number;
  estimated_seconds: number;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: string;
  question_id: string | null;
  student_answer: string | null;
  is_correct: boolean | null;
  time_spent_seconds: number | null;
  grade_level_tested: string;
  was_probe_up: boolean;
  was_probe_down: boolean;
  answered_at: string;
}

export interface SubjectPlacement {
  subject: string;
  declared_grade: string;
  comfortable_grade: string;
  stretch_grade: string | null;
  questions_asked: number;
  questions_correct: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface PlacementAssessment {
  id: string;
  student_id: string;
  status: 'in_progress' | 'completed';
  phase: 'warmup' | 'assessment' | 'complete';
  jurisdiction: string | null;
  declared_grade: string | null;
  current_subject_index: number;
  subjects_to_assess: string[];
  warmup_responses: Record<string, any>;
}

export type NextAction =
  | { action: 'question'; question: AssessmentQuestion; gradeLevel: string; isProbeUp: boolean; isProbeDown: boolean }
  | { action: 'next_subject'; subject: string; message: string }
  | { action: 'complete'; message: string };

// Constants
const MASTERY_THRESHOLD = 0.80; // 80% for comfortable
const STRETCH_THRESHOLD = 0.60; // 60% for stretch
const MAX_QUESTIONS_PER_SUBJECT = 6;
const MAX_PROBE_LEVELS = 3;

export { supabase, MASTERY_THRESHOLD, STRETCH_THRESHOLD, MAX_QUESTIONS_PER_SUBJECT, MAX_PROBE_LEVELS };

/**
 * Get gateway questions for a specific subject and grade level
 */
export async function getGatewayQuestions(
  subject: string,
  gradeLevel: string
): Promise<AssessmentQuestion[]> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('subject', subject)
    .eq('grade_level', gradeLevel)
    .eq('is_gateway', true)
    .order('difficulty_weight', { ascending: true })
    .limit(3);

  if (error) {
    console.error('Error fetching gateway questions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(questionId: string): Promise<AssessmentQuestion | null> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('id', questionId)
    .single();

  if (error) {
    console.error('Error fetching question:', error);
    return null;
  }

  return data;
}

/**
 * Get all responses for an assessment
 */
export async function getAssessmentResponses(assessmentId: string): Promise<AssessmentResponse[]> {
  const { data, error } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('answered_at', { ascending: true });

  if (error) {
    console.error('Error fetching responses:', error);
    return [];
  }

  return data || [];
}

/**
 * Get responses for a specific subject within an assessment
 */
export async function getSubjectResponses(
  assessmentId: string,
  subject: string
): Promise<AssessmentResponse[]> {
  const responses = await getAssessmentResponses(assessmentId);

  // We need to join with questions to filter by subject
  const questionIds = responses.map(r => r.question_id).filter(Boolean);

  if (questionIds.length === 0) return [];

  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('id, subject')
    .in('id', questionIds);

  const subjectQuestionIds = new Set(
    questions?.filter(q => q.subject === subject).map(q => q.id) || []
  );

  return responses.filter(r => r.question_id && subjectQuestionIds.has(r.question_id));
}
