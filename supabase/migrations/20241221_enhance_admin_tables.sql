-- Enhance tables for Master Admin Dashboard functionality

-- First, ensure dealership_groups table has all needed columns
CREATE TABLE IF NOT EXISTS public.dealer_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  multiple_points BOOLEAN DEFAULT false,
  admin_user_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing dealerships table
ALTER TABLE public.dealerships 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS dealer_group_id INTEGER REFERENCES public.dealer_groups(id),
  ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES public.profiles(id);

-- Update profiles table to match expected structure
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create signup_requests table for handling registration requests
CREATE TABLE IF NOT EXISTS public.signup_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dealer_groups_manufacturer ON public.dealer_groups(manufacturer);
CREATE INDEX IF NOT EXISTS idx_dealer_groups_admin_user ON public.dealer_groups(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_dealerships_dealer_group ON public.dealerships(dealer_group_id);
CREATE INDEX IF NOT EXISTS idx_dealerships_admin_user ON public.dealerships(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_signup_requests_status ON public.signup_requests(status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_email ON public.signup_requests(email);

-- Enable RLS on new tables
ALTER TABLE public.dealer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dealer_groups
CREATE POLICY "Allow authenticated users to view dealer groups"
  ON public.dealer_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to manage dealer groups"
  ON public.dealer_groups
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for signup_requests
CREATE POLICY "Allow authenticated users to view signup requests"
  ON public.signup_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to manage signup requests"
  ON public.signup_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_dealer_groups'
  ) THEN
    CREATE TRIGGER set_updated_at_dealer_groups
      BEFORE UPDATE ON public.dealer_groups
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_signup_requests'
  ) THEN
    CREATE TRIGGER set_updated_at_signup_requests
      BEFORE UPDATE ON public.signup_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Insert some sample manufacturer data for dealer groups if none exists
INSERT INTO public.dealer_groups (name, manufacturer, multiple_points) 
VALUES 
  ('AutoNation Ford', 'Ford', true),
  ('Hendrick Toyota', 'Toyota', true),
  ('Lithia Honda', 'Honda', false)
ON CONFLICT DO NOTHING;

-- Insert some sample dealerships
INSERT INTO public.dealerships (name, address, dealer_group_id) 
VALUES 
  ('Downtown Ford', '123 Main St, Downtown', 1),
  ('North Toyota', '456 North Ave, Northside', 2),
  ('City Honda', '789 City Blvd, Midtown', 3)
ON CONFLICT DO NOTHING; 