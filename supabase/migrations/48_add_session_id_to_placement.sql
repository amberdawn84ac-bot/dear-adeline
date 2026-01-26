-- Migration to support pre-signup placement assessments
-- 1. Make student_id nullable (since pre-signup users have no profile yet)
-- 2. Add session_id column for email/session tracking

-- Drop the NOT NULL constraint on student_id
ALTER TABLE public.placement_assessments 
ALTER COLUMN student_id DROP NOT NULL;

-- Add session_id column
ALTER TABLE public.placement_assessments 
ADD COLUMN IF NOT EXISTS session_id text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_placement_assessments_session_id 
ON public.placement_assessments(session_id);

-- Add comment
COMMENT ON COLUMN public.placement_assessments.session_id IS 'Email or Session ID for tracking pre-signup assessments';
