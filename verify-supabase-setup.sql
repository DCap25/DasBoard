-- Supabase Configuration Verification Script
-- Run this after applying the RLS fixes to verify everything is working

-- =============================================
-- 1. TEST TABLES EXIST
-- =============================================
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'dealership_groups'
) AS dealership_groups_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'dealerships'
) AS dealerships_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'roles'
) AS roles_exists;

-- =============================================
-- 2. TEST RLS IS PROPERLY CONFIGURED
-- =============================================
-- Check which tables have RLS enabled
SELECT
    n.nspname as schema,
    c.relname as table,
    CASE WHEN c.relrowsecurity THEN 'RLS enabled' ELSE 'RLS disabled' END as rls_status
FROM
    pg_class c
JOIN
    pg_namespace n ON n.oid = c.relnamespace
WHERE
    n.nspname = 'public'
    AND c.relkind = 'r'  -- Only tables
    AND c.relname IN ('dealership_groups', 'dealerships', 'roles', 'profiles', 'users')
ORDER BY
    c.relname;

-- List all policies for our primary tables
SELECT
    tablename,
    policyname,
    roles,
    cmd
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename IN ('dealership_groups', 'dealerships', 'roles')
ORDER BY
    tablename;

-- =============================================
-- 3. TEST DATA ACCESS
-- =============================================
-- Test anonymous access to dealership_groups
SELECT
    COUNT(*) as dealership_group_count
FROM
    public.dealership_groups;

-- Test anonymous access to dealerships
SELECT
    COUNT(*) as dealership_count
FROM
    public.dealerships;

-- =============================================
-- 4. TEST INSERT OPERATIONS
-- =============================================
-- Try to insert a test dealership group (will be rolled back)
BEGIN;
    INSERT INTO public.dealership_groups (name, description)
    VALUES ('TEST GROUP - VERIFY', 'Test group for verification - will be rolled back');
    
    SELECT id, name FROM public.dealership_groups WHERE name = 'TEST GROUP - VERIFY';
ROLLBACK;

-- =============================================
-- 5. PERMISSIONS CHECK
-- =============================================
-- Check permissions for the anon role
SELECT
    table_schema,
    table_name, 
    privilege_type
FROM
    information_schema.role_table_grants
WHERE
    grantee = 'anon'
    AND table_schema = 'public'
    AND table_name IN ('dealership_groups', 'dealerships', 'roles')
ORDER BY
    table_name,
    privilege_type; 