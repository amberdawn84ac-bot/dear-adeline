-- Update opportunity deadlines from 2025 to 2026 so they appear in the UI
-- The original seed data had 2025 dates which are now expired

UPDATE opportunities
SET deadline = deadline + INTERVAL '1 year'
WHERE deadline < NOW();

-- Backfill category, scope, and age_group for existing opportunities based on tags/disciplines
UPDATE opportunities SET category = 'art', scope = 'local', age_group = 'high'
WHERE title ILIKE '%mural%' OR title ILIKE '%art%' OR disciplines && ARRAY['Digital Art', 'Painting', 'Sculpture'];

UPDATE opportunities SET category = 'writing', scope = 'national', age_group = 'middle,high'
WHERE title ILIKE '%poetry%' OR title ILIKE '%essay%' OR title ILIKE '%writing%' OR disciplines && ARRAY['Writing', 'Poetry'];

UPDATE opportunities SET category = 'science', scope = 'national', age_group = 'middle,high'
WHERE title ILIKE '%science%' OR disciplines && ARRAY['Science', 'Research'];

UPDATE opportunities SET category = 'technology', scope = 'national', age_group = 'high'
WHERE title ILIKE '%app%' OR title ILIKE '%coding%' OR disciplines && ARRAY['Coding', 'Technology'];

UPDATE opportunities SET category = 'entrepreneurship', scope = 'national', age_group = 'high'
WHERE title ILIKE '%entrepreneur%' OR title ILIKE '%business%' OR disciplines && ARRAY['Business', 'Entrepreneurship'];

UPDATE opportunities SET category = 'service', scope = 'local', age_group = 'middle,high'
WHERE title ILIKE '%community%' OR title ILIKE '%service%' OR disciplines && ARRAY['Community Service', 'Leadership'];

UPDATE opportunities SET category = 'history', scope = 'local', age_group = 'high'
WHERE title ILIKE '%history%' OR disciplines && ARRAY['History', 'Documentary'];

UPDATE opportunities SET category = 'scholarships', scope = 'national', age_group = 'high'
WHERE type = 'scholarship' AND category IS NULL;

-- Also add some additional national opportunities that will be useful for students
INSERT INTO opportunities (title, description, type, organization, location, deadline, amount, source_url, track_credits, disciplines, experience_level, tags, featured, status, category, scope, age_group) VALUES

-- Scholarships
('National Merit Scholarship Program', 'The National Merit Scholarship Program honors academically talented students. Students enter by taking the PSAT/NMSQT and can earn scholarship awards.', 'scholarship', 'National Merit Scholarship Corporation', 'National (USA)', '2026-10-15 23:59:59', '$2,500-$10,000', 'https://www.nationalmerit.org', '{"english": 2, "creation_science": 2}', ARRAY['Academic Excellence'], 'Student', ARRAY['scholarship', 'academic', 'merit'], true, 'active', 'scholarships', 'national', 'high'),

('Coca-Cola Scholars Program', 'Achievement-based scholarship for graduating high school seniors. Recognizes students who demonstrate leadership and service.', 'scholarship', 'Coca-Cola Scholars Foundation', 'National (USA)', '2026-10-31 23:59:59', '$20,000', 'https://www.coca-colascholarsfoundation.org', '{"justice": 2, "english": 1}', ARRAY['Leadership', 'Community Service'], 'Student', ARRAY['scholarship', 'leadership', 'service'], true, 'active', 'scholarships', 'national', 'high'),

-- Art & Design
('Doodle for Google', 'Create a Google Doodle based on the annual theme. Winners receive scholarships and their artwork displayed on Google.', 'contest', 'Google', 'National (USA)', '2026-03-18 23:59:59', '$5,000-$30,000', 'https://doodles.google.com/d4g/', '{"creation_science": 3}', ARRAY['Digital Art', 'Illustration'], 'Student', ARRAY['art', 'digital', 'creativity'], true, 'active', 'art', 'national', 'elementary,middle,high'),

('YoungArts Competition', 'National arts competition for emerging artists ages 15-18 in visual, literary, design, and performing arts.', 'contest', 'National YoungArts Foundation', 'National (USA)', '2026-10-11 23:59:59', '$250-$10,000', 'https://www.youngarts.org', '{"creation_science": 3}', ARRAY['Visual Arts', 'Writing', 'Music', 'Dance', 'Theatre'], 'Student', ARRAY['art', 'performing arts', 'portfolio'], true, 'active', 'art', 'national', 'high'),

-- Writing & Literature
('Letters About Literature', 'Write a personal letter to an author explaining how their work changed your view of the world or yourself.', 'contest', 'Library of Congress', 'National (USA)', '2026-01-09 23:59:59', '$100-$1,000', 'https://www.lettersaboutliterature.org', '{"english": 3}', ARRAY['Writing', 'Literary Analysis'], 'Student', ARRAY['writing', 'reading', 'literature'], false, 'active', 'writing', 'national', 'elementary,middle,high'),

('Creative Writing Workshops for Teens', 'Free online creative writing workshop series for teens, with publication opportunities.', 'grant', 'PEN America', 'National (USA)', '2026-06-30 23:59:59', 'Free Workshop', 'https://pen.org/youth-programs/', '{"english": 3}', ARRAY['Writing', 'Poetry', 'Fiction'], 'Student', ARRAY['writing', 'workshop', 'publication'], false, 'active', 'writing', 'national', 'middle,high'),

-- Science & STEM
('Regeneron Science Talent Search', 'The nations oldest and most prestigious science and math competition for high school seniors.', 'contest', 'Society for Science', 'National (USA)', '2026-11-09 23:59:59', '$2,000-$250,000', 'https://www.societyforscience.org/regeneron-sts/', '{"creation_science": 3}', ARRAY['Science', 'Mathematics', 'Research'], 'Student', ARRAY['science', 'research', 'STEM', 'competition'], true, 'active', 'science', 'national', 'high'),

('3M Young Scientist Challenge', 'Americas premier middle school science competition. Create a 1-2 minute video describing a solution to an everyday problem.', 'contest', '3M and Discovery Education', 'National (USA)', '2026-04-22 23:59:59', '$25,000', 'https://www.youngscientistlab.com', '{"creation_science": 3}', ARRAY['Science', 'Innovation'], 'Student', ARRAY['science', 'invention', 'video'], true, 'active', 'science', 'national', 'middle'),

-- Technology & Engineering
('Congressional App Challenge', 'Students create and submit original apps for a chance to win prizes and have their app displayed in the U.S. Capitol.', 'contest', 'U.S. House of Representatives', 'National (USA)', '2026-11-01 23:59:59', 'Congressional Recognition', 'https://www.congressionalappchallenge.us', '{"creation_science": 3}', ARRAY['Coding', 'App Development'], 'Student', ARRAY['coding', 'technology', 'app', 'programming'], true, 'active', 'technology', 'national', 'middle,high'),

('FIRST Robotics Competition', 'Build and program robots to compete in alliance challenges. Emphasizes teamwork, innovation, and gracious professionalism.', 'contest', 'FIRST', 'National (USA)', '2026-04-30 23:59:59', 'Scholarship Opportunities', 'https://www.firstinspires.org', '{"creation_science": 3, "economics": 1}', ARRAY['Robotics', 'Engineering', 'Programming'], 'Student', ARRAY['robotics', 'STEM', 'engineering', 'teamwork'], true, 'active', 'technology', 'national', 'middle,high'),

-- Entrepreneurship
('Diamond Challenge', 'High school entrepreneurship competition. Create a business or social venture concept and pitch to judges.', 'contest', 'University of Delaware', 'National (USA)', '2026-02-15 23:59:59', '$5,000-$25,000', 'https://www.diamondchallenge.org', '{"economics": 3, "english": 1}', ARRAY['Business', 'Entrepreneurship', 'Social Enterprise'], 'Student', ARRAY['business', 'entrepreneurship', 'pitch', 'startup'], true, 'active', 'entrepreneurship', 'national', 'high'),

('NFTE World Series of Innovation', 'Solve real-world challenges from leading companies by developing innovative business ideas.', 'contest', 'Network for Teaching Entrepreneurship', 'National (USA)', '2026-05-31 23:59:59', '$1,000-$10,000', 'https://innovation.nfte.com', '{"economics": 3, "creation_science": 1}', ARRAY['Business', 'Innovation', 'Problem Solving'], 'Student', ARRAY['entrepreneurship', 'innovation', 'business'], false, 'active', 'entrepreneurship', 'national', 'middle,high'),

-- History & Social Studies
('National History Day', 'Students conduct original research on historical topics and present their findings through exhibits, documentaries, papers, performances, or websites.', 'contest', 'National History Day', 'National (USA)', '2026-06-15 23:59:59', '$1,000-$5,000', 'https://www.nhd.org', '{"history": 3, "english": 1}', ARRAY['History', 'Research', 'Documentary'], 'Student', ARRAY['history', 'research', 'documentary', 'exhibit'], true, 'active', 'history', 'national', 'middle,high'),

('C-SPAN StudentCam', 'Create a 5-6 minute documentary about a topic related to the Constitution and why it matters.', 'contest', 'C-SPAN', 'National (USA)', '2026-01-20 23:59:59', '$250-$5,000', 'https://www.studentcam.org', '{"history": 2, "english": 2, "creation_science": 1}', ARRAY['Documentary', 'Civics', 'Video Production'], 'Student', ARRAY['documentary', 'civics', 'government', 'video'], false, 'active', 'history', 'national', 'middle,high'),

-- Service & Leadership
('Prudential Spirit of Community Awards', 'Recognizes students in grades 5-12 for outstanding volunteer service to their communities.', 'contest', 'Prudential Financial', 'National (USA)', '2026-11-08 23:59:59', '$1,000-$5,000', 'https://spirit.prudential.com', '{"justice": 3}', ARRAY['Community Service', 'Volunteer'], 'Student', ARRAY['service', 'volunteer', 'community', 'leadership'], true, 'active', 'service', 'national', 'middle,high'),

('Yoshiyama Award for Exemplary Service', 'Honors high school seniors who have made sustained and significant contributions to their communities through volunteer service.', 'scholarship', 'Hitachi Foundation', 'National (USA)', '2026-02-28 23:59:59', '$5,000', 'https://www.hcifoundation.org', '{"justice": 3}', ARRAY['Community Service', 'Leadership'], 'Student', ARRAY['service', 'leadership', 'scholarship'], false, 'active', 'service', 'national', 'high')

ON CONFLICT DO NOTHING;
