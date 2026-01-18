-- Migration 37: Seed ELA Gateway Questions (Grades 3-6)

-- Grade 3 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'Which word is a noun? "The quick brown fox jumps."', '[{"text": "fox", "isCorrect": true}, {"text": "quick", "isCorrect": false}, {"text": "jumps", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'English Language Arts', true, 20),
('multiple_choice', 'What does "enormous" mean?', '[{"text": "Very big", "isCorrect": true}, {"text": "Very small", "isCorrect": false}, {"text": "Very fast", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'English Language Arts', true, 20),
('multiple_choice', 'Which sentence is correct?', '[{"text": "She runs fast.", "isCorrect": true}, {"text": "She run fast.", "isCorrect": false}, {"text": "Her runs fast.", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'English Language Arts', true, 25);

-- Grade 4 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is the main idea of a paragraph?', '[{"text": "What the paragraph is mostly about", "isCorrect": true}, {"text": "The first sentence", "isCorrect": false}, {"text": "A small detail", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'English Language Arts', true, 25),
('multiple_choice', 'Which word is an adjective in: "The tall tree swayed"?', '[{"text": "tall", "isCorrect": true}, {"text": "tree", "isCorrect": false}, {"text": "swayed", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'English Language Arts', true, 20),
('multiple_choice', 'What is a synonym for "happy"?', '[{"text": "joyful", "isCorrect": true}, {"text": "sad", "isCorrect": false}, {"text": "angry", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'English Language Arts', true, 20);

-- Grade 5 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What does it mean to "infer" something?', '[{"text": "Figure out from clues", "isCorrect": true}, {"text": "Read out loud", "isCorrect": false}, {"text": "Copy exactly", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'English Language Arts', true, 25),
('multiple_choice', 'Which sentence uses a comma correctly?', '[{"text": "After dinner, we played games.", "isCorrect": true}, {"text": "After, dinner we played games.", "isCorrect": false}, {"text": "After dinner we, played games.", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'English Language Arts', true, 30),
('multiple_choice', 'What is the author''s purpose if they want to teach you something?', '[{"text": "To inform", "isCorrect": true}, {"text": "To entertain", "isCorrect": false}, {"text": "To persuade", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'English Language Arts', true, 25);

-- Grade 6 ELA Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is a "theme" in a story?', '[{"text": "The message or lesson", "isCorrect": true}, {"text": "The main character", "isCorrect": false}, {"text": "Where the story happens", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'English Language Arts', true, 25),
('multiple_choice', 'Which is an example of figurative language?', '[{"text": "Her smile was sunshine", "isCorrect": true}, {"text": "She smiled brightly", "isCorrect": false}, {"text": "She smiled at me", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'English Language Arts', true, 30),
('multiple_choice', 'What does "analyze" mean?', '[{"text": "Examine closely to understand", "isCorrect": true}, {"text": "Summarize briefly", "isCorrect": false}, {"text": "Write quickly", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'English Language Arts', true, 25);
