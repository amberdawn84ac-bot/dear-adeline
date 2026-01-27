-- Add state column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS state TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.state IS 'Student state for curriculum standards';
