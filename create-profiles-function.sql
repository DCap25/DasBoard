-- Create missing profiles function that bypasses RLS
-- This should be run in the Supabase SQL Editor as it uses elevated privileges

-- First, create a function that can insert profiles with elevated privileges
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS TABLE(user_id UUID, email TEXT, created BOOLEAN, error_msg TEXT)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
DECLARE
  user_record RECORD;
  profile_exists BOOLEAN;
  insert_success BOOLEAN;
BEGIN
  -- Loop through all auth users that don't have profiles
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
      CASE 
        WHEN au.email = 'testadmin@example.com' THEN 'master_admin'
        WHEN au.email = 'testfinance@example.com' THEN 'finance_manager'
        WHEN au.email = 'dealer1.admin@exampletest.com' THEN 'dealership_admin'
        ELSE 'single_dealer_admin'
      END as role
    FROM auth.users au
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = au.id
    )
  LOOP
    -- Return the user info and attempt to create profile
    user_id := user_record.id;
    email := user_record.email;
    insert_success := FALSE;
    error_msg := NULL;
    
    BEGIN
      -- Insert the profile
      INSERT INTO public.profiles (id, email, name, role, created_at, phone)
      VALUES (
        user_record.id,
        user_record.email,
        user_record.name,
        user_record.role,
        NOW(),
        '555-0000'
      );
      
      insert_success := TRUE;
      created := TRUE;
      
    EXCEPTION WHEN OTHERS THEN
      error_msg := SQLERRM;
      created := FALSE;
    END;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Run the function to create missing profiles
SELECT * FROM create_missing_profiles();

-- Verify the results
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Also check which auth users still don't have profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
ORDER BY au.created_at;

-- Drop the function after use (optional, for security)
-- DROP FUNCTION IF EXISTS create_missing_profiles(); 