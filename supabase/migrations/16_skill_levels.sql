-- Migration 16: Skill Levels
-- Track detailed skill mastery levels for each student

-- ============================================
-- SKILL LEVELS TABLE
-- ============================================
create table public.skill_levels (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  level text check (level in ('not_introduced', 'needs_instruction', 'competent', 'mastered')) default 'not_introduced',
  attempts int default 0,
  successes int default 0,
  last_attempted timestamp with time zone,
  mastery_date timestamp with time zone,
  evidence jsonb default '[]'::jsonb, -- Array of evidence: photos, responses, portfolio items, etc.
  notes text, -- Additional notes from teacher or system
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, skill_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.skill_levels enable row level security;

-- Students can view their own skill levels
create policy "Students can view own skill levels"
  on public.skill_levels
  for select
  using (student_id = auth.uid());

-- Teachers can view their students' skill levels
create policy "Teachers can view student skill levels"
  on public.skill_levels
  for select
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and student_id = public.skill_levels.student_id
    )
  );

-- System (authenticated users) can update skill levels through API
create policy "Authenticated users can update skill levels"
  on public.skill_levels
  for all
  using (auth.uid() is not null);

-- ============================================
-- TRIGGERS
-- ============================================
create trigger update_skill_levels_updated_at
  before update on public.skill_levels
  for each row
  execute procedure public.update_updated_at_column();

-- Automatically set mastery_date when level changes to 'mastered'
create or replace function public.set_mastery_date()
returns trigger as $$
begin
  if NEW.level = 'mastered' and OLD.level != 'mastered' then
    NEW.mastery_date = now();
  elsif NEW.level != 'mastered' then
    NEW.mastery_date = null;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger set_mastery_date_trigger
  before update on public.skill_levels
  for each row
  execute procedure public.set_mastery_date();

-- ============================================
-- INDEXES
-- ============================================
create index idx_skill_levels_student_id
  on public.skill_levels(student_id);

create index idx_skill_levels_skill_id
  on public.skill_levels(skill_id);

create index idx_skill_levels_level
  on public.skill_levels(level);

create index idx_skill_levels_student_skill
  on public.skill_levels(student_id, skill_id);

-- ============================================
-- COMMENTS
-- ============================================
comment on table public.skill_levels is
  'Tracks detailed mastery levels for each student-skill combination';

comment on column public.skill_levels.level is
  'Mastery level: not_introduced (never seen), needs_instruction (struggling), competent (working on it), mastered (solid)';

comment on column public.skill_levels.attempts is
  'Number of times student has attempted this skill';

comment on column public.skill_levels.successes is
  'Number of successful completions of this skill';

comment on column public.skill_levels.evidence is
  'JSON array of evidence items (photos, portfolio entries, conversation snippets)';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update skill level based on performance
create or replace function public.update_skill_level(
  p_student_id uuid,
  p_skill_id uuid,
  p_success boolean,
  p_evidence jsonb default null
)
returns void as $$
declare
  v_current_level text;
  v_attempts int;
  v_successes int;
  v_new_level text;
begin
  -- Get current stats or initialize
  select level, attempts, successes
  into v_current_level, v_attempts, v_successes
  from public.skill_levels
  where student_id = p_student_id and skill_id = p_skill_id;

  if not found then
    v_current_level := 'not_introduced';
    v_attempts := 0;
    v_successes := 0;
  end if;

  -- Update counts
  v_attempts := v_attempts + 1;
  if p_success then
    v_successes := v_successes + 1;
  end if;

  -- Determine new level based on success rate
  if v_attempts >= 3 then
    if v_successes::decimal / v_attempts >= 0.9 then
      v_new_level := 'mastered';
    elsif v_successes::decimal / v_attempts >= 0.7 then
      v_new_level := 'competent';
    elsif v_successes::decimal / v_attempts >= 0.3 then
      v_new_level := 'needs_instruction';
    else
      v_new_level := 'needs_instruction';
    end if;
  elsif v_attempts > 0 then
    if p_success then
      v_new_level := 'competent';
    else
      v_new_level := 'needs_instruction';
    end if;
  else
    v_new_level := 'not_introduced';
  end if;

  -- Upsert skill level
  insert into public.skill_levels (
    student_id,
    skill_id,
    level,
    attempts,
    successes,
    last_attempted,
    evidence
  )
  values (
    p_student_id,
    p_skill_id,
    v_new_level,
    v_attempts,
    v_successes,
    now(),
    coalesce(p_evidence, '[]'::jsonb)
  )
  on conflict (student_id, skill_id)
  do update set
    level = v_new_level,
    attempts = v_attempts,
    successes = v_successes,
    last_attempted = now(),
    evidence = case
      when p_evidence is not null then
        public.skill_levels.evidence || p_evidence
      else
        public.skill_levels.evidence
    end,
    updated_at = now();
end;
$$ language plpgsql security definer;

comment on function public.update_skill_level is
  'Updates a student''s skill level based on attempt success. Automatically calculates new level based on success rate.';
