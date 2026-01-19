-- Migration 15: Placement Assessments
-- Conversational placement assessment system for new students

-- ============================================
-- PLACEMENT ASSESSMENTS TABLE
-- ============================================
create table public.placement_assessments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('in_progress', 'completed')) default 'in_progress',
  current_subject text, -- math, reading, science, hebrew, etc.
  responses jsonb default '{}'::jsonb, -- Q&A pairs from conversation
  skill_evaluations jsonb default '[]'::jsonb, -- [{skill_id, skill_name, level, evidence}]
  learning_profile jsonb default '{}'::jsonb, -- {style, pace, interests, needsBreaksWhenStuck}
  recommendations jsonb default '{}'::jsonb, -- {startingPoint, criticalGaps, strengths}
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.placement_assessments enable row level security;

-- Students can view and update their own assessments
create policy "Students can manage own assessments"
  on public.placement_assessments
  for all
  using (student_id = auth.uid());

-- Teachers can view their students' assessments
create policy "Teachers can view student assessments"
  on public.placement_assessments
  for select
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and student_id = public.placement_assessments.student_id
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
create trigger update_placement_assessments_updated_at
  before update on public.placement_assessments
  for each row
  execute procedure public.update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
create index idx_placement_assessments_student_id
  on public.placement_assessments(student_id);

create index idx_placement_assessments_status
  on public.placement_assessments(status);

-- ============================================
-- COMMENTS
-- ============================================
comment on table public.placement_assessments is
  'Conversational placement assessments conducted by Adeline for new students';

comment on column public.placement_assessments.responses is
  'JSON object storing Q&A pairs from the assessment conversation';

comment on column public.placement_assessments.skill_evaluations is
  'Array of skill evaluations with level (not_introduced, needs_instruction, competent, mastered)';

comment on column public.placement_assessments.learning_profile is
  'Student learning style, pace, interests discovered during assessment';

comment on column public.placement_assessments.recommendations is
  'Adeline''s recommendations for starting point and critical gaps to address';
