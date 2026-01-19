-- Migration: Add lesson content fields to library_projects
-- This allows projects to have optional teaching lessons attached

-- Add lesson content fields
ALTER TABLE public.library_projects
ADD COLUMN IF NOT EXISTS lesson_content TEXT,
ADD COLUMN IF NOT EXISTS lesson_type TEXT CHECK (lesson_type IN ('premade', 'ai_generated', 'none')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS lesson_video_url TEXT,
ADD COLUMN IF NOT EXISTS key_concepts TEXT[], -- Array of key learning concepts
ADD COLUMN IF NOT EXISTS discussion_questions TEXT[], -- Questions for reflection
ADD COLUMN IF NOT EXISTS requires_lesson_completion BOOLEAN DEFAULT false;

-- Add index for faster queries on lesson_type
CREATE INDEX IF NOT EXISTS idx_library_projects_lesson_type ON public.library_projects(lesson_type);

-- Add comments for documentation
COMMENT ON COLUMN public.library_projects.lesson_content IS 'The actual teaching lesson content (markdown/text)';
COMMENT ON COLUMN public.library_projects.lesson_type IS 'How the lesson was created: premade (by admin), ai_generated (by Adeline), or none (project-only)';
COMMENT ON COLUMN public.library_projects.lesson_video_url IS 'Optional YouTube/Vimeo embed URL for video lessons';
COMMENT ON COLUMN public.library_projects.key_concepts IS 'Array of main concepts taught in the lesson';
COMMENT ON COLUMN public.library_projects.discussion_questions IS 'Reflection questions for after the lesson';
COMMENT ON COLUMN public.library_projects.requires_lesson_completion IS 'If true, student must view lesson before starting project';
