-- Fix stale opportunities issue
-- This will delete old 2025 opportunities and let the auto-scraper repopulate with fresh data

-- Step 1: See what we're about to delete
SELECT
    COUNT(*) as total_opportunities,
    COUNT(*) FILTER (WHERE deadline < NOW()) as expired,
    COUNT(*) FILTER (WHERE deadline >= NOW() OR deadline IS NULL) as current_or_unknown
FROM opportunities;

-- Step 2: Delete all opportunities with 2025 deadlines (they're stale)
DELETE FROM opportunities
WHERE deadline IS NOT NULL
  AND deadline < NOW();

-- Step 3: Delete the seeded test data (optional - uncomment if you want a complete fresh start)
/*
DELETE FROM opportunities
WHERE source_url LIKE '%example.com%';
*/

-- Step 4: Verify deletion
SELECT
    COUNT(*) as remaining_opportunities,
    MIN(deadline) as earliest_deadline,
    MAX(deadline) as latest_deadline
FROM opportunities;

-- Note: After running this, the opportunities page will auto-search
-- and populate with fresh data using the Tavily API scraper
