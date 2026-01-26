-- Create student learning plans table
CREATE TABLE IF NOT EXISTS student_learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    grade_level TEXT NOT NULL,
    state TEXT NOT NULL,
    yearly_goals JSONB NOT NULL,
    quarters JSONB NOT NULL,
    monthly_themes JSONB NOT NULL,
    current_week INTEGER DEFAULT 1,
    current_month TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, grade_level)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_learning_plans_student ON student_learning_plans(student_id);

-- Enable RLS
ALTER TABLE student_learning_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own plans
CREATE POLICY "Students can view own learning plans"
    ON student_learning_plans
    FOR SELECT
    USING (auth.uid() = student_id);

-- Policy: Teachers can view all plans
CREATE POLICY "Teachers can view all learning plans"
    ON student_learning_plans
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

-- Policy: Students and teachers can insert/update
CREATE POLICY "Students and teachers can manage learning plans"
    ON student_learning_plans
    FOR ALL
    USING (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );
