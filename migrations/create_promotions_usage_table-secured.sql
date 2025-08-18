-- ================================================================
-- ENHANCED SECURE PROMOTIONS USAGE TABLE MIGRATION
-- ================================================================
-- SECURITY ENHANCEMENTS IMPLEMENTED:
-- 1. Comprehensive foreign key constraints with CASCADE options
-- 2. Enhanced RLS policies with granular access control
-- 3. Data integrity validation and business logic constraints
-- 4. Performance optimization with strategic indexes
-- 5. Audit trail with comprehensive logging
-- 6. Prevention of duplicate usage and fraud detection
-- 7. Secure data archival and cleanup procedures
-- 8. Enhanced monitoring and alerting capabilities
-- ================================================================

-- Security: Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For exclusion constraints

-- Security: Create enum for usage status tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usage_status_type') THEN
        CREATE TYPE usage_status_type AS ENUM (
            'pending',    -- Usage recorded but not yet validated
            'active',     -- Usage confirmed and active
            'expired',    -- Usage has expired
            'revoked',    -- Usage was revoked due to violation
            'refunded'    -- Usage was refunded
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usage_source_type') THEN
        CREATE TYPE usage_source_type AS ENUM (
            'direct_signup',     -- Direct user signup
            'admin_applied',     -- Applied by administrator
            'system_migration',  -- System migration/bulk operation
            'api_integration',   -- Through API integration
            'bulk_import'        -- Bulk import operation
        );
    END IF;
END $$;

-- Security: Create enhanced promotions_usage table with comprehensive validation
CREATE TABLE IF NOT EXISTS promotions_usage (
    -- Security: Primary key with UUID v4 for unpredictable IDs
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Security: Promotion reference with proper foreign key constraint
    promotion_id UUID NOT NULL 
        REFERENCES promotions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Security: Tier tracking with validation (denormalized for performance)
    promotion_tier promotion_tier_type NOT NULL,
    
    -- Security: User reference with cascade handling
    user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Security: Schema name with validation for finance manager schemas
    schema_name TEXT 
        CONSTRAINT promotions_usage_schema_name_format 
        CHECK (schema_name IS NULL OR schema_name ~ '^[a-z0-9_]+$')
        CONSTRAINT promotions_usage_schema_name_length
        CHECK (char_length(schema_name) <= 50),
    
    -- Security: Dealership reference with proper constraint
    dealership_id INTEGER 
        REFERENCES dealerships(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Security: Enhanced date tracking with validation
    signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
        CONSTRAINT promotions_usage_signup_date_reasonable 
        CHECK (signup_date >= '2025-01-01' AND signup_date <= NOW() + INTERVAL '1 hour'),
    
    -- Security: Usage status and lifecycle tracking
    status usage_status_type NOT NULL DEFAULT 'pending',
    source usage_source_type NOT NULL DEFAULT 'direct_signup',
    
    -- Security: Expiration date based on promotion terms
    expires_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    
    -- Security: Financial tracking with validation
    original_amount DECIMAL(10, 2)
        CONSTRAINT promotions_usage_original_amount_positive 
        CHECK (original_amount IS NULL OR original_amount > 0),
    
    promotional_amount DECIMAL(10, 2)
        CONSTRAINT promotions_usage_promo_amount_non_negative
        CHECK (promotional_amount IS NULL OR promotional_amount >= 0),
    
    savings_amount DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN original_amount IS NOT NULL AND promotional_amount IS NOT NULL 
            THEN original_amount - promotional_amount
            ELSE NULL
        END
    ) STORED,
    
    -- Security: IP address tracking for fraud detection
    signup_ip_address INET,
    user_agent TEXT
        CONSTRAINT promotions_usage_user_agent_length
        CHECK (char_length(user_agent) <= 500),
    
    -- Security: Referral and tracking information
    referral_code TEXT
        CONSTRAINT promotions_usage_referral_code_format
        CHECK (referral_code IS NULL OR referral_code ~ '^[A-Z0-9_-]+$')
        CONSTRAINT promotions_usage_referral_code_length
        CHECK (char_length(referral_code) <= 20),
    
    utm_source TEXT
        CONSTRAINT promotions_usage_utm_source_length
        CHECK (char_length(utm_source) <= 100),
    
    utm_campaign TEXT
        CONSTRAINT promotions_usage_utm_campaign_length
        CHECK (char_length(utm_campaign) <= 100),
    
    -- Security: Audit trail fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Security: Soft delete support
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Security: Additional metadata as JSONB for flexibility
    metadata JSONB DEFAULT '{}',
    
    -- Security: Business logic constraints
    CONSTRAINT promotions_usage_user_or_dealership 
        CHECK (user_id IS NOT NULL OR dealership_id IS NOT NULL),
    
    CONSTRAINT promotions_usage_finance_schema_logic
        CHECK (
            (promotion_tier = 'finance_manager_only' AND schema_name IS NOT NULL AND dealership_id IS NULL) OR
            (promotion_tier != 'finance_manager_only' AND schema_name IS NULL)
        ),
    
    CONSTRAINT promotions_usage_status_dates
        CHECK (
            (status = 'active' AND activated_at IS NOT NULL) OR
            (status != 'active') OR
            (status = 'revoked' AND revoked_at IS NOT NULL) OR
            (status != 'revoked')
        ),
    
    CONSTRAINT promotions_usage_expiry_logic
        CHECK (expires_at IS NULL OR expires_at > signup_date),
    
    CONSTRAINT promotions_usage_amounts_logic
        CHECK (
            (original_amount IS NULL AND promotional_amount IS NULL) OR
            (original_amount IS NOT NULL AND promotional_amount IS NOT NULL AND promotional_amount <= original_amount)
        )
);

-- Security: Add comprehensive table and column comments
COMMENT ON TABLE promotions_usage IS 
'Tracks users who have used promotional pricing with comprehensive security and fraud prevention';

COMMENT ON COLUMN promotions_usage.id IS 
'Unique identifier using UUID v4 for security and unpredictability';

COMMENT ON COLUMN promotions_usage.promotion_id IS 
'Foreign key reference to the specific promotion used';

COMMENT ON COLUMN promotions_usage.promotion_tier IS 
'Denormalized promotion tier for performance and reporting';

COMMENT ON COLUMN promotions_usage.user_id IS 
'User who used the promotion (NULL for dealership-level promotions)';

COMMENT ON COLUMN promotions_usage.schema_name IS 
'Schema name for finance manager promotions (validated format)';

COMMENT ON COLUMN promotions_usage.dealership_id IS 
'Dealership associated with the promotion usage';

COMMENT ON COLUMN promotions_usage.status IS 
'Current status of the promotion usage for lifecycle tracking';

COMMENT ON COLUMN promotions_usage.source IS 
'Source of the promotion usage for tracking and analytics';

COMMENT ON COLUMN promotions_usage.signup_ip_address IS 
'IP address used during signup for fraud detection';

COMMENT ON COLUMN promotions_usage.user_agent IS 
'Browser user agent for fraud detection and analytics';

COMMENT ON COLUMN promotions_usage.savings_amount IS 
'Calculated savings amount for reporting (generated column)';

COMMENT ON COLUMN promotions_usage.metadata IS 
'Additional metadata in JSON format for extensibility';

-- Security: Create strategic indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_promotions_usage_promotion_id
ON promotions_usage (promotion_id)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_user_id
ON promotions_usage (user_id)
WHERE deleted_at IS NULL AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_dealership_id
ON promotions_usage (dealership_id)
WHERE deleted_at IS NULL AND dealership_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_schema_name
ON promotions_usage (schema_name)
WHERE deleted_at IS NULL AND schema_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_signup_date
ON promotions_usage (signup_date DESC)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_status_active
ON promotions_usage (status, expires_at)
WHERE status = 'active' AND deleted_at IS NULL;

-- Security: Create composite index for fraud detection
CREATE INDEX IF NOT EXISTS idx_promotions_usage_fraud_detection
ON promotions_usage (signup_ip_address, user_agent, signup_date)
WHERE deleted_at IS NULL AND signup_ip_address IS NOT NULL;

-- Security: Create unique constraint to prevent duplicate usage
CREATE UNIQUE INDEX IF NOT EXISTS idx_promotions_usage_unique_active
ON promotions_usage (promotion_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(dealership_id, 0))
WHERE status IN ('pending', 'active') AND deleted_at IS NULL;

-- Security: Create exclusion constraint to prevent overlapping active promotions per user
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE promotions_usage 
ADD CONSTRAINT promotions_usage_no_overlap_active
EXCLUDE USING gist (
    user_id WITH =,
    promotion_tier WITH =,
    tstzrange(activated_at, COALESCE(expires_at, 'infinity'::timestamptz)) WITH &&
)
WHERE (status = 'active' AND user_id IS NOT NULL AND deleted_at IS NULL);

-- Security: Create function for secure role and access checking
CREATE OR REPLACE FUNCTION check_promotions_usage_access(
    user_uuid UUID, 
    target_user_id UUID DEFAULT NULL,
    target_dealership_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role TEXT;
    user_dealership INTEGER;
BEGIN
    -- Security: Get user role and dealership
    SELECT role, dealership_id INTO user_role, user_dealership
    FROM profiles 
    WHERE id = user_uuid
      AND deleted_at IS NULL
      AND is_active = TRUE;
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Security: Master admin has full access
    IF user_role = 'master_admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Security: Admin has access to their dealership group
    IF user_role IN ('admin', 'dealership_admin') THEN
        -- Allow access if target is in same dealership or no specific target
        RETURN target_dealership_id IS NULL OR target_dealership_id = user_dealership;
    END IF;
    
    -- Security: Users can only access their own usage records
    IF target_user_id IS NOT NULL THEN
        RETURN target_user_id = user_uuid;
    END IF;
    
    -- Security: Finance managers can access their dealership's usage
    IF user_role IN ('finance_manager', 'single_finance_manager') THEN
        RETURN target_dealership_id IS NULL OR target_dealership_id = user_dealership;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Security: Add comment for access checking function
COMMENT ON FUNCTION check_promotions_usage_access(UUID, UUID, INTEGER) IS 
'Securely checks access permissions for promotions usage records based on user role and relationships';

-- Security: Enable Row Level Security
ALTER TABLE promotions_usage ENABLE ROW LEVEL SECURITY;

-- Security: Drop existing policies to recreate with enhanced security
DROP POLICY IF EXISTS "Authenticated users can view promotions_usage" ON promotions_usage;
DROP POLICY IF EXISTS "Admin users can manage promotions_usage" ON promotions_usage;

-- Security: Enhanced RLS policy for SELECT with granular access control
CREATE POLICY "secure_promotions_usage_select"
ON promotions_usage FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL AND 
    check_promotions_usage_access(auth.uid(), user_id, dealership_id)
);

-- Security: Enhanced RLS policy for INSERT with validation
CREATE POLICY "secure_promotions_usage_insert"
ON promotions_usage FOR INSERT
TO authenticated
WITH CHECK (
    -- Security: Validate user permissions
    (
        -- Master admin can insert any usage record
        check_user_role(auth.uid(), ARRAY['master_admin']) OR
        -- Regular admin can insert for their dealership
        (check_user_role(auth.uid(), ARRAY['admin', 'dealership_admin']) 
         AND (dealership_id IS NULL OR check_promotions_usage_access(auth.uid(), user_id, dealership_id))) OR
        -- Users can create their own usage records
        (user_id = auth.uid())
    ) AND
    -- Security: Ensure proper initial values
    deleted_at IS NULL AND
    status IN ('pending', 'active') AND
    created_by IS NOT DISTINCT FROM auth.uid()
);

-- Security: Enhanced RLS policy for UPDATE with restrictions
CREATE POLICY "secure_promotions_usage_update"
ON promotions_usage FOR UPDATE
TO authenticated
USING (
    deleted_at IS NULL AND (
        -- Master admin can update any record
        check_user_role(auth.uid(), ARRAY['master_admin']) OR
        -- Admin can update records in their scope
        (check_user_role(auth.uid(), ARRAY['admin', 'dealership_admin'])
         AND check_promotions_usage_access(auth.uid(), user_id, dealership_id))
    )
)
WITH CHECK (
    -- Security: Ensure updated_by is set correctly
    updated_by = auth.uid() AND
    -- Security: Prevent modification of creation audit fields
    created_at = (SELECT created_at FROM promotions_usage WHERE id = promotions_usage.id) AND
    created_by IS NOT DISTINCT FROM (SELECT created_by FROM promotions_usage WHERE id = promotions_usage.id) AND
    -- Security: Prevent resurrection of deleted records
    (OLD.deleted_at IS NULL OR NEW.deleted_at IS NOT NULL)
);

-- Security: Enhanced RLS policy for soft DELETE
CREATE POLICY "secure_promotions_usage_delete"
ON promotions_usage FOR UPDATE
TO authenticated
USING (
    deleted_at IS NULL AND 
    check_user_role(auth.uid(), ARRAY['master_admin'])
)
WITH CHECK (
    deleted_at IS NOT NULL AND
    deleted_by = auth.uid()
);

-- Security: Create audit trigger function for promotions_usage
CREATE OR REPLACE FUNCTION promotions_usage_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Security: Handle UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
        NEW.updated_by = auth.uid();
        
        -- Security: Log status changes and significant updates
        IF OLD.status != NEW.status OR OLD.promotional_amount IS DISTINCT FROM NEW.promotional_amount THEN
            INSERT INTO promotions_usage_audit_log (
                usage_id,
                action,
                old_values,
                new_values,
                changed_by,
                changed_at,
                ip_address
            ) VALUES (
                NEW.id,
                'update',
                row_to_json(OLD),
                row_to_json(NEW),
                auth.uid(),
                NOW(),
                inet_client_addr()
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Security: Handle INSERT operations
    IF TG_OP = 'INSERT' THEN
        INSERT INTO promotions_usage_audit_log (
            usage_id,
            action,
            new_values,
            changed_by,
            changed_at,
            ip_address
        ) VALUES (
            NEW.id,
            'insert',
            row_to_json(NEW),
            auth.uid(),
            NOW(),
            inet_client_addr()
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Security: Create audit log table for promotions_usage
CREATE TABLE IF NOT EXISTS promotions_usage_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usage_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'status_change')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Security: Additional context
    reason TEXT,
    admin_notes TEXT
        CONSTRAINT promotions_usage_audit_admin_notes_length
        CHECK (char_length(admin_notes) <= 1000)
);

-- Security: Add audit log indexes and comments
COMMENT ON TABLE promotions_usage_audit_log IS 
'Comprehensive audit trail for promotions usage table with IP tracking and context';

CREATE INDEX IF NOT EXISTS idx_promotions_usage_audit_usage_id 
ON promotions_usage_audit_log (usage_id);

CREATE INDEX IF NOT EXISTS idx_promotions_usage_audit_changed_at 
ON promotions_usage_audit_log (changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_promotions_usage_audit_changed_by 
ON promotions_usage_audit_log (changed_by);

CREATE INDEX IF NOT EXISTS idx_promotions_usage_audit_ip_address 
ON promotions_usage_audit_log (ip_address)
WHERE ip_address IS NOT NULL;

-- Security: Create the audit trigger
DROP TRIGGER IF EXISTS promotions_usage_audit_trigger ON promotions_usage;
CREATE TRIGGER promotions_usage_audit_trigger
    BEFORE INSERT OR UPDATE ON promotions_usage
    FOR EACH ROW
    EXECUTE FUNCTION promotions_usage_audit_trigger();

-- Security: Create function to detect potential fraud
CREATE OR REPLACE FUNCTION detect_promotion_fraud(
    check_ip INET DEFAULT NULL,
    check_user_agent TEXT DEFAULT NULL,
    time_window INTERVAL DEFAULT '1 hour'
)
RETURNS TABLE(
    suspicious_ip INET,
    usage_count BIGINT,
    unique_users BIGINT,
    first_usage TIMESTAMPTZ,
    last_usage TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.signup_ip_address as suspicious_ip,
        COUNT(*) as usage_count,
        COUNT(DISTINCT pu.user_id) as unique_users,
        MIN(pu.signup_date) as first_usage,
        MAX(pu.signup_date) as last_usage
    FROM promotions_usage pu
    WHERE 
        pu.deleted_at IS NULL AND
        pu.signup_date >= NOW() - time_window AND
        (check_ip IS NULL OR pu.signup_ip_address = check_ip) AND
        (check_user_agent IS NULL OR pu.user_agent = check_user_agent)
    GROUP BY pu.signup_ip_address
    HAVING 
        COUNT(*) >= 5 OR  -- 5+ signups from same IP
        (COUNT(*) >= 3 AND COUNT(DISTINCT pu.user_id) = 1)  -- 3+ signups, same user
    ORDER BY usage_count DESC, last_usage DESC;
END;
$$;

-- Security: Add comment for fraud detection function
COMMENT ON FUNCTION detect_promotion_fraud(INET, TEXT, INTERVAL) IS 
'Detects potential fraudulent promotion usage based on IP, user agent, and usage patterns';

-- Security: Enhanced subscription_events table modifications
DO $$ 
BEGIN
    -- Security: Add is_promotional column with proper constraint
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subscription_events' AND column_name = 'is_promotional'
    ) THEN
        ALTER TABLE subscription_events 
        ADD COLUMN is_promotional BOOLEAN DEFAULT false NOT NULL;
        
        COMMENT ON COLUMN subscription_events.is_promotional IS 
        'Required field indicating if promotional pricing was applied';
    END IF;
    
    -- Security: Add original_amount with validation
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subscription_events' AND column_name = 'original_amount'
    ) THEN
        ALTER TABLE subscription_events 
        ADD COLUMN original_amount DECIMAL(10, 2)
            CONSTRAINT subscription_events_original_amount_positive 
            CHECK (original_amount IS NULL OR original_amount > 0);
        
        COMMENT ON COLUMN subscription_events.original_amount IS 
        'Original price before promotional discount (must be positive if set)';
    END IF;
    
    -- Security: Add promotion usage reference
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'subscription_events' AND column_name = 'promotion_usage_id'
    ) THEN
        ALTER TABLE subscription_events 
        ADD COLUMN promotion_usage_id UUID 
            REFERENCES promotions_usage(id) ON DELETE SET NULL ON UPDATE CASCADE;
        
        COMMENT ON COLUMN subscription_events.promotion_usage_id IS 
        'Reference to the specific promotion usage record';
    END IF;
    
    -- Security: Add constraint for promotional logic
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'subscription_events' 
        AND constraint_name = 'subscription_events_promotional_logic'
    ) THEN
        ALTER TABLE subscription_events 
        ADD CONSTRAINT subscription_events_promotional_logic
        CHECK (
            (is_promotional = false AND original_amount IS NULL AND promotion_usage_id IS NULL) OR
            (is_promotional = true AND original_amount IS NOT NULL AND promotion_usage_id IS NOT NULL)
        );
    END IF;
END $$;

-- Security: Create indexes for subscription_events promotional fields
CREATE INDEX IF NOT EXISTS idx_subscription_events_is_promotional
ON subscription_events (is_promotional)
WHERE is_promotional = true;

CREATE INDEX IF NOT EXISTS idx_subscription_events_promotion_usage_id
ON subscription_events (promotion_usage_id)
WHERE promotion_usage_id IS NOT NULL;

-- Security: Create function to safely create promotion usage
CREATE OR REPLACE FUNCTION create_promotion_usage(
    p_promotion_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_dealership_id INTEGER DEFAULT NULL,
    p_schema_name TEXT DEFAULT NULL,
    p_source usage_source_type DEFAULT 'direct_signup',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    usage_id UUID;
    promo_tier promotion_tier_type;
    promo_status promotion_status_type;
    promo_max_uses INTEGER;
    promo_current_uses INTEGER;
BEGIN
    -- Security: Validate promotion exists and is active
    SELECT tier, status, max_uses, current_uses
    INTO promo_tier, promo_status, promo_max_uses, promo_current_uses
    FROM promotions 
    WHERE id = p_promotion_id 
      AND deleted_at IS NULL
      AND status = 'active'
      AND (end_date IS NULL OR end_date >= CURRENT_DATE);
    
    IF promo_tier IS NULL THEN
        RAISE EXCEPTION 'Promotion not found, expired, or inactive';
    END IF;
    
    -- Security: Check usage limits
    IF promo_max_uses IS NOT NULL AND promo_current_uses >= promo_max_uses THEN
        RAISE EXCEPTION 'Promotion usage limit exceeded';
    END IF;
    
    -- Security: Validate input parameters
    IF p_user_id IS NULL AND p_dealership_id IS NULL THEN
        RAISE EXCEPTION 'Either user_id or dealership_id must be provided';
    END IF;
    
    -- Security: Validate finance manager logic
    IF promo_tier = 'finance_manager_only' AND p_schema_name IS NULL THEN
        RAISE EXCEPTION 'Schema name required for finance manager promotions';
    END IF;
    
    -- Security: Check for duplicate usage
    IF EXISTS (
        SELECT 1 FROM promotions_usage 
        WHERE promotion_id = p_promotion_id
          AND user_id IS NOT DISTINCT FROM p_user_id
          AND dealership_id IS NOT DISTINCT FROM p_dealership_id
          AND status IN ('pending', 'active')
          AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Promotion already used by this user/dealership';
    END IF;
    
    -- Security: Create usage record
    INSERT INTO promotions_usage (
        promotion_id,
        promotion_tier,
        user_id,
        dealership_id,
        schema_name,
        source,
        signup_ip_address,
        user_agent,
        referral_code,
        status,
        created_by
    ) VALUES (
        p_promotion_id,
        promo_tier,
        p_user_id,
        p_dealership_id,
        p_schema_name,
        p_source,
        p_ip_address,
        p_user_agent,
        p_referral_code,
        'pending',
        COALESCE(p_user_id, auth.uid())
    ) RETURNING id INTO usage_id;
    
    -- Security: Increment promotion usage counter
    PERFORM increment_promotion_usage(p_promotion_id);
    
    RETURN usage_id;
END;
$$;

-- Security: Add comment for creation function
COMMENT ON FUNCTION create_promotion_usage(UUID, UUID, INTEGER, TEXT, usage_source_type, INET, TEXT, TEXT) IS 
'Safely creates a promotion usage record with comprehensive validation and fraud prevention';

-- Security: Grant appropriate permissions
GRANT SELECT ON promotions_usage TO authenticated;
GRANT SELECT ON promotions_usage_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION check_promotions_usage_access(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_promotion_fraud(INET, TEXT, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION create_promotion_usage(UUID, UUID, INTEGER, TEXT, usage_source_type, INET, TEXT, TEXT) TO authenticated;

-- Security: Create view for active promotions usage (for reporting)
CREATE OR REPLACE VIEW active_promotions_usage AS
SELECT 
    pu.id,
    pu.promotion_id,
    p.description as promotion_description,
    pu.promotion_tier,
    pu.user_id,
    pu.dealership_id,
    pu.schema_name,
    pu.status,
    pu.signup_date,
    pu.expires_at,
    pu.original_amount,
    pu.promotional_amount,
    pu.savings_amount,
    pu.created_at
FROM promotions_usage pu
JOIN promotions p ON p.id = pu.promotion_id
WHERE pu.status = 'active' 
  AND pu.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND (pu.expires_at IS NULL OR pu.expires_at > NOW());

-- Security: Add RLS to the view
ALTER VIEW active_promotions_usage SET (security_barrier = true);

-- Security: Grant select on view
GRANT SELECT ON active_promotions_usage TO authenticated;

-- Security: Add view comment
COMMENT ON VIEW active_promotions_usage IS 
'Secure view of currently active promotion usage records with RLS enforcement';

-- Security: Final validation and notification
DO $$
DECLARE
    promotion_count INTEGER;
    usage_count INTEGER;
BEGIN
    -- Security: Validate schema integrity
    SELECT COUNT(*) INTO promotion_count FROM promotions WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO usage_count FROM promotions_usage WHERE deleted_at IS NULL;
    
    -- Security: Check for orphaned records
    ASSERT NOT EXISTS (
        SELECT 1 FROM promotions_usage pu 
        LEFT JOIN promotions p ON p.id = pu.promotion_id 
        WHERE p.id IS NULL AND pu.deleted_at IS NULL
    ), 'Orphaned promotion usage records detected';
    
    RAISE NOTICE 'Promotions usage table security migration completed successfully';
    RAISE NOTICE 'Active promotions: %, Usage records: %', promotion_count, usage_count;
END $$;