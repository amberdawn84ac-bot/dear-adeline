create table public.student_interests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  interest text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.student_interests enable row level security;

create policy "Students can view their own interests." on public.student_interests
  for select using (user_id = auth.uid());

create policy "Students can insert their own interests." on public.student_interests
  for insert with check (user_id = auth.uid());

create policy "Students can update their own interests." on public.student_interests
  for update using (user_id = auth.uid());

create policy "Students can delete their own interests." on public.student_interests
  for delete using (user_id = auth.uid());

create trigger update_student_interests_updated_at
  before update on public.student_interests
  for each row execute procedure public.update_updated_at_column();
