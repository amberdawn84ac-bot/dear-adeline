-- Migration 36: Seed Math Gateway Questions (Grades 3-6)
-- Core assessment questions for initial placement

-- Grade 3 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 7 × 8?', '[{"text": "56", "isCorrect": true}, {"text": "54", "isCorrect": false}, {"text": "48", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'Mathematics', true, 20),
('multiple_choice', 'What is 45 + 38?', '[{"text": "83", "isCorrect": true}, {"text": "73", "isCorrect": false}, {"text": "93", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'Mathematics', true, 25),
('multiple_choice', 'Which fraction is larger: 1/2 or 1/4?', '[{"text": "1/2", "isCorrect": true}, {"text": "1/4", "isCorrect": false}, {"text": "They are equal", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '3', 'Mathematics', true, 20);

-- Grade 4 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 6 × 12?', '[{"text": "72", "isCorrect": true}, {"text": "66", "isCorrect": false}, {"text": "78", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'Mathematics', true, 20),
('multiple_choice', 'What is 1/4 + 1/4?', '[{"text": "1/2", "isCorrect": true}, {"text": "2/8", "isCorrect": false}, {"text": "1/8", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'Mathematics', true, 25),
('multiple_choice', 'Round 3,847 to the nearest hundred.', '[{"text": "3,800", "isCorrect": true}, {"text": "3,900", "isCorrect": false}, {"text": "4,000", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '4', 'Mathematics', true, 20);

-- Grade 5 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 3/4 + 1/2?', '[{"text": "1 1/4", "isCorrect": true}, {"text": "4/6", "isCorrect": false}, {"text": "1", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'Mathematics', true, 30),
('multiple_choice', 'What is 2.5 × 4?', '[{"text": "10", "isCorrect": true}, {"text": "8.5", "isCorrect": false}, {"text": "6.5", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'Mathematics', true, 25),
('multiple_choice', 'If a rectangle has length 8 and width 5, what is its area?', '[{"text": "40", "isCorrect": true}, {"text": "26", "isCorrect": false}, {"text": "13", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '5', 'Mathematics', true, 25);

-- Grade 6 Math Gateway Questions
insert into public.assessment_questions (question_type, prompt, options, grade_level, subject, is_gateway, estimated_seconds) values
('multiple_choice', 'What is 2/3 ÷ 1/2?', '[{"text": "1 1/3", "isCorrect": true}, {"text": "1/3", "isCorrect": false}, {"text": "3/4", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'Mathematics', true, 35),
('multiple_choice', 'Solve for x: 3x = 18', '[{"text": "6", "isCorrect": true}, {"text": "15", "isCorrect": false}, {"text": "21", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'Mathematics', true, 30),
('multiple_choice', 'What is 25% of 80?', '[{"text": "20", "isCorrect": true}, {"text": "25", "isCorrect": false}, {"text": "40", "isCorrect": false}, {"text": "I don''t know", "isCorrect": false}]', '6', 'Mathematics', true, 25);
