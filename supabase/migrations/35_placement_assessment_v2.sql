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
