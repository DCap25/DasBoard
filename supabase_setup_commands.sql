-- ================================================================
-- SUPABASE SETUP COMMANDS FOR FINANCE MANAGER 500 ERROR PREVENTION
-- ================================================================
-- Run these commands in Supabase Dashboard > SQL Editor
-- These commands set up proper RLS policies and database structure
-- to prevent 500 errors during Finance Manager login

-- ================================================================
-- 1. VERIFY CURRENT RLS POLICIES
-- ================================================================
-- Check existing RLS policies for profiles table
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if RLS is enabled on profiles table
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'profiles';

-- ================================================================
-- 2. ENABLE RLS ON PROFILES TABLE (if not already enabled)
-- ================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 3. CREATE/UPDATE RLS POLICIES FOR FINANCE MANAGERS
-- ================================================================

-- Drop existing policies that might conflict (if they exist)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Policy 1: Finance Managers can access their own profile
CREATE POLICY "finance_managers_can_access_own_profile" 
ON profiles FOR SELECT 
TO authenticated
USING (
  auth.uid() = id 
  AND (
    role = 'single_finance_manager' 
    OR role = 'finance_manager'
    OR role = 'viewer'  -- Safe fallback
  )
);

-- Policy 2: Finance Managers can update their own profile
CREATE POLICY "finance_managers_can_update_own_profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Admins can view all profiles
CREATE POLICY "admins_can_view_all_profiles" 
ON profiles FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('master_admin', 'admin')
  )
);

-- Policy 4: Admins can manage all profiles
CREATE POLICY "admins_can_manage_all_profiles" 
ON profiles FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('master_admin', 'admin')
  )
);

-- ================================================================
-- 4. VERIFY USERS TABLE (if it exists)
-- ================================================================
-- Check if users table exists and has proper structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If users table exists, set up RLS policies for it too
DO $$
BEGIN
  -- Check if users table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Enable RLS on users table
    EXECUTE 'ALTER TABLE users ENABLE ROW LEVEL SECURITY';
    
    -- Create RLS policy for users table
    EXECUTE 'CREATE POLICY IF NOT EXISTS "users_can_access_own_data" 
             ON users FOR SELECT 
             TO authenticated
             USING (auth.uid() = id)';
             
    RAISE NOTICE 'Users table RLS policies created successfully';
  ELSE
    RAISE NOTICE 'Users table does not exist - skipping';
  END IF;
END $$;

-- ================================================================
-- 5. CREATE ENHANCED PROMOTIONS TABLES (if not exists)
-- ================================================================

-- Create promotions table with enhanced security
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier TEXT NOT NULL CHECK (tier IN (
    'finance_manager_only',
    'salesperson', 
    'sales_manager',
    'general_manager',
    'dealership_basic',
    'dealership_pro',
    'dealership_enterprise'
  )),
  original_price DECIMAL(10, 2) NOT NULL CHECK (original_price >= 0),
  promo_price DECIMAL(10, 2) NOT NULL CHECK (promo_price >= 0),
  start_date DATE NOT NULL,
  end_date DATE CHECK (end_date IS NULL OR end_date > start_date),
  description TEXT CHECK (LENGTH(description) <= 1000),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'scheduled', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_price_relationship CHECK (promo_price <= original_price)
);

-- Enable RLS on promotions table
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promotions table
CREATE POLICY "authenticated_users_can_view_promotions" 
ON promotions FOR SELECT 
TO authenticated
USING (deleted_at IS NULL);

CREATE POLICY "admins_can_manage_promotions" 
ON promotions FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('master_admin', 'admin')
  )
);

-- Create promotions_usage table with schema support
CREATE TABLE IF NOT EXISTS promotions_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  promotion_tier TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  schema_name TEXT CHECK (schema_name ~* '^[a-zA-Z][a-zA-Z0-9_]*$' AND LENGTH(schema_name) <= 63),
  dealership_id INTEGER,
  usage_type TEXT NOT NULL DEFAULT 'signup' CHECK (usage_type IN ('signup', 'renewal', 'upgrade', 'downgrade')),
  signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  original_amount DECIMAL(10, 2) CHECK (original_amount IS NULL OR original_amount >= 0),
  discounted_amount DECIMAL(10, 2) CHECK (discounted_amount IS NULL OR discounted_amount >= 0),
  discount_applied DECIMAL(5, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  version INTEGER NOT NULL DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT valid_entity_reference CHECK (
    (user_id IS NOT NULL AND schema_name IS NULL AND dealership_id IS NULL) OR
    (user_id IS NULL AND schema_name IS NOT NULL AND dealership_id IS NULL) OR
    (user_id IS NULL AND schema_name IS NULL AND dealership_id IS NOT NULL)
  )
);

-- Enable RLS on promotions_usage table
ALTER TABLE promotions_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promotions_usage table
CREATE POLICY "users_can_view_own_usage" 
ON promotions_usage FOR SELECT 
TO authenticated
USING (
  deleted_at IS NULL 
  AND (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('master_admin', 'admin')
    )
  )
);

-- ================================================================
-- 6. INSERT DEFAULT FINANCE MANAGER PROMOTION
-- ================================================================
-- Insert the Finance Manager free promotion (if it doesn't exist)
INSERT INTO promotions (
  tier, 
  original_price, 
  promo_price, 
  start_date, 
  description,
  created_by
)
SELECT 
  'finance_manager_only', 
  5.00, 
  0.00, 
  '2025-05-18', 
  'Finance Manager Only - Free for a limited time',
  (SELECT id FROM auth.users LIMIT 1)  -- Use any admin user
WHERE NOT EXISTS (
  SELECT 1 FROM promotions 
  WHERE tier = 'finance_manager_only' 
  AND deleted_at IS NULL
);

-- ================================================================
-- 7. CREATE VALIDATION FUNCTIONS FOR 500 ERROR PREVENTION
-- ================================================================

-- Function to safely get user profile with error handling
CREATE OR REPLACE FUNCTION get_user_profile_safe(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  id UUID,
  role TEXT,
  dealership_id INTEGER,
  is_group_admin BOOLEAN,
  error_message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return profile data with error handling
  RETURN QUERY
  SELECT 
    p.id,
    p.role,
    p.dealership_id,
    p.is_group_admin,
    NULL::TEXT as error_message
  FROM profiles p
  WHERE p.id = user_uuid
  LIMIT 1;
  
  -- If no results, return an error record
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      user_uuid,
      'viewer'::TEXT as role,
      NULL::INTEGER as dealership_id,
      FALSE as is_group_admin,
      'Profile not found - using safe defaults'::TEXT as error_message;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return safe defaults on any error
    RETURN QUERY
    SELECT 
      user_uuid,
      'viewer'::TEXT as role,
      NULL::INTEGER as dealership_id,
      FALSE as is_group_admin,
      format('Database error: %s', SQLERRM)::TEXT as error_message;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_safe TO authenticated;

-- ================================================================
-- 8. CREATE HEALTH CHECK FUNCTION
-- ================================================================

-- Function to check database health for 500 error prevention
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check profiles table
  RETURN QUERY
  SELECT 
    'Profiles Table'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
      THEN 'OK' 
      ELSE 'MISSING' 
    END::TEXT,
    'Core user profile storage'::TEXT;
  
  -- Check RLS policies on profiles
  RETURN QUERY
  SELECT 
    'Profiles RLS Policies'::TEXT,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') >= 2
      THEN 'OK'
      ELSE 'INSUFFICIENT'
    END::TEXT,
    format('Found %s policies', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles'))::TEXT;
  
  -- Check promotions table
  RETURN QUERY
  SELECT 
    'Promotions Table'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions') 
      THEN 'OK' 
      ELSE 'MISSING' 
    END::TEXT,
    'Finance Manager promotions support'::TEXT;
  
  -- Check Finance Manager promotion
  RETURN QUERY
  SELECT 
    'Finance Manager Promotion'::TEXT,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM promotions 
        WHERE tier = 'finance_manager_only' 
        AND deleted_at IS NULL
        AND status = 'active'
      ) 
      THEN 'OK' 
      ELSE 'MISSING' 
    END::TEXT,
    'Free Finance Manager tier promotion'::TEXT;
  
  RETURN;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_database_health TO authenticated;

-- ================================================================
-- 9. FINAL VERIFICATION QUERIES
-- ================================================================

-- Show summary of what was created/verified
SELECT 'SETUP COMPLETE - Run these verification queries:' as status;

-- Query 1: Check RLS policies
SELECT 'RLS POLICIES:' as check_type;
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('profiles', 'promotions', 'promotions_usage')
ORDER BY tablename, policyname;

-- Query 2: Check promotions
SELECT 'PROMOTIONS:' as check_type;
SELECT tier, original_price, promo_price, status, description
FROM promotions 
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- Query 3: Test health check
SELECT 'DATABASE HEALTH:' as check_type;
SELECT * FROM check_database_health();

-- Query 4: Test profile function
SELECT 'PROFILE FUNCTION TEST:' as check_type;
-- This will test with the current authenticated user
-- Replace with a known user UUID for testing
SELECT * FROM get_user_profile_safe();