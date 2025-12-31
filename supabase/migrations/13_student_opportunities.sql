-- Student Opportunities: Tracks student's saved/applied opportunities

CREATE TABLE IF NOT EXISTS student_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
    
    -- Tracking
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'shortlisted', 'rejected', 'awarded')),
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Project Plan (if generated via AI)
    project_plan JSONB,
    -- Example structure:
    -- {
    --   "mission": "...",
    --   "outcome": "...",
    --   "creditAreas": ["Art", "Economics"],
    --   "skills": [{"name": "...", "completed": false}],
    --   "actionPlan": [{"step": "...", "time": "..."}],
    --   "evidenceRequirements": ["..."]
    -- }
    
    -- Evidence & Submission
    submission_url TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure student can't save same opportunity twice
    UNIQUE(student_id, opportunity_id)
);

-- Indexes
CREATE INDEX idx_student_opportunities_student ON student_opportunities(student_id);
CREATE INDEX idx_student_opportunities_status ON student_opportunities(student_id, status);

-- Updated timestamp trigger
CREATE TRIGGER update_student_opportunities_updated_at
    BEFORE UPDATE ON student_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE student_opportunities ENABLE ROW LEVEL SECURITY;

-- Policies: Students can only see/manage their own saved opportunities
CREATE POLICY "Students can view their own saved opportunities"
    ON student_opportunities FOR SELECT
    USING (auth.uid() = student_id);

CREATE POLICY "Students can save opportunities"
    ON student_opportunities FOR INSERT
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own saved opportunities"
    ON student_opportunities FOR UPDATE
    USING (auth.uid() = student_id);

CREATE POLICY "Students can delete their own saved opportunities"
    ON student_opportunities FOR DELETE
    USING (auth.uid() = student_id);

-- Teachers can view their students' saved opportunities
CREATE POLICY "Teachers can view their students' saved opportunities"
    ON student_opportunities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM teacher_students ts
            WHERE ts.teacher_id = auth.uid()
            AND ts.student_id = student_opportunities.student_id
        )
    );
