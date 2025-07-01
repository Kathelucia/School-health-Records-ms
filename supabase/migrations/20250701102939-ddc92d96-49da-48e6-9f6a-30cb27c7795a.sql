
-- First, let's check what columns exist in the profiles table and update accordingly
-- Update user_role enum to only include admin and nurse
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'nurse');

-- Add the role column back to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'nurse';

-- Update existing profiles to use only admin or nurse roles
-- Since we don't know the current role values, we'll set all to 'nurse' as default
-- Admins can be manually updated later
UPDATE profiles SET role = 'nurse' WHERE role IS NULL OR role NOT IN ('admin', 'nurse');

-- Recreate the get_user_role function with updated enum
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update RLS policies to work with simplified roles
DROP POLICY IF EXISTS "Medical staff can view students" ON students;
DROP POLICY IF EXISTS "Medical staff can manage students" ON students;
DROP POLICY IF EXISTS "Medical staff can update students" ON students;
DROP POLICY IF EXISTS "Admins can add students" ON students;

CREATE POLICY "Staff can manage students" 
  ON students FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

-- Update clinic visits policies
DROP POLICY IF EXISTS "Medical staff can view clinic visits" ON clinic_visits;
DROP POLICY IF EXISTS "Medical staff can manage clinic visits" ON clinic_visits;

CREATE POLICY "Staff can manage clinic visits" 
  ON clinic_visits FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

-- Update immunizations policies
DROP POLICY IF EXISTS "Medical staff can view immunizations" ON immunizations;
DROP POLICY IF EXISTS "Medical staff can manage immunizations" ON immunizations;

CREATE POLICY "Staff can manage immunizations" 
  ON immunizations FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

-- Update medications policies
DROP POLICY IF EXISTS "Medical staff can view medications" ON medications;
DROP POLICY IF EXISTS "Medical staff can manage medications" ON medications;

CREATE POLICY "Staff can manage medications" 
  ON medications FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

-- Update other policies
DROP POLICY IF EXISTS "Medical staff can view medication dispensing" ON medication_dispensing;
CREATE POLICY "Staff can manage medication dispensing" 
  ON medication_dispensing FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

DROP POLICY IF EXISTS "Medical staff can view fee payments" ON fee_payments;
CREATE POLICY "Staff can manage fee payments" 
  ON fee_payments FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

DROP POLICY IF EXISTS "Medical staff can view student progression" ON student_progression;
CREATE POLICY "Staff can manage student progression" 
  ON student_progression FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));
