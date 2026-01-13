-- Add portfolio_public column to profiles table
-- Allows users to toggle their portfolio visibility

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS portfolio_public BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN profiles.portfolio_public IS 'Whether the user''s portfolio is publicly accessible via shareable link';
