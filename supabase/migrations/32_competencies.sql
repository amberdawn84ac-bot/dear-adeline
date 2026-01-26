-- Migration 18: Real-World Competencies
-- Track what students can actually DO, not just standards met

-- ============================================
-- COMPETENCIES TABLE
-- ============================================
create table public.competencies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text not null, -- math, science, writing, practical, etc.
  real_world_applications text[] default array[]::text[],
  demonstration_examples text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- COMPETENCY-SKILLS MAPPING
-- ============================================
create table public.competency_skills_map (
  id uuid default gen_random_uuid() primary key,
  competency_id uuid references public.competencies(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  weight decimal(3,2) default 1.0 check (weight >= 0 and weight <= 1), -- How much this skill contributes (0.0-1.0)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(competency_id, skill_id)
);

-- ============================================
-- STUDENT COMPETENCIES
-- ============================================
create table public.student_competencies (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  competency_id uuid references public.competencies(id) on delete cascade not null,
  status text check (status in ('not_started', 'developing', 'competent', 'advanced')) default 'not_started',
  evidence jsonb default '[]'::jsonb, -- Array of portfolio items, photos, project links, etc.
  last_demonstrated timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, competency_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.competencies enable row level security;
alter table public.competency_skills_map enable row level security;
alter table public.student_competencies enable row level security;

-- Anyone can view competencies (they're curriculum definitions)
create policy "Anyone can view competencies"
  on public.competencies
  for select
  using (true);

-- Anyone can view competency-skill mappings
create policy "Anyone can view competency mappings"
  on public.competency_skills_map
  for select
  using (true);

-- Students can view their own competencies
create policy "Students can view own competencies"
  on public.student_competencies
  for select
  using (student_id = auth.uid());

-- Teachers can view their students' competencies
create policy "Teachers can view student competencies"
  on public.student_competencies
  for select
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and student_id = public.student_competencies.student_id
    )
  );

-- System can update competencies
create policy "System can update competencies"
  on public.student_competencies
  for all
  using (auth.uid() is not null);

-- ============================================
-- TRIGGERS
-- ============================================
create trigger update_student_competencies_updated_at
  before update on public.student_competencies
  for each row
  execute procedure public.update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
create index idx_competencies_category
  on public.competencies(category);

create index idx_competency_skills_map_competency_id
  on public.competency_skills_map(competency_id);

create index idx_competency_skills_map_skill_id
  on public.competency_skills_map(skill_id);

create index idx_student_competencies_student_id
  on public.student_competencies(student_id);

create index idx_student_competencies_status
  on public.student_competencies(status);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update student competency progress based on skill mastery
create or replace function public.update_competency_progress(
  p_student_id uuid,
  p_competency_id uuid
)
returns void as $$
declare
  v_total_weight decimal;
  v_earned_weight decimal;
  v_percentage decimal;
  v_new_status text;
begin
  -- Get total weight of all skills for this competency
  select coalesce(sum(weight), 0)
  into v_total_weight
  from public.competency_skills_map
  where competency_id = p_competency_id;

  if v_total_weight = 0 then
    return; -- No skills mapped, nothing to do
  end if;

  -- Get weight of mastered skills
  select coalesce(sum(csm.weight), 0)
  into v_earned_weight
  from public.competency_skills_map csm
  join public.skill_levels sl on sl.skill_id = csm.skill_id
  where csm.competency_id = p_competency_id
    and sl.student_id = p_student_id
    and sl.level = 'mastered';

  -- Calculate percentage
  v_percentage := v_earned_weight / v_total_weight;

  -- Determine status
  if v_percentage = 0 then
    v_new_status := 'not_started';
  elsif v_percentage > 0 and v_percentage < 0.5 then
    v_new_status := 'developing';
  elsif v_percentage >= 0.5 and v_percentage < 0.8 then
    v_new_status := 'competent';
  else
    v_new_status := 'advanced';
  end if;

  -- Upsert student competency
  insert into public.student_competencies (
    student_id,
    competency_id,
    status,
    last_demonstrated
  )
  values (
    p_student_id,
    p_competency_id,
    v_new_status,
    now()
  )
  on conflict (student_id, competency_id)
  do update set
    status = v_new_status,
    last_demonstrated = now(),
    updated_at = now();
end;
$$ language plpgsql security definer;

comment on function public.update_competency_progress is
  'Updates a student''s competency status based on their skill mastery levels';

-- Trigger to auto-update competencies when skill_levels change
create or replace function public.trigger_update_competencies()
returns trigger as $$
begin
  -- Find all competencies that use this skill
  perform public.update_competency_progress(
    NEW.student_id,
    csm.competency_id
  )
  from public.competency_skills_map csm
  where csm.skill_id = NEW.skill_id;

  return NEW;
end;
$$ language plpgsql;

create trigger skill_level_update_competencies
  after insert or update on public.skill_levels
  for each row
  execute procedure public.trigger_update_competencies();

-- ============================================
-- SEED DATA - Example Competencies
-- ============================================

-- Math Competency: Calculate materials for construction
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Calculate Materials for Construction Projects',
 'Determine quantities, measurements, and costs for building projects using fractions, geometry, and unit conversion',
 'math',
 array['Building greenhouse', 'Chicken coop design', 'Garden bed layout', 'Fence construction'],
 array['Calculated board lengths for frame', 'Determined concrete volume needed', 'Estimated costs within 10% accuracy', 'Created material list with quantities']
);

-- Science Competency: Plant biology
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Understand and Apply Plant Biology',
 'Knowledge of photosynthesis, growth cycles, soil science, and plant care for food production',
 'science',
 array['Growing vegetables', 'Greenhouse management', 'Permaculture design', 'Composting'],
 array['Explained photosynthesis process', 'Optimized light/water conditions', 'Documented plant growth experiment', 'Identified nutrient deficiencies']
);

-- Writing Competency: Process documentation
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Document Processes with Writing and Photos',
 'Create clear instructions and documentation for projects using photos, captions, and step-by-step writing',
 'writing',
 array['Building instructions', 'Recipe documentation', 'Science experiment reports', 'How-to guides'],
 array['Wrote step-by-step greenhouse build guide', 'Created photo journal of project', 'Documented experiment with photos and captions', 'Published tutorial online']
);

-- Practical Competency: Scientific method
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Apply Scientific Method to Real Problems',
 'Design experiments, collect data, analyze results, and draw conclusions to solve real-world problems',
 'science',
 array['Testing soil amendments', 'Comparing plant growth conditions', 'Optimizing recipes', 'Troubleshooting systems'],
 array['Designed controlled experiment', 'Collected quantitative data', 'Graphed and analyzed results', 'Adjusted hypothesis based on findings']
);

-- Reading Competency: Research and synthesis
insert into public.competencies (name, description, category, real_world_applications, demonstration_examples) values
('Research from Multiple Sources and Synthesize Information',
 'Find reliable information, evaluate sources, take notes, and combine insights from multiple texts',
 'reading',
 array['Planning new project', 'Solving technical problem', 'Learning new skill', 'Comparing approaches'],
 array['Researched topic from 3+ sources', 'Evaluated source credibility', 'Combined information into summary', 'Cited sources properly']
);

-- NOTE: The competency-skill mappings should be added after reviewing your actual skills table.
-- Example mapping (adjust skill IDs based on your database):
-- insert into public.competency_skills_map (competency_id, skill_id, weight) values
-- ((select id from public.competencies where name like '%Calculate Materials%'),
--  (select id from public.skills where name like '%Fractions%'),
--  0.3);

-- ============================================
-- COMMENTS
-- ============================================
comment on table public.competencies is
  'Real-world competencies - what students can actually DO (parent-facing)';

comment on table public.competency_skills_map is
  'Maps which academic skills contribute to which real-world competencies';

comment on table public.student_competencies is
  'Student progress on real-world competencies with evidence';

comment on column public.student_competencies.status is
  'not_started (0%), developing (<50%), competent (50-80%), advanced (>80%)';

comment on column public.student_competencies.evidence is
  'JSON array of evidence: portfolio items, photos, project links, etc.';
