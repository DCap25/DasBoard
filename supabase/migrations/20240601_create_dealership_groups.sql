-- Create dealership_groups table
CREATE TABLE IF NOT EXISTS dealership_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  brands JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_dealership_groups_name ON dealership_groups (name);

-- Add appropriate permissions
ALTER TABLE dealership_groups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow full access to authenticated users" 
  ON dealership_groups
  FOR ALL
  TO authenticated
  USING (true);

-- Update existing dealerships table if needed
ALTER TABLE dealerships
  ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES dealership_groups(id); 