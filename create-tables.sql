-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dealership_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dealership_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dealerships table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dealerships (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  phone VARCHAR(20),
  group_id INTEGER REFERENCES public.dealership_groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on these tables (to start with)
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealership_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealerships DISABLE ROW LEVEL SECURITY;

-- Insert sample role if not exists
INSERT INTO public.roles (name)
VALUES ('Sales'), ('Admin'), ('Manager')
ON CONFLICT (name) DO NOTHING;

-- Create function to insert sample dealership group
CREATE OR REPLACE FUNCTION insert_sample_dealership_group()
RETURNS void AS $$
DECLARE
  group_id INTEGER;
BEGIN
  -- Check if any records exist
  IF NOT EXISTS (SELECT 1 FROM public.dealership_groups LIMIT 1) THEN
    -- Insert a sample dealership group
    INSERT INTO public.dealership_groups (name, description)
    VALUES ('Sample Group', 'A sample dealership group for testing')
    RETURNING id INTO group_id;
    
    -- Insert a sample dealership
    INSERT INTO public.dealerships (name, description, address, city, state, zip, phone, group_id)
    VALUES (
      'Sample Dealership', 
      'A sample dealership for testing', 
      '123 Test Street', 
      'Test City', 
      'TS', 
      '12345', 
      '555-123-4567', 
      group_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Run the function
SELECT insert_sample_dealership_group(); 