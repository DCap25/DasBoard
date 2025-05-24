-- Create signup_requests table in public schema
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free_trial', 'finance_manager', 'dealership', 'dealer_group')),
  add_ons JSONB DEFAULT '[]'::jsonb,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for signup_requests table
CREATE POLICY "Admins can manage signup requests"
  ON public.signup_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM public.roles WHERE name = 'admin')
    )
  );

-- Create policy for selecting pending signup requests
CREATE POLICY "Admins can view all signup requests"
  ON public.signup_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM public.roles WHERE name = 'admin')
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_signup_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_signup_requests_updated_at
  BEFORE UPDATE ON public.signup_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_signup_requests_updated_at(); 