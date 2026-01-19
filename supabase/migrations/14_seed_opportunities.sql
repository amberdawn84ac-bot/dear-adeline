-- Seed sample opportunities for testing

INSERT INTO opportunities (title, description, type, organization, location, deadline, amount, source_url, track_credits, disciplines, experience_level, tags, featured) VALUES

-- Art Opportunities
('Youth Mural Grant - Oklahoma City', 'Design and paint a mural for a city park. Submit a proposal including concept sketches, budget, and timeline. Selected artists receive funding and mentorship.', 'grant', 'Oklahoma City Arts Council', 'Oklahoma City, OK', '2025-03-15 23:59:59', '$500-$2000', 'https://example.com/mural-grant', '{"creation_science": 2, "economics": 1, "justice": 1}', ARRAY['Digital Art', 'Painting', 'Sculpture'], 'Student', ARRAY['art', 'public art', 'community'], true),

('Scholastic Art & Writing Awards', 'Submit original artwork or writing for national recognition. Winners receive scholarships and exhibition opportunities.', 'contest', 'Scholastic Inc.', 'National (USA)', '2025-01-10 23:59:59', '$500-$10000', 'https://www.artandwriting.org', '{"creation_science": 2, "english": 2}', ARRAY['Digital Art', 'Painting', 'Writing', 'Poetry'], 'Student', ARRAY['art', 'writing', 'scholarship'], true),

-- Writing Opportunities
('Oklahoma Youth Poetry Contest', 'Submit 3-5 original poems on the theme of "Home and Heritage". Winners published in state anthology.', 'contest', 'Oklahoma Arts Institute', 'Oklahoma', '2025-04-01 23:59:59', '$100-$500', 'https://example.com/poetry-contest', '{"english": 2, "discipleship": 1}', ARRAY['Writing', 'Poetry'], 'Student', ARRAY['writing', 'poetry', 'publication'], false),

('Teen Voices Essay Competition', 'Write a 1000-word essay on social justice topics. Winners receive publication and mentorship.', 'contest', 'Teen Voices Magazine', 'National (USA)', '2025-02-28 23:59:59', '$250-$1000', 'https://example.com/essay-contest', '{"english": 2, "justice": 2}', ARRAY['Writing'], 'Student', ARRAY['writing', 'social justice', 'essay'], false),

-- Music Opportunities
('Young Composers Competition', 'Submit an original musical composition (any genre). Winners performed by professional orchestra.', 'contest', 'Oklahoma Symphony', 'Oklahoma City, OK', '2025-05-15 23:59:59', '$500-$1500', 'https://example.com/composers', '{"creation_science": 3}', ARRAY['Music', 'Composition'], 'Student', ARRAY['music', 'composition', 'performance'], false),

-- Science & STEM
('Regional Science Fair', 'Conduct original research and present findings. Winners advance to state and national competitions.', 'contest', 'Oklahoma Science Teachers Association', 'Regional', '2025-02-01 23:59:59', '$100-$500', 'https://example.com/science-fair', '{"creation_science": 3, "english": 1}', ARRAY['Science', 'Research'], 'Student', ARRAY['science', 'research', 'STEM'], true),

-- Entrepreneurship
('Youth Entrepreneurship Challenge', 'Develop a business plan for a social enterprise. Winners receive seed funding and mentorship.', 'contest', 'Oklahoma Small Business Development', 'Oklahoma', '2025-03-30 23:59:59', '$1000-$5000', 'https://example.com/entrepreneur', '{"economics": 3, "english": 1}', ARRAY['Business', 'Entrepreneurship'], 'Student', ARRAY['business', 'entrepreneurship', 'startup'], true),

-- Community Service
('Community Impact Grant', 'Propose a project that addresses a local need. Receive funding to implement your solution.', 'grant', 'Oklahoma Community Foundation', 'Oklahoma', '2025-04-15 23:59:59', '$500-$3000', 'https://example.com/community-grant', '{"justice": 2, "economics": 1, "english": 1}', ARRAY['Community Service', 'Leadership'], 'Student', ARRAY['service', 'community', 'leadership'], false),

-- Photography
('Youth Photography Exhibition', 'Submit 5-10 photos on the theme of "Oklahoma Landscapes". Selected works exhibited in gallery.', 'contest', 'Oklahoma Museum of Art', 'Oklahoma City, OK', '2025-03-01 23:59:59', '$200-$800', 'https://example.com/photo-exhibit', '{"creation_science": 2}', ARRAY['Photography'], 'Student', ARRAY['photography', 'exhibition', 'art'], false),

-- Film & Media
('Student Film Festival', 'Create a short film (5-15 minutes) on any topic. Winners screened at state festival.', 'contest', 'Oklahoma Film Society', 'Oklahoma', '2025-05-01 23:59:59', '$300-$1500', 'https://example.com/film-festival', '{"creation_science": 3, "english": 1}', ARRAY['Film', 'Video Production'], 'Student', ARRAY['film', 'video', 'storytelling'], false),

-- History & Research
('Local History Documentary Project', 'Research and document local history through interviews and archival research. Create a multimedia presentation.', 'grant', 'Oklahoma Historical Society', 'Oklahoma', '2025-06-01 23:59:59', '$500-$2000', 'https://example.com/history-grant', '{"history": 3, "english": 1, "creation_science": 1}', ARRAY['History', 'Research', 'Documentary'], 'Student', ARRAY['history', 'research', 'documentary'], false),

-- Performing Arts
('Youth Theatre Scholarship', 'Audition for summer theatre program. Scholarships cover tuition and provide professional training.', 'scholarship', 'Oklahoma Theatre Company', 'Oklahoma City, OK', '2025-02-15 23:59:59', '$500-$2500', 'https://example.com/theatre-scholarship', '{"creation_science": 2}', ARRAY['Theatre', 'Performing Arts'], 'Student', ARRAY['theatre', 'performance', 'scholarship'], false),

-- Environmental
('Green Innovation Challenge', 'Design a solution to an environmental problem. Winners receive funding to prototype their idea.', 'contest', 'Oklahoma Environmental Council', 'Oklahoma', '2025-04-20 23:59:59', '$1000-$3000', 'https://example.com/green-challenge', '{"creation_science": 2, "economics": 1, "food_systems": 1}', ARRAY['Environmental Science', 'Engineering'], 'Student', ARRAY['environment', 'innovation', 'sustainability'], true),

-- Coding & Technology
('App Development Competition', 'Build a mobile app that solves a real-world problem. Winners receive mentorship and funding.', 'contest', 'Oklahoma Tech Alliance', 'Oklahoma', '2025-05-30 23:59:59', '$500-$2000', 'https://example.com/app-contest', '{"creation_science": 3, "economics": 1}', ARRAY['Coding', 'Technology'], 'Student', ARRAY['coding', 'technology', 'app development'], false),

-- Fashion & Design
('Sustainable Fashion Design Contest', 'Create a fashion piece using sustainable materials. Winners showcased at fashion show.', 'contest', 'Oklahoma Fashion Alliance', 'Oklahoma City, OK', '2025-03-20 23:59:59', '$300-$1200', 'https://example.com/fashion-contest', '{"creation_science": 2, "economics": 1}', ARRAY['Fashion Design', 'Textile Arts'], 'Student', ARRAY['fashion', 'design', 'sustainability'], false);
