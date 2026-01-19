create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  caption text not null,
  translation text,
  skills text[],
  grade text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_logs enable row level security;

create policy "Students can view their own activity logs." on public.activity_logs
  for select using (student_id = auth.uid());

create policy "Students can insert their own activity logs." on public.activity_logs
  for insert with check (student_id = auth.uid());

-- Optional: Allow students to update/delete their own activity logs if necessary.
-- For now, activities are logged once and typically not modified by the student.
-- create policy "Students can update their own activity logs." on public.activity_logs
--   for update using (student_id = auth.uid());
-- create policy "Students can delete their own activity logs." on public.activity_logs
--   for delete using (student_id = auth.uid());

create trigger update_activity_logs_updated_at
  before update on public.activity_logs
  for each row execute procedure public.update_updated_at_column();
