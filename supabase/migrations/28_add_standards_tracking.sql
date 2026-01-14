-- Migration: Add State Standards Tracking
-- This enables granular tracking of state standard codes and their relationship to skills and learning gaps

-- ============================================
-- 1. STATE STANDARDS TABLE
-- ============================================
-- Stores official state standard codes with metadata
create table public.state_standards (
  id uuid default uuid_generate_v4() primary key,

  -- Standard Identification
  standard_code text not null,           -- e.g., "OK.MATH.8.A.1.3" or "CCSS.MATH.8.NS.A.1"
  jurisdiction text not null,            -- e.g., "Oklahoma", "Multi-State" (for CCSS)
  subject text not null,                 -- e.g., "Mathematics", "English Language Arts"
  grade_level text not null,             -- e.g., "8", "9-12", "K-2"

  -- Standard Content
  statement_text text not null,          -- The official standard statement
  description text,                      -- Additional context or explanation

  -- CASE Framework Integration
  case_identifier_uuid text,             -- UUID from CASE framework API for progression tracking

  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Unique constraint on standard code per jurisdiction
  unique(standard_code, jurisdiction)
);

-- Index for fast lookups
create index idx_state_standards_code on public.state_standards(standard_code);
create index idx_state_standards_jurisdiction on public.state_standards(jurisdiction);
create index idx_state_standards_grade on public.state_standards(grade_level);


-- ============================================
-- 2. LEARNING COMPONENTS TABLE
-- ============================================
-- Stores granular sub-skills within each standard
create table public.learning_components (
  id uuid default uuid_generate_v4() primary key,

  -- Link to parent standard
  standard_id uuid references public.state_standards(id) on delete cascade,

  -- Component Details
  component_text text not null,          -- Specific learning component
  component_order integer,               -- Order within the standard

  -- CASE Framework Integration
  case_identifier_uuid text,             -- UUID from CASE framework API

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_learning_components_standard on public.learning_components(standard_id);


-- ============================================
-- 3. SKILL-STANDARD MAPPING TABLE
-- ============================================
-- Maps Dear Adeline skills to state standards
create table public.skill_standard_mappings (
  id uuid default uuid_generate_v4() primary key,

  skill_id uuid references public.skills(id) on delete cascade not null,
  standard_id uuid references public.state_standards(id) on delete cascade not null,

  -- Mapping Details
  alignment_strength text check (alignment_strength in ('full', 'partial', 'related')) default 'full',
  notes text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(skill_id, standard_id)
);

create index idx_skill_standard_mappings_skill on public.skill_standard_mappings(skill_id);
create index idx_skill_standard_mappings_standard on public.skill_standard_mappings(standard_id);


-- ============================================
-- 4. STUDENT STANDARDS PROGRESS TABLE
-- ============================================
-- Tracks which standards each student has demonstrated
create table public.student_standards_progress (
  id uuid default uuid_generate_v4() primary key,

  student_id uuid references public.profiles(id) on delete cascade not null,
  standard_id uuid references public.state_standards(id) on delete cascade not null,

  -- Progress Tracking
  mastery_level text check (mastery_level in ('introduced', 'developing', 'proficient', 'mastered')) default 'introduced',
  demonstrated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Evidence
  source_type text check (source_type in ('activity_log', 'ai_lesson', 'library_project', 'manual', 'assessment')),
  source_id uuid,
  evidence_notes text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(student_id, standard_id)
);

create index idx_student_standards_progress_student on public.student_standards_progress(student_id);
create index idx_student_standards_progress_standard on public.student_standards_progress(standard_id);
create index idx_student_standards_progress_mastery on public.student_standards_progress(mastery_level);


-- ============================================
-- 5. UPDATE LEARNING GAPS TABLE
-- ============================================
-- Add standard_id to learning_gaps to link gaps to specific standards
alter table public.learning_gaps
  add column standard_id uuid references public.state_standards(id) on delete set null;

create index idx_learning_gaps_standard on public.learning_gaps(standard_id);


-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================
alter table public.state_standards enable row level security;
alter table public.learning_components enable row level security;
alter table public.skill_standard_mappings enable row level security;
alter table public.student_standards_progress enable row level security;

-- Public read access for standards and components
create policy "Anyone can view state standards" on public.state_standards
  for select using (true);

create policy "Anyone can view learning components" on public.learning_components
  for select using (true);

create policy "Anyone can view skill-standard mappings" on public.skill_standard_mappings
  for select using (true);

-- Student standards progress policies
create policy "Students can view own standards progress" on public.student_standards_progress
  for select using (student_id = auth.uid());

create policy "Teachers can view their students standards progress" on public.student_standards_progress
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.student_standards_progress.student_id
    )
  );

-- Insert/update policies for standards progress
create policy "System can insert standards progress" on public.student_standards_progress
  for insert with check (true);

create policy "System can update standards progress" on public.student_standards_progress
  for update using (true);


-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to update student standards progress when a skill is earned
create or replace function update_student_standards_progress()
returns trigger as $$
declare
  v_standard_id uuid;
  v_existing_mastery text;
begin
  -- Find all standards mapped to this skill
  for v_standard_id in
    select standard_id
    from public.skill_standard_mappings
    where skill_id = NEW.skill_id
  loop
    -- Check if student already has progress for this standard
    select mastery_level into v_existing_mastery
    from public.student_standards_progress
    where student_id = NEW.student_id and standard_id = v_standard_id;

    if v_existing_mastery is null then
      -- First time demonstrating this standard
      insert into public.student_standards_progress (
        student_id, standard_id, mastery_level, source_type, source_id, demonstrated_at
      ) values (
        NEW.student_id, v_standard_id, 'developing', NEW.source_type, NEW.source_id, NEW.earned_at
      );
    elsif v_existing_mastery = 'introduced' then
      -- Upgrade to developing
      update public.student_standards_progress
      set mastery_level = 'developing',
          source_type = NEW.source_type,
          source_id = NEW.source_id,
          updated_at = NEW.earned_at
      where student_id = NEW.student_id and standard_id = v_standard_id;
    elsif v_existing_mastery = 'developing' then
      -- Upgrade to proficient
      update public.student_standards_progress
      set mastery_level = 'proficient',
          source_type = NEW.source_type,
          source_id = NEW.source_id,
          updated_at = NEW.earned_at
      where student_id = NEW.student_id and standard_id = v_standard_id;
    elsif v_existing_mastery = 'proficient' then
      -- Upgrade to mastered
      update public.student_standards_progress
      set mastery_level = 'mastered',
          source_type = NEW.source_type,
          source_id = NEW.source_id,
          updated_at = NEW.earned_at
      where student_id = NEW.student_id and standard_id = v_standard_id;
    end if;
  end loop;

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to update standards progress when skills are earned
create trigger on_student_skill_earned
  after insert on public.student_skills
  for each row
  execute function update_student_standards_progress();


-- ============================================
-- 8. COMMENTS
-- ============================================
comment on table public.state_standards is 'Official state education standards with CASE framework integration';
comment on table public.learning_components is 'Granular learning objectives within each standard';
comment on table public.skill_standard_mappings is 'Maps Dear Adeline skills to state standards';
comment on table public.student_standards_progress is 'Tracks student progress on state standards';
comment on column public.learning_gaps.standard_id is 'Links learning gap to specific state standard';
