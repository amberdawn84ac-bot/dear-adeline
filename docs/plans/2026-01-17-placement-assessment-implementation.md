# Placement Assessment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an adaptive placement assessment that determines student skill levels against state standards, with conversational warmup, multiple-choice questions, and comprehensive outputs (skill levels, learning plans, parent reports, Adeline memory).

**Architecture:** Three-phase assessment (warmup → adaptive questions → completion) with a probing algorithm that tests ±3 grade levels to find comfortable/stretch zones. Normalized database schema with separate tables for questions, responses, and placements. Service layer handles scoring and adaptation logic.

**Tech Stack:** Next.js 16, React 19, Supabase (PostgreSQL), TypeScript, Tailwind CSS

---

## Phase 1: Database Foundation

### Task 1: Create Migration for New Tables

**Files:**
- Create: `supabase/migrations/35_placement_assessment_v2.sql`

**Step 1: Write the migration file**

```sql
-- Migration 35: Placement Assessment V2
-- Adaptive placement assessment with normalized schema

-- ============================================
-- 1. ASSESSMENT QUESTIONS TABLE
-- ============================================
create table if not exists public.assessment_questions (
  id uuid primary key default uuid_generate_v4(),

  -- What this question assesses
  skill_id uuid references public.skills(id) on delete cascade,
  standard_id uuid references public.state_standards(id) on delete set null,

  -- Question content
  question_type text not null check (question_type in (
    'multiple_choice', 'fill_blank', 'drag_sort', 'true_false', 'activity'
  )),
  prompt text not null,
  options jsonb,
  correct_answer text,
  activity_config jsonb,

  -- Targeting
  grade_level text not null,
  subject text not null,
  is_gateway boolean default false,

  -- Metadata
  difficulty_weight integer default 5 check (difficulty_weight >= 1 and difficulty_weight <= 10),
  estimated_seconds integer default 30,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_aq_skill on public.assessment_questions(skill_id);
create index if not exists idx_aq_grade_subject on public.assessment_questions(grade_level, subject);
create index if not exists idx_aq_gateway on public.assessment_questions(is_gateway) where is_gateway = true;

-- RLS
alter table public.assessment_questions enable row level security;

create policy "Anyone can view assessment questions"
  on public.assessment_questions for select
  using (true);

create policy "Admins can manage assessment questions"
  on public.assessment_questions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- 2. ASSESSMENT RESPONSES TABLE
-- ============================================
create table if not exists public.assessment_responses (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references public.placement_assessments(id) on delete cascade not null,
  question_id uuid references public.assessment_questions(id) on delete set null,

  -- Response data
  student_answer text,
  is_correct boolean,
  time_spent_seconds integer,

  -- For adaptive algorithm
  grade_level_tested text not null,
  was_probe_up boolean default false,
  was_probe_down boolean default false,

  answered_at timestamptz default now()
);

create index if not exists idx_ar_assessment on public.assessment_responses(assessment_id);

-- RLS
alter table public.assessment_responses enable row level security;

create policy "Students can view own responses"
  on public.assessment_responses for select
  using (
    exists (
      select 1 from public.placement_assessments pa
      where pa.id = assessment_id and pa.student_id = auth.uid()
    )
  );

-- ============================================
-- 3. SUBJECT PLACEMENTS TABLE
-- ============================================
create table if not exists public.subject_placements (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references public.placement_assessments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,

  subject text not null,
  declared_grade text not null,
  comfortable_grade text not null,
  stretch_grade text,

  questions_asked integer not null,
  questions_correct integer not null,
  confidence text check (confidence in ('high', 'medium', 'low')),

  created_at timestamptz default now(),

  unique(assessment_id, subject)
);

create index if not exists idx_sp_student on public.subject_placements(student_id);

-- RLS
alter table public.subject_placements enable row level security;

create policy "Students can view own placements"
  on public.subject_placements for select
  using (student_id = auth.uid());

create policy "Teachers can view student placements"
  on public.subject_placements for select
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.subject_placements.student_id
    )
  );

-- ============================================
-- 4. MODIFY PROFILES TABLE
-- ============================================
alter table public.profiles
  add column if not exists jurisdiction text,
  add column if not exists declared_grade text,
  add column if not exists onboarding_status text default 'not_started'
    check (onboarding_status in (
      'not_started', 'in_progress', 'placement_pending',
      'placement_in_progress', 'complete'
    ));

-- ============================================
-- 5. MODIFY PLACEMENT_ASSESSMENTS TABLE
-- ============================================
alter table public.placement_assessments
  add column if not exists jurisdiction text,
  add column if not exists declared_grade text,
  add column if not exists phase text default 'warmup'
    check (phase in ('warmup', 'assessment', 'complete')),
  add column if not exists current_subject_index integer default 0,
  add column if not exists subjects_to_assess text[] default array[
    'Mathematics', 'English Language Arts', 'Science', 'Social Studies'
  ],
  add column if not exists warmup_responses jsonb default '{}'::jsonb;

-- ============================================
-- 6. COMMENTS
-- ============================================
comment on table public.assessment_questions is 'Pre-built questions for placement assessment';
comment on table public.assessment_responses is 'Individual responses during placement assessment';
comment on table public.subject_placements is 'Per-subject placement results from assessment';
comment on column public.assessment_questions.is_gateway is 'Core placement question for this grade/subject';
comment on column public.subject_placements.comfortable_grade is 'Grade level where student demonstrates 80%+ mastery';
comment on column public.subject_placements.stretch_grade is 'Grade level where student can reach with support (60-79%)';
```

**Step 2: Verify migration syntax**

Run: `cd /c/home/claude/dear-adeline/.worktrees/placement-assessment && head -50 supabase/migrations/35_placement_assessment_v2.sql`
Expected: First 50 lines of migration file displayed

**Step 3: Commit**

```bash
git add supabase/migrations/35_placement_assessment_v2.sql
git commit -m "feat(db): Add placement assessment v2 schema

- assessment_questions: Pre-built questions with gateway flags
- assessment_responses: Normalized response tracking
- subject_placements: Per-subject comfortable/stretch grades
- profiles: Add jurisdiction, declared_grade, onboarding_status
- placement_assessments: Add phase tracking and warmup_responses"
```

---

### Task 2: Seed Gateway Questions for Math (Grades 3-6)

**Files:**
- Create: `supabase/migrations/36_seed_math_gateway_questions.sql`

**Step 1: Write seed data**

```sql
-- Migration 36: Seed Math Gateway Questions (Grades 3-6)
-- Core assessment questions for initial placement

-- Grade 3 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 7 × 8?', '[{"text": "56", "isCorrect": true}, {"text": "54", "isCorrect": false}, {"text": "48", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'Mathematics', true, 20),
('multiple_choice', 'What is 45 + 38?', '[{"text": "83", "isCorrect": true}, {"text": "73", "isCorrect": false}, {"text": "93", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'Mathematics', true, 25),
('multiple_choice', 'Which fraction is larger: 1/2 or 1/4?', '[{"text": "1/2", "isCorrect": true}, {"text": "1/4", "isCorrect": false}, {"text": "They are equal", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'Mathematics', true, 20);

-- Grade 4 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 6 × 12?', '[{"text": "72", "isCorrect": true}, {"text": "66", "isCorrect": false}, {"text": "78", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'Mathematics', true, 20),
('multiple_choice', 'What is 1/4 + 1/4?', '[{"text": "1/2", "isCorrect": true}, {"text": "2/8", "isCorrect": false}, {"text": "1/8", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'Mathematics', true, 25),
('multiple_choice', 'Round 3,847 to the nearest hundred.', '[{"text": "3,800", "isCorrect": true}, {"text": "3,900", "isCorrect": false}, {"text": "4,000", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'Mathematics', true, 20);

-- Grade 5 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 3/4 + 1/2?', '[{"text": "1 1/4", "isCorrect": true}, {"text": "4/6", "isCorrect": false}, {"text": "1", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'Mathematics', true, 30),
('multiple_choice', 'What is 2.5 × 4?', '[{"text": "10", "isCorrect": true}, {"text": "8.5", "isCorrect": false}, {"text": "6.5", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'Mathematics', true, 25),
('multiple_choice', 'If a rectangle has length 8 and width 5, what is its area?', '[{"text": "40", "isCorrect": true}, {"text": "26", "isCorrect": false}, {"text": "13", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'Mathematics', true, 25);

-- Grade 6 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 2/3 ÷ 1/2?', '[{"text": "1 1/3", "isCorrect": true}, {"text": "1/3", "isCorrect": false}, {"text": "3/4", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'Mathematics', true, 35),
('multiple_choice', 'Solve for x: 3x = 18', '[{"text": "6", "isCorrect": true}, {"text": "15", "isCorrect": false}, {"text": "21", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'Mathematics', true, 30),
('multiple_choice', 'What is 25% of 80?', '[{"text": "20", "isCorrect": true}, {"text": "25", "isCorrect": false}, {"text": "40", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'Mathematics', true, 25);
```

**Step 2: Commit**

```bash
git add supabase/migrations/36_seed_math_gateway_questions.sql
git commit -m "feat(db): Seed math gateway questions for grades 3-6

12 gateway questions (3 per grade) for initial math placement"
```

---

### Task 3: Seed Gateway Questions for ELA (Grades 3-6)

**Files:**
- Create: `supabase/migrations/37_seed_ela_gateway_questions.sql`

**Step 1: Write seed data**

```sql
-- Migration 37: Seed ELA Gateway Questions (Grades 3-6)

-- Grade 3 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'Which word is a noun? "The quick brown fox jumps."', '[{"text": "fox", "isCorrect": true}, {"text": "quick", "isCorrect": false}, {"text": "jumps", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'English Language Arts', true, 20),
('multiple_choice', 'What does "enormous" mean?', '[{"text": "Very big", "isCorrect": true}, {"text": "Very small", "isCorrect": false}, {"text": "Very fast", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'English Language Arts', true, 20),
('multiple_choice', 'Which sentence is correct?', '[{"text": "She runs fast.", "isCorrect": true}, {"text": "She run fast.", "isCorrect": false}, {"text": "Her runs fast.", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'English Language Arts', true, 25);

-- Grade 4 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is the main idea of a paragraph?', '[{"text": "What the paragraph is mostly about", "isCorrect": true}, {"text": "The first sentence", "isCorrect": false}, {"text": "A small detail", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'English Language Arts', true, 25),
('multiple_choice', 'Which word is an adjective in: "The tall tree swayed"?', '[{"text": "tall", "isCorrect": true}, {"text": "tree", "isCorrect": false}, {"text": "swayed", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'English Language Arts', true, 20),
('multiple_choice', 'What is a synonym for "happy"?', '[{"text": "joyful", "isCorrect": true}, {"text": "sad", "isCorrect": false}, {"text": "angry", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'English Language Arts', true, 20);

-- Grade 5 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What does it mean to "infer" something?', '[{"text": "Figure out from clues", "isCorrect": true}, {"text": "Read out loud", "isCorrect": false}, {"text": "Copy exactly", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'English Language Arts', true, 25),
('multiple_choice', 'Which sentence uses a comma correctly?', '[{"text": "After dinner, we played games.", "isCorrect": true}, {"text": "After, dinner we played games.", "isCorrect": false}, {"text": "After dinner we, played games.", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'English Language Arts', true, 30),
('multiple_choice', 'What is the author''s purpose if they want to teach you something?', '[{"text": "To inform", "isCorrect": true}, {"text": "To entertain", "isCorrect": false}, {"text": "To persuade", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'English Language Arts', true, 25);

-- Grade 6 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is a "theme" in a story?', '[{"text": "The message or lesson", "isCorrect": true}, {"text": "The main character", "isCorrect": false}, {"text": "Where the story happens", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'English Language Arts', true, 25),
('multiple_choice', 'Which is an example of figurative language?', '[{"text": "Her smile was sunshine", "isCorrect": true}, {"text": "She smiled brightly", "isCorrect": false}, {"text": "She smiled at me", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'English Language Arts', true, 30),
('multiple_choice', 'What does "analyze" mean?', '[{"text": "Examine closely to understand", "isCorrect": true}, {"text": "Summarize briefly", "isCorrect": false}, {"text": "Write quickly", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'English Language Arts', true, 25);
```

**Step 2: Commit**

```bash
git add supabase/migrations/37_seed_ela_gateway_questions.sql
git commit -m "feat(db): Seed ELA gateway questions for grades 3-6

12 gateway questions (3 per grade) for initial ELA placement"
```

---

## Phase 2: Core Service Layer

### Task 4: Create Placement Service - Types and Setup

**Files:**
- Create: `src/lib/services/placementService.ts`

**Step 1: Write types and initialization**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/lib/services/placementService.ts
git commit -m "feat(service): Add placement service types and constants

- AssessmentQuestion, AssessmentResponse, SubjectPlacement types
- PlacementAssessment type with phase tracking
- NextAction discriminated union for algorithm output
- Constants for thresholds and limits"
```

---

### Task 5: Placement Service - Question Fetching

**Files:**
- Modify: `src/lib/services/placementService.ts`

**Step 1: Add question fetching functions**

Append to the file:

```typescript

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
```

**Step 2: Commit**

```bash
git add src/lib/services/placementService.ts
git commit -m "feat(service): Add question and response fetching functions

- getGatewayQuestions: Fetch gateway questions for subject/grade
- getQuestionById: Fetch single question
- getAssessmentResponses: Get all responses for assessment
- getSubjectResponses: Get responses filtered by subject"
```

---

### Task 6: Placement Service - Scoring

**Files:**
- Modify: `src/lib/services/placementService.ts`

**Step 1: Add scoring functions**

Append to the file:

```typescript

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
```

**Step 2: Commit**

```bash
git add src/lib/services/placementService.ts
git commit -m "feat(service): Add answer scoring functions

- scoreAnswer: Score answer based on question type (MC, fill_blank, etc.)
- calculateSuccessRate: Calculate overall success rate
- calculateGradeSuccessRate: Calculate rate at specific grade level
- Handles 'I don't know' as valid incorrect answer"
```

---

### Task 7: Placement Service - Adaptive Algorithm

**Files:**
- Modify: `src/lib/services/placementService.ts`

**Step 1: Add the adaptive algorithm**

Append to the file:

```typescript

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
```

**Step 2: Commit**

```bash
git add src/lib/services/placementService.ts
git commit -m "feat(service): Add adaptive probing algorithm

- determineNextAction: Core algorithm for adaptive assessment
- Probes up if 80%+ success, down if <50%
- Respects MAX_QUESTIONS_PER_SUBJECT (6) limit
- MAX_PROBE_LEVELS (3) grades up or down
- Friendly subject transition messages"
```

---

### Task 8: Placement Service - Placement Calculation

**Files:**
- Modify: `src/lib/services/placementService.ts`

**Step 1: Add placement calculation**

Append to the file:

```typescript

/**
 * Calculate placement for a subject based on responses
 */
export async function calculateSubjectPlacement(
  assessmentId: string,
  studentId: string,
  subject: string,
  declaredGrade: string
): Promise<SubjectPlacement> {
  const responses = await getSubjectResponses(assessmentId, subject);

  // Group by grade level
  const gradeResults: Record<string, { correct: number; total: number }> = {};

  for (const response of responses) {
    const grade = response.grade_level_tested;
    if (!gradeResults[grade]) {
      gradeResults[grade] = { correct: 0, total: 0 };
    }
    gradeResults[grade].total++;
    if (response.is_correct) {
      gradeResults[grade].correct++;
    }
  }

  // Find comfortable grade (80%+ success)
  let comfortableGrade = declaredGrade;
  let stretchGrade: string | null = null;

  const sortedGrades = Object.keys(gradeResults).sort(
    (a, b) => gradeToNumber(b) - gradeToNumber(a)
  );

  for (const grade of sortedGrades) {
    const result = gradeResults[grade];
    const rate = result.total > 0 ? result.correct / result.total : 0;

    if (rate >= MASTERY_THRESHOLD) {
      comfortableGrade = grade;
      // Check if there's a higher grade with 60%+
      const higherGrade = numberToGrade(gradeToNumber(grade) + 1);
      if (gradeResults[higherGrade]) {
        const higherRate = gradeResults[higherGrade].correct / gradeResults[higherGrade].total;
        if (higherRate >= STRETCH_THRESHOLD) {
          stretchGrade = higherGrade;
        }
      }
      break;
    } else if (rate >= STRETCH_THRESHOLD) {
      stretchGrade = grade;
    }
  }

  // Calculate totals
  const totalAsked = responses.length;
  const totalCorrect = responses.filter(r => r.is_correct).length;

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (totalAsked >= 5) {
    confidence = 'high';
  } else if (totalAsked <= 2) {
    confidence = 'low';
  }

  return {
    subject,
    declared_grade: declaredGrade,
    comfortable_grade: comfortableGrade,
    stretch_grade: stretchGrade,
    questions_asked: totalAsked,
    questions_correct: totalCorrect,
    confidence
  };
}

/**
 * Save subject placement to database
 */
export async function saveSubjectPlacement(
  assessmentId: string,
  studentId: string,
  placement: SubjectPlacement
): Promise<void> {
  const { error } = await supabase
    .from('subject_placements')
    .upsert({
      assessment_id: assessmentId,
      student_id: studentId,
      subject: placement.subject,
      declared_grade: placement.declared_grade,
      comfortable_grade: placement.comfortable_grade,
      stretch_grade: placement.stretch_grade,
      questions_asked: placement.questions_asked,
      questions_correct: placement.questions_correct,
      confidence: placement.confidence
    }, {
      onConflict: 'assessment_id,subject'
    });

  if (error) {
    console.error('Error saving subject placement:', error);
    throw error;
  }
}

/**
 * Calculate and save all subject placements for an assessment
 */
export async function finalizeAssessment(
  assessmentId: string,
  studentId: string,
  declaredGrade: string,
  subjects: string[]
): Promise<SubjectPlacement[]> {
  const placements: SubjectPlacement[] = [];

  for (const subject of subjects) {
    const placement = await calculateSubjectPlacement(
      assessmentId,
      studentId,
      subject,
      declaredGrade
    );
    await saveSubjectPlacement(assessmentId, studentId, placement);
    placements.push(placement);
  }

  // Update assessment status
  await supabase
    .from('placement_assessments')
    .update({
      status: 'completed',
      phase: 'complete',
      completed_at: new Date().toISOString()
    })
    .eq('id', assessmentId);

  return placements;
}
```

**Step 2: Commit**

```bash
git add src/lib/services/placementService.ts
git commit -m "feat(service): Add placement calculation and finalization

- calculateSubjectPlacement: Determine comfortable/stretch grades
- saveSubjectPlacement: Persist placement to database
- finalizeAssessment: Calculate all placements and mark complete
- Confidence levels based on question count"
```

---

## Phase 3: API Routes

### Task 9: Create /api/placement/start Route

**Files:**
- Modify: `src/app/api/placement/start/route.ts`

**Step 1: Rewrite the start route**

```typescript
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, jurisdiction, declared_grade')
      .eq('id', userId)
      .single();

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
    const { data: inProgressAssessment } = await supabase
      .from('placement_assessments')
      .select('*')
      .eq('student_id', userId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (inProgressAssessment) {
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
```

**Step 2: Commit**

```bash
git add src/app/api/placement/start/route.ts
git commit -m "feat(api): Rewrite /api/placement/start with service role key

- Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
- Loads jurisdiction and declared_grade from profile
- Returns warmup phase for new assessments
- Handles resume of in-progress assessments"
```

---

### Task 10: Create /api/placement/warmup Route

**Files:**
- Create: `src/app/api/placement/warmup/route.ts`

**Step 1: Write the warmup route**

```typescript
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

    if (fetchError || !assessment) {
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
      await supabase
        .from('placement_assessments')
        .update({
          warmup_responses: warmupResponses,
          phase: 'assessment'
        })
        .eq('id', assessmentId);

      return NextResponse.json({
        warmupComplete: true,
        transition: true,
        message: "Awesome! Now I'll show you a few questions so I know where to start. This isn't a test - just say \"I don't know\" if you're not sure!"
      });
    }

    // Update warmup responses and return next question
    await supabase
      .from('placement_assessments')
      .update({ warmup_responses: warmupResponses })
      .eq('id', assessmentId);

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
```

**Step 2: Commit**

```bash
git add src/app/api/placement/warmup/route.ts
git commit -m "feat(api): Add /api/placement/warmup route

- Three warmup questions: interests, learning style, subjects
- Stores responses in warmup_responses JSON
- Transitions to assessment phase when complete"
```

---

### Task 11: Create /api/placement/question Route

**Files:**
- Create: `src/app/api/placement/question/route.ts`

**Step 1: Write the question route**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { determineNextAction, getGatewayQuestions } from '@/lib/services/placementService';

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
```

**Step 2: Commit**

```bash
git add src/app/api/placement/question/route.ts
git commit -m "feat(api): Add /api/placement/question route

- Uses determineNextAction from placement service
- Returns next question or transition/complete signals
- Updates current_subject_index on transitions"
```

---

### Task 12: Create /api/placement/answer Route

**Files:**
- Create: `src/app/api/placement/answer/route.ts`

**Step 1: Write the answer route**

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scoreAnswer, getQuestionById } from '@/lib/services/placementService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { assessmentId, questionId, answer, gradeLevel, isProbeUp, isProbeDown, timeSpent } = await req.json();

    if (!assessmentId || !questionId || answer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the question
    const question = await getQuestionById(questionId);
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Score the answer
    const { isCorrect } = scoreAnswer(question, answer);

    // Store the response
    const { error: insertError } = await supabase
      .from('assessment_responses')
      .insert({
        assessment_id: assessmentId,
        question_id: questionId,
        student_answer: answer,
        is_correct: isCorrect,
        time_spent_seconds: timeSpent || null,
        grade_level_tested: gradeLevel || question.grade_level,
        was_probe_up: isProbeUp || false,
        was_probe_down: isProbeDown || false
      });

    if (insertError) {
      console.error('Error storing response:', insertError);
      return NextResponse.json({ error: 'Failed to store response' }, { status: 500 });
    }

    // Return success (don't reveal correct/incorrect to frontend for UX reasons)
    return NextResponse.json({
      recorded: true,
      // Note: We intentionally don't return isCorrect to maintain friendly UX
    });

  } catch (error: any) {
    console.error('Error recording answer:', error);
    return NextResponse.json(
      { error: 'Failed to record answer', details: error.message },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/placement/answer/route.ts
git commit -m "feat(api): Add /api/placement/answer route

- Scores answer using placementService
- Stores response in assessment_responses table
- Tracks grade_level_tested and probe direction
- Intentionally hides isCorrect from response for friendly UX"
```

---

### Task 13: Create /api/placement/complete Route

**Files:**
- Create: `src/app/api/placement/complete/route.ts`

**Step 1: Write the complete route**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/app/api/placement/complete/route.ts
git commit -m "feat(api): Add /api/placement/complete route

- Calls finalizeAssessment to calculate all placements
- Generates friendly summary message
- Returns placements for frontend display"
```

---

## Phase 4: Frontend Components

### Task 14: Create MultipleChoice Component

**Files:**
- Create: `src/components/placement/MultipleChoice.tsx`

**Step 1: Write the component**

```typescript
'use client';

import { useState } from 'react';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceProps {
  prompt: string;
  options: Option[];
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export function MultipleChoice({ prompt, options, onAnswer, disabled }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (disabled) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (selected) {
      onAnswer(selected);
      setSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">{prompt}</p>

      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option.text)}
            disabled={disabled}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
              selected === option.text
                ? 'border-[var(--forest)] bg-[var(--forest)]/10'
                : 'border-gray-200 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === option.text
                  ? 'border-[var(--forest)] bg-[var(--forest)]'
                  : 'border-gray-300'
              }`}>
                {selected === option.text && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>
              <span>{option.text}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected || disabled}
        className="w-full py-3 px-4 bg-[var(--forest)] text-white rounded-lg font-medium hover:bg-[var(--forest-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/placement/MultipleChoice.tsx
git commit -m "feat(ui): Add MultipleChoice component for placement assessment

- Radio-style selection with visual feedback
- Disabled state for loading
- Calls onAnswer when submitted"
```

---

### Task 15: Create ProgressIndicator Component

**Files:**
- Create: `src/components/placement/ProgressIndicator.tsx`

**Step 1: Write the component**

```typescript
'use client';

import { CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  subjects: string[];
  currentIndex: number;
  completedCount: number;
}

export function ProgressIndicator({ subjects, currentIndex, completedCount }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 rounded-lg">
      {subjects.map((subject, index) => {
        const isComplete = index < completedCount;
        const isCurrent = index === currentIndex;

        // Shorten subject names for display
        const shortName = subject
          .replace('English Language Arts', 'Reading')
          .replace('Mathematics', 'Math')
          .replace('Social Studies', 'Social');

        return (
          <div
            key={subject}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
              isComplete
                ? 'bg-green-100 text-green-700'
                : isCurrent
                  ? 'bg-[var(--forest)]/10 text-[var(--forest)] font-medium'
                  : 'text-gray-400'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${
                isCurrent ? 'bg-[var(--forest)]' : 'bg-gray-300'
              }`} />
            )}
            <span>{shortName}</span>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/placement/ProgressIndicator.tsx
git commit -m "feat(ui): Add ProgressIndicator component

- Shows subjects with completion status
- No scores displayed (per UX requirements)
- Highlights current subject"
```

---

### Task 16: Rewrite PlacementAssessment Main Component

**Files:**
- Modify: `src/components/PlacementAssessment.tsx`

**Step 1: Rewrite the component**

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { MultipleChoice } from './placement/MultipleChoice';
import { ProgressIndicator } from './placement/ProgressIndicator';

interface PlacementAssessmentProps {
  userId: string;
  onComplete: (report: any) => void;
}

type Phase = 'loading' | 'warmup' | 'transition' | 'assessment' | 'complete';

interface Question {
  id: string;
  type: string;
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  subject: string;
  estimatedSeconds: number;
}

export function PlacementAssessment({ userId, onComplete }: PlacementAssessmentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [warmupKey, setWarmupKey] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [completedSubjects, setCompletedSubjects] = useState(0);
  const [gradeLevel, setGradeLevel] = useState('');
  const [isProbeUp, setIsProbeUp] = useState(false);
  const [isProbeDown, setIsProbeDown] = useState(false);
  const questionStartTime = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message, currentQuestion]);

  useEffect(() => {
    startAssessment();
  }, [userId]);

  const startAssessment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/placement/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();

      if (data.alreadyCompleted) {
        const reportResponse = await fetch(`/api/placement/report?userId=${userId}`);
        const report = await reportResponse.json();
        onComplete(report);
        return;
      }

      setAssessmentId(data.assessmentId);
      setSubjects(data.subjects || ['Mathematics', 'English Language Arts', 'Science', 'Social Studies']);

      if (data.phase === 'warmup' || !data.warmupComplete) {
        setPhase('warmup');
        setMessage(data.firstMessage);
        // Fetch first warmup question key
        const warmupResponse = await fetch('/api/placement/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessmentId: data.assessmentId })
        });
        const warmupData = await warmupResponse.json();
        setWarmupKey(warmupData.questionKey);
      } else {
        setPhase('assessment');
        await fetchNextQuestion(data.assessmentId);
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      setMessage("Sorry, I'm having trouble starting. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWarmupResponse = async () => {
    if (!input.trim() || !assessmentId || !warmupKey) return;

    setIsLoading(true);
    const userResponse = input.trim();
    setInput('');

    try {
      const response = await fetch('/api/placement/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionKey: warmupKey,
          response: userResponse
        })
      });

      const data = await response.json();

      if (data.warmupComplete) {
        setPhase('transition');
        setMessage(data.message);
        setTimeout(() => {
          setPhase('assessment');
          fetchNextQuestion(assessmentId);
        }, 2000);
      } else {
        setMessage(data.question);
        setWarmupKey(data.questionKey);
      }
    } catch (error) {
      console.error('Error in warmup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async (aId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/placement/question?assessmentId=${aId}`);
      const data = await response.json();

      if (data.complete) {
        await completeAssessment(aId);
        return;
      }

      if (data.transition) {
        setMessage(data.message);
        setCompletedSubjects(prev => prev + 1);
        setSubjectIndex(prev => prev + 1);
        setTimeout(() => fetchNextQuestion(aId), 1500);
        return;
      }

      setCurrentQuestion(data.question);
      setGradeLevel(data.gradeLevel);
      setIsProbeUp(data.isProbeUp);
      setIsProbeDown(data.isProbeDown);
      setSubjectIndex(data.subjectIndex);
      questionStartTime.current = Date.now();
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!assessmentId || !currentQuestion) return;

    setIsLoading(true);
    const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);

    try {
      await fetch('/api/placement/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          questionId: currentQuestion.id,
          answer,
          gradeLevel,
          isProbeUp,
          isProbeDown,
          timeSpent
        })
      });

      setCurrentQuestion(null);
      await fetchNextQuestion(assessmentId);
    } catch (error) {
      console.error('Error recording answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeAssessment = async (aId: string) => {
    try {
      const response = await fetch('/api/placement/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: aId })
      });

      const data = await response.json();
      setPhase('complete');
      setMessage(data.message);
      setCompletedSubjects(subjects.length);

      setTimeout(() => {
        onComplete(data.placements);
      }, 2000);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleWarmupResponse();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg border-2 border-[var(--forest)] shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-[var(--forest)] text-white rounded-t-lg flex items-center gap-3">
        <Sparkles className="w-5 h-5" />
        <div>
          <h3 className="font-semibold text-lg">Getting to Know You</h3>
          <p className="text-sm text-white/80">This helps me understand where to start</p>
        </div>
      </div>

      {/* Progress (only show in assessment phase) */}
      {(phase === 'assessment' || phase === 'complete') && subjects.length > 0 && (
        <ProgressIndicator
          subjects={subjects}
          currentIndex={subjectIndex}
          completedCount={completedSubjects}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {phase === 'loading' && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--forest)]" />
          </div>
        )}

        {(phase === 'warmup' || phase === 'transition') && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
              <p className="whitespace-pre-wrap">{message}</p>
            </div>
          </div>
        )}

        {phase === 'assessment' && currentQuestion && (
          <MultipleChoice
            prompt={currentQuestion.prompt}
            options={currentQuestion.options}
            onAnswer={handleAnswer}
            disabled={isLoading}
          />
        )}

        {phase === 'assessment' && !currentQuestion && isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading next question...</span>
          </div>
        )}

        {phase === 'complete' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-50 border-2 border-green-500 text-green-900 rounded-2xl px-6 py-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold">Assessment Complete!</p>
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input (only for warmup phase) */}
      {phase === 'warmup' && (
        <div className="p-4 border-t-2 border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[var(--forest)] disabled:bg-gray-100"
            />
            <button
              onClick={handleWarmupResponse}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-[var(--forest)] text-white rounded-lg hover:bg-[var(--forest-dark)] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This isn&apos;t a test - there are no wrong answers here!
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/PlacementAssessment.tsx
git commit -m "feat(ui): Rewrite PlacementAssessment with full adaptive flow

- Three phases: warmup, assessment, complete
- Integrates MultipleChoice and ProgressIndicator
- Tracks time spent per question
- Handles transitions between subjects
- Friendly completion message"
```

---

## Phase 5: Integration & Testing

### Task 17: Manual Testing Checklist

**No code changes - testing instructions**

**Step 1: Apply migrations**

```bash
# In the worktree, run migrations against your Supabase instance
cd /c/home/claude/dear-adeline/.worktrees/placement-assessment
# Use your preferred method to apply migrations
```

**Step 2: Test the flow manually**

1. Create a test user or use existing account
2. Navigate to onboarding flow (where PlacementAssessment is embedded)
3. Verify:
   - [ ] Warmup phase asks 3 conversational questions
   - [ ] Transition message appears after warmup
   - [ ] First math question appears
   - [ ] Answering questions advances through subject
   - [ ] Progress indicator updates correctly
   - [ ] Subject transitions have friendly messages
   - [ ] Completion shows summary message
   - [ ] No scores are shown to the student

**Step 3: Verify database**

```sql
-- Check assessment was created
SELECT * FROM placement_assessments WHERE student_id = '<test-user-id>';

-- Check responses were recorded
SELECT * FROM assessment_responses WHERE assessment_id = '<assessment-id>';

-- Check placements were calculated
SELECT * FROM subject_placements WHERE assessment_id = '<assessment-id>';
```

---

### Task 18: Create Integration Test

**Files:**
- Create: `src/lib/services/__tests__/placementService.test.ts`

**Step 1: Write the test file**

```typescript
import {
  scoreAnswer,
  calculateSuccessRate,
  calculateGradeSuccessRate,
  AssessmentQuestion,
  AssessmentResponse
} from '../placementService';

describe('placementService', () => {
  describe('scoreAnswer', () => {
    it('scores multiple choice correctly', () => {
      const question: AssessmentQuestion = {
        id: '1',
        skill_id: null,
        standard_id: null,
        question_type: 'multiple_choice',
        prompt: 'What is 2 + 2?',
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false }
        ],
        correct_answer: null,
        activity_config: null,
        grade_level: '3',
        subject: 'Mathematics',
        is_gateway: true,
        difficulty_weight: 5,
        estimated_seconds: 20
      };

      expect(scoreAnswer(question, '4').isCorrect).toBe(true);
      expect(scoreAnswer(question, '3').isCorrect).toBe(false);
      expect(scoreAnswer(question, "I don't know").isCorrect).toBe(false);
    });

    it('handles fill in the blank', () => {
      const question: AssessmentQuestion = {
        id: '2',
        skill_id: null,
        standard_id: null,
        question_type: 'fill_blank',
        prompt: 'The capital of France is ___',
        options: null,
        correct_answer: 'Paris',
        activity_config: null,
        grade_level: '4',
        subject: 'Social Studies',
        is_gateway: false,
        difficulty_weight: 5,
        estimated_seconds: 25
      };

      expect(scoreAnswer(question, 'Paris').isCorrect).toBe(true);
      expect(scoreAnswer(question, 'paris').isCorrect).toBe(true); // case insensitive
      expect(scoreAnswer(question, 'London').isCorrect).toBe(false);
    });
  });

  describe('calculateSuccessRate', () => {
    it('calculates rate correctly', () => {
      const responses: Partial<AssessmentResponse>[] = [
        { is_correct: true },
        { is_correct: true },
        { is_correct: false },
        { is_correct: true }
      ];

      expect(calculateSuccessRate(responses as AssessmentResponse[])).toBe(0.75);
    });

    it('handles empty responses', () => {
      expect(calculateSuccessRate([])).toBe(0);
    });
  });

  describe('calculateGradeSuccessRate', () => {
    it('filters by grade level', () => {
      const responses: Partial<AssessmentResponse>[] = [
        { is_correct: true, grade_level_tested: '5' },
        { is_correct: true, grade_level_tested: '5' },
        { is_correct: false, grade_level_tested: '6' },
        { is_correct: true, grade_level_tested: '6' }
      ];

      const grade5 = calculateGradeSuccessRate(responses as AssessmentResponse[], '5');
      expect(grade5.rate).toBe(1); // 2/2 = 100%
      expect(grade5.total).toBe(2);

      const grade6 = calculateGradeSuccessRate(responses as AssessmentResponse[], '6');
      expect(grade6.rate).toBe(0.5); // 1/2 = 50%
      expect(grade6.total).toBe(2);
    });
  });
});
```

**Step 2: Run tests**

```bash
npm test -- --testPathPattern=placementService
```

**Step 3: Commit**

```bash
git add src/lib/services/__tests__/placementService.test.ts
git commit -m "test: Add unit tests for placement service

- scoreAnswer tests for multiple choice and fill_blank
- calculateSuccessRate tests
- calculateGradeSuccessRate tests with grade filtering"
```

---

## Summary

**Total Tasks:** 18

**Phase 1 (Database):** Tasks 1-3
- Migration for new tables
- Seed math gateway questions
- Seed ELA gateway questions

**Phase 2 (Service Layer):** Tasks 4-8
- Types and constants
- Question fetching
- Scoring functions
- Adaptive algorithm
- Placement calculation

**Phase 3 (API Routes):** Tasks 9-13
- /api/placement/start
- /api/placement/warmup
- /api/placement/question
- /api/placement/answer
- /api/placement/complete

**Phase 4 (Frontend):** Tasks 14-16
- MultipleChoice component
- ProgressIndicator component
- Main PlacementAssessment rewrite

**Phase 5 (Testing):** Tasks 17-18
- Manual testing checklist
- Unit tests for service

---

## Future Tasks (Not in This Plan)

- Seed questions for Science and Social Studies
- Seed questions for grades 7-12 and K-2
- Add fill_blank and drag_sort UI components
- Parent report generation
- Adeline memory integration
- Skill levels population from placements
- Learning plan generation
