
-- First, let's ensure the profiles table has the correct structure and permissions
-- Drop and recreate the trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling
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
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for better admin access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Update other tables to ensure admin access
DROP POLICY IF EXISTS "Allow authenticated users to view students" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to insert students" ON public.students;
DROP POLICY IF EXISTS "Staff can manage students" ON public.students;

CREATE POLICY "Users can view students" ON public.students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Users can manage students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

-- Fix medication table policies
DROP POLICY IF EXISTS "Allow authenticated users to view medications" ON public.medications;
DROP POLICY IF EXISTS "Allow authenticated users to insert medications" ON public.medications;

CREATE POLICY "Users can view medications" ON public.medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Users can manage medications" ON public.medications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

-- Fix clinic visits policies
DROP POLICY IF EXISTS "Allow authenticated users to view clinic_visits" ON public.clinic_visits;
DROP POLICY IF EXISTS "Allow authenticated users to insert clinic_visits" ON public.clinic_visits;

CREATE POLICY "Users can view clinic visits" ON public.clinic_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Users can manage clinic visits" ON public.clinic_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

-- Fix staff table policies
DROP POLICY IF EXISTS "Allow authenticated users to view staff" ON public.staff;
DROP POLICY IF EXISTS "Allow authenticated users to insert staff" ON public.staff;

CREATE POLICY "Users can view staff" ON public.staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Users can manage staff" ON public.staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

-- Add policy for immunizations
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view immunizations" ON public.immunizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );

CREATE POLICY "Users can manage immunizations" ON public.immunizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_role IN ('admin', 'nurse')
    )
  );
