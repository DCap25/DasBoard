-- =====================================================
-- FULL DEALER GROUP SETUP FOR TESTING
-- =====================================================

-- 1. Create a new dealer group schema
CREATE SCHEMA IF NOT EXISTS dealer_group_test;

-- 2. Create dealer group record
INSERT INTO dealer_groups (
  id, name, logo_url, brands, created_at
) VALUES (
  'dg-test-001',
  'Test Automotive Group',
  'https://example.com/logo.png',
  ARRAY['Honda', 'Toyota', 'Ford'],
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brands = EXCLUDED.brands;

-- 3. Create dealerships under this group
INSERT INTO dealerships (
  id, name, group_id, schema_name, logo_url, 
  locations, brands, created_at
) VALUES 
  (
    'deal-test-001',
    'Downtown Honda',
    'dg-test-001',
    'dealer_group_test',
    'https://example.com/honda-logo.png',
    '[{"address": "123 Main St", "city": "Downtown", "state": "CA", "zip": "90210"}]'::jsonb,
    ARRAY['Honda'],
    NOW()
  ),
  (
    'deal-test-002', 
    'Suburban Toyota',
    'dg-test-001',
    'dealer_group_test',
    'https://example.com/toyota-logo.png',
    '[{"address": "456 Oak Ave", "city": "Suburban", "state": "CA", "zip": "90211"}]'::jsonb,
    ARRAY['Toyota'],
    NOW()
  ),
  (
    'deal-test-003',
    'Metro Ford',
    'dg-test-001', 
    'dealer_group_test',
    'https://example.com/ford-logo.png',
    '[{"address": "789 Pine Rd", "city": "Metro", "state": "CA", "zip": "90212"}]'::jsonb,
    ARRAY['Ford'],
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  group_id = EXCLUDED.group_id,
  schema_name = EXCLUDED.schema_name;

-- 4. Create test users with different roles
-- Finance Director
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'finance.director@testgroup.com',
  crypt('TestPass123!', gen_salt('bf')),
  NOW(),
  NOW(), 
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}'
) ON CONFLICT (email) DO NOTHING;

-- Sales Manager
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'sales.manager@testgroup.com', 
  crypt('TestPass123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}'
) ON CONFLICT (email) DO NOTHING;

-- General Manager
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'general.manager@testgroup.com',
  crypt('TestPass123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}'
) ON CONFLICT (email) DO NOTHING;

-- Finance Managers
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES 
  (
    gen_random_uuid(),
    'john.valentine@testgroup.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{}'
  ),
  (
    gen_random_uuid(),
    'sarah.johnson@testgroup.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{}'
  )
ON CONFLICT (email) DO NOTHING;

-- Salespersons
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) VALUES 
  (
    gen_random_uuid(),
    'mike.davis@testgroup.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{}'
  ),
  (
    gen_random_uuid(),
    'lisa.chen@testgroup.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{}'
  ),
  (
    gen_random_uuid(),
    'tom.wilson@testgroup.com',
    crypt('TestPass123!', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{}'
  )
ON CONFLICT (email) DO NOTHING;

-- 5. Create profiles for all users
INSERT INTO profiles (
  id, email, name, role, dealership_id, created_at
) 
SELECT 
  u.id,
  u.email,
  CASE 
    WHEN u.email = 'finance.director@testgroup.com' THEN 'Finance Director'
    WHEN u.email = 'sales.manager@testgroup.com' THEN 'Sales Manager'
    WHEN u.email = 'general.manager@testgroup.com' THEN 'General Manager'
    WHEN u.email = 'john.valentine@testgroup.com' THEN 'John Valentine'
    WHEN u.email = 'sarah.johnson@testgroup.com' THEN 'Sarah Johnson'
    WHEN u.email = 'mike.davis@testgroup.com' THEN 'Mike Davis'
    WHEN u.email = 'lisa.chen@testgroup.com' THEN 'Lisa Chen'
    WHEN u.email = 'tom.wilson@testgroup.com' THEN 'Tom Wilson'
  END,
  CASE 
    WHEN u.email = 'finance.director@testgroup.com' THEN 'finance_director'
    WHEN u.email = 'sales.manager@testgroup.com' THEN 'sales_manager'
    WHEN u.email = 'general.manager@testgroup.com' THEN 'general_manager'
    WHEN u.email IN ('john.valentine@testgroup.com', 'sarah.johnson@testgroup.com') THEN 'finance_manager'
    WHEN u.email IN ('mike.davis@testgroup.com', 'lisa.chen@testgroup.com', 'tom.wilson@testgroup.com') THEN 'salesperson'
  END,
  CASE 
    WHEN u.email IN ('finance.director@testgroup.com', 'sales.manager@testgroup.com', 'general.manager@testgroup.com') THEN 'deal-test-001'
    WHEN u.email IN ('john.valentine@testgroup.com', 'mike.davis@testgroup.com') THEN 'deal-test-001'
    WHEN u.email IN ('sarah.johnson@testgroup.com', 'lisa.chen@testgroup.com') THEN 'deal-test-002'
    WHEN u.email = 'tom.wilson@testgroup.com' THEN 'deal-test-003'
  END,
  NOW()
FROM auth.users u
WHERE u.email LIKE '%@testgroup.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  dealership_id = EXCLUDED.dealership_id;

-- 6. Create realistic test deals
INSERT INTO deals (
  id, stock_number, vin_last8, new_or_used, customer_last_name,
  deal_type, reserve_flat_amount, vsc_profit, ppm_profit, 
  tire_wheel_profit, paint_fabric_profit, other_profit,
  front_end_gross, status, created_by, sales_manager_id,
  fi_manager_id, salesperson_id, salesperson_initials,
  created_at, dealership_id
) VALUES 
  -- Downtown Honda deals
  (
    gen_random_uuid(), 'H24001', 'ABC12345', 'N', 'Smith',
    'Finance', 500, 1200, 800, 600, 400, 200, 2800, 'Funded',
    (SELECT id FROM auth.users WHERE email = 'john.valentine@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sales.manager@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'john.valentine@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'mike.davis@testgroup.com'),
    'MD', NOW() - INTERVAL '2 days', 'deal-test-001'
  ),
  (
    gen_random_uuid(), 'H24002', 'DEF67890', 'U', 'Johnson',
    'Cash', NULL, 0, 0, 0, 0, 0, 1200, 'Funded',
    (SELECT id FROM auth.users WHERE email = 'john.valentine@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sales.manager@testgroup.com'),
    NULL,
    (SELECT id FROM auth.users WHERE email = 'mike.davis@testgroup.com'),
    'MD', NOW() - INTERVAL '1 day', 'deal-test-001'
  ),
  -- Suburban Toyota deals
  (
    gen_random_uuid(), 'T24001', 'GHI11111', 'N', 'Williams',
    'Finance', 750, 1500, 900, 700, 500, 300, 3200, 'Funded',
    (SELECT id FROM auth.users WHERE email = 'sarah.johnson@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sales.manager@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sarah.johnson@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'lisa.chen@testgroup.com'),
    'LC', NOW() - INTERVAL '3 days', 'deal-test-002'
  ),
  (
    gen_random_uuid(), 'T24002', 'JKL22222', 'N', 'Brown',
    'Lease', 400, 800, 600, 400, 300, 150, 1950, 'Funded',
    (SELECT id FROM auth.users WHERE email = 'sarah.johnson@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sales.manager@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sarah.johnson@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'lisa.chen@testgroup.com'),
    'LC', NOW() - INTERVAL '4 days', 'deal-test-002'
  ),
  -- Metro Ford deals
  (
    gen_random_uuid(), 'F24001', 'MNO33333', 'N', 'Davis',
    'Finance', 600, 1100, 700, 500, 350, 250, 2600, 'Pending',
    (SELECT id FROM auth.users WHERE email = 'sarah.johnson@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sales.manager@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'sarah.johnson@testgroup.com'),
    (SELECT id FROM auth.users WHERE email = 'tom.wilson@testgroup.com'),
    'TW', NOW(), 'deal-test-003'
  )
ON CONFLICT (id) DO NOTHING;

-- 7. Create pay plans for roles
INSERT INTO pay_plans (
  id, role_id, front_end_percent, back_end_percent, csi_bonus,
  demo_allowance, vsc_bonus, ppm_bonus, volume_bonus,
  updated_by, updated_at, dealership_id
) VALUES 
  (
    gen_random_uuid(), 'salesperson', 25.0, 0.0, 100.0,
    500.0, 50.0, 25.0, '{"10": 200, "15": 400, "20": 600}'::jsonb,
    (SELECT id FROM auth.users WHERE email = 'sales.manager@testgroup.com'),
    NOW(), 'deal-test-001'
  ),
  (
    gen_random_uuid(), 'finance_manager', 0.0, 20.0, 150.0,
    0.0, 100.0, 50.0, '{"50": 500, "75": 1000, "100": 1500}'::jsonb,
    (SELECT id FROM auth.users WHERE email = 'finance.director@testgroup.com'),
    NOW(), 'deal-test-001'
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Create schedules
INSERT INTO schedules (
  id, user_id, dealership_id, schedule_data, created_at, updated_at
) 
SELECT 
  gen_random_uuid(),
  u.id,
  p.dealership_id,
  '{
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"},
    "wednesday": {"start": "09:00", "end": "18:00"},
    "thursday": {"start": "09:00", "end": "18:00"},
    "friday": {"start": "09:00", "end": "18:00"},
    "saturday": {"start": "09:00", "end": "17:00"},
    "sunday": {"off": true}
  }'::jsonb,
  NOW(),
  NOW()
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@testgroup.com'
ON CONFLICT (id) DO NOTHING;

-- 9. Update admindan to have master admin access
UPDATE profiles 
SET role = 'master_admin', is_group_admin = true
WHERE email = 'admindan@thedasboard.com';

-- 10. Ensure demo user has proper access
INSERT INTO profiles (
  id, email, name, role, dealership_id, created_at
) 
SELECT 
  u.id, u.email, 'Demo User', 'sales_manager', 'deal-test-001', NOW()
FROM auth.users u
WHERE u.email = 'demo@thedasboard.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'sales_manager',
  dealership_id = 'deal-test-001';

-- Summary query
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@testgroup.com') as test_users_created,
  (SELECT COUNT(*) FROM dealerships WHERE group_id = 'dg-test-001') as dealerships_created,
  (SELECT COUNT(*) FROM deals WHERE dealership_id IN ('deal-test-001', 'deal-test-002', 'deal-test-003')) as deals_created; 