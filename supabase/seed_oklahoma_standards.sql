-- Seed Oklahoma State Standards
-- This provides a starter set of standards for common subjects
-- Full standards can be imported later via CASE API integration

-- ============================================
-- OKLAHOMA MATHEMATICS STANDARDS (Grade 8)
-- ============================================
INSERT INTO public.state_standards (
  standard_code,
  jurisdiction,
  subject,
  grade_level,
  statement_text,
  description
) VALUES
-- Number and Operations
('OK.MATH.8.N.1', 'Oklahoma', 'Mathematics', '8',
 'Know that numbers that are not rational are called irrational.',
 'Understand the concept of irrational numbers'),

('OK.MATH.8.N.2', 'Oklahoma', 'Mathematics', '8',
 'Compare and order real numbers; locate real numbers on a number line.',
 'Work with real numbers on number lines'),

-- Algebra
('OK.MATH.8.A.1', 'Oklahoma', 'Mathematics', '8',
 'Represent, interpret, and analyze patterns, trends, and relationships with tables, graphs, words, and symbolic rules.',
 'Use multiple representations of functions'),

('OK.MATH.8.A.2', 'Oklahoma', 'Mathematics', '8',
 'Solve linear equations and inequalities using concrete, formal, and calculator methods.',
 'Solve basic linear equations'),

('OK.MATH.8.A.3', 'Oklahoma', 'Mathematics', '8',
 'Use the properties of operations to generate equivalent expressions.',
 'Understand algebraic properties'),

-- Geometry and Measurement
('OK.MATH.8.GM.1', 'Oklahoma', 'Mathematics', '8',
 'Understand and apply the Pythagorean Theorem.',
 'Use Pythagorean Theorem to solve problems'),

('OK.MATH.8.GM.2', 'Oklahoma', 'Mathematics', '8',
 'Solve problems involving surface area and volume of three-dimensional objects.',
 'Calculate surface area and volume'),

-- ============================================
-- OKLAHOMA ENGLISH LANGUAGE ARTS (Grade 8)
-- ============================================
('OK.ELA.8.R.1', 'Oklahoma', 'English Language Arts', '8',
 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn.',
 'Support analysis with text evidence'),

('OK.ELA.8.R.2', 'Oklahoma', 'English Language Arts', '8',
 'Determine a theme or central idea of a text and analyze its development.',
 'Identify and analyze themes'),

('OK.ELA.8.W.1', 'Oklahoma', 'English Language Arts', '8',
 'Write arguments to support claims with clear reasons and relevant evidence.',
 'Write argumentative essays'),

('OK.ELA.8.W.2', 'Oklahoma', 'English Language Arts', '8',
 'Write informative/explanatory texts to examine a topic and convey ideas clearly.',
 'Write informational texts'),

-- ============================================
-- OKLAHOMA SCIENCE STANDARDS (Grade 8)
-- ============================================
('OK.SCI.8.PS.1', 'Oklahoma', 'Science', '8',
 'Develop models to describe the atomic composition of simple molecules and extended structures.',
 'Understand atomic structure and molecules'),

('OK.SCI.8.PS.2', 'Oklahoma', 'Science', '8',
 'Analyze and interpret data on the properties of substances before and after chemical reactions.',
 'Understand chemical reactions'),

('OK.SCI.8.LS.1', 'Oklahoma', 'Science', '8',
 'Construct an explanation for how genetic variations of traits in a population increase survival.',
 'Understand natural selection and genetics'),

('OK.SCI.8.ESS.1', 'Oklahoma', 'Science', '8',
 'Develop a model to describe the cycling of Earth''s materials and the flow of energy.',
 'Understand Earth systems and energy flow'),

-- ============================================
-- OKLAHOMA HISTORY/SOCIAL STUDIES (Grade 8)
-- ============================================
('OK.HIST.8.1', 'Oklahoma', 'History', '8',
 'Examine the foundations and development of American political ideals.',
 'Understand U.S. government foundations'),

('OK.HIST.8.2', 'Oklahoma', 'History', '8',
 'Analyze the causes and effects of major events in U.S. history.',
 'Understand historical cause and effect'),

('OK.HIST.8.3', 'Oklahoma', 'History', '8',
 'Evaluate the impact of geographic factors on historical events.',
 'Connect geography to history')

ON CONFLICT (standard_code, jurisdiction) DO NOTHING;

-- ============================================
-- Verify the results
-- ============================================
SELECT
  subject,
  COUNT(*) as standard_count
FROM public.state_standards
WHERE jurisdiction = 'Oklahoma'
GROUP BY subject
ORDER BY subject;
