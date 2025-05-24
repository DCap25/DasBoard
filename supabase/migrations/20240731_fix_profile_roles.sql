-- Update the role constraint in profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Recreate the constraint with correct values
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'dealership_admin', 'sales_manager', 'salesperson', 'finance_manager', 'viewer'));

-- Fix any 'F&I' roles to 'finance_manager'
UPDATE profiles SET role = 'finance_manager' WHERE role = 'F&I';

-- Fix any NULL roles to 'viewer'
UPDATE profiles SET role = 'viewer' WHERE role IS NULL;

-- Temporarily disable Row Level Security to resolve circular dependencies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Fix any missing profile records for existing users
INSERT INTO profiles (id, role, updated_at)
SELECT 
  auth.users.id, 
  'viewer'::text as role,
  NOW() as updated_at
FROM 
  auth.users
LEFT JOIN 
  profiles ON auth.users.id = profiles.id
WHERE 
  profiles.id IS NULL; 