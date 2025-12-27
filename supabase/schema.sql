-- Dear Adeline Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. TABLES CREATION
-- ============================================

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text not null check (role in ('student', 'teacher', 'admin')) default 'student',
  display_name text,
  avatar_url text,
  dashboard_theme jsonb default '{"primary": "#87A878", "mode": "light"}'::jsonb,
  state_standards text default 'oklahoma',
  grade_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEACHER-STUDENT RELATIONSHIPS
create table public.teacher_students (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(teacher_id, student_id)
);

-- SKILLS
create table public.skills (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text not null,
  subcategory text,
  credit_value decimal(4,2) default 0.25,
  grade_levels text[] default array['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  state_standards text[] default array['oklahoma'],
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STUDENT SKILLS
create table public.student_skills (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  source_type text check (source_type in ('ai_lesson', 'library_project', 'manual', 'game')),
  source_id uuid,
  notes text,
  verified_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, skill_id)
);

-- GRADUATION REQUIREMENTS
create table public.graduation_requirements (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text not null,
  required_credits decimal(4,2) not null,
  state_standards text default 'oklahoma',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STUDENT GRADUATION PROGRESS
create table public.student_graduation_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  requirement_id uuid references public.graduation_requirements(id) on delete cascade not null,
  credits_earned decimal(4,2) default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, requirement_id)
);

-- LIBRARY PROJECTS
create table public.library_projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text not null check (category in ('art', 'farm', 'science', 'game')),
  instructions text,
  materials text[],
  skills_awarded uuid[],
  credit_value decimal(4,2) default 0.25,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  grade_levels text[] default array['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  estimated_time text,
  image_url text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STUDENT PROJECTS
create table public.student_projects (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  project_id uuid references public.library_projects(id) on delete cascade not null,
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started',
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  reflection text,
  evidence_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, project_id)
);

-- PORTFOLIO ITEMS (Moved after teacher_students table creation reference)
create table public.portfolio_items (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  type text check (type in ('project', 'lesson', 'artwork', 'writing', 'other')) default 'project',
  content text,
  media_urls text[],
  skills_demonstrated uuid[],
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- AI CONVERSATIONS
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  messages jsonb default '[]'::jsonb,
  topic text,
  skills_identified uuid[],
  lessons_generated jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LEARNING GAPS
create table public.learning_gaps (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  skill_area text not null,
  description text,
  severity text check (severity in ('minor', 'moderate', 'significant')) default 'minor',
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  suggested_activities jsonb default '[]'::jsonb,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ============================================
-- 2. ENABLE RLS
-- ============================================
alter table public.profiles enable row level security;
alter table public.teacher_students enable row level security;
alter table public.skills enable row level security;
alter table public.student_skills enable row level security;
alter table public.graduation_requirements enable row level security;
alter table public.student_graduation_progress enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.library_projects enable row level security;
alter table public.student_projects enable row level security;
alter table public.conversations enable row level security;
alter table public.learning_gaps enable row level security;


-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- PROFILES POLICIES
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Teachers can view their students" on public.profiles
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.profiles.id
    )
  );

-- TEACHER_STUDENTS POLICIES
create policy "Teachers can manage their relationships" on public.teacher_students
  for all using (teacher_id = auth.uid());

create policy "Admins can manage all relationships" on public.teacher_students
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- SKILLS POLICIES
create policy "Anyone can view skills" on public.skills
  for select using (true);

create policy "Admins can manage skills" on public.skills
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- STUDENT_SKILLS POLICIES
create policy "Students can view own skills" on public.student_skills
  for select using (student_id = auth.uid());

create policy "Teachers can view their students skills" on public.student_skills
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.student_skills.student_id
    )
  );

create policy "Admins can manage all skills" on public.student_skills
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- GRADUATION REQUIREMENTS POLICIES
create policy "Anyone can view requirements" on public.graduation_requirements
  for select using (true);

create policy "Admins can manage requirements" on public.graduation_requirements
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- STUDENT GRADUATION PROGRESS POLICIES
create policy "Students can view own progress" on public.student_graduation_progress
  for select using (student_id = auth.uid());

create policy "Teachers can view their students progress" on public.student_graduation_progress
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.student_graduation_progress.student_id
    )
  );

-- PORTFOLIO ITEMS POLICIES
create policy "Students can manage own portfolio" on public.portfolio_items
  for all using (student_id = auth.uid());

create policy "Public items are viewable by all" on public.portfolio_items
  for select using (is_public = true);

create policy "Teachers can view their students portfolios" on public.portfolio_items
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.portfolio_items.student_id
    )
  );

-- LIBRARY PROJECTS POLICIES
create policy "Anyone can view library projects" on public.library_projects
  for select using (true);

create policy "Admins can manage library projects" on public.library_projects
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- STUDENT PROJECTS POLICIES
create policy "Students can manage own project progress" on public.student_projects
  for all using (student_id = auth.uid());

create policy "Teachers can view their students projects" on public.student_projects
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.student_projects.student_id
    )
  );

-- CONVERSATIONS POLICIES
create policy "Students can manage own conversations" on public.conversations
  for all using (student_id = auth.uid());

-- LEARNING GAPS POLICIES
create policy "Students can view own gaps" on public.learning_gaps
  for select using (student_id = auth.uid());

create policy "Teachers can view their students gaps" on public.learning_gaps
  for select using (
    exists (
      select 1 from public.teacher_students
      where teacher_id = auth.uid() and student_id = public.learning_gaps.student_id
    )
  );


-- ============================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

create trigger update_portfolio_items_updated_at
  before update on public.portfolio_items
  for each row execute procedure public.update_updated_at_column();

create trigger update_library_projects_updated_at
  before update on public.library_projects
  for each row execute procedure public.update_updated_at_column();

create trigger update_student_projects_updated_at
  before update on public.student_projects
  for each row execute procedure public.update_updated_at_column();

create trigger update_conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.update_updated_at_column();

create trigger update_student_graduation_progress_updated_at
  before update on public.student_graduation_progress
  for each row execute procedure public.update_updated_at_column();


-- ============================================
-- 5. INITIAL DATA
-- ============================================

insert into public.graduation_requirements (name, description, category, required_credits, state_standards) values
('English Language Arts', 'Reading, writing, grammar, literature, and communication skills', 'ela', 4.0, 'oklahoma'),
('Mathematics', 'Algebra, geometry, and advanced math concepts', 'math', 3.0, 'oklahoma'),
('Science', 'Biology, chemistry, physics, and earth science', 'science', 3.0, 'oklahoma'),
('Social Studies', 'History, government, geography, and economics', 'social_studies', 3.0, 'oklahoma'),
('Fine Arts', 'Visual arts, music, theater, or other fine arts', 'fine_arts', 1.0, 'oklahoma'),
('World Languages', 'Foreign language study', 'world_languages', 2.0, 'oklahoma'),
('Computer Technology', 'Digital literacy and computer science', 'technology', 1.0, 'oklahoma'),
('Health & Physical Education', 'Physical fitness and health education', 'health_pe', 1.0, 'oklahoma'),
('Electives', 'Additional courses of student choice', 'electives', 5.0, 'oklahoma');

insert into public.skills (name, description, category, subcategory, credit_value) values
-- ELA Skills -> English & Lit
('Reading Comprehension', 'Understanding and analyzing written text', 'english_lit', 'reading', 0.25),
('Creative Writing', 'Writing original stories, poems, and creative pieces', 'english_lit', 'writing', 0.25),
('Grammar & Mechanics', 'Proper use of grammar, punctuation, and spelling', 'english_lit', 'writing', 0.25),
('Research Skills', 'Gathering, evaluating, and synthesizing information', 'english_lit', 'research', 0.25),
('Public Speaking', 'Effective verbal communication and presentation', 'english_lit', 'communication', 0.25),

-- Math Skills -> Math
('Algebra', 'Solving equations and understanding algebraic concepts', 'math', 'algebra', 0.25),
('Geometry', 'Understanding shapes, angles, and spatial reasoning', 'math', 'geometry', 0.25),
('Statistics', 'Data analysis and probability', 'math', 'statistics', 0.25),
('Financial Literacy', 'Understanding money, budgeting, and economics', 'math', 'applied', 0.25),

-- Science Skills -> Creation & Science
('Scientific Method', 'Designing and conducting experiments', 'creation_science', 'process', 0.25),
('Biology', 'Understanding living organisms and life processes', 'creation_science', 'life_science', 0.25),
('Chemistry', 'Understanding matter and chemical reactions', 'creation_science', 'physical_science', 0.25),
('Physics', 'Understanding forces, motion, and energy', 'creation_science', 'physical_science', 0.25),
('Environmental Science', 'Understanding ecosystems and environmental issues', 'creation_science', 'earth_science', 0.25),

-- Life/Farm Skills -> Food Systems / Health
('Agriculture', 'Farming, gardening, and animal care', 'food_systems', 'vocational', 0.25),
('Plant Identification', 'Identifying herbs and medicinal plants', 'health_naturopathy', 'botany', 0.25),
('Cooking', 'Food preparation and nutrition', 'food_systems', 'life_skills', 0.25),
('Entrepreneurship', 'Starting and running a business', 'gov_econ', 'business', 0.25),
('Biblical Ethics', 'Principles of justice and character', 'discipleship', 'spirituality', 0.25);

insert into public.library_projects (title, description, category, instructions, materials, difficulty, estimated_time, grade_levels) values
-- Art Projects
('Watercolor Landscape', 'Create a beautiful landscape painting using watercolors', 'art', 
 'Step 1: Sketch your landscape lightly in pencil.\nStep 2: Wet your paper with clean water.\nStep 3: Apply light washes for the sky.\nStep 4: Build up layers for foreground elements.\nStep 5: Add details once dry.', 
 array['Watercolor paints', 'Watercolor paper', 'Brushes', 'Water cup', 'Pencil'], 
 'intermediate', '2-3 hours', array['3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),

('Clay Sculpture', 'Hand-build a sculpture using air-dry clay', 'art',
 'Step 1: Sketch your design.\nStep 2: Form the basic shape.\nStep 3: Add details and textures.\nStep 4: Let dry completely (24-48 hours).\nStep 5: Paint if desired.',
 array['Air-dry clay', 'Sculpting tools', 'Water', 'Acrylic paints (optional)'],
 'beginner', '2-4 hours plus drying', array['K', '1', '2', '3', '4', '5', '6', '7', '8']),

-- Farm Projects
('Vegetable Garden Planning', 'Design and plan a vegetable garden for your growing zone', 'farm',
 'Step 1: Determine your growing zone.\nStep 2: Choose vegetables for your climate.\nStep 3: Draw a garden layout.\nStep 4: Plan planting schedule.\nStep 5: Create a care calendar.',
 array['Graph paper', 'Seed catalogs', 'Colored pencils', 'Calendar'],
 'beginner', '2-3 hours', array['3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),

('Chicken Coop Design', 'Design a functional chicken coop for a small flock', 'farm',
 'Step 1: Research chicken needs.\nStep 2: Calculate space requirements.\nStep 3: Sketch design with nesting boxes and roosts.\nStep 4: Plan ventilation and predator protection.\nStep 5: Create materials list.',
 array['Graph paper', 'Ruler', 'Reference books or websites'],
 'intermediate', '3-4 hours', array['6', '7', '8', '9', '10', '11', '12']),

-- Science Experiments
('Volcano Eruption', 'Build and erupt a model volcano', 'science',
 'Step 1: Build volcano shape with clay or paper mache.\nStep 2: Place small container at top.\nStep 3: Add baking soda inside.\nStep 4: Mix vinegar with dish soap and food coloring.\nStep 5: Pour mixture in and watch the eruption!',
 array['Baking soda', 'Vinegar', 'Dish soap', 'Food coloring', 'Clay or paper mache', 'Small container'],
 'beginner', '1-2 hours', array['K', '1', '2', '3', '4', '5']),

('Plant Growth Experiment', 'Test how different conditions affect plant growth', 'science',
 'Step 1: Plant identical seeds in multiple pots.\nStep 2: Vary one condition (light, water, soil type).\nStep 3: Keep all other conditions the same.\nStep 4: Measure and record growth daily.\nStep 5: Graph results and draw conclusions.',
 array['Seeds', 'Pots', 'Soil', 'Ruler', 'Notebook', 'Camera'],
 'intermediate', '2-4 weeks', array['3', '4', '5', '6', '7', '8', '9', '10']),

-- Games
('History Time Travel Quiz', 'Test your knowledge of American History in this interactive quiz game.', 'game', 
 'Ask Adeline to "Start the History Time Travel Quiz". She will ask you questions about key historical events. Answer correctly to earn points and skills!', 
 array['None'], 'intermediate', '15-30 mins', array['3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),

('Spelling Bee Challenge', 'Practice your spelling words in an interactive game format.', 'game',
 'Ask Adeline to "Start the Spelling Bee". She will pronounce words (or describe them) for you to spell. Get 10 right to win!',
 array['None'], 'beginner', '10-20 mins', array['K', '1', '2', '3', '4', '5']);
