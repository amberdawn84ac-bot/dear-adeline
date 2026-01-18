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
