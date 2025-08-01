
-- Add the missing is_active column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Also add missing insurance-related columns to both students and profiles tables
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS nhif_number text,
ADD COLUMN IF NOT EXISTS sha_number text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nhif_number text,
ADD COLUMN IF NOT EXISTS sha_number text;
