-- DAS BOARD SCHEMA SETUP
-- This script sets up the entire database schema for the dealership management system
-- It creates global tables, functions, triggers, RLS policies, and testing procedures

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "moddatetime";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create a logs table to track operations
CREATE TABLE IF NOT EXISTS public.logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Global Tables
CREATE TABLE public.dealership_groups (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.dealerships (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    group_id BIGINT REFERENCES public.dealership_groups(id),
    schema_name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    locations JSONB DEFAULT '[]'::jsonb,
    brands JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.roles (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
('admin', 'Das Board Admin with full access'),
('dealership_admin', 'Dealership Admin with access to their dealership only'),
('general_manager', 'General Manager for a dealership'),
('sales_manager', 'Sales Manager for a dealership'),
('finance_manager', 'Finance Manager for a dealership'),
('salesperson', 'Salesperson for a dealership');

-- Update the profiles table to include dealership_id and role_id
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dealership_id BIGINT REFERENCES public.dealerships(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id BIGINT REFERENCES public.roles(id);

-- Function to create schema for a dealership
CREATE OR REPLACE FUNCTION create_dealership_schema(schema_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Create the schema
    EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || schema_name;
    
    -- Create tables in the schema
    EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.pay_plans (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.schedules (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        date DATE NOT NULL,
        shift_start TIME NOT NULL,
        shift_end TIME NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.deals (
        id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
        customer_name TEXT NOT NULL,
        vehicle TEXT NOT NULL,
        sale_date DATE NOT NULL,
        front_end_gross DECIMAL(10,2) DEFAULT 0,
        back_end_gross DECIMAL(10,2) DEFAULT 0,
        salesperson_id UUID REFERENCES auth.users(id),
        status TEXT DEFAULT ''pending'',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )';
    
    -- Create RLS policies for the tables
    -- Allow dealership admin and above to access tables
    EXECUTE 'ALTER TABLE ' || schema_name || '.pay_plans ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE ' || schema_name || '.schedules ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE ' || schema_name || '.deals ENABLE ROW LEVEL SECURITY';
    
    -- Pay plans - only dealership admins and global admins can manage
    EXECUTE 'CREATE POLICY admin_pay_plans_policy ON ' || schema_name || '.pay_plans
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                JOIN public.dealerships d ON p.dealership_id = d.id
                WHERE p.id = auth.uid() 
                AND d.schema_name = ''' || schema_name || '''
                AND p.role IN (''dealership_admin'', ''admin'')
            )
        )';
    
    -- Schedules - managers and above can manage
    EXECUTE 'CREATE POLICY managers_schedules_policy ON ' || schema_name || '.schedules
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                JOIN public.dealerships d ON p.dealership_id = d.id
                WHERE p.id = auth.uid() 
                AND d.schema_name = ''' || schema_name || '''
                AND p.role IN (''sales_manager'', ''general_manager'', ''dealership_admin'', ''admin'')
            )
        )';
    
    -- Deals - all dealership staff can view, managers can edit
    EXECUTE 'CREATE POLICY view_deals_policy ON ' || schema_name || '.deals
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                JOIN public.dealerships d ON p.dealership_id = d.id
                WHERE p.id = auth.uid() 
                AND d.schema_name = ''' || schema_name || '''
            )
        )';
        
    EXECUTE 'CREATE POLICY manage_deals_policy ON ' || schema_name || '.deals
        FOR INSERT UPDATE DELETE
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles p
                JOIN public.dealerships d ON p.dealership_id = d.id
                WHERE p.id = auth.uid() 
                AND d.schema_name = ''' || schema_name || '''
                AND p.role IN (''sales_manager'', ''finance_manager'', ''general_manager'', ''dealership_admin'', ''admin'')
            )
        )';
    
    -- Log schema creation
    INSERT INTO public.logs (action, details) 
    VALUES ('schema_creation', json_build_object('schema_name', schema_name));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update schema when a dealership is created
CREATE OR REPLACE FUNCTION create_dealership_schema_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_dealership_schema(NEW.schema_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_schema_on_dealership_insert
    AFTER INSERT ON public.dealerships
    FOR EACH ROW
    EXECUTE FUNCTION create_dealership_schema_trigger();

-- Set up triggers for updated_at timestamps
CREATE TRIGGER set_dealership_groups_updated_at
    BEFORE UPDATE ON public.dealership_groups
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

CREATE TRIGGER set_dealerships_updated_at
    BEFORE UPDATE ON public.dealerships
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

-- RLS Policies
-- Enable RLS on all tables
ALTER TABLE public.dealership_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Global admin policy for dealership_groups (admin can do anything)
CREATE POLICY admin_dealership_groups_policy ON public.dealership_groups
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Global admin and respective dealership admin policy for dealerships
CREATE POLICY admin_dealerships_policy ON public.dealerships
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND 
            (profiles.role = 'admin' OR 
             (profiles.role = 'dealership_admin' AND profiles.dealership_id = dealerships.id))
        )
    );

-- Anyone can view roles
CREATE POLICY view_roles_policy ON public.roles
    FOR SELECT
    USING (true);

-- Only admin can manage roles
CREATE POLICY manage_roles_policy ON public.roles
    FOR INSERT UPDATE DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Only admin can view logs
CREATE POLICY view_logs_policy ON public.logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Create test data function
CREATE OR REPLACE FUNCTION create_test_data()
RETURNS VOID AS $$
DECLARE
    group_id BIGINT;
    dealership_id BIGINT;
BEGIN
    -- Create a test group
    INSERT INTO public.dealership_groups (name, logo_url)
    VALUES ('Test Group', 'https://example.com/logo.png')
    RETURNING id INTO group_id;
    
    -- Create a test dealership
    INSERT INTO public.dealerships (name, group_id, schema_name, logo_url)
    VALUES ('Test Dealership', group_id, 'dealership_test', 'https://example.com/dealership.png')
    RETURNING id INTO dealership_id;
    
    -- Add some test data to the dealership schema
    EXECUTE '
        INSERT INTO dealership_test.pay_plans (name, details)
        VALUES 
            (''Standard Commission'', ''{"base": 2000, "commission_rate": 0.25}''),
            (''Performance Bonus'', ''{"base": 1800, "commission_rate": 0.3, "bonus_threshold": 10}'')
    ';
    
    -- Log the test data creation
    INSERT INTO public.logs (action, details) 
    VALUES ('test_data_creation', json_build_object(
        'group_id', group_id,
        'dealership_id', dealership_id,
        'timestamp', now()
    ));
END;
$$ LANGUAGE plpgsql; 