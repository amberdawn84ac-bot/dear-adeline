-- Seed Skill-to-Standard Mappings
-- Maps Dear Adeline skills to Oklahoma state standards
-- This enables automatic standards tracking when students demonstrate skills

-- ============================================
-- MATHEMATICS SKILL MAPPINGS
-- ============================================

-- Elementary Math Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE s.name ILIKE '%counting%' AND st.standard_code = 'OK.MATH.K.N.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE s.name ILIKE '%place value%' AND st.standard_code = 'OK.MATH.2.N.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%multiplication%' OR s.name ILIKE '%division%')
  AND st.standard_code = 'OK.MATH.3.N.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%decimal%' OR s.name ILIKE '%fraction%')
  AND st.standard_code = 'OK.MATH.4.N.1'
ON CONFLICT DO NOTHING;

-- Middle School Math Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%ratio%' OR s.name ILIKE '%proportion%')
  AND st.standard_code = 'OK.MATH.6.N.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%algebra%' OR s.name ILIKE '%pattern%' OR s.name ILIKE '%function%')
  AND st.standard_code = 'OK.MATH.8.A.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%linear equation%' OR s.name ILIKE '%solve equation%')
  AND st.standard_code = 'OK.MATH.8.A.2'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%pythagorean%' OR s.name ILIKE '%right triangle%')
  AND st.standard_code = 'OK.MATH.8.GM.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%surface area%' OR s.name ILIKE '%volume%')
  AND st.standard_code = 'OK.MATH.8.GM.2'
ON CONFLICT DO NOTHING;

-- High School Math Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%geometry proof%' OR s.name ILIKE '%geometric theorem%')
  AND st.standard_code = 'OK.MATH.HS.G.1'
ON CONFLICT DO NOTHING;

-- ============================================
-- ENGLISH LANGUAGE ARTS SKILL MAPPINGS
-- ============================================

-- Elementary ELA Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%reading comprehension%' OR s.name ILIKE '%key detail%')
  AND st.standard_code = 'OK.ELA.1.R.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%inference%' OR s.name ILIKE '%text detail%')
  AND st.standard_code = 'OK.ELA.4.R.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%quote%' OR s.name ILIKE '%text evidence%')
  AND st.standard_code = 'OK.ELA.5.R.1'
ON CONFLICT DO NOTHING;

-- Middle School ELA Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%cite%' OR s.name ILIKE '%textual evidence%')
  AND st.standard_code = 'OK.ELA.8.R.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%theme%' OR s.name ILIKE '%central idea%')
  AND st.standard_code = 'OK.ELA.8.R.2'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%argumentative%' OR s.name ILIKE '%persuasive writing%')
  AND st.standard_code = 'OK.ELA.8.W.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%informative%' OR s.name ILIKE '%explanatory%' OR s.name ILIKE '%expository%')
  AND st.standard_code = 'OK.ELA.8.W.2'
ON CONFLICT DO NOTHING;

-- High School ELA Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%literary analysis%' OR s.name ILIKE '%analyze literature%')
  AND st.standard_code = 'OK.ELA.HS.R.1'
ON CONFLICT DO NOTHING;

-- ============================================
-- SCIENCE SKILL MAPPINGS
-- ============================================

-- Elementary Science Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%force%' OR s.name ILIKE '%motion%' OR s.name ILIKE '%push%' OR s.name ILIKE '%pull%')
  AND st.standard_code = 'OK.SCI.K.PS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%life cycle%' OR s.name ILIKE '%organism%')
  AND st.standard_code = 'OK.SCI.3.LS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%fossil%' OR s.name ILIKE '%rock formation%' OR s.name ILIKE '%geology%')
  AND st.standard_code = 'OK.SCI.4.ESS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%matter%' OR s.name ILIKE '%particle%' OR s.name ILIKE '%atom%')
  AND st.standard_code = 'OK.SCI.5.PS.1'
ON CONFLICT DO NOTHING;

-- Middle School Science Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%photosynthesis%' OR s.name ILIKE '%energy flow%')
  AND st.standard_code = 'OK.SCI.6.LS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%atomic%' OR s.name ILIKE '%molecule%')
  AND st.standard_code = 'OK.SCI.8.PS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%chemical reaction%' OR s.name ILIKE '%chemistry%')
  AND st.standard_code = 'OK.SCI.8.PS.2'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%genetics%' OR s.name ILIKE '%natural selection%' OR s.name ILIKE '%evolution%')
  AND st.standard_code = 'OK.SCI.8.LS.1'
ON CONFLICT DO NOTHING;

-- High School Science Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%periodic table%' OR s.name ILIKE '%element%')
  AND st.standard_code = 'OK.SCI.HS.PS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%DNA%' OR s.name ILIKE '%protein%' OR s.name ILIKE '%genetics%')
  AND st.standard_code = 'OK.SCI.HS.LS.1'
ON CONFLICT DO NOTHING;

-- ============================================
-- HISTORY/SOCIAL STUDIES SKILL MAPPINGS
-- ============================================

-- Elementary History Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%family history%' OR s.name ILIKE '%tradition%')
  AND st.standard_code = 'OK.HIST.1.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%geography%' OR s.name ILIKE '%region%' OR s.name ILIKE '%map%')
  AND st.standard_code = 'OK.HIST.3.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%american revolution%' OR s.name ILIKE '%revolutionary war%')
  AND st.standard_code = 'OK.HIST.5.1'
ON CONFLICT DO NOTHING;

-- Middle School History Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%civilization%' OR s.name ILIKE '%ancient%')
  AND st.standard_code = 'OK.HIST.6.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%government%' OR s.name ILIKE '%political%' OR s.name ILIKE '%civic%')
  AND st.standard_code = 'OK.HIST.8.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%cause and effect%' OR s.name ILIKE '%historical%')
  AND st.standard_code = 'OK.HIST.8.2'
ON CONFLICT DO NOTHING;

-- High School History Skills
INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%world history%' OR s.name ILIKE '%global%')
  AND st.standard_code = 'OK.HIST.HS.1'
ON CONFLICT DO NOTHING;

INSERT INTO public.skill_standard_mappings (skill_id, standard_id, alignment_strength)
SELECT s.id, st.id, 'full'
FROM public.skills s
CROSS JOIN public.state_standards st
WHERE (s.name ILIKE '%foreign policy%' OR s.name ILIKE '%international%')
  AND st.standard_code = 'OK.HIST.HS.2'
ON CONFLICT DO NOTHING;

-- ============================================
-- Verify the results
-- ============================================
SELECT
  COUNT(*) as total_mappings,
  COUNT(DISTINCT skill_id) as unique_skills,
  COUNT(DISTINCT standard_id) as unique_standards
FROM public.skill_standard_mappings;

SELECT
  st.subject,
  st.grade_level,
  COUNT(DISTINCT ssm.skill_id) as mapped_skills
FROM public.state_standards st
LEFT JOIN public.skill_standard_mappings ssm ON st.id = ssm.standard_id
WHERE st.jurisdiction = 'Oklahoma'
GROUP BY st.subject, st.grade_level
ORDER BY st.subject, st.grade_level;
