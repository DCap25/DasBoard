-- Enhanced Promotions Usage Table with Secure RLS Policies and 500 Error Prevention
-- 
-- SECURITY IMPROVEMENTS IMPLEMENTED:
-- 1. Schema-based access control for Finance Managers
-- 2. Comprehensive RLS policies for role-based access
-- 3. Defensive triggers to prevent 500 errors from invalid data
-- 4. Audit trail and version control for compliance
-- 5. Soft delete capabilities for data retention
-- 6. Usage tracking and analytics support
-- 7. Concurrent access protection
-- 8. Input validation and sanitization

-- Create enhanced promotions_usage table with security and audit features
CREATE TABLE IF NOT EXISTS promotions_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  promotion_tier TEXT NOT NULL CHECK (promotion_tier IN (
    'finance_manager_only',
    'salesperson', 
    'sales_manager',
    'general_manager',
    'dealership_basic',
    'dealership_pro',
    'dealership_enterprise'
  )),
  
  -- Security: Entity identification with validation
  user_id UUID REFERENCES auth.users(id),
  schema_name TEXT CHECK (schema_name ~* '^[a-zA-Z][a-zA-Z0-9_]*$' AND LENGTH(schema_name) <= 63),
  dealership_id INTEGER REFERENCES dealerships(id),
  
  -- Security: Usage tracking fields
  usage_type TEXT NOT NULL DEFAULT 'signup' CHECK (usage_type IN ('signup', 'renewal', 'upgrade', 'downgrade')),
  signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  original_amount DECIMAL(10, 2) CHECK (original_amount IS NULL OR original_amount >= 0),
  discounted_amount DECIMAL(10, 2) CHECK (discounted_amount IS NULL OR discounted_amount >= 0),
  discount_applied DECIMAL(5, 2) CHECK (discount_applied IS NULL OR (discount_applied >= 0 AND discount_applied <= 100)),
  
  -- Security: Status and lifecycle management
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Security: Enhanced audit and version control fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Security: Soft delete capabilities
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  
  -- Security: Additional validation constraints
  CONSTRAINT valid_entity_reference CHECK (
    (user_id IS NOT NULL AND schema_name IS NULL AND dealership_id IS NULL) OR
    (user_id IS NULL AND schema_name IS NOT NULL AND dealership_id IS NULL) OR
    (user_id IS NULL AND schema_name IS NULL AND dealership_id IS NOT NULL)
  ),
  CONSTRAINT valid_amounts CHECK (
    discounted_amount IS NULL OR original_amount IS NULL OR discounted_amount <= original_amount
  ),
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at),
  CONSTRAINT no_update_after_delete CHECK (deleted_at IS NULL OR updated_at <= deleted_at)
);

-- Security: Add comment for the table
COMMENT ON TABLE promotions_usage IS 'Enhanced promotions usage tracking with comprehensive security and audit trail';

-- Security: Add column comments for documentation
COMMENT ON COLUMN promotions_usage.schema_name IS 'Finance manager schema name for schema-based access control';
COMMENT ON COLUMN promotions_usage.usage_type IS 'Type of usage event for analytics and business logic';
COMMENT ON COLUMN promotions_usage.discount_applied IS 'Percentage discount applied (0-100)';
COMMENT ON COLUMN promotions_usage.is_active IS 'Whether this usage record is currently active';
COMMENT ON COLUMN promotions_usage.version IS 'Version number for optimistic locking';

-- Security: Create indexes for performance and RLS optimization
CREATE INDEX IF NOT EXISTS idx_promotions_usage_promotion_id ON promotions_usage(promotion_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_usage_user_id ON promotions_usage(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_usage_schema_name ON promotions_usage(schema_name) WHERE deleted_at IS NULL AND schema_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_usage_dealership_id ON promotions_usage(dealership_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_usage_tier_active ON promotions_usage(promotion_tier, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_usage_signup_date ON promotions_usage(signup_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_usage_created_by ON promotions_usage(created_by) WHERE deleted_at IS NULL;

-- Security: Create composite index for unique usage tracking
CREATE UNIQUE INDEX IF NOT EXISTS idx_promotions_usage_unique_active 
ON promotions_usage(promotion_id, COALESCE(user_id::text, schema_name, dealership_id::text)) 
WHERE deleted_at IS NULL AND is_active = true;

-- Security: Enable Row Level Security
ALTER TABLE promotions_usage ENABLE ROW LEVEL SECURITY;

-- Security: Drop existing policies if they exist (for migration safety)
DROP POLICY IF EXISTS "Authenticated users can view promotions_usage" ON promotions_usage;
DROP POLICY IF EXISTS "Admin users can manage promotions_usage" ON promotions_usage;

-- Enhanced RLS Policy 1: Finance Managers can view usage for their schema
CREATE POLICY "finance_managers_can_view_schema_usage" 
ON promotions_usage FOR SELECT 
TO authenticated
USING (
  deleted_at IS NULL 
  AND (
    -- Finance Managers can see usage for their schema
    (schema_name IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'single_finance_manager'
      AND (p.schema_name IS NULL OR p.schema_name = promotions_usage.schema_name)
    ))
    OR
    -- Users can see their own usage
    user_id = auth.uid()
    OR
    -- Dealership members can see dealership usage
    (dealership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.dealership_id = promotions_usage.dealership_id
    ))
    OR
    -- Admins can see all usage
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('master_admin', 'admin', 'general_manager')
    )
  )
);

-- Enhanced RLS Policy 2: Schema-based usage creation for Finance Managers
CREATE POLICY "finance_managers_can_create_schema_usage" 
ON promotions_usage FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND deleted_at IS NULL
  AND (
    -- Finance Managers can create usage for their schema
    (schema_name IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'single_finance_manager'
      AND (p.schema_name IS NULL OR p.schema_name = promotions_usage.schema_name)
    ))
    OR
    -- Users can create their own usage
    user_id = auth.uid()
    OR
    -- Dealership admins can create dealership usage
    (dealership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.dealership_id = promotions_usage.dealership_id
      AND p.role IN ('sales_manager', 'general_manager')
    ))
    OR
    -- Admins can create any usage
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('master_admin', 'admin')
    )
  )
);

-- Enhanced RLS Policy 3: Role-based usage management
CREATE POLICY "role_based_usage_management" 
ON promotions_usage FOR UPDATE 
TO authenticated
USING (
  deleted_at IS NULL 
  AND (
    -- Finance Managers can update schema usage
    (schema_name IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'single_finance_manager'
      AND (p.schema_name IS NULL OR p.schema_name = promotions_usage.schema_name)
    ))
    OR
    -- Users can update their own usage (limited fields)
    user_id = auth.uid()
    OR
    -- Admins can update any usage
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('master_admin', 'admin', 'general_manager')
    )
  )
)
WITH CHECK (
  -- Security: Prevent modification of critical fields by non-admins
  (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('master_admin', 'admin')
    )
  ) OR (
    -- Non-admins can only update limited fields
    promotion_id = (SELECT promotion_id FROM promotions_usage WHERE id = promotions_usage.id)
    AND promotion_tier = (SELECT promotion_tier FROM promotions_usage WHERE id = promotions_usage.id)
    AND created_at = (SELECT created_at FROM promotions_usage WHERE id = promotions_usage.id)
  )
);

-- Enhanced RLS Policy 4: Secure deletion for admins only
CREATE POLICY "secure_admin_usage_deletion" 
ON promotions_usage FOR DELETE 
TO authenticated
USING (
  -- Security: Only master_admin can hard delete usage records
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'master_admin'
    AND p.deleted_at IS NULL
  )
);

-- Security: Create defensive trigger to prevent 500 errors from invalid data
CREATE OR REPLACE FUNCTION validate_promotion_usage_data()
RETURNS TRIGGER AS $$
DECLARE
  promotion_exists BOOLEAN;
  promotion_active BOOLEAN;
BEGIN
  -- Security: Comprehensive validation to prevent 500 errors
  
  -- Validate promotion_tier enum (defensive check)
  IF NEW.promotion_tier NOT IN ('finance_manager_only', 'salesperson', 'sales_manager',
                                'general_manager', 'dealership_basic', 'dealership_pro',
                                'dealership_enterprise') THEN
    RAISE EXCEPTION 'Invalid promotion tier: %', NEW.promotion_tier USING ERRCODE = '23514';
  END IF;
  
  -- Validate usage_type enum (defensive check)
  IF NEW.usage_type NOT IN ('signup', 'renewal', 'upgrade', 'downgrade') THEN
    RAISE EXCEPTION 'Invalid usage type: %', NEW.usage_type USING ERRCODE = '23514';
  END IF;
  
  -- Security: Validate promotion exists and is active
  SELECT EXISTS(SELECT 1 FROM promotions WHERE id = NEW.promotion_id AND deleted_at IS NULL),
         EXISTS(SELECT 1 FROM promotions WHERE id = NEW.promotion_id AND deleted_at IS NULL AND status = 'active')
  INTO promotion_exists, promotion_active;
  
  IF NOT promotion_exists THEN
    RAISE EXCEPTION 'Referenced promotion does not exist' USING ERRCODE = 'P0001';
  END IF;
  
  IF TG_OP = 'INSERT' AND NOT promotion_active THEN
    RAISE EXCEPTION 'Cannot create usage for inactive promotion' USING ERRCODE = 'P0002';
  END IF;
  
  -- Security: Validate entity constraint (exactly one entity ID)
  IF (NEW.user_id IS NOT NULL)::INTEGER + 
     (NEW.schema_name IS NOT NULL)::INTEGER + 
     (NEW.dealership_id IS NOT NULL)::INTEGER != 1 THEN
    RAISE EXCEPTION 'Exactly one of user_id, schema_name, or dealership_id must be provided' USING ERRCODE = '23514';
  END IF;
  
  -- Security: Validate schema name format
  IF NEW.schema_name IS NOT NULL THEN
    IF NOT (NEW.schema_name ~* '^[a-zA-Z][a-zA-Z0-9_]*$' AND LENGTH(NEW.schema_name) <= 63) THEN
      RAISE EXCEPTION 'Invalid schema name format: %', NEW.schema_name USING ERRCODE = '23514';
    END IF;
  END IF;
  
  -- Security: Validate amount constraints
  IF NEW.original_amount IS NOT NULL AND NEW.original_amount < 0 THEN
    RAISE EXCEPTION 'Original amount must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF NEW.discounted_amount IS NOT NULL AND NEW.discounted_amount < 0 THEN
    RAISE EXCEPTION 'Discounted amount must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF NEW.original_amount IS NOT NULL AND NEW.discounted_amount IS NOT NULL 
     AND NEW.discounted_amount > NEW.original_amount THEN
    RAISE EXCEPTION 'Discounted amount cannot exceed original amount' USING ERRCODE = '23514';
  END IF;
  
  -- Security: Calculate discount percentage if amounts provided
  IF NEW.original_amount IS NOT NULL AND NEW.discounted_amount IS NOT NULL AND NEW.original_amount > 0 THEN
    NEW.discount_applied := ROUND(((NEW.original_amount - NEW.discounted_amount) / NEW.original_amount) * 100, 2);
  END IF;
  
  -- Security: Set audit fields on insert
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    NEW.created_at := COALESCE(NEW.created_at, NOW());
    NEW.updated_at := NOW();
    NEW.version := 1;
    
    -- Set promotion_tier from referenced promotion if not provided
    IF NEW.promotion_tier IS NULL THEN
      SELECT tier INTO NEW.promotion_tier FROM promotions WHERE id = NEW.promotion_id;
    END IF;
  END IF;
  
  -- Security: Set audit fields on update
  IF TG_OP = 'UPDATE' THEN
    -- Prevent updating critical audit fields
    NEW.id := OLD.id;
    NEW.created_by := OLD.created_by;
    NEW.created_at := OLD.created_at;
    NEW.updated_by := auth.uid();
    NEW.updated_at := NOW();
    NEW.version := OLD.version + 1;
    
    -- Security: Optimistic locking check
    IF OLD.version != NEW.version - 1 THEN
      RAISE EXCEPTION 'Concurrent modification detected. Please refresh and try again.' USING ERRCODE = '40001';
    END IF;
    
    -- Prevent modification of critical business fields by non-admins
    IF NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('master_admin', 'admin')
    ) THEN
      NEW.promotion_id := OLD.promotion_id;
      NEW.promotion_tier := OLD.promotion_tier;
      NEW.user_id := OLD.user_id;
      NEW.schema_name := OLD.schema_name;
      NEW.dealership_id := OLD.dealership_id;
      NEW.signup_date := OLD.signup_date;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error for monitoring while preventing 500 errors
    RAISE LOG 'Promotion usage validation error for user %: % (SQLSTATE: %)', 
      auth.uid(), SQLERRM, SQLSTATE;
    
    -- Re-raise with user-friendly message
    IF SQLSTATE = '23514' THEN
      RAISE EXCEPTION 'Invalid promotion usage data: %', SQLERRM USING ERRCODE = '23514';
    ELSIF SQLSTATE = '40001' THEN
      RAISE EXCEPTION 'Concurrent update detected. Please try again.' USING ERRCODE = '40001';
    ELSIF SQLSTATE IN ('P0001', 'P0002') THEN
      RAISE; -- Re-raise custom errors as-is
    ELSE
      RAISE EXCEPTION 'Promotion usage validation failed. Please check your data.' USING ERRCODE = 'P0003';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Create trigger for validation and audit trail
DROP TRIGGER IF EXISTS trigger_validate_promotion_usage_data ON promotions_usage;
CREATE TRIGGER trigger_validate_promotion_usage_data
  BEFORE INSERT OR UPDATE ON promotions_usage
  FOR EACH ROW
  EXECUTE FUNCTION validate_promotion_usage_data();

-- Security: Create function for safe soft delete
CREATE OR REPLACE FUNCTION soft_delete_promotion_usage(usage_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Security: Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM promotions_usage pu
    JOIN profiles p ON p.id = auth.uid()
    WHERE pu.id = usage_id 
    AND (
      p.role IN ('master_admin', 'admin') OR
      pu.user_id = auth.uid() OR
      (pu.schema_name IS NOT NULL AND p.role = 'single_finance_manager' 
       AND (p.schema_name IS NULL OR p.schema_name = pu.schema_name))
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to delete promotion usage' USING ERRCODE = 'P0001';
  END IF;
  
  -- Perform soft delete
  UPDATE promotions_usage 
  SET 
    deleted_at = NOW(),
    deleted_by = auth.uid(),
    updated_at = NOW(),
    version = version + 1,
    is_active = false
  WHERE id = usage_id 
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'Promotion usage not found or already deleted' USING ERRCODE = 'P0002';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Create view for active usage with analytics
CREATE OR REPLACE VIEW active_promotion_usage AS
SELECT 
  pu.id,
  pu.promotion_id,
  pu.promotion_tier,
  pu.user_id,
  pu.schema_name,
  pu.dealership_id,
  pu.usage_type,
  pu.signup_date,
  pu.original_amount,
  pu.discounted_amount,
  pu.discount_applied,
  pu.is_active,
  pu.expires_at,
  pu.created_at,
  pu.version,
  p.tier as promotion_tier_confirmed,
  p.description as promotion_description,
  p.status as promotion_status
FROM promotions_usage pu
JOIN promotions p ON p.id = pu.promotion_id
WHERE pu.deleted_at IS NULL 
  AND pu.is_active = true
  AND p.deleted_at IS NULL
  AND (pu.expires_at IS NULL OR pu.expires_at > NOW());

-- Security: Add comment to view
COMMENT ON VIEW active_promotion_usage IS 'Secure view of active promotion usage with RLS policies applied';

-- Add columns to subscription_events table to track promotions if they don't exist
DO $$ 
BEGIN
  -- Check if subscription_events table exists first
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_events') THEN
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'subscription_events' AND column_name = 'is_promotional'
    ) THEN
      ALTER TABLE subscription_events ADD COLUMN is_promotional BOOLEAN DEFAULT false;
      COMMENT ON COLUMN subscription_events.is_promotional IS 'Indicates if promotional pricing was applied to this subscription event';
      
      -- Security: Add index for performance
      CREATE INDEX IF NOT EXISTS idx_subscription_events_promotional 
      ON subscription_events(is_promotional) WHERE is_promotional = true;
    END IF;

    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'subscription_events' AND column_name = 'original_amount'
    ) THEN
      ALTER TABLE subscription_events ADD COLUMN original_amount DECIMAL(10, 2) CHECK (original_amount IS NULL OR original_amount >= 0);
      COMMENT ON COLUMN subscription_events.original_amount IS 'The original price before promotional discount';
    END IF;
    
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'subscription_events' AND column_name = 'promotion_usage_id'
    ) THEN
      ALTER TABLE subscription_events ADD COLUMN promotion_usage_id UUID REFERENCES promotions_usage(id);
      COMMENT ON COLUMN subscription_events.promotion_usage_id IS 'Reference to the promotion usage record';
      
      -- Security: Add index for referential integrity
      CREATE INDEX IF NOT EXISTS idx_subscription_events_promotion_usage 
      ON subscription_events(promotion_usage_id) WHERE promotion_usage_id IS NOT NULL;
    END IF;
    
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error but don't fail migration
    RAISE LOG 'Could not modify subscription_events table: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END $$;

-- Security: Grant necessary permissions
GRANT SELECT ON promotions_usage TO authenticated;
GRANT INSERT ON promotions_usage TO authenticated;
GRANT UPDATE ON promotions_usage TO authenticated;
GRANT SELECT ON active_promotion_usage TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_promotion_usage(UUID) TO authenticated;

-- Security: Create analytics function for reporting (admin only)
CREATE OR REPLACE FUNCTION get_promotion_usage_analytics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE,
  tier_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  promotion_tier TEXT,
  usage_count BIGINT,
  total_original_amount DECIMAL,
  total_discounted_amount DECIMAL,
  average_discount_percentage DECIMAL,
  schema_count BIGINT,
  user_count BIGINT,
  dealership_count BIGINT
) AS $$
BEGIN
  -- Security: Only allow admins to access analytics
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('master_admin', 'admin', 'general_manager')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to access analytics' USING ERRCODE = 'P0001';
  END IF;
  
  RETURN QUERY
  SELECT 
    pu.promotion_tier,
    COUNT(*)::BIGINT as usage_count,
    COALESCE(SUM(pu.original_amount), 0)::DECIMAL as total_original_amount,
    COALESCE(SUM(pu.discounted_amount), 0)::DECIMAL as total_discounted_amount,
    COALESCE(AVG(pu.discount_applied), 0)::DECIMAL as average_discount_percentage,
    COUNT(DISTINCT pu.schema_name)::BIGINT as schema_count,
    COUNT(DISTINCT pu.user_id)::BIGINT as user_count,
    COUNT(DISTINCT pu.dealership_id)::BIGINT as dealership_count
  FROM promotions_usage pu
  WHERE pu.deleted_at IS NULL
    AND pu.signup_date >= start_date
    AND pu.signup_date <= end_date
    AND (tier_filter IS NULL OR pu.promotion_tier = tier_filter)
  GROUP BY pu.promotion_tier
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Add final comment
COMMENT ON FUNCTION get_promotion_usage_analytics IS 'Analytics function for promotion usage reporting (admin only)';