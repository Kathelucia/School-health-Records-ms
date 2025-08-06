
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable read access for admins" ON public.profiles;

-- Update the admin read access policy to use the user metadata directly
CREATE POLICY "Enable read access for admins" ON public.profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
  OR id = auth.uid()
);

-- Update the admin update policy similarly  
DROP POLICY IF EXISTS "Enable admin update access" ON public.profiles;
CREATE POLICY "Enable admin update access" ON public.profiles
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
  OR id = auth.uid()
);

-- Create a policy to allow profile creation during signup
CREATE POLICY IF NOT EXISTS "Allow profile creation during signup" ON public.profiles
FOR INSERT 
WITH CHECK (id = auth.uid());
