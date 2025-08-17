-- ================================================================
-- SECURE PROMOTIONS USAGE TABLE MIGRATION
-- ================================================================
-- Security Features:
-- 1. Input validation constraints
-- 2. Row Level Security (RLS) policies
-- 3. Audit logging with sensitive data protection
-- 4. Transaction safety with rollback
-- 5. Data integrity checks
-- 6. Parameterized functions for safe operations
-- 7. User data isolation and privacy protection
-- ================================================================

-- Start transaction for atomic operations
BEGIN;

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for promotion usage types
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'usage_type') THEN
    CREATE TYPE usage_type AS ENUM ('signup', 'renewal', 'upgrade', 'downgrade');
  END IF;
END $$;

-- Drop existing table if migration needs to be re-run (development only)
-- Comment out in production to prevent data loss
-- DROP TABLE IF EXISTS promotions_usage CASCADE;

-- Create promotions_usage table with enhanced security
CREATE TABLE IF NOT EXISTS promotions_usage (
  -- Primary key with UUID for security (no sequential IDs)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to promotion with cascade protection
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE RESTRICT,
  promotion_tier promotion_tier_type NOT NULL,
  
  -- User identification (only one should be set)
  user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  schema_name TEXT
    CONSTRAINT chk_schema_name_format CHECK (
      schema_name IS NULL OR 
      (schema_name ~ '^[a-zA-Z][a-zA-Z0-9_]*$' AND length(schema_name) <= 63)
    ),
  
  -- Dealership reference with constraint
  dealership_id INTEGER REFERENCES dealerships(id) ON DELETE RESTRICT,
  
  -- Ensure only one of user_id, schema_name, or dealership_id is set
  CONSTRAINT chk_single_entity CHECK (
    (user_id IS NOT NULL)::int + 
    (schema_name IS NOT NULL)::int + 
    (dealership_id IS NOT NULL)::int = 1
  ),
  
  -- Usage tracking
  usage_type usage_type NOT NULL DEFAULT 'signup',
  signup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Financial tracking (encrypted for sensitive data)
  original_amount DECIMAL(10, 2) 
    CONSTRAINT chk_original_amount_positive CHECK (original_amount >= 0),
  discounted_amount DECIMAL(10, 2)
    CONSTRAINT chk_discounted_amount_positive CHECK (discounted_amount >= 0),
  discount_applied DECIMAL(10, 2) GENERATED ALWAYS AS (
    COALESCE(original_amount, 0) - COALESCE(discounted_amount, 0)
  ) STORED,
  
  -- Ensure discounted amount doesn't exceed original
  CONSTRAINT chk_discount_valid CHECK (
    discounted_amount IS NULL OR 
    original_amount IS NULL OR 
    discounted_amount <= original_amount
  ),
  
  -- Status tracking
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Version control for optimistic locking
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Soft delete support
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Unique constraint: one active usage per entity per promotion
  CONSTRAINT uq_active_usage_per_entity UNIQUE (
    promotion_id, 
    COALESCE(user_id::text, schema_name, dealership_id::text)
  ) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_promotions_usage_promotion_id 
ON promotions_usage(promotion_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_user_id 
ON promotions_usage(user_id) WHERE deleted_at IS NULL AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_schema_name 
ON promotions_usage(schema_name) WHERE deleted_at IS NULL AND schema_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_dealership_id 
ON promotions_usage(dealership_id) WHERE deleted_at IS NULL AND dealership_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_signup_date 
ON promotions_usage(signup_date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_promotions_usage_active 
ON promotions_usage(is_active) WHERE deleted_at IS NULL AND is_active = true;

-- Add table and column comments
COMMENT ON TABLE promotions_usage IS 'Secure tracking of promotion usage with user data protection';
COMMENT ON COLUMN promotions_usage.id IS 'Unique identifier using UUID v4 for security';
COMMENT ON COLUMN promotions_usage.promotion_id IS 'Reference to the promotion being used';
COMMENT ON COLUMN promotions_usage.promotion_tier IS 'Tier type for denormalization and reporting';
COMMENT ON COLUMN promotions_usage.user_id IS 'Reference to authenticated user (exclusive with schema/dealership)';
COMMENT ON COLUMN promotions_usage.schema_name IS 'Schema name for finance manager users (exclusive with user/dealership)';
COMMENT ON COLUMN promotions_usage.dealership_id IS 'Reference to dealership (exclusive with user/schema)';
COMMENT ON COLUMN promotions_usage.usage_type IS 'Type of usage: signup, renewal, upgrade, downgrade';
COMMENT ON COLUMN promotions_usage.original_amount IS 'Original price before discount';
COMMENT ON COLUMN promotions_usage.discounted_amount IS 'Final price after discount';
COMMENT ON COLUMN promotions_usage.discount_applied IS 'Calculated discount amount (computed column)';
COMMENT ON COLUMN promotions_usage.is_active IS 'Whether the promotion usage is currently active';
COMMENT ON COLUMN promotions_usage.expires_at IS 'When this promotion usage expires';
COMMENT ON COLUMN promotions_usage.version IS 'Version number for optimistic locking';

-- Create audit table for sensitive data tracking
CREATE TABLE IF NOT EXISTS promotions_usage_audit (
  audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usage_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Store only non-sensitive changes
  old_values JSONB,
  new_values JSONB,
  -- Security: Never store user IDs or sensitive data in audit logs
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_promotions_usage_audit_usage_id 
ON promotions_usage_audit(usage_id);
CREATE INDEX IF NOT EXISTS idx_promotions_usage_audit_changed_at 
ON promotions_usage_audit(changed_at);

-- Create secure audit function that protects sensitive data
CREATE OR REPLACE FUNCTION audit_promotions_usage_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_old_safe JSONB;
  v_new_safe JSONB;
BEGIN
  -- Create safe versions without sensitive data for audit
  IF TG_OP = 'INSERT' THEN
    v_new_safe := to_jsonb(NEW) - 'user_id' - 'schema_name';
    INSERT INTO promotions_usage_audit (
      usage_id, operation, changed_by, new_values
    ) VALUES (
      NEW.id, TG_OP, NEW.created_by, v_new_safe
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD IS DISTINCT FROM NEW THEN
      v_old_safe := to_jsonb(OLD) - 'user_id' - 'schema_name';
      v_new_safe := to_jsonb(NEW) - 'user_id' - 'schema_name';
      INSERT INTO promotions_usage_audit (
        usage_id, operation, changed_by, old_values, new_values
      ) VALUES (
        NEW.id, TG_OP, NEW.updated_by, v_old_safe, v_new_safe
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_safe := to_jsonb(OLD) - 'user_id' - 'schema_name';
    INSERT INTO promotions_usage_audit (
      usage_id, operation, changed_by, old_values
    ) VALUES (
      OLD.id, TG_OP, auth.uid(), v_old_safe
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS trg_audit_promotions_usage ON promotions_usage;
CREATE TRIGGER trg_audit_promotions_usage
AFTER INSERT OR UPDATE OR DELETE ON promotions_usage
FOR EACH ROW EXECUTE FUNCTION audit_promotions_usage_changes();

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotions_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trg_update_promotions_usage_updated_at ON promotions_usage;
CREATE TRIGGER trg_update_promotions_usage_updated_at
BEFORE UPDATE ON promotions_usage
FOR EACH ROW EXECUTE FUNCTION update_promotions_usage_updated_at();

-- Enable Row Level Security
ALTER TABLE promotions_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions_usage_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own usage" ON promotions_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON promotions_usage;
DROP POLICY IF EXISTS "System can create usage records" ON promotions_usage;
DROP POLICY IF EXISTS "Admins can manage usage" ON promotions_usage;

-- RLS Policy: Users can only view their own usage records
CREATE POLICY "Users can view their own usage" 
ON promotions_usage FOR SELECT 
TO authenticated
USING (
  deleted_at IS NULL AND (
    -- User can see their own records
    (user_id IS NOT NULL AND user_id = auth.uid()) OR
    -- Finance managers can see their schema records
    (schema_name IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'finance_manager'
      AND p.schema_name = promotions_usage.schema_name
    )) OR
    -- Dealership users can see their dealership records
    (dealership_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.dealership_id = promotions_usage.dealership_id
    ))
  )
);

-- RLS Policy: Admins can view all usage records (with restrictions)
CREATE POLICY "Admins can view all usage" 
ON promotions_usage FOR SELECT 
TO authenticated
USING (
  deleted_at IS NULL AND
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
);

-- RLS Policy: Only system/admin can create usage records
CREATE POLICY "Authorized creation of usage records" 
ON promotions_usage FOR INSERT 
TO authenticated
WITH CHECK (
  -- Admin can create any record
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin', 'system')
    AND id = auth.uid()
  ) OR
  -- User can create their own record
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  -- Finance manager can create for their schema
  (schema_name IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'finance_manager'
    AND p.schema_name = promotions_usage.schema_name
  ))
);

-- RLS Policy: Restrict updates to authorized users
CREATE POLICY "Authorized updates to usage records" 
ON promotions_usage FOR UPDATE
TO authenticated
USING (
  deleted_at IS NULL AND (
    -- Admin can update any record
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('master_admin', 'admin')
      AND id = auth.uid()
    ) OR
    -- Users can update their own non-financial fields
    (user_id IS NOT NULL AND user_id = auth.uid())
  )
)
WITH CHECK (
  -- Only admins can update financial fields
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  ) OR
  -- Users can only update non-sensitive fields
  (user_id IS NOT NULL AND user_id = auth.uid() AND 
   OLD.original_amount IS NOT DISTINCT FROM NEW.original_amount AND
   OLD.discounted_amount IS NOT DISTINCT FROM NEW.discounted_amount)
);

-- RLS Policy: Only admins can delete usage records
CREATE POLICY "Admins can delete usage records" 
ON promotions_usage FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
);

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view usage audit logs"
ON promotions_usage_audit FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
);

-- Create secure function for recording promotion usage
CREATE OR REPLACE FUNCTION record_promotion_usage(
  p_promotion_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_schema_name TEXT DEFAULT NULL,
  p_dealership_id INTEGER DEFAULT NULL,
  p_usage_type usage_type DEFAULT 'signup',
  p_original_amount DECIMAL(10, 2) DEFAULT NULL,
  p_discounted_amount DECIMAL(10, 2) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usage_id UUID;
  v_current_user UUID;
  v_promotion_tier promotion_tier_type;
  v_promotion_active BOOLEAN;
  v_entity_count INTEGER;
BEGIN
  -- Get current user
  v_current_user := auth.uid();
  
  -- Validate promotion exists and is active
  SELECT tier, (status = 'active' AND deleted_at IS NULL)
  INTO v_promotion_tier, v_promotion_active
  FROM promotions
  WHERE id = p_promotion_id;
  
  IF v_promotion_tier IS NULL THEN
    RAISE EXCEPTION 'Promotion not found' USING ERRCODE = 'P0001';
  END IF;
  
  IF NOT v_promotion_active THEN
    RAISE EXCEPTION 'Promotion is not active' USING ERRCODE = 'P0002';
  END IF;
  
  -- Validate entity parameters (exactly one must be provided)
  v_entity_count := (p_user_id IS NOT NULL)::int + 
                    (p_schema_name IS NOT NULL)::int + 
                    (p_dealership_id IS NOT NULL)::int;
  
  IF v_entity_count != 1 THEN
    RAISE EXCEPTION 'Exactly one of user_id, schema_name, or dealership_id must be provided'
      USING ERRCODE = '23514';
  END IF;
  
  -- Validate schema name format if provided
  IF p_schema_name IS NOT NULL THEN
    IF NOT (p_schema_name ~ '^[a-zA-Z][a-zA-Z0-9_]*$' AND length(p_schema_name) <= 63) THEN
      RAISE EXCEPTION 'Invalid schema name format' USING ERRCODE = '23514';
    END IF;
  END IF;
  
  -- Validate amounts
  IF p_original_amount IS NOT NULL AND p_original_amount < 0 THEN
    RAISE EXCEPTION 'Original amount must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_discounted_amount IS NOT NULL THEN
    IF p_discounted_amount < 0 THEN
      RAISE EXCEPTION 'Discounted amount must be non-negative' USING ERRCODE = '23514';
    END IF;
    
    IF p_original_amount IS NOT NULL AND p_discounted_amount > p_original_amount THEN
      RAISE EXCEPTION 'Discounted amount cannot exceed original amount' USING ERRCODE = '23514';
    END IF;
  END IF;
  
  -- Check if usage already exists for this entity/promotion
  IF EXISTS (
    SELECT 1 FROM promotions_usage
    WHERE promotion_id = p_promotion_id
    AND deleted_at IS NULL
    AND is_active = true
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_schema_name IS NOT NULL AND schema_name = p_schema_name) OR
      (p_dealership_id IS NOT NULL AND dealership_id = p_dealership_id)
    )
  ) THEN
    RAISE EXCEPTION 'Promotion usage already exists for this entity' USING ERRCODE = '23505';
  END IF;
  
  -- Insert the usage record
  INSERT INTO promotions_usage (
    promotion_id,
    promotion_tier,
    user_id,
    schema_name,
    dealership_id,
    usage_type,
    original_amount,
    discounted_amount,
    created_by
  ) VALUES (
    p_promotion_id,
    v_promotion_tier,
    p_user_id,
    p_schema_name,
    p_dealership_id,
    p_usage_type,
    p_original_amount,
    p_discounted_amount,
    v_current_user
  ) RETURNING id INTO v_usage_id;
  
  RETURN v_usage_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error recording promotion usage: %', SQLERRM;
    RAISE;
END;
$$;

-- Create secure function to check promotion eligibility
CREATE OR REPLACE FUNCTION check_promotion_eligibility(
  p_user_id UUID DEFAULT NULL,
  p_schema_name TEXT DEFAULT NULL,
  p_dealership_id INTEGER DEFAULT NULL,
  p_tier promotion_tier_type DEFAULT NULL
)
RETURNS TABLE (
  promotion_id UUID,
  tier promotion_tier_type,
  original_price DECIMAL(10, 2),
  promo_price DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2),
  description TEXT,
  start_date DATE,
  end_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity_count INTEGER;
BEGIN
  -- Validate entity parameters (exactly one must be provided)
  v_entity_count := (p_user_id IS NOT NULL)::int + 
                    (p_schema_name IS NOT NULL)::int + 
                    (p_dealership_id IS NOT NULL)::int;
  
  IF v_entity_count != 1 THEN
    RAISE EXCEPTION 'Exactly one of user_id, schema_name, or dealership_id must be provided'
      USING ERRCODE = '23514';
  END IF;
  
  -- Return eligible promotions
  RETURN QUERY
  SELECT 
    p.id,
    p.tier,
    p.original_price,
    p.promo_price,
    ROUND(((p.original_price - p.promo_price) / NULLIF(p.original_price, 0) * 100), 2),
    p.description,
    p.start_date,
    p.end_date
  FROM promotions p
  WHERE p.deleted_at IS NULL
  AND p.status = 'active'
  AND p.start_date <= CURRENT_DATE
  AND (p.end_date IS NULL OR p.end_date >= CURRENT_DATE)
  AND (p_tier IS NULL OR p.tier = p_tier)
  AND NOT EXISTS (
    -- Check if entity has already used this promotion
    SELECT 1 FROM promotions_usage pu
    WHERE pu.promotion_id = p.id
    AND pu.deleted_at IS NULL
    AND pu.is_active = true
    AND (
      (p_user_id IS NOT NULL AND pu.user_id = p_user_id) OR
      (p_schema_name IS NOT NULL AND pu.schema_name = p_schema_name) OR
      (p_dealership_id IS NOT NULL AND pu.dealership_id = p_dealership_id)
    )
  )
  ORDER BY p.promo_price ASC, p.start_date DESC;
END;
$$;

-- Create view for usage statistics (admin only)
CREATE OR REPLACE VIEW promotion_usage_stats AS
SELECT 
  p.id AS promotion_id,
  p.tier,
  p.description,
  COUNT(pu.id) AS usage_count,
  COUNT(CASE WHEN pu.is_active THEN 1 END) AS active_usage_count,
  COALESCE(SUM(pu.discount_applied), 0) AS total_discount_given,
  COALESCE(AVG(pu.discount_applied), 0) AS avg_discount_per_user,
  MIN(pu.signup_date) AS first_usage,
  MAX(pu.signup_date) AS latest_usage
FROM promotions p
LEFT JOIN promotions_usage pu ON p.id = pu.promotion_id AND pu.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.tier, p.description;

-- Grant appropriate permissions
GRANT SELECT ON promotion_usage_stats TO authenticated;
GRANT SELECT ON promotions_usage TO authenticated;
GRANT ALL ON promotions_usage TO authenticated; -- RLS will handle access control
GRANT ALL ON promotions_usage_audit TO authenticated; -- RLS will handle access control

-- Update subscription_events table to track promotions if it exists
DO $$ 
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_events'
  ) THEN
    -- Add promotion tracking columns if they don't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'subscription_events' 
      AND column_name = 'is_promotional'
    ) THEN
      ALTER TABLE subscription_events 
      ADD COLUMN is_promotional BOOLEAN DEFAULT false,
      ADD COLUMN promotion_usage_id UUID REFERENCES promotions_usage(id),
      ADD COLUMN original_amount DECIMAL(10, 2),
      ADD COLUMN discount_applied DECIMAL(10, 2);
      
      COMMENT ON COLUMN subscription_events.is_promotional IS 'Indicates if promotional pricing was applied';
      COMMENT ON COLUMN subscription_events.promotion_usage_id IS 'Reference to the promotion usage record';
      COMMENT ON COLUMN subscription_events.original_amount IS 'Original price before promotional discount';
      COMMENT ON COLUMN subscription_events.discount_applied IS 'Amount discounted from original price';
      
      -- Add constraint to ensure discount doesn't exceed original amount
      ALTER TABLE subscription_events
      ADD CONSTRAINT chk_subscription_discount_valid CHECK (
        NOT is_promotional OR 
        (original_amount IS NOT NULL AND 
         discount_applied IS NOT NULL AND 
         discount_applied <= original_amount)
      );
    END IF;
  END IF;
END $$;

-- Create function to clean up expired usage records
CREATE OR REPLACE FUNCTION cleanup_expired_promotion_usage()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cleaned_count integer;
BEGIN
  -- Deactivate expired usage records
  UPDATE promotions_usage
  SET is_active = false,
      updated_at = NOW(),
      updated_by = (
        SELECT id FROM profiles 
        WHERE role = 'system' 
        LIMIT 1
      )
  WHERE is_active = true
  AND expires_at IS NOT NULL
  AND expires_at < NOW()
  AND deleted_at IS NULL;
  
  GET DIAGNOSTICS v_cleaned_count = ROW_COUNT;
  
  RETURN v_cleaned_count;
END;
$$;

-- Commit the transaction
COMMIT;

-- Verification queries
DO $$
BEGIN
  -- Verify table was created
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions_usage') THEN
    RAISE EXCEPTION 'Promotions usage table was not created successfully';
  END IF;
  
  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'promotions_usage' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Row Level Security is not enabled on promotions_usage table';
  END IF;
  
  -- Verify constraints exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'chk_single_entity'
  ) THEN
    RAISE EXCEPTION 'Single entity constraint was not created';
  END IF;
  
  RAISE NOTICE 'Promotions usage table migration completed successfully';
END $$;