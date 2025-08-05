-- Enable Row Level Security (RLS) on all tables
-- This ensures data access is properly controlled based on user authentication and authorization

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Enable RLS on dealerships table
ALTER TABLE public.dealerships ENABLE ROW LEVEL SECURITY;

-- Dealerships policies
CREATE POLICY "Users can view dealerships they belong to" ON public.dealerships
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT dealership_id 
            FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Dealership admins can update their dealership" ON public.dealerships
    FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT dealership_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('dealership_admin', 'general_manager')
        )
    )
    WITH CHECK (
        id IN (
            SELECT dealership_id 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('dealership_admin', 'general_manager')
        )
    );

CREATE POLICY "Group admins can view all dealerships" ON public.dealerships
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE id = auth.uid() 
            AND (is_group_admin = true OR role = 'dealer_group_admin')
        )
    );

CREATE POLICY "Service role can manage all dealerships" ON public.dealerships
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Enable RLS on dealership_groups table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dealership_groups') THEN
        ALTER TABLE public.dealership_groups ENABLE ROW LEVEL SECURITY;
        
        -- Only group admins can access dealership groups
        EXECUTE 'CREATE POLICY "Group admins can manage dealership groups" ON public.dealership_groups
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 
                    FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND (is_group_admin = true OR role = ''dealer_group_admin'')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 
                    FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND (is_group_admin = true OR role = ''dealer_group_admin'')
                )
            )';
    END IF;
END $$;

-- Enable RLS on users table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "Users can view their own user record" ON public.users
            FOR SELECT
            TO authenticated
            USING (id = auth.uid())';
            
        EXECUTE 'CREATE POLICY "Users can update their own user record" ON public.users
            FOR UPDATE
            TO authenticated
            USING (id = auth.uid())
            WITH CHECK (id = auth.uid())';
    END IF;
END $$;

-- Enable RLS on roles table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'roles') THEN
        ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
        
        -- Everyone can view roles (needed for role selection)
        EXECUTE 'CREATE POLICY "Authenticated users can view roles" ON public.roles
            FOR SELECT
            TO authenticated
            USING (true)';
            
        -- Only admins can modify roles
        EXECUTE 'CREATE POLICY "Admins can manage roles" ON public.roles
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 
                    FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN (''admin'', ''dealership_admin'', ''dealer_group_admin'')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 
                    FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN (''admin'', ''dealership_admin'', ''dealer_group_admin'')
                )
            )';
    END IF;
END $$;

-- Enable RLS on signup_requests table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'signup_requests') THEN
        ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;
        
        -- Users can view their own signup requests
        EXECUTE 'CREATE POLICY "Users can view their own signup requests" ON public.signup_requests
            FOR SELECT
            TO authenticated
            USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))';
            
        -- Admins can view and manage all signup requests
        EXECUTE 'CREATE POLICY "Admins can manage signup requests" ON public.signup_requests
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 
                    FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN (''admin'', ''dealer_group_admin'')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 
                    FROM public.profiles 
                    WHERE id = auth.uid() 
                    AND role IN (''admin'', ''dealer_group_admin'')
                )
            )';
    END IF;
END $$;

-- Function to check if user has access to dealership data
CREATE OR REPLACE FUNCTION user_has_dealership_access(dealership_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user belongs to the dealership or is a group admin
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND (
            profiles.dealership_id = dealership_id_param
            OR profiles.is_group_admin = true 
            OR profiles.role = 'dealer_group_admin'
            OR profiles.role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'dealership_admin', 'dealer_group_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    table_name TEXT,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view security audit logs" ON public.security_audit_log
    FOR SELECT
    TO authenticated
    USING (user_is_admin());

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    event_type_param TEXT,
    table_name_param TEXT DEFAULT NULL,
    record_id_param TEXT DEFAULT NULL,
    old_values_param JSONB DEFAULT NULL,
    new_values_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        event_type,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        auth.uid(),
        event_type_param,
        table_name_param,
        record_id_param,
        old_values_param,
        new_values_param
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;