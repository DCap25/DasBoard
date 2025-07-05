-- =====================================================
-- CLEANUP EXISTING TEST ACCOUNTS
-- =====================================================

-- First, let's see what we have before cleanup
SELECT 
  'BEFORE CLEANUP' as phase,
  COUNT(*) as total_users,
  COUNT(CASE WHEN email IN ('demo@thedasboard.com', 'admindan@thedasboard.com') THEN 1 END) as essential_users,
  COUNT(CASE WHEN email NOT IN ('demo@thedasboard.com', 'admindan@thedasboard.com') THEN 1 END) as test_users_to_delete
FROM auth.users;

-- 1. Clean up related data first (to avoid foreign key constraints)

-- Delete deals from test users
DELETE FROM deals 
WHERE created_by IN (
  SELECT id FROM auth.users 
  WHERE email NOT IN ('demo@thedasboard.com', 'admindan@thedasboard.com')
);

-- Delete schedules for test users
DELETE FROM schedules 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email NOT IN ('demo@thedasboard.com', 'admindan@thedasboard.com')
);

-- Delete pay plans created by test users
DELETE FROM pay_plans 
WHERE updated_by IN (
  SELECT id FROM auth.users 
  WHERE email NOT IN ('demo@thedasboard.com', 'admindan@thedasboard.com')
);

-- Delete profiles for test users
DELETE FROM profiles 
WHERE email NOT IN ('demo@thedasboard.com', 'admindan@thedasboard.com');

-- 2. Delete test dealerships and groups (keep only essential ones)
DELETE FROM dealerships 
WHERE id NOT IN (
  SELECT DISTINCT dealership_id 
  FROM profiles 
  WHERE email IN ('demo@thedasboard.com', 'admindan@thedasboard.com')
  AND dealership_id IS NOT NULL
);

-- Clean up orphaned dealer groups
DELETE FROM dealer_groups 
WHERE id NOT IN (
  SELECT DISTINCT group_id 
  FROM dealerships 
  WHERE group_id IS NOT NULL
);

-- 3. Finally, delete the test user accounts (keeping essential ones)
DELETE FROM auth.users 
WHERE email NOT IN ('demo@thedasboard.com', 'admindan@thedasboard.com');

-- 4. Verify cleanup
SELECT 
  'AFTER CLEANUP' as phase,
  COUNT(*) as total_users_remaining,
  string_agg(email, ', ') as remaining_users
FROM auth.users;

-- 5. Show what profiles remain
SELECT 
  'REMAINING PROFILES' as info,
  email, name, role, dealership_id
FROM profiles 
ORDER BY email; 