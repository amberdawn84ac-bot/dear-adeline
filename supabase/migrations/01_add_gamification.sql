-- Migration: Add 'game' category to library_projects

-- 1. Drop the existing check constraint
ALTER TABLE public.library_projects
DROP CONSTRAINT library_projects_category_check;

-- 2. Add the new check constraint including 'game'
ALTER TABLE public.library_projects
ADD CONSTRAINT library_projects_category_check 
CHECK (category IN ('art', 'farm', 'science', 'game'));

-- 3. Add initial seed data for games
INSERT INTO public.library_projects (title, description, category, instructions, difficulty, estimated_time, grade_levels, credit_value) 
VALUES
('History Time Travel Quiz', 'Test your knowledge of American History in this interactive quiz game.', 'game', 
 'Ask Adeline to "Start the History Time Travel Quiz". She will ask you questions about key historical events. Answer correctly to earn points and skills!', 
 'intermediate', '15-30 mins', array['3', '4', '5', '6', '7', '8'], 0.10),

('Spelling Bee Challenge', 'Practice your spelling words in an interactive game format.', 'game',
 'Ask Adeline to "Start the Spelling Bee". She will pronounce words (or describe them) for you to spell. Get 10 right to win!',
 'beginner', '10-20 mins', array['K', '1', '2', '3', '4', '5'], 0.10);
