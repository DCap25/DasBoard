-- Create a table to store mappings between users and their schemas
CREATE TABLE IF NOT EXISTS public.schema_user_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  schema_name TEXT NOT NULL,
  schema_type TEXT NOT NULL CHECK (schema_type IN ('finance_manager', 'dealership', 'dealer_group')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_schema_user_mappings_user_id ON public.schema_user_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_schema_user_mappings_schema_name ON public.schema_user_mappings(schema_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_schema_user_mappings_user_schema_type ON public.schema_user_mappings(user_id, schema_type);

-- Add RLS policies for schema_user_mappings
ALTER TABLE public.schema_user_mappings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own schema mappings
CREATE POLICY select_own_schema_mappings
  ON public.schema_user_mappings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role / admin access for insert, update, delete
CREATE POLICY admin_all_operations
  ON public.schema_user_mappings
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to track schema creation time
CREATE OR REPLACE FUNCTION public.handle_schema_creation()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.schema_user_mappings
FOR EACH ROW
EXECUTE FUNCTION public.handle_schema_creation(); 