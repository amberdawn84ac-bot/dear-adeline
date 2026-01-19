-- Quick test to verify Oklahoma standards are loaded and add test progress
-- Replace 'your-student-email@example.com' with the student account email

-- Step 1: Verify Oklahoma standards exist
SELECT
    COUNT(*) as total_standards,
    COUNT(DISTINCT subject) as subjects,
    COUNT(DISTINCT grade_level) as grade_levels
FROM state_standards
WHERE state = 'Oklahoma';

-- Step 2: See what subjects are available
SELECT DISTINCT subject, COUNT(*) as count
FROM state_standards
WHERE state = 'Oklahoma'
GROUP BY subject
ORDER BY subject;

-- Step 3: Check if student has grade level set
SELECT id, email, grade_level, state_standards
FROM profiles
WHERE email = 'your-student-email@example.com';

-- Step 4: Add test standards progress (uncomment after verifying student ID)
/*
INSERT INTO student_standards_progress (student_id, standard_id, mastery_level, demonstrated_at)
SELECT
    (SELECT id FROM profiles WHERE email = 'your-student-email@example.com'),
    ss.id,
    CASE
        WHEN random() < 0.25 THEN 'mastered'
        WHEN random() < 0.5 THEN 'proficient'
        WHEN random() < 0.75 THEN 'developing'
        ELSE 'introduced'
    END,
    NOW() - (random() * interval '30 days')
FROM state_standards ss
WHERE ss.state = 'Oklahoma'
    AND ss.grade_level = '8'  -- Change to match student's grade
LIMIT 12
ON CONFLICT (student_id, standard_id) DO NOTHING;

-- Verify data was inserted
SELECT
    sp.mastery_level,
    s.standard_code,
    s.subject,
    s.statement_text
FROM student_standards_progress sp
JOIN state_standards s ON sp.standard_id = s.id
WHERE sp.student_id = (SELECT id FROM profiles WHERE email = 'your-student-email@example.com')
ORDER BY sp.demonstrated_at DESC;
*/
