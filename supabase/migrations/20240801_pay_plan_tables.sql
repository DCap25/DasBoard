-- Create the pay_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS pay_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id TEXT NOT NULL UNIQUE,
  front_end_percent NUMERIC NOT NULL DEFAULT 0,
  back_end_percent NUMERIC NOT NULL DEFAULT 0,
  csi_bonus NUMERIC NOT NULL DEFAULT 0,
  demo_allowance NUMERIC NOT NULL DEFAULT 0,
  vsc_bonus NUMERIC NOT NULL DEFAULT 0,
  ppm_bonus NUMERIC NOT NULL DEFAULT 0,
  volume_bonus JSONB DEFAULT '{}'::jsonb,
  updated_by UUID NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT pay_plans_front_end_percent_check CHECK (front_end_percent >= 0 AND front_end_percent <= 100),
  CONSTRAINT pay_plans_back_end_percent_check CHECK (back_end_percent >= 0 AND back_end_percent <= 100),
  CONSTRAINT pay_plans_updated_by_fk FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- Ensure the roles table exists
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add predefined roles if the table is empty
INSERT INTO roles (id, name, description)
VALUES 
  ('sales', 'Sales', 'Sales Consultant'),
  ('finance_manager', 'Finance Manager', 'F&I Manager'),
  ('sales_manager', 'Sales Manager', 'Sales Management'),
  ('general_manager', 'General Manager', 'General Manager'),
  ('admin', 'Admin', 'System Administrator'),
  ('viewer', 'Viewer', 'Read-only access')
ON CONFLICT (id) DO NOTHING;

-- Add index to improve query performance
CREATE INDEX IF NOT EXISTS pay_plans_role_id_idx ON pay_plans(role_id);

-- Add comments for documentation
COMMENT ON TABLE pay_plans IS 'Compensation plans for dealership roles';
COMMENT ON COLUMN pay_plans.role_id IS 'Foreign key to roles table';
COMMENT ON COLUMN pay_plans.front_end_percent IS 'Percentage of front-end gross profit';
COMMENT ON COLUMN pay_plans.back_end_percent IS 'Percentage of back-end profit';
COMMENT ON COLUMN pay_plans.csi_bonus IS 'Bonus amount for customer satisfaction';
COMMENT ON COLUMN pay_plans.demo_allowance IS 'Monthly allowance for demos';
COMMENT ON COLUMN pay_plans.vsc_bonus IS 'Bonus amount for vehicle service contracts';
COMMENT ON COLUMN pay_plans.ppm_bonus IS 'Bonus amount for paint protection and maintenance';
COMMENT ON COLUMN pay_plans.volume_bonus IS 'JSON structure for volume-based bonus tiers'; 