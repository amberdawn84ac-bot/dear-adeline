-- Migration: Update categories and tracks to match the 9 modern tracks
-- 1. God's Creation & Science
-- 2. Health/Naturopathy
-- 3. Food Systems
-- 4. Government/Economics
-- 5. Justice
-- 6. Discipleship
-- 7. History
-- 8. English/Lit
-- 9. Math

-- 1. Update library_projects category constraint
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
    'game' -- Keeping game for legacy/utility
  ));

-- 2. Clear out old requirements and add new track-based ones
DELETE FROM public.graduation_requirements WHERE state_standards = 'oklahoma';

INSERT INTO public.graduation_requirements (name, description, category, required_credits, state_standards)
VALUES 
  ('God''s Creation & Science', 'Study of the natural world and scientific principles.', 'creation_science', 4.0, 'oklahoma'),
  ('Health & Naturopathy', 'Understanding health, wellness, and natural systems.', 'health_naturopathy', 2.0, 'oklahoma'),
  ('Food Systems', 'Agriculture, nutrition, and sustainable food chains.', 'food_systems', 2.0, 'oklahoma'),
  ('Government & Economics', 'Civics, stewardship, and economic logic.', 'gov_econ', 3.0, 'oklahoma'),
  ('Justice', 'Ethics, biblical justice, and social responsibility.', 'justice', 1.0, 'oklahoma'),
  ('Discipleship', 'Focus on character development and faith.', 'discipleship', 4.0, 'oklahoma'),
  ('History', 'The story of humanity and cultures.', 'history', 4.0, 'oklahoma'),
  ('English & Literature', 'Reading, writing, and communication.', 'english_lit', 4.0, 'oklahoma'),
  ('Mathematics', 'Logic, numeracy, and geometric design.', 'math', 4.0, 'oklahoma');

-- 3. Add app_settings table for visual styling (if not already added)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Initial theme settings
INSERT INTO public.app_settings (key, value)
VALUES ('theme', '{"primaryColor": "#87A878", "fontSize": "16px", "fontFamily": "Inter", "headingFont": "Outfit"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
