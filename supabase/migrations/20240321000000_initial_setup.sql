-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE dealership_status AS ENUM ('active', 'inactive', 'pending');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    encrypted_password TEXT NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dealerships table
CREATE TABLE IF NOT EXISTS dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    status dealership_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FNI details table
CREATE TABLE IF NOT EXISTS fni_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id),
    finance_amount DECIMAL(10,2),
    insurance_amount DECIMAL(10,2),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE fni_details ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create policies for dealerships table
CREATE POLICY "Users can view all dealerships" ON dealerships
    FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage dealerships" ON dealerships
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'manager')
        )
    );

-- Create policies for sales table
CREATE POLICY "Users can view all sales" ON sales
    FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage sales" ON sales
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'manager')
        )
    );

-- Create policies for fni_details table
CREATE POLICY "Users can view all FNI details" ON fni_details
    FOR SELECT USING (true);

CREATE POLICY "Managers and admins can manage FNI details" ON fni_details
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM users 
            WHERE role IN ('admin', 'manager')
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_sales_dealership_id ON sales(dealership_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_fni_details_dealership_id ON fni_details(dealership_id);
CREATE INDEX idx_fni_details_date ON fni_details(date);

-- Create functions for updated_at timestamp
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

CREATE TRIGGER update_dealerships_updated_at
    BEFORE UPDATE ON dealerships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fni_details_updated_at
    BEFORE UPDATE ON fni_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 