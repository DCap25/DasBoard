-- Add add_ons field to signup_requests table
ALTER TABLE public.signup_requests 
ADD COLUMN IF NOT EXISTS add_ons JSONB DEFAULT '[]'::jsonb;

-- Add fields for Stripe subscription data
ALTER TABLE public.signup_requests 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add settings JSONB column to dealerships table
ALTER TABLE public.dealerships 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Log the migration
INSERT INTO public.logs (action, details)
VALUES (
  'migration_complete', 
  jsonb_build_object(
    'migration', 'update_signup_requests',
    'timestamp', now(),
    'description', 'Added add_ons and Stripe payment fields to signup_requests, settings to dealerships'
  )
); 