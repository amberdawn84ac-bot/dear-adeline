-- Daily Lesson Plans Table
-- Stores AI-generated daily lesson plans based on graduation progress

CREATE TABLE IF NOT EXISTS daily_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Plan content
    subject TEXT NOT NULL, -- e.g., "Math", "Science", "English"
    topic TEXT NOT NULL, -- e.g., "Algebra - Linear Equations"
    description TEXT NOT NULL, -- What they'll learn today
    activities JSONB DEFAULT '[]'::jsonb, -- Array of suggested activities
    learning_objectives TEXT[], -- What they should know/be able to do

    -- Motivation for this plan
    reason TEXT, -- Why this was chosen (e.g., "You need 2 more Math credits")
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    -- Tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,

    -- Credits and requirements
    target_requirement_id UUID REFERENCES graduation_requirements(id),
    estimated_credits DECIMAL(4,2) DEFAULT 0.25,
    credits_earned DECIMAL(4,2) DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Only one plan per student per day per subject
    UNIQUE(student_id, plan_date, subject)
);

-- Indexes
CREATE INDEX idx_daily_plans_student_date ON daily_plans(student_id, plan_date DESC);
CREATE INDEX idx_daily_plans_status ON daily_plans(status) WHERE status = 'pending';

-- Row Level Security
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own plans"
    ON daily_plans FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Students can update their own plans"
    ON daily_plans FOR UPDATE
    USING (student_id = auth.uid());

CREATE POLICY "System can insert plans"
    ON daily_plans FOR INSERT
    WITH CHECK (true);

-- Auto-update timestamp
CREATE TRIGGER update_daily_plans_updated_at
    BEFORE UPDATE ON daily_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
