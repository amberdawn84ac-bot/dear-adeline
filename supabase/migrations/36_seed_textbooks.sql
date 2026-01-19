-- History Seed Data
INSERT INTO public.textbook_events (title, date_display, era, mainstream_narrative, primary_sources, sort_order, approved)
VALUES 
('Creation of the World', 'Day 1-6', 'creation', 'The universe began with a Big Bang approximately 13.8 billion years ago, followed by gradual cosmic evolution.', 'Genesis 1:1 - "In the beginning God created the heavens and the earth." God spoke the world into existence in six days.', 1, true),
('The Great Flood', 'Approx. 2348 BC', 'creation', 'Most cultures have flood myths due to localized flooding at the end of the last Ice Age.', 'Genesis 6-9 describes a global flood judgment. "The waters rose and covered the mountains to a depth of more than fifteen cubits." (Gen 7:20)', 2, true),
('Call of Abraham', 'Approx. 2100 BC', 'ancient', 'Bronze Age migration of Semitic peoples in the Fertile Crescent.', 'Genesis 12:1 - "Go from your country, your people and your father''s household to the land I will show you."', 3, true),
('Exodus from Egypt', 'Approx. 1446 BC', 'ancient', 'Egyptologists find little evidence for a massive Israelite exodus in the 15th century BC.', 'Exodus 14 describes the miraculous parting of the Red Sea. "The Lord drove the sea back with a strong east wind and made the land dry."', 4, true);

-- Science Seed Data
INSERT INTO public.textbook_concepts (title, branch, why_it_matters, what_models_say, what_we_observe, sort_order, approved)
VALUES
('Matter & Atoms', 'matter', 'Everything physical is made of matter. Understanding it helps us build, cook, and create.', 'Standard Model describes quarks, leptons, and bosons as fundamental particles.', '["We observe consistent structures in crystals and chemical reactions.", "Matter has mass and takes up space."]', 1, true),
('Energy Transformation', 'energy', 'Energy cannot be created or destroyed, only changed. This is the First Law of Thermodynamics.', 'Energy is a quantitative property that must be transferred to an object in order to perform work on, or to heat, the object.', '["A rolling ball stops (friction turns motion to heat).", "Plants turn sunlight into chemical energy."]', 2, true),
('Photosynthesis', 'growing', 'This is how plants make food from sunlight, which feeds almost all life on Earth.', 'Chemical equation: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2.', '["Plants grow toward light.", "Leaves turn green (chlorophyll).", "Plants release oxygen."]', 3, true),
('Gravity', 'gravity', 'Gravity holds us to the earth and keeps planets in orbit.', 'General Relativity describes gravity as the curvature of spacetime caused by mass.', '["things fall down", "planets orbit the sun", "tides"]', 4, true);
