-- Safety Sentinel System
CREATE TABLE IF NOT EXISTS safety_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id),
    message_content TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'self_harm', 'violence', 'inappropriate', 'predatory'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    ai_analysis TEXT NOT NULL,
    context_messages JSONB,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES profiles(id),
    acknowledged_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_student ON safety_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_severity ON safety_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_acknowledged ON safety_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_created ON safety_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view all safety alerts
CREATE POLICY "Teachers can view all safety alerts"
    ON safety_alerts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

-- Policy: Teachers can acknowledge safety alerts
CREATE POLICY "Teachers can acknowledge safety alerts"
    ON safety_alerts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

-- Policy: System can insert alerts
CREATE POLICY "System can create safety alerts"
    ON safety_alerts
    FOR INSERT
    WITH CHECK (true);
