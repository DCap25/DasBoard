-- Test script to create a test dealership with admin to verify admin details fix
-- This will help us verify that admin name, email, and phone show up correctly

-- First, let's see existing users
SELECT id, name, email, role FROM profiles WHERE role LIKE '%admin%' LIMIT 3;

-- Insert a test admin user if needed
INSERT INTO profiles (id, email, name, role, phone, created_at)
VALUES 
  ('test-admin-123', 'testadmin@testdealership.com', 'Test Admin User', 'single_dealer_admin', '+1-555-0123', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone;

-- Create a test dealership with the admin assigned
INSERT INTO dealerships (name, type, subscription_tier, num_teams, admin_user_id, store_hours, schema_name)
VALUES 
  ('Test Dealership for Admin Fix', 'single', 'base', 1, 'test-admin-123', 
   '{"status": "not_configured", "note": "Store hours to be configured by dealer admin"}',
   'test_dealership_admin_fix_schema')
ON CONFLICT (name) DO UPDATE SET
  admin_user_id = EXCLUDED.admin_user_id,
  type = EXCLUDED.type;

-- Verify the test data
SELECT 
  d.id as dealership_id,
  d.name as dealership_name,
  d.admin_user_id,
  p.name as admin_name,
  p.email as admin_email,
  p.phone as admin_phone
FROM dealerships d
LEFT JOIN profiles p ON d.admin_user_id = p.id
WHERE d.name = 'Test Dealership for Admin Fix'; 