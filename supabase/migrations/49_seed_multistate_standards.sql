-- Seed additional state standards (Texas, California, Florida)
-- These are representative standards for multi-state support

-- ============================================
-- TEXAS ESSENTIAL KNOWLEDGE AND SKILLS (TEKS)
-- ============================================

-- Texas Mathematics (Grade 8)
INSERT INTO public.state_standards (standard_code, jurisdiction, subject, grade_level, statement_text, description) VALUES
('TX.MATH.8.1A', 'Texas', 'Mathematics', '8', 'Extend previous knowledge of sets and subsets using a visual representation to describe relationships between sets of real numbers.', 'Understand real number sets'),
('TX.MATH.8.2A', 'Texas', 'Mathematics', '8', 'Extend previous knowledge of sets and subsets using a visual representation to describe relationships between sets of rational numbers.', 'Work with rational numbers'),
('TX.MATH.8.4A', 'Texas', 'Mathematics', '8', 'Use similar right triangles to develop an understanding that slope, m, given as the rate comparing the change in y-values to the change in x-values.', 'Understand slope'),
('TX.MATH.8.5A', 'Texas', 'Mathematics', '8', 'Represent linear proportional situations with tables, graphs, and equations in the form y = kx.', 'Linear proportional relationships'),
('TX.MATH.8.6A', 'Texas', 'Mathematics', '8', 'Describe the volume formula V = Bh of a cylinder in terms of its base area and its height.', 'Volume of cylinders'),
('TX.MATH.8.7A', 'Texas', 'Mathematics', '8', 'Solve problems involving the volume of cylinders, cones, and spheres.', 'Apply volume formulas'),
('TX.MATH.8.8A', 'Texas', 'Mathematics', '8', 'Write one-variable equations or inequalities with variables on both sides that represent problems using rational number coefficients.', 'Multi-step equations'),

-- Texas ELA (Grade 8)
('TX.ELA.8.5A', 'Texas', 'English Language Arts', '8', 'Establish a thesis or controlling idea for an explanatory text.', 'Write thesis statements'),
('TX.ELA.8.6A', 'Texas', 'English Language Arts', '8', 'Analyze how the author''s use of language contributes to mood and voice.', 'Analyze author craft'),
('TX.ELA.8.7A', 'Texas', 'English Language Arts', '8', 'Infer multiple themes within a text using text evidence.', 'Identify themes'),
('TX.ELA.8.10A', 'Texas', 'English Language Arts', '8', 'Compose a literary analysis that demonstrates an understanding of author''s craft.', 'Write literary analysis'),

-- Texas Science (Grade 8)
('TX.SCI.8.5A', 'Texas', 'Science', '8', 'Describe the structure of atoms, including the masses, electrical charges, and locations of protons and neutrons in the nucleus and electrons in the electron cloud.', 'Atomic structure'),
('TX.SCI.8.6A', 'Texas', 'Science', '8', 'Demonstrate and calculate how unbalanced forces change the speed or direction of an object''s motion.', 'Forces and motion'),
('TX.SCI.8.9A', 'Texas', 'Science', '8', 'Describe the historical development of the Periodic Table and how the arrangement reflects the properties of elements.', 'Periodic table'),

-- Texas Social Studies (Grade 8)
('TX.SS.8.1A', 'Texas', 'History', '8', 'Identify the major eras and events in U.S. history through 1877.', 'U.S. History through Reconstruction'),
('TX.SS.8.4A', 'Texas', 'History', '8', 'Analyze the causes of the American Revolution, including the Proclamation of 1763.', 'American Revolution causes'),
('TX.SS.8.7A', 'Texas', 'History', '8', 'Analyze the issues of the Constitutional Convention of 1787.', 'Constitutional Convention'),

-- Texas Elementary (K-5 samples)
('TX.MATH.K.2A', 'Texas', 'Mathematics', 'K', 'Count forward and backward to at least 20 with and without objects.', 'Counting to 20'),
('TX.MATH.3.4A', 'Texas', 'Mathematics', '3', 'Recall facts to multiply up to 10 by 10 with automaticity.', 'Multiplication facts'),
('TX.MATH.5.3A', 'Texas', 'Mathematics', '5', 'Estimate to determine solutions to mathematical and real-world problems involving addition, subtraction, multiplication, or division.', 'Estimation strategies'),

-- Texas High School
('TX.MATH.A1.2A', 'Texas', 'Mathematics', '9-12', 'Determine the domain and range of a linear function in mathematical problems; determine reasonable domain and range values for real-world situations.', 'Domain and range'),
('TX.MATH.G.5A', 'Texas', 'Mathematics', '9-12', 'Investigate patterns to make conjectures about geometric relationships.', 'Geometric reasoning')
ON CONFLICT (standard_code, jurisdiction) DO NOTHING;

-- ============================================
-- CALIFORNIA COMMON CORE STATE STANDARDS
-- ============================================

-- California Mathematics (Grade 8)
INSERT INTO public.state_standards (standard_code, jurisdiction, subject, grade_level, statement_text, description) VALUES
('CA.MATH.8.NS.1', 'California', 'Mathematics', '8', 'Know that numbers that are not rational are called irrational. Understand informally that every number has a decimal expansion.', 'Rational vs irrational numbers'),
('CA.MATH.8.NS.2', 'California', 'Mathematics', '8', 'Use rational approximations of irrational numbers to compare the size of irrational numbers.', 'Compare irrational numbers'),
('CA.MATH.8.EE.1', 'California', 'Mathematics', '8', 'Know and apply the properties of integer exponents to generate equivalent numerical expressions.', 'Exponent properties'),
('CA.MATH.8.EE.5', 'California', 'Mathematics', '8', 'Graph proportional relationships, interpreting the unit rate as the slope of the graph.', 'Proportional relationships'),
('CA.MATH.8.EE.7', 'California', 'Mathematics', '8', 'Solve linear equations in one variable including equations with rational coefficients.', 'Solve linear equations'),
('CA.MATH.8.F.1', 'California', 'Mathematics', '8', 'Understand that a function is a rule that assigns to each input exactly one output.', 'Function concept'),
('CA.MATH.8.G.1', 'California', 'Mathematics', '8', 'Verify experimentally the properties of rotations, reflections, and translations.', 'Transformations'),
('CA.MATH.8.G.6', 'California', 'Mathematics', '8', 'Explain a proof of the Pythagorean Theorem and its converse.', 'Pythagorean Theorem'),
('CA.MATH.8.SP.1', 'California', 'Mathematics', '8', 'Construct and interpret scatter plots for bivariate measurement data.', 'Scatter plots'),

-- California ELA (Grade 8)
('CA.ELA.8.RL.1', 'California', 'English Language Arts', '8', 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn.', 'Cite text evidence'),
('CA.ELA.8.RL.2', 'California', 'English Language Arts', '8', 'Determine a theme or central idea of a text and analyze its development over the course of the text.', 'Analyze theme development'),
('CA.ELA.8.W.1', 'California', 'English Language Arts', '8', 'Write arguments to support claims with clear reasons and relevant evidence.', 'Argumentative writing'),
('CA.ELA.8.W.2', 'California', 'English Language Arts', '8', 'Write informative/explanatory texts to examine a topic and convey ideas through analysis of relevant content.', 'Informative writing'),

-- California Science (Grade 8)
('CA.SCI.8.MS-PS1-1', 'California', 'Science', '8', 'Develop models to describe the atomic composition of simple molecules and extended structures.', 'Molecular models'),
('CA.SCI.8.MS-PS2-2', 'California', 'Science', '8', 'Plan an investigation to provide evidence that the change in an object''s motion depends on the sum of the forces on the object and the mass of the object.', 'Forces and mass'),
('CA.SCI.8.MS-LS4-1', 'California', 'Science', '8', 'Analyze and interpret data for patterns in the fossil record that document the existence, diversity, extinction, and change of life forms.', 'Fossil record analysis'),

-- California History (Grade 8)
('CA.HSS.8.1', 'California', 'History', '8', 'Students understand the major events preceding the founding of the nation and relate their significance to the development of American constitutional democracy.', 'Founding era'),
('CA.HSS.8.3', 'California', 'History', '8', 'Students understand the foundation of the American political system and the ways in which citizens participate in it.', 'Political participation'),

-- California Elementary (K-5 samples)
('CA.MATH.K.CC.1', 'California', 'Mathematics', 'K', 'Count to 100 by ones and by tens.', 'Count to 100'),
('CA.MATH.3.OA.7', 'California', 'Mathematics', '3', 'Fluently multiply and divide within 100.', 'Multiplication fluency'),
('CA.MATH.5.NBT.5', 'California', 'Mathematics', '5', 'Fluently multiply multi-digit whole numbers using the standard algorithm.', 'Multi-digit multiplication'),

-- California High School
('CA.MATH.HS.A-REI.3', 'California', 'Mathematics', '9-12', 'Solve linear equations and inequalities in one variable.', 'Solve equations'),
('CA.MATH.HS.G-CO.9', 'California', 'Mathematics', '9-12', 'Prove theorems about lines and angles.', 'Geometric proofs')
ON CONFLICT (standard_code, jurisdiction) DO NOTHING;

-- ============================================
-- FLORIDA BEST STANDARDS
-- ============================================

-- Florida Mathematics (Grade 8)
INSERT INTO public.state_standards (standard_code, jurisdiction, subject, grade_level, statement_text, description) VALUES
('FL.MATH.8.NSO.1.1', 'Florida', 'Mathematics', '8', 'Extend previous understanding of rational numbers to define irrational numbers within the real number system.', 'Define irrational numbers'),
('FL.MATH.8.NSO.1.2', 'Florida', 'Mathematics', '8', 'Plot, order and compare rational and irrational numbers, represented in various forms.', 'Compare real numbers'),
('FL.MATH.8.AR.1.1', 'Florida', 'Mathematics', '8', 'Apply the Laws of Exponents to generate equivalent algebraic expressions.', 'Laws of exponents'),
('FL.MATH.8.AR.2.1', 'Florida', 'Mathematics', '8', 'Solve multi-step linear equations in one variable, with rational number coefficients.', 'Multi-step equations'),
('FL.MATH.8.F.1.1', 'Florida', 'Mathematics', '8', 'Given a set of ordered pairs, a table, a graph or mapping diagram, determine whether the relationship is a function.', 'Identify functions'),
('FL.MATH.8.GR.1.1', 'Florida', 'Mathematics', '8', 'Apply the Pythagorean Theorem to solve mathematical and real-world problems involving unknown side lengths in right triangles.', 'Apply Pythagorean Theorem'),
('FL.MATH.8.DP.1.1', 'Florida', 'Mathematics', '8', 'Given a set of data, construct a scatter plot, identify a line of fit and write the equation of the line of fit.', 'Scatter plots and lines of fit'),

-- Florida ELA (Grade 8)
('FL.ELA.8.R.1.1', 'Florida', 'English Language Arts', '8', 'Analyze the interaction between character development, setting, and plot in a literary text.', 'Literary analysis'),
('FL.ELA.8.R.1.2', 'Florida', 'English Language Arts', '8', 'Analyze two or more themes and their development throughout a literary text.', 'Theme analysis'),
('FL.ELA.8.C.1.3', 'Florida', 'English Language Arts', '8', 'Write to argue a position, supporting claims using logical reasoning and credible evidence from multiple sources.', 'Argumentative writing'),
('FL.ELA.8.C.1.4', 'Florida', 'English Language Arts', '8', 'Write expository texts to explain and analyze information from multiple sources.', 'Expository writing'),

-- Florida Science (Grade 8)
('FL.SCI.8.P.8.4', 'Florida', 'Science', '8', 'Classify and compare substances on the basis of characteristic physical properties that can be demonstrated or measured.', 'Physical properties'),
('FL.SCI.8.P.8.9', 'Florida', 'Science', '8', 'Distinguish among mixtures and pure substances.', 'Mixtures vs pure substances'),
('FL.SCI.8.E.5.7', 'Florida', 'Science', '8', 'Compare and contrast the properties of objects in the Solar System.', 'Solar system properties'),

-- Florida Social Studies (Grade 8)
('FL.SS.8.A.1.1', 'Florida', 'History', '8', 'Provide supporting details for an answer from text, interview for oral history, check validity of information from research.', 'Historical research'),
('FL.SS.8.A.3.1', 'Florida', 'History', '8', 'Explain the consequences of the French and Indian War in British policies for the American colonies.', 'Colonial era consequences'),
('FL.SS.8.A.3.5', 'Florida', 'History', '8', 'Describe the influence of individuals on social and political developments during the Revolutionary era.', 'Revolutionary influences'),

-- Florida Elementary (K-5 samples)
('FL.MATH.K.NSO.1.1', 'Florida', 'Mathematics', 'K', 'Given a group of up to 20 objects, count the number of objects in that group.', 'Count objects to 20'),
('FL.MATH.3.NSO.2.1', 'Florida', 'Mathematics', '3', 'Recall multiplication facts with factors up to 12 and related division facts with automaticity.', 'Multiplication facts to 12'),
('FL.MATH.5.NSO.2.1', 'Florida', 'Mathematics', '5', 'Multiply multi-digit whole numbers including using a standard algorithm with procedural fluency.', 'Multi-digit multiplication'),

-- Florida High School
('FL.MATH.912.AR.1.1', 'Florida', 'Mathematics', '9-12', 'Interpret, rewrite and strategically manipulate algebraic expressions for the purpose of problem solving.', 'Algebraic manipulation'),
('FL.MATH.912.GR.1.1', 'Florida', 'Mathematics', '9-12', 'Prove relationships and theorems about lines and angles.', 'Prove geometric theorems')
ON CONFLICT (standard_code, jurisdiction) DO NOTHING;

-- ============================================
-- Verify the results
-- ============================================
SELECT
  jurisdiction,
  subject,
  COUNT(*) as standard_count
FROM public.state_standards
GROUP BY jurisdiction, subject
ORDER BY jurisdiction, subject;
