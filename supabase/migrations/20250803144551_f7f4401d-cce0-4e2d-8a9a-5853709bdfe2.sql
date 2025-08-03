
-- Create the user_role enum type that's missing
CREATE TYPE user_role AS ENUM ('nurse', 'admin');

-- Also create the form_level enum that might be needed for students
CREATE TYPE form_level AS ENUM ('form_1', 'form_2', 'form_3', 'form_4');

-- Create the term enum that might be needed
CREATE TYPE term AS ENUM ('term_1', 'term_2', 'term_3');

-- Update the profiles table to ensure it has the correct structure
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role user_role DEFAULT 'nurse'::user_role;

-- Update the handle_new_user function to work correctly with the enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, role, user_role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'nurse'::user_role),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'nurse'::user_role),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    user_role = EXCLUDED.user_role,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
