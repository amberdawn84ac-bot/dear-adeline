create table if not exists activity_logs (
    id uuid default gen_random_uuid() primary key,
    student_id uuid references auth.users(id),
    type text check (type in ('text', 'photo')),
    caption text not null,
    translation text not null, -- 'Academic translation (e.g. Baking -> Chemistry)'
    skills text[], -- Array of strings
    grade text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table activity_logs enable row level security;

-- Policies
create policy "Users can insert their own activity logs"
    on activity_logs for insert
    with check (auth.uid() = student_id);

create policy "Users can view their own activity logs"
    on activity_logs for select
    using (auth.uid() = student_id);
