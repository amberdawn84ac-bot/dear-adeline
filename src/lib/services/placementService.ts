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

/**
 * Score a student's answer for a question
 */
export function scoreAnswer(
  question: AssessmentQuestion,
  studentAnswer: string
): { isCorrect: boolean; feedback: string } {
  const normalizedAnswer = studentAnswer.trim().toLowerCase();

  switch (question.question_type) {
    case 'multiple_choice': {
      if (!question.options) {
        return { isCorrect: false, feedback: 'Invalid question configuration' };
      }

      // Check if answer matches any correct option
      const correctOption = question.options.find(opt => opt.isCorrect);
      const selectedOption = question.options.find(
        opt => opt.text.toLowerCase() === normalizedAnswer
      );

      // "I don't know" is always incorrect but valid
      if (normalizedAnswer === "i don't know" || normalizedAnswer === "i dont know") {
        return { isCorrect: false, feedback: "That's okay! Let's try another one." };
      }

      const isCorrect = selectedOption?.isCorrect || false;
      return {
        isCorrect,
        feedback: isCorrect ? 'Correct!' : `The answer is ${correctOption?.text || 'unknown'}.`
      };
    }

    case 'fill_blank': {
      if (!question.correct_answer) {
        return { isCorrect: false, feedback: 'Invalid question configuration' };
      }

      // Fuzzy match: case-insensitive, trim whitespace
      const correctNormalized = question.correct_answer.trim().toLowerCase();
      const isCorrect = normalizedAnswer === correctNormalized;

      return {
        isCorrect,
        feedback: isCorrect ? 'Correct!' : `The answer is ${question.correct_answer}.`
      };
    }

    case 'true_false': {
      if (!question.correct_answer) {
        return { isCorrect: false, feedback: 'Invalid question configuration' };
      }

      const correctNormalized = question.correct_answer.trim().toLowerCase();
      const isCorrect = normalizedAnswer === correctNormalized;

      return {
        isCorrect,
        feedback: isCorrect ? 'Correct!' : `The answer is ${question.correct_answer}.`
      };
    }

    case 'drag_sort': {
      // For drag_sort, the studentAnswer should be a JSON string of ordered items
      // This would need more complex handling in the frontend
      return { isCorrect: false, feedback: 'Drag sort scoring not yet implemented' };
    }

    case 'activity': {
      // Activity scoring depends on the activity type
      return { isCorrect: false, feedback: 'Activity scoring handled by activity config' };
    }

    default:
      return { isCorrect: false, feedback: 'Unknown question type' };
  }
}

/**
 * Calculate success rate for a set of responses
 */
export function calculateSuccessRate(responses: AssessmentResponse[]): number {
  if (responses.length === 0) return 0;

  const correctCount = responses.filter(r => r.is_correct).length;
  return correctCount / responses.length;
}

/**
 * Calculate success rate at a specific grade level
 */
export function calculateGradeSuccessRate(
  responses: AssessmentResponse[],
  gradeLevel: string
): { rate: number; total: number; correct: number } {
  const gradeResponses = responses.filter(r => r.grade_level_tested === gradeLevel);
  const correct = gradeResponses.filter(r => r.is_correct).length;

  return {
    rate: gradeResponses.length > 0 ? correct / gradeResponses.length : 0,
    total: gradeResponses.length,
    correct
  };
}

/**
 * Parse grade level to number for comparison
 * Handles: "K", "1", "2", ... "12"
 */
function gradeToNumber(grade: string): number {
  if (grade.toUpperCase() === 'K') return 0;
  return parseInt(grade, 10) || 0;
}

/**
 * Convert number back to grade string
 */
function numberToGrade(num: number): string {
  if (num <= 0) return 'K';
  return num.toString();
}

/**
 * Determine the next action in the assessment based on responses
 */
export async function determineNextAction(
  assessmentId: string,
  assessment: PlacementAssessment
): Promise<NextAction> {
  const currentSubject = assessment.subjects_to_assess[assessment.current_subject_index];

  if (!currentSubject) {
    // All subjects complete
    return { action: 'complete', message: 'All subjects assessed!' };
  }

  const declaredGrade = assessment.declared_grade || '5';
  const responses = await getSubjectResponses(assessmentId, currentSubject);

  // Check if we've hit max questions for this subject
  if (responses.length >= MAX_QUESTIONS_PER_SUBJECT) {
    return moveToNextSubject(assessment, currentSubject);
  }

  // Find what grade levels we've tested
  const testedGrades = new Set(responses.map(r => r.grade_level_tested));
  const declaredGradeNum = gradeToNumber(declaredGrade);

  // Calculate success at each tested grade
  const gradeResults: Record<string, { rate: number; total: number }> = {};
  for (const grade of testedGrades) {
    gradeResults[grade] = calculateGradeSuccessRate(responses, grade);
  }

  // If we haven't tested declared grade yet, start there
  if (!testedGrades.has(declaredGrade)) {
    const questions = await getGatewayQuestions(currentSubject, declaredGrade);
    if (questions.length > 0) {
      return {
        action: 'question',
        question: questions[0],
        gradeLevel: declaredGrade,
        isProbeUp: false,
        isProbeDown: false
      };
    }
  }

  // Get results at declared grade
  const declaredResult = gradeResults[declaredGrade];

  if (declaredResult) {
    // Need at least 3 responses to make decisions
    if (declaredResult.total < 3) {
      // Get more questions at this level
      const questions = await getGatewayQuestions(currentSubject, declaredGrade);
      const answeredIds = new Set(responses.map(r => r.question_id));
      const unanswered = questions.filter(q => !answeredIds.has(q.id));

      if (unanswered.length > 0) {
        return {
          action: 'question',
          question: unanswered[0],
          gradeLevel: declaredGrade,
          isProbeUp: false,
          isProbeDown: false
        };
      }
    }

    // We have enough data - decide on probing
    if (declaredResult.rate >= MASTERY_THRESHOLD) {
      // Student is strong - probe up
      const probeUpGrade = numberToGrade(declaredGradeNum + 1);
      const alreadyProbedUp = testedGrades.has(probeUpGrade);

      if (!alreadyProbedUp && declaredGradeNum + 1 <= declaredGradeNum + MAX_PROBE_LEVELS) {
        const questions = await getGatewayQuestions(currentSubject, probeUpGrade);
        if (questions.length > 0) {
          return {
            action: 'question',
            question: questions[0],
            gradeLevel: probeUpGrade,
            isProbeUp: true,
            isProbeDown: false
          };
        }
      }

      // Already probed up or no questions available - move on
      return moveToNextSubject(assessment, currentSubject);
    }

    if (declaredResult.rate < 0.5) {
      // Student is struggling - probe down
      const probeDownGrade = numberToGrade(declaredGradeNum - 1);
      const alreadyProbedDown = testedGrades.has(probeDownGrade);

      if (!alreadyProbedDown && declaredGradeNum - 1 >= declaredGradeNum - MAX_PROBE_LEVELS) {
        const questions = await getGatewayQuestions(currentSubject, probeDownGrade);
        if (questions.length > 0) {
          return {
            action: 'question',
            question: questions[0],
            gradeLevel: probeDownGrade,
            isProbeUp: false,
            isProbeDown: true
          };
        }
      }

      // Already probed down or no questions - move on
      return moveToNextSubject(assessment, currentSubject);
    }
  }

  // Default: move to next subject
  return moveToNextSubject(assessment, currentSubject);
}

function moveToNextSubject(
  assessment: PlacementAssessment,
  completedSubject: string
): NextAction {
  const nextIndex = assessment.current_subject_index + 1;
  const nextSubject = assessment.subjects_to_assess[nextIndex];

  if (!nextSubject) {
    return { action: 'complete', message: "All done! Let me put together your results." };
  }

  const transitions: Record<string, string> = {
    'Mathematics': "Great! Now let's look at some reading.",
    'English Language Arts': "Nice work! Let's try some science questions.",
    'Science': "Awesome! Last area - social studies.",
    'Social Studies': "All done! Let me put together your results."
  };

  return {
    action: 'next_subject',
    subject: nextSubject,
    message: transitions[completedSubject] || `Now let's try ${nextSubject}.`
  };
}
