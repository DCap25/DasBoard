-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role_id TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pay_plans table
CREATE TABLE pay_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id TEXT NOT NULL UNIQUE,
  front_end_percent DECIMAL(5,2) NOT NULL,
  back_end_percent DECIMAL(5,2) NOT NULL,
  csi_bonus DECIMAL(10,2) NOT NULL,
  demo_allowance DECIMAL(10,2) NOT NULL,
  vsc_bonus DECIMAL(10,2) NOT NULL,
  ppm_bonus DECIMAL(10,2) NOT NULL,
  volume_bonus JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role_id = 'admin'
    )
  );

-- Create policies for pay_plans table
CREATE POLICY "Admins can manage pay plans"
  ON pay_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role_id = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pay_plans_updated_at
  BEFORE UPDATE ON pay_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 