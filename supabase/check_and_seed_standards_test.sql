-- Check Oklahoma standards setup and add test data for current student
-- IMPORTANT: Replace with actual student email below

-- Step 1: Verify Oklahoma standards exist
SELECT
    'Standards loaded' as check_name,
    COUNT(*) as count,
    COUNT(DISTINCT subject) as subjects,
    COUNT(DISTINCT grade_level) as grades
FROM state_standards
WHERE state = 'Oklahoma';

-- Step 2: Verify skill mappings exist
SELECT
    'Skill mappings loaded' as check_name,
    COUNT(*) as count
FROM skill_standard_mappings;

-- Step 3: Check current student profile
SELECT
    'Student profile' as check_name,
    id,
    email,
    display_name,
    grade_level,
    state_standards
FROM profiles
WHERE email = 'YOUR-STUDENT-EMAIL@example.com';  -- REPLACE THIS

-- Step 4: Add test standards progress for current student
-- Uncomment after replacing email above
/*
INSERT INTO student_standards_progress (student_id, standard_id, mastery_level, demonstrated_at)
SELECT
    (SELECT id FROM profiles WHERE email = 'YOUR-STUDENT-EMAIL@example.com'),
    ss.id,
    CASE
        WHEN random() < 0.2 THEN 'mastered'
        WHEN random() < 0.5 THEN 'proficient'
        WHEN random() < 0.8 THEN 'developing'
        ELSE 'introduced'
    END,
    NOW() - (random() * interval '14 days')
FROM state_standards ss
WHERE ss.state = 'Oklahoma'
    AND ss.grade_level IN ('11', '10', '9', 'High School')  -- Adjust for your grade
    AND ss.subject IN ('Mathematics', 'English Language Arts', 'Science')
LIMIT 15
ON CONFLICT (student_id, standard_id) DO NOTHING;

-- Step 5: Verify test data was inserted
SELECT
    sp.mastery_level,
    COUNT(*) as count,
    string_agg(DISTINCT s.subject, ', ') as subjects
FROM student_standards_progress sp
JOIN state_standards s ON sp.standard_id = s.id
WHERE sp.student_id = (SELECT id FROM profiles WHERE email = 'YOUR-STUDENT-EMAIL@example.com')
GROUP BY sp.mastery_level
ORDER BY sp.mastery_level;

-- Step 6: See actual standards for verification
SELECT
    s.standard_code,
    s.subject,
    s.statement_text,
    sp.mastery_level,
    sp.demonstrated_at
FROM student_standards_progress sp
JOIN state_standards s ON sp.standard_id = s.id
WHERE sp.student_id = (SELECT id FROM profiles WHERE email = 'YOUR-STUDENT-EMAIL@example.com')
ORDER BY sp.demonstrated_at DESC
LIMIT 10;
*/
