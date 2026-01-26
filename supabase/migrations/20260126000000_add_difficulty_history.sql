-- Migration: Add Difficulty History for Adaptive Engine
-- Required by adaptiveDifficultyService.ts

create table if not exists public.difficulty_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  difficulty_level int not null check (difficulty_level >= 1 and difficulty_level <= 10),
  
  -- Performance Metrics
  accuracy decimal(4,3), -- 0.000 to 1.000
  response_time int, -- milliseconds
  engagement_score decimal(4,3), -- 0.000 to 1.000
  
  tracked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_difficulty_history_user_subject 
  on public.difficulty_history(user_id, subject);

create index if not exists idx_difficulty_history_tracked_at 
  on public.difficulty_history(tracked_at);

-- RLS
alter table public.difficulty_history enable row level security;

create policy "Users can view own difficulty history" 
  on public.difficulty_history
  for select using (user_id = auth.uid());

create policy "System can insert difficulty history" 
  on public.difficulty_history
  for insert with check (true);
