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
 'Connect geography to history'),

-- ============================================
-- OKLAHOMA MATHEMATICS STANDARDS (Elementary K-5)
-- ============================================
('OK.MATH.K.N.1', 'Oklahoma', 'Mathematics', 'K',
 'Count to 100 by ones and by tens.',
 'Develop number sequence to 100'),

('OK.MATH.1.N.1', 'Oklahoma', 'Mathematics', '1',
 'Count, read, and write whole numbers to 100.',
 'Work with numbers to 100'),

('OK.MATH.2.N.1', 'Oklahoma', 'Mathematics', '2',
 'Understand place value to 1000.',
 'Develop place value understanding'),

('OK.MATH.3.N.1', 'Oklahoma', 'Mathematics', '3',
 'Multiply and divide within 100 using strategies based on place value.',
 'Develop multiplication and division fluency'),

('OK.MATH.4.N.1', 'Oklahoma', 'Mathematics', '4',
 'Understand decimal notation for fractions and compare decimal fractions.',
 'Work with decimals and fractions'),

('OK.MATH.5.N.1', 'Oklahoma', 'Mathematics', '5',
 'Add, subtract, multiply, and divide decimals to hundredths.',
 'Perform operations with decimals'),

-- ============================================
-- OKLAHOMA MATHEMATICS STANDARDS (Middle School 6-7)
-- ============================================
('OK.MATH.6.N.1', 'Oklahoma', 'Mathematics', '6',
 'Understand ratio concepts and use ratio reasoning to solve problems.',
 'Work with ratios and proportions'),

('OK.MATH.7.N.1', 'Oklahoma', 'Mathematics', '7',
 'Apply and extend previous understandings of operations with fractions to operations with rational numbers.',
 'Operate with rational numbers'),

-- ============================================
-- OKLAHOMA MATHEMATICS STANDARDS (High School 9-12)
-- ============================================
('OK.MATH.HS.A.1', 'Oklahoma', 'Mathematics', '9-12',
 'Create equations and inequalities in one variable and use them to solve problems.',
 'Solve real-world algebra problems'),

('OK.MATH.HS.G.1', 'Oklahoma', 'Mathematics', '9-12',
 'Prove geometric theorems about lines, angles, triangles, and parallelograms.',
 'Understand geometric proofs'),

('OK.MATH.HS.F.1', 'Oklahoma', 'Mathematics', '9-12',
 'Understand that a function from one set to another assigns exactly one output to each input.',
 'Understand function concepts'),

-- ============================================
-- OKLAHOMA ELA STANDARDS (Elementary K-5)
-- ============================================
('OK.ELA.K.R.1', 'Oklahoma', 'English Language Arts', 'K',
 'Ask and answer questions about key details in a text.',
 'Comprehend read-aloud texts'),

('OK.ELA.1.R.1', 'Oklahoma', 'English Language Arts', '1',
 'Ask and answer questions about key details in a text.',
 'Read and comprehend simple texts'),

('OK.ELA.2.R.1', 'Oklahoma', 'English Language Arts', '2',
 'Ask and answer such questions as who, what, where, when, why, and how to demonstrate understanding of key details.',
 'Demonstrate reading comprehension'),

('OK.ELA.3.R.1', 'Oklahoma', 'English Language Arts', '3',
 'Ask and answer questions to demonstrate understanding, referring explicitly to the text.',
 'Use text evidence in comprehension'),

('OK.ELA.4.R.1', 'Oklahoma', 'English Language Arts', '4',
 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences.',
 'Make inferences from text'),

('OK.ELA.5.R.1', 'Oklahoma', 'English Language Arts', '5',
 'Quote accurately from a text when explaining what the text says explicitly and when drawing inferences.',
 'Quote text evidence accurately'),

-- ============================================
-- OKLAHOMA ELA STANDARDS (Middle School 6-7)
-- ============================================
('OK.ELA.6.R.1', 'Oklahoma', 'English Language Arts', '6',
 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn.',
 'Cite evidence in literary analysis'),

('OK.ELA.7.R.1', 'Oklahoma', 'English Language Arts', '7',
 'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences.',
 'Support analysis with multiple sources'),

-- ============================================
-- OKLAHOMA ELA STANDARDS (High School 9-12)
-- ============================================
('OK.ELA.HS.R.1', 'Oklahoma', 'English Language Arts', '9-12',
 'Cite strong and thorough textual evidence to support analysis of what the text says explicitly as well as inferences drawn.',
 'Analyze literature with thorough evidence'),

('OK.ELA.HS.W.1', 'Oklahoma', 'English Language Arts', '9-12',
 'Write arguments to support claims in an analysis of substantive topics or texts, using valid reasoning and relevant evidence.',
 'Write persuasive arguments'),

('OK.ELA.HS.W.2', 'Oklahoma', 'English Language Arts', '9-12',
 'Write informative/explanatory texts to examine and convey complex ideas clearly and accurately.',
 'Write expository texts'),

-- ============================================
-- OKLAHOMA SCIENCE STANDARDS (Elementary K-5)
-- ============================================
('OK.SCI.K.PS.1', 'Oklahoma', 'Science', 'K',
 'Plan and conduct investigations to compare the effects of different strengths or different directions of pushes and pulls on the motion of an object.',
 'Understand forces and motion basics'),

('OK.SCI.1.LS.1', 'Oklahoma', 'Science', '1',
 'Use observations to describe patterns of what plants and animals need to survive.',
 'Understand basic needs of living things'),

('OK.SCI.2.ESS.1', 'Oklahoma', 'Science', '2',
 'Use information from several sources to provide evidence that Earth events can occur quickly or slowly.',
 'Understand Earth processes'),

('OK.SCI.3.LS.1', 'Oklahoma', 'Science', '3',
 'Develop models to describe that organisms have unique and diverse life cycles.',
 'Understand life cycles'),

('OK.SCI.4.ESS.1', 'Oklahoma', 'Science', '4',
 'Identify evidence from patterns in rock formations and fossils in rock layers to support an explanation for changes in a landscape over time.',
 'Understand geological time and change'),

('OK.SCI.5.PS.1', 'Oklahoma', 'Science', '5',
 'Develop a model to describe that matter is made of particles too small to be seen.',
 'Understand atomic structure basics'),

-- ============================================
-- OKLAHOMA SCIENCE STANDARDS (Middle School 6-7)
-- ============================================
('OK.SCI.6.LS.1', 'Oklahoma', 'Science', '6',
 'Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy.',
 'Understand photosynthesis and energy'),

('OK.SCI.7.ESS.1', 'Oklahoma', 'Science', '7',
 'Develop and use a model to describe the cycling of water through Earth''s systems driven by energy from the sun and the force of gravity.',
 'Understand the water cycle'),

-- ============================================
-- OKLAHOMA SCIENCE STANDARDS (High School 9-12)
-- ============================================
('OK.SCI.HS.PS.1', 'Oklahoma', 'Science', '9-12',
 'Use the periodic table as a model to predict the relative properties of elements based on the patterns of electrons in the outermost energy level of atoms.',
 'Understand periodic table and atomic structure'),

('OK.SCI.HS.LS.1', 'Oklahoma', 'Science', '9-12',
 'Construct an explanation based on evidence for how the structure of DNA determines the structure of proteins which carry out the essential functions of life.',
 'Understand DNA and protein synthesis'),

('OK.SCI.HS.ESS.1', 'Oklahoma', 'Science', '9-12',
 'Develop a model based on evidence to illustrate the life span of the sun and the role of nuclear fusion in the sun''s core.',
 'Understand stellar processes'),

-- ============================================
-- OKLAHOMA HISTORY STANDARDS (Elementary K-5)
-- ============================================
('OK.HIST.K.1', 'Oklahoma', 'History', 'K',
 'Understand that history describes events and people of other times and places.',
 'Develop historical thinking'),

('OK.HIST.1.1', 'Oklahoma', 'History', '1',
 'Describe family history, customs, and traditions.',
 'Understand personal and family history'),

('OK.HIST.2.1', 'Oklahoma', 'History', '2',
 'Describe the significance of various community, state, and national celebrations.',
 'Understand civic celebrations'),

('OK.HIST.3.1', 'Oklahoma', 'History', '3',
 'Examine the characteristics of places and regions.',
 'Understand geography and regions'),

('OK.HIST.4.1', 'Oklahoma', 'History', '4',
 'Describe the early explorations of the Americas.',
 'Understand exploration history'),

('OK.HIST.5.1', 'Oklahoma', 'History', '5',
 'Examine the causes and effects of the American Revolution.',
 'Understand Revolutionary War'),

-- ============================================
-- OKLAHOMA HISTORY STANDARDS (Middle School 6-7)
-- ============================================
('OK.HIST.6.1', 'Oklahoma', 'History', '6',
 'Analyze the development of civilizations in various regions of the world.',
 'Understand ancient civilizations'),

('OK.HIST.7.1', 'Oklahoma', 'History', '7',
 'Examine medieval and Renaissance periods.',
 'Understand medieval and Renaissance history'),

-- ============================================
-- OKLAHOMA HISTORY STANDARDS (High School 9-12)
-- ============================================
('OK.HIST.HS.1', 'Oklahoma', 'History', '9-12',
 'Analyze the political, economic, and social transformations that have shaped world history.',
 'Understand global historical transformations'),

('OK.HIST.HS.2', 'Oklahoma', 'History', '9-12',
 'Evaluate the role of the United States in international affairs.',
 'Understand U.S. foreign policy history')

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
