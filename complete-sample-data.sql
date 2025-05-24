-- Comprehensive Sample Data for Das Board
-- This script populates your database with a complete test dataset

-- =============================================
-- 1. DEALERSHIP GROUPS
-- =============================================
INSERT INTO public.dealership_groups (name, description)
VALUES 
  ('Luxury Auto Group', 'High-end vehicle dealership group specializing in luxury brands'),
  ('Economy Motors', 'Affordable vehicle options for budget-conscious customers'),
  ('Family Auto Network', 'Family-friendly dealerships with diverse inventory')
ON CONFLICT DO NOTHING;

-- =============================================
-- 2. DEALERSHIPS
-- =============================================
-- First, get the group IDs
DO $$
DECLARE
  luxury_group_id INTEGER;
  economy_group_id INTEGER;
  family_group_id INTEGER;
BEGIN
  -- Get group IDs
  SELECT id INTO luxury_group_id FROM public.dealership_groups WHERE name = 'Luxury Auto Group';
  SELECT id INTO economy_group_id FROM public.dealership_groups WHERE name = 'Economy Motors';
  SELECT id INTO family_group_id FROM public.dealership_groups WHERE name = 'Family Auto Network';
  
  -- Create luxury dealerships
  INSERT INTO public.dealerships (name, description, address, city, state, zip, phone, group_id)
  VALUES
    ('Luxury Auto Downtown', 'Premium downtown location offering high-end vehicles', '123 Main Street', 'Metropolis', 'NY', '10001', '212-555-1234', luxury_group_id),
    ('Luxury Auto Westside', 'Exclusive dealership in the west side shopping district', '456 West Blvd', 'Metropolis', 'NY', '10002', '212-555-5678', luxury_group_id),
    ('Luxury Auto Eastside', 'Our flagship luxury auto dealership', '789 East Ave', 'Metropolis', 'NY', '10003', '212-555-9012', luxury_group_id)
  ON CONFLICT DO NOTHING;
  
  -- Create economy dealerships
  INSERT INTO public.dealerships (name, description, address, city, state, zip, phone, group_id)
  VALUES
    ('Economy Motors Central', 'Budget-friendly vehicles for everyone', '100 Center Plaza', 'Springfield', 'IL', '62701', '217-555-3456', economy_group_id),
    ('Economy Motors North', 'Great deals on economy vehicles', '200 North Road', 'Springfield', 'IL', '62702', '217-555-7890', economy_group_id)
  ON CONFLICT DO NOTHING;
  
  -- Create family dealerships
  INSERT INTO public.dealerships (name, description, address, city, state, zip, phone, group_id)
  VALUES
    ('Family Auto Main', 'Family-owned dealership serving the community for 25 years', '300 Family Way', 'Riverdale', 'CA', '90001', '310-555-1111', family_group_id),
    ('Family Auto Express', 'Quick and easy auto shopping for busy families', '400 Express Lane', 'Riverdale', 'CA', '90002', '310-555-2222', family_group_id),
    ('Family Auto Suburban', 'Spacious suburban location with large inventory', '500 Suburb Circle', 'Riverdale', 'CA', '90003', '310-555-3333', family_group_id)
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- 3. ROLES
-- =============================================
INSERT INTO public.roles (name)
VALUES 
  ('Sales'),
  ('Admin'),
  ('Sales Manager'),
  ('Finance Manager'),
  ('Service Manager'),
  ('Test Admin')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 4. USERS/PROFILES
-- =============================================
-- We'll create some sample users linked to the different dealerships and roles
DO $$
DECLARE
  dealership_id INTEGER;
  dealership_name TEXT;
  role_name TEXT;
  dealership_cur CURSOR FOR SELECT id, name FROM public.dealerships;
  email_domain TEXT := 'example.com';
  user_id UUID;
BEGIN
  -- Create various users for each dealership
  OPEN dealership_cur;
  
  LOOP
    FETCH dealership_cur INTO dealership_id, dealership_name;
    EXIT WHEN NOT FOUND;
    
    -- For each role type, create a user at this dealership
    FOREACH role_name IN ARRAY ARRAY['Sales', 'Sales Manager', 'Finance Manager', 'Service Manager']
    LOOP
      -- Create sanitized email based on dealership and role
      -- Create a profile record (assuming your profiles table structure matches this)
      -- Note: In a real app, you'd create auth.users entries too
      
      -- Generate a random UUID for the user_id
      user_id := gen_random_uuid();
      
      -- Insert into profiles table if it exists
      -- This assumes a profiles table with these fields - adjust as needed
      BEGIN
        EXECUTE '
          INSERT INTO public.profiles (id, email, name, role, dealership_id, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT DO NOTHING
        ' USING 
          user_id,
          LOWER(REPLACE(REPLACE(role_name, ' ', ''), '_', '') || '_' || REPLACE(LOWER(dealership_name), ' ', '') || '@' || email_domain),
          CASE 
            WHEN role_name = 'Sales' THEN 'Sales Person ' || dealership_id
            WHEN role_name = 'Sales Manager' THEN 'Manager ' || dealership_id
            WHEN role_name = 'Finance Manager' THEN 'Finance ' || dealership_id
            WHEN role_name = 'Service Manager' THEN 'Service ' || dealership_id
            ELSE 'Employee ' || dealership_id
          END,
          role_name,
          dealership_id;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not insert into profiles table: %', SQLERRM;
      END;
    END LOOP;
  END LOOP;
  
  CLOSE dealership_cur;
  
  -- Create a Test Admin user
  BEGIN
    EXECUTE '
      INSERT INTO public.profiles (id, email, name, role, dealership_id, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
      ON CONFLICT DO NOTHING
    ' USING 
      'testadmin@example.com',
      'Test Administrator',
      'Test Admin',
      (SELECT id FROM public.dealerships ORDER BY id LIMIT 1);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert Test Admin: %', SQLERRM;
  END;
END $$;

-- =============================================
-- 5. CONFIRM RESULTS
-- =============================================
-- Count the number of items in each table for confirmation
SELECT 'dealership_groups' as table_name, COUNT(*) as record_count FROM public.dealership_groups
UNION ALL
SELECT 'dealerships', COUNT(*) FROM public.dealerships
UNION ALL
SELECT 'roles', COUNT(*) FROM public.roles
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles; 