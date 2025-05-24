-- Create pre-verified test users in Supabase
-- This SQL should be run from the Supabase dashboard SQL editor

-- 1. Create function to verify emails automatically for @exampletest.com domains
CREATE OR REPLACE FUNCTION public.auto_verify_test_emails()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is a test email (@exampletest.com)
  IF NEW.email LIKE '%@exampletest.com' OR NEW.email LIKE '%@example.com' THEN
    -- Update the user's email verification status
    UPDATE auth.users
    SET email_confirmed_at = now(),
        updated_at = now()
    WHERE id = NEW.id;
    
    -- Log the auto-verification
    RAISE NOTICE 'Auto-verified test email: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger to auto-verify test emails
DROP TRIGGER IF EXISTS auto_verify_test_emails_trigger ON auth.users;
CREATE TRIGGER auto_verify_test_emails_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_verify_test_emails();

-- 3. Create test users for Dealership1 (change dealership_id accordingly)
-- First define the dealership ID for our test data
DO $$
DECLARE
  dealership_id INTEGER := 1; -- Change this to match your actual dealership ID
  admin_role_id INTEGER;
  sales_role_id INTEGER;
  finance_role_id INTEGER;
  sales_mgr_role_id INTEGER;
  gm_role_id INTEGER;
BEGIN
  -- Get role IDs from the roles table
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'Admin';
  SELECT id INTO sales_role_id FROM public.roles WHERE name = 'Sales Person';
  SELECT id INTO finance_role_id FROM public.roles WHERE name = 'Finance Manager';
  SELECT id INTO sales_mgr_role_id FROM public.roles WHERE name = 'Sales Manager';
  SELECT id INTO gm_role_id FROM public.roles WHERE name = 'General Manager';
  
  -- Create test users using manual SQL inserts (for demonstration)
  -- In production, use proper secure methods for user creation
  
  -- Note: This is just to populate the users table - the actual auth.users would be 
  -- created through the proper API calls for security reasons
  
  -- Admin user
  INSERT INTO public.users (email, name, dealership_id, role_id)
  VALUES ('admin1@exampletest.com', 'Admin User', dealership_id, admin_role_id)
  ON CONFLICT (email) DO UPDATE SET 
    name = 'Admin User',
    dealership_id = dealership_id,
    role_id = admin_role_id;
    
  -- Sales person
  INSERT INTO public.users (email, name, dealership_id, role_id)
  VALUES ('sales1@exampletest.com', 'Sales Person', dealership_id, sales_role_id)
  ON CONFLICT (email) DO UPDATE SET 
    name = 'Sales Person',
    dealership_id = dealership_id,
    role_id = sales_role_id;
    
  -- Finance manager
  INSERT INTO public.users (email, name, dealership_id, role_id)
  VALUES ('finance1@exampletest.com', 'Finance Manager', dealership_id, finance_role_id)
  ON CONFLICT (email) DO UPDATE SET 
    name = 'Finance Manager',
    dealership_id = dealership_id,
    role_id = finance_role_id;
    
  -- Sales manager
  INSERT INTO public.users (email, name, dealership_id, role_id)
  VALUES ('salesmgr1@exampletest.com', 'Sales Manager', dealership_id, sales_mgr_role_id)
  ON CONFLICT (email) DO UPDATE SET 
    name = 'Sales Manager',
    dealership_id = dealership_id,
    role_id = sales_mgr_role_id;
    
  -- General manager
  INSERT INTO public.users (email, name, dealership_id, role_id)
  VALUES ('gm1@exampletest.com', 'General Manager', dealership_id, gm_role_id)
  ON CONFLICT (email) DO UPDATE SET 
    name = 'General Manager',
    dealership_id = dealership_id,
    role_id = gm_role_id;
    
  RAISE NOTICE 'Added test users for dealership %', dealership_id;
END $$;

-- 4. Update signup_requests to auto-approve test domains
CREATE OR REPLACE FUNCTION public.auto_approve_test_signup_requests()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is a test email that should be auto-approved
  IF NEW.email LIKE '%@exampletest.com' OR NEW.email LIKE '%@example.com' THEN
    -- Auto-approve the request
    NEW.status := 'approved';
    NEW.processed_at := now();
    NEW.processed_by := 'system';
    
    -- Log the auto-approval
    RAISE NOTICE 'Auto-approved signup request for test email: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for auto-approving test signup requests
DROP TRIGGER IF EXISTS auto_approve_test_signup_trigger ON public.signup_requests;
CREATE TRIGGER auto_approve_test_signup_trigger
BEFORE INSERT ON public.signup_requests
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_test_signup_requests();

-- 6. Create RLS policy exception for test emails
CREATE POLICY "Test users have full access"
  ON public.users
  USING (
    auth.jwt() ->> 'email' LIKE '%@exampletest.com' OR 
    auth.jwt() ->> 'email' LIKE '%@example.com'
  );

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_dealership_id ON public.users(dealership_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);

-- Done! 