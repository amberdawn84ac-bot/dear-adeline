-- Migration 17: Skill Prerequisites
-- Add prerequisite relationships to skills for adaptive learning

-- ============================================
-- ADD PREREQUISITE COLUMNS TO SKILLS TABLE
-- ============================================
alter table public.skills
add column if not exists prerequisites uuid[] default array[]::uuid[];

alter table public.skills
add column if not exists difficulty_order int default 0;

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_skills_prerequisites
  on public.skills using gin(prerequisites);

-- ============================================
-- COMMENTS
-- ============================================
comment on column public.skills.prerequisites is
  'Array of skill IDs that must be mastered before attempting this skill';

comment on column public.skills.difficulty_order is
  'Relative difficulty/order within a category (lower = easier, foundational)';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if student can attempt a skill (all prerequisites mastered)
create or replace function public.can_attempt_skill(
  p_student_id uuid,
  p_skill_id uuid
)
returns jsonb as $$
declare
  v_prerequisites uuid[];
  v_missing_prereqs uuid[];
  v_skill_level text;
begin
  -- Get skill prerequisites
  select prerequisites into v_prerequisites
  from public.skills
  where id = p_skill_id;

  -- If no prerequisites, student can attempt
  if v_prerequisites is null or array_length(v_prerequisites, 1) is null then
    return jsonb_build_object(
      'allowed', true,
      'missingPrereqs', '[]'::jsonb
    );
  end if;

  -- Check which prerequisites are not mastered
  select array_agg(prereq_id)
  into v_missing_prereqs
  from unnest(v_prerequisites) as prereq_id
  where not exists (
    select 1 from public.skill_levels
    where student_id = p_student_id
      and skill_id = prereq_id
      and level = 'mastered'
  );

  -- Return result
  return jsonb_build_object(
    'allowed', v_missing_prereqs is null or array_length(v_missing_prereqs, 1) is null,
    'missingPrereqs', coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'skillId', s.id,
          'skillName', s.name,
          'category', s.category
        )
      )
      from public.skills s
      where s.id = any(v_missing_prereqs)),
      '[]'::jsonb
    )
  );
end;
$$ language plpgsql security definer;

comment on function public.can_attempt_skill is
  'Checks if a student has mastered all prerequisites for a skill. Returns {allowed: boolean, missingPrereqs: array}';

-- Function to get recommended next skills for a student in a category
create or replace function public.get_next_skills(
  p_student_id uuid,
  p_category text,
  p_limit int default 5
)
returns table (
  skill_id uuid,
  skill_name text,
  skill_description text,
  difficulty_order int,
  prerequisites_met boolean
) as $$
begin
  return query
  select
    s.id as skill_id,
    s.name as skill_name,
    s.description as skill_description,
    s.difficulty_order,
    (public.can_attempt_skill(p_student_id, s.id)->>'allowed')::boolean as prerequisites_met
  from public.skills s
  where s.category = p_category
    and not exists (
      select 1 from public.skill_levels sl
      where sl.student_id = p_student_id
        and sl.skill_id = s.id
        and sl.level = 'mastered'
    )
  order by
    (public.can_attempt_skill(p_student_id, s.id)->>'allowed')::boolean desc,
    s.difficulty_order asc
  limit p_limit;
end;
$$ language plpgsql security definer;

comment on function public.get_next_skills is
  'Returns recommended next skills for a student in a category, ordered by prerequisites met and difficulty';

-- ============================================
-- SAMPLE PREREQUISITE DATA
-- ============================================

-- Math skill prerequisites (example - adjust based on your actual skill data)
-- Basic Fractions (foundational, no prerequisites)
update public.skills
set difficulty_order = 1, prerequisites = array[]::uuid[]
where name ilike '%basic fraction%' or name ilike '%fraction basics%';

-- Fractions with Different Denominators (requires Basic Fractions)
update public.skills
set difficulty_order = 2,
    prerequisites = (
      select array_agg(id)
      from public.skills
      where name ilike '%basic fraction%'
    )
where name ilike '%different denominator%' or name ilike '%add fraction%' and name ilike '%different%';

-- Multiplying Fractions (requires basic and operations)
update public.skills
set difficulty_order = 3,
    prerequisites = (
      select array_agg(id)
      from public.skills
      where name ilike '%basic fraction%' or name ilike '%fraction operation%'
    )
where name ilike '%multiply%fraction%' or name ilike '%fraction%multipl%';

-- Percentages (requires fractions and decimals)
update public.skills
set difficulty_order = 4,
    prerequisites = (
      select array_agg(id)
      from public.skills
      where name ilike '%fraction%' or name ilike '%decimal%'
      limit 2
    )
where name ilike '%percentage%' or name ilike '%percent%';

-- Algebra (requires fractions, percentages, basic operations)
update public.skills
set difficulty_order = 5,
    prerequisites = (
      select array_agg(id)
      from public.skills
      where name ilike '%fraction%' or name ilike '%percent%'
      limit 3
    )
where name ilike '%algebra%' or name ilike '%equation%';

-- Note: The above are examples. You'll want to review and adjust
-- based on your actual skills table content.
