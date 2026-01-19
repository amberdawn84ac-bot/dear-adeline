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

-- 3. Add National (Interest-Led) requirements
DELETE FROM public.graduation_requirements WHERE state_standards = 'national';
INSERT INTO public.graduation_requirements (name, description, category, required_credits, state_standards)
VALUES 
  ('Creation & Science', 'Exploration of the world.', 'creation_science', 3.0, 'national'),
  ('Health & Life', 'Vitality and body stewardship.', 'health_naturopathy', 2.0, 'national'),
  ('Food systems', 'Sovereignty and provision.', 'food_systems', 2.0, 'national'),
  ('Governance', 'Leading and stewardship.', 'gov_econ', 2.0, 'national'),
  ('Ethics & Justice', 'Right relationship with others.', 'justice', 2.0, 'national'),
  ('Discipleship', 'Heart and mission.', 'discipleship', 4.0, 'national'),
  ('Human Story', 'History and cultures.', 'history', 3.0, 'national'),
  ('Expression', 'Lit and communication.', 'english_lit', 4.0, 'national'),
  ('Logic & Design', 'Mathematical thinking.', 'math', 3.0, 'national');

-- 4. Add Unstructured (Restored) requirements
DELETE FROM public.graduation_requirements WHERE state_standards = 'unstructured';
INSERT INTO public.graduation_requirements (name, description, category, required_credits, state_standards)
VALUES 
  ('Ancient Wisdom', 'Creation and science.', 'creation_science', 2.0, 'unstructured'),
  ('Temple Stewardship', 'Natural health.', 'health_naturopathy', 1.0, 'unstructured'),
  ('Earth Sovereignty', 'Food systems.', 'food_systems', 2.0, 'unstructured'),
  ('True Wealth', 'Stewardship and economics.', 'gov_econ', 1.0, 'unstructured'),
  ('Restored Justice', 'Biblical ethics.', 'justice', 2.0, 'unstructured'),
  ('Heart Mastery', 'Discipleship and character.', 'discipleship', 10.0, 'unstructured'),
  ('The Long Memory', 'History and lineage.', 'history', 2.0, 'unstructured'),
  ('Voice of Truth', 'Literature and expression.', 'english_lit', 2.0, 'unstructured'),
  ('Creation Order', 'Logic and math.', 'math', 2.0, 'unstructured');

-- 5. Add app_settings table for visual styling (if not already added)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Initial theme settings
INSERT INTO public.app_settings (key, value)
VALUES ('theme', '{"primaryColor": "#87A878", "fontSize": "16px", "fontFamily": "Inter", "headingFont": "Outfit"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
