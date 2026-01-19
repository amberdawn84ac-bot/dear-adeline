-- 1. PROFILES (Parent/Student)
-- Check if table exists, if not create it, else add missing columns
do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    create table profiles (
      id uuid references auth.users on delete cascade primary key,
      full_name text,
      role text check (role in ('parent', 'student')),
      age int,
      interests text[],
      created_at timestamp with time zone default now()
    );
  else
    -- Add columns if they don't exist
    alter table profiles add column if not exists full_name text;
    alter table profiles add column if not exists role text check (role in ('parent', 'student'));
    alter table profiles add column if not exists age int;
    alter table profiles add column if not exists interests text[];
  end if;
end
$$;

-- 2. ADVENTURE_LOGS (The "Transcript" builder)
create table if not exists adventure_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id),
  activity text,
  academic_subject text, -- e.g., 'Geology', 'Economic History'
  hours numeric,
  adeline_insight text,
  is_verified boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. PROCUREMENT_BIDS (The Professional Agent)
create table if not exists bids (
  id uuid primary key default uuid_generate_v4(),
  title text,
  agency text, -- e.g., 'Cherokee Nation', 'City of Tulsa'
  description text,
  link text,
  deadline date,
  match_score int -- How well it fits the student's skills
);
