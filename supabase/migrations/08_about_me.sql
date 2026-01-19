-- About Me Extended Profile System
CREATE TABLE IF NOT EXISTS student_profiles_extended (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    favorite_colors JSONB DEFAULT '[]'::jsonb,
    favorite_subjects JSONB DEFAULT '[]'::jsonb,
    favorite_book TEXT,
    book_thoughts TEXT,
    hobbies JSONB DEFAULT '[]'::jsonb,
    learning_style TEXT, -- 'visual', 'kinesthetic', 'reading', 'auditory', 'building'
    dreams_goals TEXT,
    about_me_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    current_step INTEGER DEFAULT 0, -- For resume capability
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add completion flag to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about_me_completed BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_extended_student ON student_profiles_extended(student_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_extended_completed ON student_profiles_extended(about_me_completed);

-- Enable RLS
ALTER TABLE student_profiles_extended ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can manage own extended profile" ON student_profiles_extended;
DROP POLICY IF EXISTS "Teachers can view student extended profiles" ON student_profiles_extended;

-- Policy: Students can view and edit their own extended profile
CREATE POLICY "Students can manage own extended profile"
    ON student_profiles_extended
    FOR ALL
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);

-- Policy: Teachers can view student extended profiles
CREATE POLICY "Teachers can view student extended profiles"
    ON student_profiles_extended
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'teacher'
        )
    );

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_student_profiles_extended_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_student_profiles_extended_timestamp ON student_profiles_extended;

-- Trigger to auto-update timestamp
CREATE TRIGGER update_student_profiles_extended_timestamp
    BEFORE UPDATE ON student_profiles_extended
    FOR EACH ROW
    EXECUTE FUNCTION update_student_profiles_extended_updated_at();
