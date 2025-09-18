-- Fix RLS policies to prevent "permission denied for table users" errors

-- Drop all existing profiles policies that reference auth.users table incorrectly
DROP POLICY IF EXISTS "Enable read access for admins" ON public.profiles;
DROP POLICY IF EXISTS "Enable admin update access" ON public.profiles;

-- Create simpler, working RLS policies for profiles
CREATE POLICY "Users can read their own profile and admins can read all" ON public.profiles
FOR SELECT 
USING (
  id = auth.uid() 
  OR 
  user_role = 'admin'
);

CREATE POLICY "Users can update their own profile and admins can update all" ON public.profiles
FOR UPDATE 
USING (
  id = auth.uid() 
  OR 
  user_role = 'admin'
);

-- Ensure students table has proper policies without referencing auth.users
DROP POLICY IF EXISTS "Users can view students" ON public.students;
DROP POLICY IF EXISTS "Users can manage students" ON public.students;

CREATE POLICY "Authenticated users can view students" ON public.students
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role IN ('admin', 'nurse')
  )
);

CREATE POLICY "Authenticated users can manage students" ON public.students
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role IN ('admin', 'nurse')
  )
);

CREATE POLICY "Authenticated users can update students" ON public.students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role IN ('admin', 'nurse')
  )
);

CREATE POLICY "Authenticated users can delete students" ON public.students
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_role IN ('admin', 'nurse')
  )
);