-- Upgrade 'skills' from text[] to jsonb for advanced analytics
-- This allows queries like: SELECT * FROM activity_logs WHERE skills @> '["Physics"]';

ALtER TABLE activity_logs 
ALTER COLUMN skills TYPE jsonb 
USING to_jsonb(skills);
