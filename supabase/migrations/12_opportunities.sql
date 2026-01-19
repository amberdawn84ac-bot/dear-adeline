-- Opportunities Library: Main opportunities table
-- Stores real-world opportunities (grants, contests, scholarships, etc.)

-- Create trigger function for updating updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('grant', 'contest', 'scholarship', 'contract', 'residency')),
    
    -- Details
    organization TEXT,
    location TEXT,
    deadline TIMESTAMPTZ,
    amount TEXT,
    source_url TEXT,
    
    -- Multi-Track Credits (JSONB for flexibility)
    -- Example: {"creation_science": 2, "economics": 1, "justice": 1}
    track_credits JSONB NOT NULL DEFAULT '{}',
    
    -- Search/Discovery
    disciplines TEXT[], -- ['Digital Art', 'Writing', 'Music']
    experience_level TEXT CHECK (experience_level IN ('Student', 'Emerging', 'Mid-Career', 'Established')),
    tags TEXT[],
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'draft')),
    featured BOOLEAN DEFAULT false
);

-- Indexes for efficient searching
CREATE INDEX idx_opportunities_disciplines ON opportunities USING GIN(disciplines);
CREATE INDEX idx_opportunities_status ON opportunities(status) WHERE status = 'active';
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_track_credits ON opportunities USING GIN(track_credits);

-- Updated timestamp trigger
CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read active opportunities
CREATE POLICY "Active opportunities are viewable by everyone"
    ON opportunities FOR SELECT
    USING (status = 'active');

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can manage opportunities"
    ON opportunities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
