-- Add approval system to library projects

ALTER TABLE library_projects
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for filtering approved projects
CREATE INDEX IF NOT EXISTS idx_library_projects_approved ON library_projects(approved);
CREATE INDEX IF NOT EXISTS idx_library_projects_approval_status ON library_projects(approval_status);

-- Add comments
COMMENT ON COLUMN library_projects.approved IS 'Whether the project is approved for display in the library';
COMMENT ON COLUMN library_projects.approval_status IS 'Approval workflow status: pending, approved, or rejected';
COMMENT ON COLUMN library_projects.approved_by IS 'Admin/teacher who approved the project';
COMMENT ON COLUMN library_projects.approved_at IS 'When the project was approved';
COMMENT ON COLUMN library_projects.rejection_reason IS 'Reason for rejection if status is rejected';

-- Update existing projects to be approved by default (grandfather them in)
UPDATE library_projects
SET approved = true, approval_status = 'approved'
WHERE approved IS NULL OR approved = false;
