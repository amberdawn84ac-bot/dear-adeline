-- Reset all users except admin
-- IMPORTANT: Replace 'your-admin-email@example.com' with your actual admin email!

-- Preview: See what will be deleted
SELECT
    u.id,
    u.email,
    u.created_at,
    (SELECT COUNT(*) FROM activity_logs WHERE student_id = u.id) as activity_count,
    (SELECT COUNT(*) FROM conversations WHERE user_id = u.id) as conversation_count
FROM auth.users u
WHERE u.email != 'your-admin-email@example.com'
ORDER BY u.created_at DESC;

-- Step 1: Delete all child records first (in dependency order)
-- This avoids foreign key constraint violations

DELETE FROM student_standards_progress
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM student_skills
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM student_graduation_progress
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM skill_levels
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM activity_logs
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM daily_journal_entries
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM student_project_progress
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM daily_plans
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM placement_assessments
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM game_sessions
WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM student_interests
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM student_memories
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM learning_gaps
WHERE student_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM portfolio_items
WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM conversations
WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM messages
WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

DELETE FROM response_times
WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

-- Step 2: Delete profiles
DELETE FROM profiles
WHERE id IN (
    SELECT id FROM auth.users
    WHERE email != 'your-admin-email@example.com'
);

-- Step 3: Delete auth users (this will cascade to auth-related tables)
DELETE FROM auth.users
WHERE email != 'your-admin-email@example.com';

-- Verify deletion
SELECT
    'Users remaining' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT
    'Profiles remaining' as table_name,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT
    'Activity logs remaining' as table_name,
    COUNT(*) as count
FROM activity_logs;
