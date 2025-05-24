-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table (created first due to foreign key dependencies)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL CHECK (name IN ('Sales', 'F&I', 'Finance Director', 'Sales Manager', 'GSM', 'GM', 'Admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealerships table
CREATE TABLE dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    store_hours JSONB NOT NULL,
    num_teams INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    dealership_id UUID NOT NULL REFERENCES dealerships(id),
    phone_number TEXT,
    last_2fa_verified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_number TEXT NOT NULL,
    vin_last8 TEXT NOT NULL,
    new_or_used CHAR(1) NOT NULL CHECK (new_or_used IN ('N', 'U')),
    customer_last_name TEXT NOT NULL,
    deal_type TEXT NOT NULL CHECK (deal_type IN ('Cash', 'Finance', 'Lease')),
    reserve_flat_amount NUMERIC(10,2),
    vsc_profit NUMERIC(10,2),
    ppm_profit NUMERIC(10,2),
    tire_wheel_profit NUMERIC(10,2),
    paint_fabric_profit NUMERIC(10,2),
    other_profit NUMERIC(10,2),
    front_end_gross NUMERIC(10,2) NOT NULL,
    total_fi_profit NUMERIC(10,2) GENERATED ALWAYS AS (
        COALESCE(vsc_profit, 0) + 
        COALESCE(ppm_profit, 0) + 
        COALESCE(tire_wheel_profit, 0) + 
        COALESCE(paint_fabric_profit, 0) + 
        COALESCE(other_profit, 0)
    ) STORED,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Funded', 'Unwound')),
    created_by UUID REFERENCES users(id),
    sales_manager_id UUID REFERENCES users(id),
    fi_manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    funded_at TIMESTAMP WITH TIME ZONE,
    unwound_at TIMESTAMP WITH TIME ZONE
);

-- Pay Plans table
CREATE TABLE pay_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id),
    dealership_id UUID REFERENCES dealerships(id),
    front_end_percent NUMERIC(5,2),
    back_end_percent NUMERIC(5,2),
    csi_bonus NUMERIC(10,2),
    demo_allowance NUMERIC(10,2),
    vsc_bonus NUMERIC(10,2),
    ppm_bonus NUMERIC(10,2),
    volume_bonus JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, dealership_id)
);

-- Schedules table
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    dealership_id UUID REFERENCES dealerships(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    team_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_dealership_id ON users(dealership_id);
CREATE INDEX idx_deals_created_by ON deals(created_by);
CREATE INDEX idx_deals_sales_manager_id ON deals(sales_manager_id);
CREATE INDEX idx_deals_fi_manager_id ON deals(fi_manager_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_schedules_team_id ON schedules(team_id);

-- RLS Policies for Users table
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role_id = (SELECT id FROM roles WHERE name = 'Admin')
        )
    );

-- RLS Policies for Deals table
CREATE POLICY "Admins have full access to deals"
    ON deals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role_id = (SELECT id FROM roles WHERE name = 'Admin')
        )
    );

CREATE POLICY "F&I Managers can manage their deals"
    ON deals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role_id = (SELECT id FROM roles WHERE name = 'F&I')
            AND (deals.fi_manager_id = auth.uid() OR deals.created_by = auth.uid())
        )
    );

CREATE POLICY "Sales Managers can update front end and status"
    ON deals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role_id = (SELECT id FROM roles WHERE name = 'Sales Manager')
            AND deals.sales_manager_id = auth.uid()
        )
    )
    WITH CHECK (
        (NEW.front_end_gross IS NOT NULL OR NEW.status IS NOT NULL)
        AND (OLD.front_end_gross = NEW.front_end_gross OR OLD.status = NEW.status)
    );

CREATE POLICY "Salespeople can view their team's deals"
    ON deals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role_id = (SELECT id FROM roles WHERE name = 'Sales')
            AND u.dealership_id = deals.dealership_id
        )
    );

-- RLS Policies for Schedules table
CREATE POLICY "Users can view their own schedule"
    ON schedules FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Salespeople can view their team's schedules"
    ON schedules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role_id = (SELECT id FROM roles WHERE name = 'Sales')
            AND u.team_id = schedules.team_id
        )
    );

-- Function to notify managers when a deal is deleted
CREATE OR REPLACE FUNCTION notify_deal_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify F&I Manager
    IF OLD.fi_manager_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, message, type)
        VALUES (OLD.fi_manager_id, 
                'Deal ' || OLD.id || ' has been deleted by ' || auth.uid(),
                'deal_deleted');
    END IF;
    
    -- Notify Sales Manager
    IF OLD.sales_manager_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, message, type)
        VALUES (OLD.sales_manager_id,
                'Deal ' || OLD.id || ' has been deleted by ' || auth.uid(),
                'deal_deleted');
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for deal deletion notifications
CREATE TRIGGER deal_deletion_notification
    AFTER DELETE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION notify_deal_deletion();

-- RLS Policy for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid()); 