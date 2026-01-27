-- Migration 51: Pod Workspaces
-- Combined migration for Pod Workspaces features: Shared projects, collaborators, revisions, trust levels, discussions, and pending content

-- -2. Create public.learning_pods (Missing dependency restoration)
CREATE TABLE IF NOT EXISTS public.learning_pods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.learning_pods ENABLE ROW LEVEL SECURITY;

-- -1. Create public.pod_members (Missing dependency restoration)
CREATE TABLE IF NOT EXISTS public.pod_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id uuid REFERENCES public.learning_pods(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('member', 'mentor')) DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(pod_id, student_id)
);

ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

-- 0. Create public.projects (Missing dependency)
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_student_id ON public.projects(student_id);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own projects"
  ON public.projects FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create own projects"
  ON public.projects FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own projects"
  ON public.projects FOR UPDATE
  USING (student_id = auth.uid());

CREATE POLICY "Students can delete own projects"
  ON public.projects FOR DELETE
  USING (student_id = auth.uid());

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 1. Add pod_id to public.projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS pod_id uuid REFERENCES public.learning_pods(id) ON DELETE SET NULL;

CREATE INDEX idx_projects_pod_id ON public.projects(pod_id);

COMMENT ON COLUMN public.projects.pod_id IS 'Links project to a learning pod for shared collaboration';

-- 2. Create public.project_collaborators
CREATE TABLE public.project_collaborators (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner', 'collaborator')) DEFAULT 'collaborator',
  added_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  added_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(project_id, student_id)
);

CREATE INDEX idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_student_id ON public.project_collaborators(student_id);

ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collaborators can view their projects"
  ON public.project_collaborators FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Project owners can manage collaborators"
  ON public.project_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc
      WHERE pc.project_id = public.project_collaborators.project_id
        AND pc.student_id = auth.uid()
        AND pc.role = 'owner'
    )
  );

COMMENT ON TABLE public.project_collaborators IS 'Junction table linking students to shared projects';

-- 3. Create public.project_revisions
CREATE TABLE public.project_revisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  editor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  content_snapshot jsonb NOT NULL,
  change_summary text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_project_revisions_project_id ON public.project_revisions(project_id);
CREATE INDEX idx_project_revisions_created_at ON public.project_revisions(created_at DESC);

ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collaborators can view revisions"
  ON public.project_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc
      WHERE pc.project_id = public.project_revisions.project_id
        AND pc.student_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can create revisions"
  ON public.project_revisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc
      WHERE pc.project_id = public.project_revisions.project_id
        AND pc.student_id = auth.uid()
    )
  );

COMMENT ON TABLE public.project_revisions IS 'Stores full project snapshots for revision history';

-- 4. Create public.student_trust_levels
CREATE TABLE public.student_trust_levels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  trust_score int DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  auto_publish boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_student_trust_levels_student_id ON public.student_trust_levels(student_id);

ALTER TABLE public.student_trust_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own trust level"
  ON public.student_trust_levels FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view student trust levels"
  ON public.student_trust_levels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_students ts
      WHERE ts.teacher_id = auth.uid()
        AND ts.student_id = public.student_trust_levels.student_id
    )
  );

CREATE POLICY "System can update trust levels"
  ON public.student_trust_levels FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to auto-update auto_publish based on score
CREATE OR REPLACE FUNCTION update_auto_publish()
RETURNS TRIGGER AS $$
BEGIN
  NEW.auto_publish := NEW.trust_score >= 50;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_auto_publish
  BEFORE UPDATE ON public.student_trust_levels
  FOR EACH ROW EXECUTE FUNCTION update_auto_publish();

COMMENT ON TABLE public.student_trust_levels IS 'Tracks student trust scores for content moderation';

-- 5. Create public.pod_discussions and public.discussion_replies
CREATE TABLE public.pod_discussions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pod_id uuid REFERENCES public.learning_pods(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_pinned boolean DEFAULT false,
  is_assignment boolean DEFAULT false,
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pod_discussions_pod_id ON public.pod_discussions(pod_id);
CREATE INDEX idx_pod_discussions_project_id ON public.pod_discussions(project_id);
CREATE INDEX idx_pod_discussions_author_id ON public.pod_discussions(author_id);

CREATE TABLE public.discussion_replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id uuid REFERENCES public.pod_discussions(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_author_id ON public.discussion_replies(author_id);

ALTER TABLE public.pod_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pod members can view discussions"
  ON public.pod_discussions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = public.pod_discussions.pod_id
        AND pm.student_id = auth.uid()
    )
  );

CREATE POLICY "Pod members can create discussions"
  ON public.pod_discussions FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.pod_members pm
      WHERE pm.pod_id = public.pod_discussions.pod_id
        AND pm.student_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their discussions"
  ON public.pod_discussions FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Pod members can view replies"
  ON public.discussion_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pod_discussions pd
      JOIN public.pod_members pm ON pm.pod_id = pd.pod_id
      WHERE pd.id = public.discussion_replies.discussion_id
        AND pm.student_id = auth.uid()
    )
  );

CREATE POLICY "Pod members can create replies"
  ON public.discussion_replies FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.pod_discussions pd
      JOIN public.pod_members pm ON pm.pod_id = pd.pod_id
      WHERE pd.id = public.discussion_replies.discussion_id
        AND pm.student_id = auth.uid()
    )
  );

CREATE TRIGGER update_pod_discussions_updated_at
  BEFORE UPDATE ON public.pod_discussions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON public.discussion_replies
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

COMMENT ON TABLE public.pod_discussions IS 'Discussion threads within learning pods';
COMMENT ON TABLE public.discussion_replies IS 'Replies to discussion threads';

-- 6. Create public.pending_content
CREATE TABLE public.pending_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type text CHECK (content_type IN ('discussion', 'reply', 'project_edit')) NOT NULL,
  content_id uuid NOT NULL,
  content_preview text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pod_id uuid REFERENCES public.learning_pods(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  feedback text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at timestamp with time zone
);

CREATE INDEX idx_pending_content_author_id ON public.pending_content(author_id);
CREATE INDEX idx_pending_content_pod_id ON public.pending_content(pod_id);
CREATE INDEX idx_pending_content_status ON public.pending_content(status);

ALTER TABLE public.pending_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can view their pending content"
  ON public.pending_content FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Teachers can view and manage pending content"
  ON public.pending_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_pods lp
      WHERE lp.id = public.pending_content.pod_id
        AND lp.teacher_id = auth.uid()
    )
  );

COMMENT ON TABLE public.pending_content IS 'Queue of content awaiting teacher approval';
