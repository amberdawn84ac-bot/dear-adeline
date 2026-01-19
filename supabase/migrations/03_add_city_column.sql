-- Add city column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.city IS 'Student city for local context';
