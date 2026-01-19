create table if not exists public.daily_truths (
  id uuid default uuid_generate_v4() primary key,
  topic text not null, -- 'Biblical', 'History', 'Science'
  title text not null,
  content text not null,
  original_text text, -- e.g. Hebrew word or Chemical formula
  translation_notes text,
  publish_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.daily_truths enable row level security;
create policy "Public read access" on public.daily_truths for select using (true);
create policy "Service role insert" on public.daily_truths for insert with check (true);
