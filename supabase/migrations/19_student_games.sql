-- Migration 19: Student-Designed Games
-- Let students co-create learning games with Adeline

-- ============================================
-- STUDENT GAMES TABLE
-- ============================================
create table public.student_games (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  game_type text check (game_type in ('matching', 'sorting', 'labeling', 'quiz', 'memory', 'path', 'fill_blank')) not null,
  subject text not null,
  skill_id uuid references public.skills(id),
  manifest jsonb not null, -- Game definition in JSON format
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  play_count int default 0,
  is_public boolean default false, -- Can other students play it?
  last_played timestamp with time zone
);

-- ============================================
-- GAME PLAY SESSIONS (track learning through gameplay)
-- ============================================
create table public.game_sessions (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.student_games(id) on delete cascade not null,
  player_id uuid references public.profiles(id) on delete cascade not null,
  score int,
  completed boolean default false,
  time_spent int, -- seconds
  mistakes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.student_games enable row level security;
alter table public.game_sessions enable row level security;

-- Students can manage their own games
create policy "Students can manage own games"
  on public.student_games
  for all
  using (student_id = auth.uid());

-- Public games are viewable by all
create policy "Public games viewable by all"
  on public.student_games
  for select
  using (is_public = true);

-- Teachers can view their students' games
create policy "Teachers can view student games"
  on public.student_games
  for select
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and student_id = public.student_games.student_id
    )
  );

-- Players can view their own sessions
create policy "Players can view own sessions"
  on public.game_sessions
  for select
  using (player_id = auth.uid());

-- Players can create sessions
create policy "Players can create sessions"
  on public.game_sessions
  for insert
  with check (player_id = auth.uid());

-- Teachers can view student sessions
create policy "Teachers can view student sessions"
  on public.game_sessions
  for select
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and student_id = public.game_sessions.player_id
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
create trigger update_student_games_updated_at
  before update on public.student_games
  for each row
  execute procedure public.update_updated_at_column();

-- Update play count when session is created
create or replace function public.increment_game_play_count()
returns trigger as $$
begin
  update public.student_games
  set play_count = play_count + 1,
      last_played = NEW.created_at
  where id = NEW.game_id;
  return NEW;
end;
$$ language plpgsql;

create trigger increment_play_count_trigger
  after insert on public.game_sessions
  for each row
  execute procedure public.increment_game_play_count();

-- ============================================
-- INDEXES
-- ============================================
create index idx_student_games_student_id
  on public.student_games(student_id);

create index idx_student_games_subject
  on public.student_games(subject);

create index idx_student_games_game_type
  on public.student_games(game_type);

create index idx_student_games_is_public
  on public.student_games(is_public) where is_public = true;

create index idx_game_sessions_game_id
  on public.game_sessions(game_id);

create index idx_game_sessions_player_id
  on public.game_sessions(player_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get popular public games
create or replace function public.get_popular_games(
  p_subject text default null,
  p_limit int default 10
)
returns table (
  game_id uuid,
  title text,
  description text,
  game_type text,
  subject text,
  play_count int,
  creator_name text
) as $$
begin
  return query
  select
    sg.id as game_id,
    sg.title,
    sg.description,
    sg.game_type,
    sg.subject,
    sg.play_count,
    p.display_name as creator_name
  from public.student_games sg
  join public.profiles p on p.id = sg.student_id
  where sg.is_public = true
    and (p_subject is null or sg.subject = p_subject)
  order by sg.play_count desc, sg.created_at desc
  limit p_limit;
end;
$$ language plpgsql security definer;

comment on function public.get_popular_games is
  'Returns most-played public games, optionally filtered by subject';

-- ============================================
-- COMMENTS
-- ============================================
comment on table public.student_games is
  'Games designed by students with Adeline''s help - game creation = deeper learning';

comment on column public.student_games.manifest is
  'JSON game definition: {gameId, type, assets, mechanics, pedagogy}';

comment on column public.student_games.is_public is
  'Whether other students can discover and play this game';

comment on table public.game_sessions is
  'Play sessions tracking student engagement and learning through games';

-- ============================================
-- GAME MANIFEST SCHEMA (stored in manifest column)
-- ============================================
/*
{
  "gameId": "string (uuid)",
  "type": "matching | sorting | labeling | quiz | memory | path | fill_blank",

  "assets": {
    "backgroundImage": "string (url) - optional",
    "elements": [
      {
        "id": "string",
        "type": "text | image | hotspot",
        "content": "string",
        "position": {"x": number, "y": number},
        "correctAnswer": "string | string[]",
        "distractor": boolean
      }
    ]
  },

  "mechanics": {
    "winCondition": "string",
    "lives": number (optional),
    "timer": boolean,
    "timerSeconds": number (optional)
  },

  "pedagogy": {
    "skillId": "string (uuid)",
    "difficulty": "easy | medium | hard"
  }
}
*/
