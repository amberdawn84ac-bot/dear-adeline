-- Migration: Adaptive Learning Paths
-- Enables personalized learning paths based on state standards with interest-based adaptation

-- ============================================
-- 1. LEARNING PATHS TABLE
-- ============================================
-- Stores a student's personalized learning path
CREATE TABLE IF NOT EXISTS public.student_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Path Configuration
  jurisdiction TEXT NOT NULL,           -- "Oklahoma", "Texas", "California"
  grade_level TEXT NOT NULL,            -- "8", "9-12", "K"
  
  -- Generated Path Data
  path_data JSONB NOT NULL DEFAULT '[]', -- Ordered list of standards with metadata
  
  -- Student Context for Adaptation
  interests JSONB DEFAULT '[]',          -- ["cooking", "gaming", "horses", "minecraft"]
  learning_style TEXT,                   -- "visual", "hands-on", "reading", "auditory", "mixed"
  pace TEXT DEFAULT 'moderate',          -- "accelerated", "moderate", "relaxed"
  
  -- Current Focus
  current_focus_area TEXT,               -- Current subject/topic being worked on
  current_standard_id UUID REFERENCES public.state_standards(id),
  
  -- Adaptation Tracking
  last_adapted_at TIMESTAMPTZ,
  adaptation_count INT DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active',          -- "active", "paused", "completed"
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- One active path per student
  UNIQUE(student_id)
);

-- ============================================
-- 2. LEARNING PATH MILESTONES TABLE
-- ============================================
-- Individual milestones (standards) within a learning path
CREATE TABLE IF NOT EXISTS public.learning_path_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES public.student_learning_paths(id) ON DELETE CASCADE NOT NULL,
  
  -- Milestone Target
  standard_id UUID REFERENCES public.state_standards(id) NOT NULL,
  sequence_order INT NOT NULL,           -- Order in the learning path
  
  -- Status Tracking
  status TEXT DEFAULT 'upcoming',        -- "upcoming", "in_progress", "completed", "skipped"
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Adaptation Context
  approach_used TEXT,                    -- How we taught this (e.g., "minecraft_project", "cooking_lesson")
  interest_connection TEXT,              -- Which interest connected to this standard
  engagement_score INT CHECK (engagement_score >= 1 AND engagement_score <= 10),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(path_id, standard_id)
);

-- ============================================
-- 3. INTEREST-STANDARD MAPPINGS TABLE
-- ============================================
-- Pre-defined mappings between interests and applicable standards
CREATE TABLE IF NOT EXISTS public.interest_standard_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Interest
  interest_keyword TEXT NOT NULL,        -- "cooking", "gaming", "horses", "art", "music"
  
  -- Standard Connection
  subject TEXT NOT NULL,                 -- "Mathematics", "Science", etc.
  standard_pattern TEXT,                 -- Pattern to match (e.g., "%.N.%" for number standards)
  
  -- Teaching Approach
  approach_description TEXT NOT NULL,     -- How to connect this interest to the subject
  example_activity TEXT,                  -- Example activity
  
  -- Metadata
  grade_level_min TEXT,                   -- Minimum grade this applies to
  grade_level_max TEXT,                   -- Maximum grade this applies to
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 4. PATH ADAPTATION LOG TABLE
-- ============================================
-- Tracks when and why paths were adapted
CREATE TABLE IF NOT EXISTS public.learning_path_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES public.student_learning_paths(id) ON DELETE CASCADE NOT NULL,
  
  -- Trigger
  trigger_type TEXT NOT NULL,            -- "interest_added", "choice_made", "new_info", "milestone_complete", "gap_detected"
  trigger_context JSONB,                 -- Additional context about the trigger
  
  -- Changes Made
  changes_made JSONB NOT NULL,           -- What was changed in the path
  
  -- Source
  source TEXT,                           -- "conversation", "activity", "explicit_request"
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 5. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_learning_paths_student ON public.student_learning_paths(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_grade ON public.student_learning_paths(grade_level);
CREATE INDEX IF NOT EXISTS idx_learning_paths_jurisdiction ON public.student_learning_paths(jurisdiction);

CREATE INDEX IF NOT EXISTS idx_milestones_path ON public.learning_path_milestones(path_id);
CREATE INDEX IF NOT EXISTS idx_milestones_standard ON public.learning_path_milestones(standard_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.learning_path_milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_order ON public.learning_path_milestones(path_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_interest_mappings_interest ON public.interest_standard_mappings(interest_keyword);
CREATE INDEX IF NOT EXISTS idx_interest_mappings_subject ON public.interest_standard_mappings(subject);

CREATE INDEX IF NOT EXISTS idx_adaptations_path ON public.learning_path_adaptations(path_id);
CREATE INDEX IF NOT EXISTS idx_adaptations_trigger ON public.learning_path_adaptations(trigger_type);

-- ============================================
-- 6. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.student_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_standard_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_adaptations ENABLE ROW LEVEL SECURITY;

-- Students can view their own learning path
CREATE POLICY "Students can view own learning path" ON public.student_learning_paths
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can view own milestones" ON public.learning_path_milestones
  FOR SELECT USING (
    path_id IN (SELECT id FROM public.student_learning_paths WHERE student_id = auth.uid())
  );

-- Teachers can view their students' paths
CREATE POLICY "Teachers can view student learning paths" ON public.student_learning_paths
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_students
      WHERE teacher_id = auth.uid() AND student_id = public.student_learning_paths.student_id
    )
  );

CREATE POLICY "Teachers can view student milestones" ON public.learning_path_milestones
  FOR SELECT USING (
    path_id IN (
      SELECT slp.id FROM public.student_learning_paths slp
      JOIN public.teacher_students ts ON ts.student_id = slp.student_id
      WHERE ts.teacher_id = auth.uid()
    )
  );

-- Anyone can view interest mappings (public reference data)
CREATE POLICY "Anyone can view interest mappings" ON public.interest_standard_mappings
  FOR SELECT USING (true);

-- System can manage all data
CREATE POLICY "System can insert learning paths" ON public.student_learning_paths
  FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update learning paths" ON public.student_learning_paths
  FOR UPDATE USING (true);
CREATE POLICY "System can insert milestones" ON public.learning_path_milestones
  FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update milestones" ON public.learning_path_milestones
  FOR UPDATE USING (true);
CREATE POLICY "System can insert adaptations" ON public.learning_path_adaptations
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get next milestone for a student
CREATE OR REPLACE FUNCTION get_next_milestone(p_student_id UUID)
RETURNS TABLE (
  milestone_id UUID,
  standard_id UUID,
  standard_code TEXT,
  statement_text TEXT,
  subject TEXT,
  sequence_order INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id AS milestone_id,
    m.standard_id,
    s.standard_code,
    s.statement_text,
    s.subject,
    m.sequence_order
  FROM public.learning_path_milestones m
  JOIN public.student_learning_paths p ON m.path_id = p.id
  JOIN public.state_standards s ON m.standard_id = s.id
  WHERE p.student_id = p_student_id
    AND m.status IN ('upcoming', 'in_progress')
  ORDER BY m.sequence_order
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update milestone status
CREATE OR REPLACE FUNCTION update_milestone_status(
  p_milestone_id UUID,
  p_status TEXT,
  p_approach_used TEXT DEFAULT NULL,
  p_engagement_score INT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE public.learning_path_milestones
  SET 
    status = p_status,
    started_at = CASE WHEN p_status = 'in_progress' AND started_at IS NULL THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END,
    approach_used = COALESCE(p_approach_used, approach_used),
    engagement_score = COALESCE(p_engagement_score, engagement_score),
    updated_at = NOW()
  WHERE id = p_milestone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. SEED INTEREST-STANDARD MAPPINGS
-- ============================================
INSERT INTO public.interest_standard_mappings (interest_keyword, subject, approach_description, example_activity) VALUES
-- Cooking/Baking
('cooking', 'Mathematics', 'Fractions, ratios, measurement conversions, and proportional reasoning through recipes', 'Double a recipe and calculate new ingredient amounts'),
('cooking', 'Science', 'Chemistry of cooking, heat transfer, states of matter, and chemical reactions', 'Explore why bread rises through yeast fermentation'),
('cooking', 'English Language Arts', 'Reading comprehension through recipes, procedural writing', 'Write your own recipe with clear step-by-step instructions'),
('cooking', 'History', 'Food history, cultural exchange, historical trade routes', 'Research the origins of common spices and their historical significance'),

-- Gaming/Video Games
('gaming', 'Mathematics', 'Algebra through damage calculations, geometry in game design, statistics', 'Calculate optimal stat builds using algebraic equations'),
('gaming', 'Science', 'Physics of game mechanics, programming logic, computer science', 'Analyze the physics of projectile motion in your favorite game'),
('gaming', 'English Language Arts', 'Narrative analysis, creative writing, world-building', 'Analyze the story structure of a game and write an alternate ending'),
('gaming', 'History', 'Historical strategy games, historical accuracy analysis', 'Compare a historical game setting to actual historical events'),

-- Minecraft specifically
('minecraft', 'Mathematics', 'Geometry, volume, area, coordinate systems, ratios for resource management', 'Calculate the volume of blocks needed for your build'),
('minecraft', 'Science', 'Circuits through Redstone, biomes and ecosystems, resource cycles', 'Build a working circuit using Redstone and explain the logic'),
('minecraft', 'English Language Arts', 'Descriptive writing, storytelling, documentation', 'Write a detailed guide for your Minecraft creation'),
('minecraft', 'History', 'Recreate historical structures, research ancient civilizations', 'Build a scale model of an ancient wonder and research its history'),

-- Horses/Animals
('horses', 'Mathematics', 'Measurement, ratios for feeding, area calculations for pastures', 'Calculate feed ratios based on horse weight and activity level'),
('horses', 'Science', 'Animal biology, anatomy, nutrition, physics of movement', 'Study horse anatomy and how their legs work for running'),
('horses', 'English Language Arts', 'Informational text, research writing, narrative', 'Research and write about a famous horse in history'),
('horses', 'History', 'Horses in history, cavalry, transportation revolution', 'Explore how horses changed warfare and transportation'),

-- Art/Drawing
('art', 'Mathematics', 'Geometry, proportions, ratios, symmetry, perspective', 'Use the golden ratio to create a balanced composition'),
('art', 'Science', 'Color theory, light and optics, chemistry of paints', 'Explore how light affects color perception'),
('art', 'English Language Arts', 'Visual literacy, art criticism, creative expression', 'Write an analysis of a famous painting'),
('art', 'History', 'Art movements, cultural context, historical periods', 'Create art in the style of a historical period and research that era'),

-- Music
('music', 'Mathematics', 'Fractions in time signatures, ratios in frequencies, patterns', 'Analyze the mathematical patterns in musical compositions'),
('music', 'Science', 'Sound waves, physics of instruments, acoustics', 'Explore how different instruments produce sound waves'),
('music', 'English Language Arts', 'Poetry analysis through lyrics, creative writing', 'Analyze song lyrics as poetry and write your own'),
('music', 'History', 'Music history, cultural movements, historical context', 'Research how music reflected social changes in a historical period'),

-- Nature/Outdoors
('nature', 'Mathematics', 'Measurement, data collection, statistics, patterns', 'Measure and graph plant growth over time'),
('nature', 'Science', 'Ecology, biology, earth science, environmental science', 'Study local ecosystems and identify species'),
('nature', 'English Language Arts', 'Nature writing, field journaling, descriptive writing', 'Keep a nature journal with detailed observations'),
('nature', 'History', 'Environmental history, exploration, conservation movement', 'Research the history of conservation in America'),

-- Building/Construction
('building', 'Mathematics', 'Geometry, measurement, area, volume, angles, scale', 'Design a structure to scale with accurate measurements'),
('building', 'Science', 'Physics of structures, materials science, engineering', 'Test which shapes are strongest for building'),
('building', 'English Language Arts', 'Technical writing, documentation, instructions', 'Write detailed building instructions for your project'),
('building', 'History', 'Architecture through history, engineering achievements', 'Research ancient building techniques and their innovations')

ON CONFLICT DO NOTHING;

-- ============================================
-- 9. COMMENTS
-- ============================================
COMMENT ON TABLE public.student_learning_paths IS 'Personalized learning paths for students based on state standards';
COMMENT ON TABLE public.learning_path_milestones IS 'Individual standards/milestones within a learning path';
COMMENT ON TABLE public.interest_standard_mappings IS 'Maps student interests to applicable standards with teaching approaches';
COMMENT ON TABLE public.learning_path_adaptations IS 'Audit log of path adaptations and triggers';
COMMENT ON COLUMN public.student_learning_paths.interests IS 'Array of student interests used for adaptation';
COMMENT ON COLUMN public.learning_path_milestones.approach_used IS 'How this standard was taught (connects to interests)';
