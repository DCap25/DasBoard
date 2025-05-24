-- Add fields for dealer group support to signup_requests table
ALTER TABLE public.signup_requests 
ADD COLUMN IF NOT EXISTS group_level TEXT,
ADD COLUMN IF NOT EXISTS dealership_count INTEGER DEFAULT 1;

-- Create area_vps table for tracking Area VP assignments 
CREATE TABLE IF NOT EXISTS public.area_vps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  group_id INTEGER NOT NULL REFERENCES public.dealership_groups(id),
  dealerships JSONB, -- Array of dealership IDs this AVP manages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for area_vps table
ALTER TABLE public.area_vps ENABLE ROW LEVEL SECURITY;

-- Policy for master admins to manage all area VPs
CREATE POLICY "Master admins can manage all area VPs"
  ON public.area_vps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM public.roles WHERE name = 'admin')
    )
  );

-- Policy for group admins to manage their own group's area VPs
CREATE POLICY "Group admins can manage their own group's area VPs"
  ON public.area_vps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND is_group_admin = true
      AND group_id = (
        SELECT group_id FROM public.area_vps WHERE id = area_vps.id
      )
    )
  );

-- Policy for area VPs to view their own assignments
CREATE POLICY "Area VPs can view their own assignments"
  ON public.area_vps
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Track migrations
CREATE TABLE IF NOT EXISTS public.migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Record this migration
INSERT INTO public.migrations (name) 
VALUES ('004_dealer_group_schema')
ON CONFLICT (name) DO NOTHING;

-- Log the migration
INSERT INTO public.logs (action, details)
VALUES (
  'migration_complete', 
  jsonb_build_object(
    'migration', '004_dealer_group_schema',
    'timestamp', now(),
    'description', 'Added dealer group support and area_vps table'
  )
); 