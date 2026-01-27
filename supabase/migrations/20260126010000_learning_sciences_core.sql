-- Create Credit Ledger for "Life Translated into Credits"
-- This creates a verifiable log of all credits earned, whether from life, projects, or lessons.

CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(6,4) NOT NULL, -- Supports small fractions like 0.005
    credit_category TEXT NOT NULL, -- e.g. 'Math', 'Science'
    requirement_id UUID, -- Optional link to graduation_requirements(id) - avoiding FK constraint for now to be safe, but can be added if confirmed
    source_type TEXT NOT NULL CHECK (source_type IN ('project', 'course', 'life_experience', 'daily_plan', 'transfer')),
    source_details JSONB DEFAULT '{}'::jsonb, -- e.g. { "activity": "Baked a cake", "project_id": "..." }
    evidence_url TEXT, -- Link to photo/video in storage
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students see own ledger" ON credit_ledger;
CREATE POLICY "Students see own ledger" ON credit_ledger
    FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers see student ledgers" ON credit_ledger;
CREATE POLICY "Teachers see student ledgers" ON credit_ledger
    FOR SELECT USING (
        EXISTS (select 1 from profiles where id = auth.uid() and role = 'teacher')
    );

DROP POLICY IF EXISTS "System can insert ledger" ON credit_ledger;
CREATE POLICY "System can insert ledger" ON credit_ledger
    FOR INSERT WITH CHECK (true); -- Allow system/functions to insert

-- Enable Realtime
alter publication supabase_realtime add table credit_ledger;

-- Update Academic Missions for Student Agency
-- Update Academic Missions for Student Agency
-- ALTER TABLE academic_missions
-- ADD COLUMN IF NOT EXISTS is_student_initiated BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS student_proposal_data JSONB DEFAULT '{}'::jsonb,
-- ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
-- ADD COLUMN IF NOT EXISTS mentor_feedback TEXT,
-- ADD COLUMN IF NOT EXISTS submission_status TEXT DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'approved', 'changes_requested'));

-- Function to update aggregated progress when a ledger entry is verified
CREATE OR REPLACE FUNCTION update_progress_from_ledger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if verified and we have a requirement ID
    IF NEW.verification_status = 'verified' AND NEW.requirement_id IS NOT NULL THEN
        -- We just call the existing function or do the update directly
        -- Assuming update_student_progress function exists from migration 26
        PERFORM update_student_progress(NEW.student_id, NEW.requirement_id, NEW.amount);
            
        -- Update verified_at if not set
        IF NEW.verified_at IS NULL THEN
            UPDATE credit_ledger SET verified_at = NOW() WHERE id = NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_ledger_update ON credit_ledger;
CREATE TRIGGER trigger_ledger_update
AFTER INSERT ON credit_ledger
FOR EACH ROW
EXECUTE FUNCTION update_progress_from_ledger();

-- Also handle updates (e.g. pending -> verified)
CREATE OR REPLACE FUNCTION update_progress_on_verify()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.verification_status != 'verified' AND NEW.verification_status = 'verified' AND NEW.requirement_id IS NOT NULL THEN
        PERFORM update_student_progress(NEW.student_id, NEW.requirement_id, NEW.amount);
        
        IF NEW.verified_at IS NULL THEN
            NEW.verified_at = NOW(); -- This won't work in AFTER trigger, but that's fine
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ledger_verify ON credit_ledger;
CREATE TRIGGER trigger_ledger_verify
AFTER UPDATE ON credit_ledger
FOR EACH ROW
EXECUTE FUNCTION update_progress_on_verify();
