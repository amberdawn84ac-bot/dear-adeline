-- Migration 34: Peer Learning Network
-- Enables safe student collaboration, mentorship tracking, and peer reviews

-- ============================================
-- LEARNING PODS (Groups for collaboration)
-- ============================================
create table public.learning_pods (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  teacher_id uuid references public.profiles(id) on delete set null,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- POD MEMBERSHIP
-- ============================================
create table public.pod_members (
  id uuid default uuid_generate_v4() primary key,
  pod_id uuid references public.learning_pods(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('member', 'mentor')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(pod_id, student_id)
);

-- ============================================
-- MENTORSHIP LOGS (Track mentoring hours)
-- ============================================
create table public.mentorship_logs (
  id uuid default uuid_generate_v4() primary key,
  mentor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  pod_id uuid references public.learning_pods(id) on delete set null,
  subject text not null,
  duration_minutes int not null check (duration_minutes > 0),
  notes text,
  verified_by_teacher boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PEER REVIEWS
-- ============================================
create table public.peer_reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  portfolio_item_id uuid references public.portfolio_items(id) on delete cascade not null,
  feedback text not null,
  rating int check (rating >= 1 and rating <= 5),
  teacher_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.learning_pods enable row level security;
alter table public.pod_members enable row level security;
alter table public.mentorship_logs enable row level security;
alter table public.peer_reviews enable row level security;

-- LEARNING PODS POLICIES
create policy "Anyone can view public pods"
  on public.learning_pods for select
  using (is_public = true);

create policy "Members can view their pods"
  on public.learning_pods for select
  using (
    exists (
      select 1 from public.pod_members
      where pod_id = public.learning_pods.id
        and student_id = auth.uid()
    )
  );

create policy "Teachers can manage their pods"
  on public.learning_pods for all
  using (teacher_id = auth.uid());

-- POD MEMBERS POLICIES
create policy "Pod members can view each other"
  on public.pod_members for select
  using (
    exists (
      select 1 from public.pod_members as my_membership
      where my_membership.pod_id = public.pod_members.pod_id
        and my_membership.student_id = auth.uid()
    )
  );

create policy "Teachers can manage pod members"
  on public.pod_members for all
  using (
    exists (
      select 1 from public.learning_pods
      where id = public.pod_members.pod_id
        and teacher_id = auth.uid()
    )
  );

-- MENTORSHIP LOGS POLICIES
create policy "Mentors can view their own logs"
  on public.mentorship_logs for select
  using (mentor_id = auth.uid());

create policy "Students can view their mentorship logs"
  on public.mentorship_logs for select
  using (student_id = auth.uid());

create policy "Mentors can create logs"
  on public.mentorship_logs for insert
  with check (mentor_id = auth.uid());

create policy "Teachers can verify logs"
  on public.mentorship_logs for all
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and (student_id = public.mentorship_logs.mentor_id or student_id = public.mentorship_logs.student_id)
    )
  );

-- PEER REVIEWS POLICIES
create policy "Reviewers can view their reviews"
  on public.peer_reviews for select
  using (reviewer_id = auth.uid());

create policy "Students can view reviews of their work"
  on public.peer_reviews for select
  using (
    exists (
      select 1 from public.portfolio_items
      where id = public.peer_reviews.portfolio_item_id
        and student_id = auth.uid()
    )
  );

create policy "Students can create peer reviews"
  on public.peer_reviews for insert
  with check (reviewer_id = auth.uid());

create policy "Teachers can manage all peer reviews"
  on public.peer_reviews for all
  using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid()
        and student_id = public.peer_reviews.reviewer_id
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================
create trigger update_learning_pods_updated_at
  before update on public.learning_pods
  for each row execute procedure public.update_updated_at_column();

create trigger update_mentorship_logs_updated_at
  before update on public.mentorship_logs
  for each row execute procedure public.update_updated_at_column();

create trigger update_peer_reviews_updated_at
  before update on public.peer_reviews
  for each row execute procedure public.update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
create index idx_pod_members_student_id on public.pod_members(student_id);
create index idx_pod_members_pod_id on public.pod_members(pod_id);
create index idx_mentorship_logs_mentor_id on public.mentorship_logs(mentor_id);
create index idx_mentorship_logs_student_id on public.mentorship_logs(student_id);
create index idx_peer_reviews_portfolio_item_id on public.peer_reviews(portfolio_item_id);
create index idx_peer_reviews_reviewer_id on public.peer_reviews(reviewer_id);

-- ============================================
-- COMMENTS
-- ============================================
comment on table public.learning_pods is 'Collaboration groups for students, overseen by teachers';
comment on table public.mentorship_logs is 'Tracking mentoring hours for students helping other students';
comment on table public.peer_reviews is 'Constructive feedback from students on each other''s portfolio items';
