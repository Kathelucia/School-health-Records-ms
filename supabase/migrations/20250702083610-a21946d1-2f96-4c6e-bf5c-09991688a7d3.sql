
-- Update user roles to only have admin and nurse
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'nurse');

-- Update existing profiles to only use admin or nurse roles
UPDATE profiles SET role = 'nurse' WHERE role IS NULL OR role NOT IN ('admin', 'nurse');

-- Recreate the get_user_role function with updated enum
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Add missing columns to medications table for better inventory tracking
ALTER TABLE medications ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS monthly_usage integer DEFAULT 0;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS last_restocked timestamp with time zone DEFAULT now();

-- Update medications table constraints
ALTER TABLE medications ALTER COLUMN quantity_in_stock SET DEFAULT 0;
ALTER TABLE medications ALTER COLUMN minimum_stock_level SET DEFAULT 10;

-- Create medication dispensing tracking
CREATE TABLE IF NOT EXISTS medication_dispensing_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  clinic_visit_id uuid REFERENCES clinic_visits(id) ON DELETE CASCADE,
  quantity_dispensed integer NOT NULL,
  dispensed_by uuid REFERENCES profiles(id),
  dispensed_at timestamp with time zone DEFAULT now(),
  dosage_instructions text,
  notes text
);

-- Enable RLS on medication dispensing log
ALTER TABLE medication_dispensing_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for medication dispensing log
CREATE POLICY "Staff can manage medication dispensing log" 
  ON medication_dispensing_log FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

-- Update all existing RLS policies to only use admin and nurse roles
DROP POLICY IF EXISTS "Staff can manage students" ON students;
CREATE POLICY "Staff can manage students" 
  ON students FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

DROP POLICY IF EXISTS "Staff can manage clinic visits" ON clinic_visits;
CREATE POLICY "Staff can manage clinic visits" 
  ON clinic_visits FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

DROP POLICY IF EXISTS "Staff can manage immunizations" ON immunizations;
CREATE POLICY "Staff can manage immunizations" 
  ON immunizations FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

DROP POLICY IF EXISTS "Staff can manage medications" ON medications;
CREATE POLICY "Staff can manage medications" 
  ON medications FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'nurse')
  ));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_full_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_medications_expiry_date ON medications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_clinic_visits_visit_date ON clinic_visits(visit_date);
