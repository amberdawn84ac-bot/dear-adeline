-- Add columns for student-initiated projects to academic_missions
ALTER TABLE academic_missions
ADD COLUMN IF NOT EXISTS is_student_initiated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS student_proposal_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mentor_feedback TEXT,
ADD COLUMN IF NOT EXISTS submission_status TEXT DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'approved', 'changes_requested'));

-- Add policy for students to insert their own missions if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_missions' 
        AND policyname = 'Students can create their own missions'
    ) THEN
        CREATE POLICY "Students can create their own missions"
        ON academic_missions FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = student_id);
    END IF;
END $$;

-- Add policy for students to update their own missions (e.g. submit them)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_missions' 
        AND policyname = 'Students can update their own missions'
    ) THEN
        CREATE POLICY "Students can update their own missions"
        ON academic_missions FOR UPDATE
        TO authenticated
        USING (auth.uid() = student_id);
    END IF;
END $$;
