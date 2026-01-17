-- First, update the category constraint to accept new categories
ALTER TABLE public.library_projects DROP CONSTRAINT IF EXISTS library_projects_category_check;

ALTER TABLE public.library_projects ADD CONSTRAINT library_projects_category_check
  CHECK (category IN (
    'God''s Creation & Science',
    'Health/Naturopathy',
    'Food Systems',
    'Government/Economics',
    'Justice',
    'Discipleship',
    'History',
    'English/Lit',
    'Math',
    'game',
    'art',
    'farm',
    'science'
  ));

-- Add the approved column if it doesn't exist
ALTER TABLE public.library_projects ADD COLUMN IF NOT EXISTS approved boolean DEFAULT true;
ALTER TABLE public.library_projects ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved';

-- Now insert the 3 starter projects
INSERT INTO public.library_projects (
    title,
    description,
    category,
    instructions,
    materials,
    credit_value,
    difficulty,
    grade_levels,
    approved,
    approval_status,
    estimated_time
) VALUES
(
    'The Fibonacci Trail',
    'Search for the hidden mathematical signatures of creation in your own backyard.',
    'God''s Creation & Science',
    '1. Head outside and find five different plants or flowers.
2. Count the petals on each flower.
3. Look for spiral patterns in pinecones or sunflowers.
4. Record your findings and see if they match the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13).
5. Sketch the most perfect spiral you find.',
    ARRAY['Notebook', 'Pencil', 'Magnifying glass'],
    0.01,
    'beginner',
    ARRAY['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    true,
    'approved',
    '30-45 minutes'
),
(
    'Heritage Seed Saving',
    'Preserve the inheritance of the land by saving seeds from your food.',
    'Food Systems',
    '1. Select a heirloom fruit or vegetable (like a tomato or pepper).
2. Carefully extract the seeds.
3. Clean and dry them thoroughly on a paper towel.
4. Research the history of this specific variety.
5. Design a seed packet with planting instructions and historical notes to share with a neighbor.',
    ARRAY['Heirloom produce', 'Paper towels', 'Small envelopes', 'Colored pencils'],
    0.015,
    'beginner',
    ARRAY['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    true,
    'approved',
    '1-2 hours'
),
(
    'The Living Archive',
    'Connect your own family journey to the broader story of humanity.',
    'History',
    '1. Interview the oldest living member of your family or community.
2. Record three stories of ''Restored Hope'' from their life.
3. Draw a family tree that stretches back at least 4 generations.
4. Identify one historical event that impacted your ancestors.
5. Create a ''Legacy Portfolio'' of their advice for your generation.',
    ARRAY['Voice recorder (phone)', 'Large paper', 'Photos (optional)'],
    0.02,
    'beginner',
    ARRAY['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    true,
    'approved',
    '2-3 hours'
)
ON CONFLICT DO NOTHING;

-- Verify the results
SELECT id, title, category, approved FROM public.library_projects ORDER BY created_at DESC;
