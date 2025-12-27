-- COPY AND PASTE THIS INTO YOUR SUPABASE SQL EDITOR TO RESET USERS AND CONFIGURE AMBER AS ADMIN

-- 1. DELETE ALL USERS AND PROFILES (Clean Slate)
-- This cascades and deletes everything linked to users
TRUNCATE auth.users CASCADE;

-- 2. ENSURE THE TRIGGER ASSIGNS ADMIN ROLE TO AMBER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.email = 'amber@dearadeline.co' THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'student')
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RE-ENABLE TRIGGER (Just to be sure)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
