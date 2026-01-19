-- Migration: Add Parent/Teacher Alert System
-- Alerts appear in teacher dashboard instead of email

-- Create parent_alerts table
CREATE TABLE IF NOT EXISTS public.parent_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('direct_answers', 'stuck_concept', 'inappropriate', 'manipulation', 'inactivity')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  conversation_snippet TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  viewed_at TIMESTAMP WITH TIME ZONE,
  viewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parent_alerts_student_id ON public.parent_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_alerts_created_at ON public.parent_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parent_alerts_viewed_at ON public.parent_alerts(viewed_at) WHERE viewed_at IS NULL;

-- Enable RLS
ALTER TABLE public.parent_alerts ENABLE ROW LEVEL SECURITY;

-- Teachers can view alerts for their students
CREATE POLICY "Teachers can view their students' alerts"
  ON public.parent_alerts
  FOR SELECT
  USING (
    student_id IN (
      SELECT student_id 
      FROM public.teacher_students 
      WHERE teacher_id = auth.uid()
    )
    OR
    -- Admins can see all
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Teachers can mark alerts as viewed
CREATE POLICY "Teachers can update their students' alerts"
  ON public.parent_alerts
  FOR UPDATE
  USING (
    student_id IN (
      SELECT student_id 
      FROM public.teacher_students 
      WHERE teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can create alerts
CREATE POLICY "System can create alerts"
  ON public.parent_alerts
  FOR INSERT
  WITH CHECK (true);
