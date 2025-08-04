
-- Create the user_role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'nurse');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Now recreate the handle_new_user function with the correct enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, user_role, created_at, updated_at)
  VALUES (
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

-- Ensure the profiles table columns use the correct enum type
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'nurse'::user_role,
ALTER COLUMN user_role SET DEFAULT 'nurse'::user_role;
