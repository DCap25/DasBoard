-- Supabase RLS Fix Script
-- This script checks and fixes Row Level Security (RLS) on all public schema tables
-- It also adds appropriate policies for each table

-- Step 1: Check current RLS status for all tables
SELECT 
  table_name,
  CASE WHEN rls_enabled THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM 
  information_schema.tables t 
LEFT JOIN 
  pg_tables pt ON t.table_name = pt.tablename
LEFT JOIN 
  pg_class pc ON pc.relname = t.table_name
WHERE 
  t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY 
  table_name;

-- Step 2: Check existing policies
SELECT 
  tablename,
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM 
  pg_policies
WHERE 
  schemaname = 'public'
ORDER BY 
  tablename, 
  policyname;

-- Step 3: Enable RLS on all public tables
-- WARNING: This will be executed in steps to avoid breaking access

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table 
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dealership_groups table
ALTER TABLE public.dealership_groups ENABLE ROW LEVEL SECURITY;

-- Enable RLS on dealerships table
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- Enable RLS on logs table
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on schema_operations table
ALTER TABLE public.schema_operations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create or replace policies for each table

-- PROFILES table policies
-- Policy to allow users to select their own profile
CREATE POLICY IF NOT EXISTS "Allow users to view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Allow users to update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy to allow users to insert their own profile during registration
CREATE POLICY IF NOT EXISTS "Allow users to insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy to allow Das Board Admin full access to profiles
CREATE POLICY IF NOT EXISTS "Allow admin full access to profiles" 
  ON public.profiles 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- ROLES table policies
-- Policy to allow anyone to view roles
CREATE POLICY IF NOT EXISTS "Allow anyone to view roles" 
  ON public.roles 
  FOR SELECT 
  USING (true);

-- Policy to allow only admins to modify roles
CREATE POLICY IF NOT EXISTS "Allow admin to modify roles" 
  ON public.roles 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- USERS table policies
-- Policy to allow users to view their own user record
CREATE POLICY IF NOT EXISTS "Allow users to view own user" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy to allow Das Board Admin full access to users
CREATE POLICY IF NOT EXISTS "Allow admin full access to users" 
  ON public.users 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- Policy to allow dealership admins to view users in their dealership
CREATE POLICY IF NOT EXISTS "Allow dealership admin to view dealership users" 
  ON public.users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.profiles current_user ON current_user.id = auth.uid()
      WHERE p.id = public.users.id
      AND p.dealership_id = current_user.dealership_id
      AND current_user.role = 'dealership_admin'
    )
  );

-- DEALERSHIP_GROUPS table policies
-- Policy to allow Das Board Admin full access
CREATE POLICY IF NOT EXISTS "Allow admin full access to dealership_groups" 
  ON public.dealership_groups 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- Policy to allow group admins to view their own group
CREATE POLICY IF NOT EXISTS "Allow group admins to view own group" 
  ON public.dealership_groups 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'dealer_group_admin'
      AND dealership_group_id = public.dealership_groups.id
    )
  );

-- DEALERSHIPS table policies
-- Policy to allow Das Board Admin full access
CREATE POLICY IF NOT EXISTS "Allow admin full access to dealerships" 
  ON public.dealerships 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- Policy to allow dealership users to view their own dealership
CREATE POLICY IF NOT EXISTS "Allow users to view own dealership" 
  ON public.dealerships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND dealership_id = public.dealerships.id
    )
  );

-- Policy to allow group admins to view dealerships in their group
CREATE POLICY IF NOT EXISTS "Allow group admins to view group dealerships" 
  ON public.dealerships 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'dealer_group_admin'
      AND dealership_group_id = public.dealerships.dealership_group_id
    )
  );

-- LOGS table policies
-- Policy to allow Das Board Admin full access
CREATE POLICY IF NOT EXISTS "Allow admin full access to logs" 
  ON public.logs 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- Policy to allow dealership admins to view logs for their dealership
CREATE POLICY IF NOT EXISTS "Allow dealership admin to view dealership logs" 
  ON public.logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'dealership_admin'
      AND dealership_id = public.logs.dealership_id
    )
  );

-- SCHEMA_OPERATIONS table policies
-- Policy to allow Das Board Admin full access
CREATE POLICY IF NOT EXISTS "Allow admin full access to schema_operations" 
  ON public.schema_operations 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR email LIKE '%@exampletest.com')
    )
  );

-- Add any missing indexes for optimization
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_dealership_id_idx ON public.profiles (dealership_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
CREATE INDEX IF NOT EXISTS dealerships_group_id_idx ON public.dealerships (dealership_group_id);
CREATE INDEX IF NOT EXISTS logs_dealership_id_idx ON public.logs (dealership_id);

-- Check tables after changes
SELECT 
  table_name,
  CASE WHEN rls_enabled THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM 
  information_schema.tables t 
LEFT JOIN 
  pg_tables pt ON t.table_name = pt.tablename
LEFT JOIN 
  pg_class pc ON pc.relname = t.table_name
WHERE 
  t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY 
  table_name;

-- Check policies after changes
SELECT 
  tablename,
  policyname, 
  permissive,
  roles,
  cmd,
  qual
FROM 
  pg_policies
WHERE 
  schemaname = 'public'
ORDER BY 
  tablename, 
  policyname; 