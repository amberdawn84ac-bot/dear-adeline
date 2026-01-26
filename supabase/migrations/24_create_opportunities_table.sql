create table public.opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null,
  url text,
  eligibility jsonb,
  target_skills text[],
  target_interests text[],
  location text,
  deadline timestamp with time zone,
  source text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.opportunities enable row level security;

create policy "Anyone can view opportunities." on public.opportunities
  for select using (true);

create policy "Admins can manage opportunities." on public.opportunities
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create trigger update_opportunities_updated_at
  before update on public.opportunities
  for each row execute procedure public.update_updated_at_column();
