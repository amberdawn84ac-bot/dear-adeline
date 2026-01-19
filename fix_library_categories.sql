-- Fix library_projects category constraint to accept new categories
-- Run this in your Supabase SQL Editor

ALTER TABLE public.library_projects DROP CONSTRAINT IF EXISTS library_projects_category_check;

ALTER TABLE public.library_projects ADD CONSTRAINT library_projects_category_check
  CHECK (category IN (
    'God''s Creation & Science',
    'Health/Naturopathy',
    'Food Systems',
    'Government/Economics',
    'Justice',
    'Discipleship',
    'History',
    'English/Lit',
    'Math',
    'game'
  ));

-- Verify the constraint is updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.library_projects'::regclass
AND conname = 'library_projects_category_check';
