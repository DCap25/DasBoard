-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_number TEXT NOT NULL,
  vin_last8 TEXT NOT NULL,
  new_or_used TEXT NOT NULL CHECK (new_or_used IN ('N', 'U')),
  customer_last_name TEXT NOT NULL,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('Cash', 'Finance', 'Lease')),
  reserve_flat_amount DECIMAL(10,2),
  vsc_profit DECIMAL(10,2),
  ppm_profit DECIMAL(10,2),
  tire_wheel_profit DECIMAL(10,2),
  paint_fabric_profit DECIMAL(10,2),
  other_profit DECIMAL(10,2),
  front_end_gross DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Funded', 'Unwound')),
  created_by UUID REFERENCES users(id) NOT NULL,
  sales_manager_id UUID REFERENCES users(id),
  fi_manager_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  funded_at TIMESTAMP WITH TIME ZONE,
  unwound_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for deals
CREATE POLICY "Allow F&I Managers to view all deals"
ON deals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id IN (
      SELECT id FROM roles
      WHERE name IN ('F&I', 'General Manager', 'Admin')
    )
  )
);

CREATE POLICY "Allow F&I Managers to view their own deals"
ON deals FOR SELECT
TO authenticated
USING (
  fi_manager_id = auth.uid()
);

-- Create RLS policies for users
CREATE POLICY "Allow users to view their own profile"
ON users FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Allow F&I Managers to view all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role_id IN (
      SELECT id FROM roles
      WHERE name IN ('F&I', 'General Manager', 'Admin')
    )
  )
);

-- Create RLS policies for roles
CREATE POLICY "Allow all authenticated users to view roles"
ON roles FOR SELECT
TO authenticated
USING (true);

-- Insert default roles
INSERT INTO roles (name) VALUES 
  ('F&I'),
  ('Sales Manager'),
  ('General Manager'),
  ('Admin')
ON CONFLICT (name) DO NOTHING;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    (SELECT id FROM roles WHERE name = 'F&I' LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 