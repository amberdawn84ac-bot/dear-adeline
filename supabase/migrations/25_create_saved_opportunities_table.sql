create table public.saved_opportunities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, opportunity_id)
);

alter table public.saved_opportunities enable row level security;

create policy "Users can view their own saved opportunities." on public.saved_opportunities
  for select using (user_id = auth.uid());

create policy "Users can insert their own saved opportunities." on public.saved_opportunities
  for insert with check (user_id = auth.uid());

create policy "Users can delete their own saved opportunities." on public.saved_opportunities
  for delete using (user_id = auth.uid());

create trigger update_saved_opportunities_updated_at
  before update on public.saved_opportunities
  for each row execute procedure public.update_updated_at_column();
