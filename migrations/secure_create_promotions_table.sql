-- ================================================================
-- SECURE PROMOTIONS TABLE MIGRATION
-- ================================================================
-- Security Features:
-- 1. Input validation constraints
-- 2. Row Level Security (RLS) policies  
-- 3. Audit logging
-- 4. Transaction safety with rollback
-- 5. Data integrity checks
-- 6. Parameterized function for safe inserts
-- ================================================================

-- Start transaction for atomic operations
BEGIN;

-- Create extension if not exists (required for UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for tier types to prevent injection
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_tier_type') THEN
    CREATE TYPE promotion_tier_type AS ENUM (
      'finance_manager_only',
      'salesperson',
      'sales_manager', 
      'general_manager',
      'dealership_basic',
      'dealership_pro',
      'dealership_enterprise'
    );
  END IF;
END $$;

-- Create enum for promotion status
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'promotion_status') THEN
    CREATE TYPE promotion_status AS ENUM ('active', 'scheduled', 'expired', 'cancelled');
  END IF;
END $$;

-- Drop existing table if migration needs to be re-run (development only)
-- Comment out in production to prevent data loss
-- DROP TABLE IF EXISTS promotions CASCADE;

-- Create promotions table with enhanced security constraints
CREATE TABLE IF NOT EXISTS promotions (
  -- Primary key with UUID for security (no sequential IDs)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Use enum for tier to prevent SQL injection
  tier promotion_tier_type NOT NULL,
  
  -- Financial constraints with validation
  original_price DECIMAL(10, 2) NOT NULL 
    CONSTRAINT chk_original_price_positive CHECK (original_price >= 0),
  promo_price DECIMAL(10, 2) NOT NULL
    CONSTRAINT chk_promo_price_positive CHECK (promo_price >= 0),
  
  -- Ensure promo price is less than or equal to original
  CONSTRAINT chk_promo_price_valid CHECK (promo_price <= original_price),
  
  -- Date constraints with validation
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  CONSTRAINT chk_date_range CHECK (
    end_date IS NULL OR end_date >= start_date
  ),
  
  -- Status tracking
  status promotion_status NOT NULL DEFAULT 'scheduled',
  
  -- Description with length limit to prevent overflow
  description TEXT
    CONSTRAINT chk_description_length CHECK (
      description IS NULL OR length(description) <= 1000
    ),
  
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
  
  -- Prevent duplicate active promotions for same tier
  CONSTRAINT uq_active_promotion_per_tier EXCLUDE USING gist (
    tier WITH =,
    daterange(start_date, COALESCE(end_date, 'infinity'::date)) WITH &&
  ) WHERE (deleted_at IS NULL AND status = 'active')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotions_tier ON promotions(tier) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON promotions(created_by);

-- Add table comment
COMMENT ON TABLE promotions IS 'Secure table tracking promotional pricing with audit trail and data integrity';

-- Add column comments for documentation
COMMENT ON COLUMN promotions.id IS 'Unique identifier using UUID v4 for security';
COMMENT ON COLUMN promotions.tier IS 'Subscription tier enum to prevent injection';
COMMENT ON COLUMN promotions.original_price IS 'Original price before promotion (must be >= 0)';
COMMENT ON COLUMN promotions.promo_price IS 'Promotional price (must be >= 0 and <= original_price)';
COMMENT ON COLUMN promotions.start_date IS 'Promotion start date';
COMMENT ON COLUMN promotions.end_date IS 'Promotion end date (NULL for open-ended)';
COMMENT ON COLUMN promotions.status IS 'Current status of the promotion';
COMMENT ON COLUMN promotions.description IS 'Human-readable description (max 1000 chars)';
COMMENT ON COLUMN promotions.version IS 'Version number for optimistic locking';

-- Create audit table for tracking changes
CREATE TABLE IF NOT EXISTS promotions_audit (
  audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_by UUID NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  old_values JSONB,
  new_values JSONB
);

CREATE INDEX IF NOT EXISTS idx_promotions_audit_promotion_id ON promotions_audit(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotions_audit_changed_at ON promotions_audit(changed_at);

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_promotions_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO promotions_audit (promotion_id, operation, changed_by, new_values)
    VALUES (NEW.id, TG_OP, NEW.created_by, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if actual changes were made
    IF OLD IS DISTINCT FROM NEW THEN
      INSERT INTO promotions_audit (promotion_id, operation, changed_by, old_values, new_values)
      VALUES (NEW.id, TG_OP, NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO promotions_audit (promotion_id, operation, changed_by, old_values)
    VALUES (OLD.id, TG_OP, auth.uid(), to_jsonb(OLD));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS trg_audit_promotions ON promotions;
CREATE TRIGGER trg_audit_promotions
AFTER INSERT OR UPDATE OR DELETE ON promotions
FOR EACH ROW EXECUTE FUNCTION audit_promotions_changes();

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trg_update_promotions_updated_at ON promotions;
CREATE TRIGGER trg_update_promotions_updated_at
BEFORE UPDATE ON promotions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger function to automatically update promotion status
CREATE OR REPLACE FUNCTION update_promotion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Set status based on dates
  IF NEW.start_date > CURRENT_DATE THEN
    NEW.status = 'scheduled';
  ELSIF NEW.end_date IS NOT NULL AND NEW.end_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  ELSIF NEW.status != 'cancelled' THEN
    NEW.status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto status update
DROP TRIGGER IF EXISTS trg_update_promotion_status ON promotions;
CREATE TRIGGER trg_update_promotion_status
BEFORE INSERT OR UPDATE OF start_date, end_date ON promotions
FOR EACH ROW EXECUTE FUNCTION update_promotion_status();

-- Enable Row Level Security
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view active promotions" ON promotions;
DROP POLICY IF EXISTS "Admin users can manage promotions" ON promotions;
DROP POLICY IF EXISTS "System can update promotion status" ON promotions;

-- RLS Policy: All authenticated users can view non-deleted promotions
CREATE POLICY "Authenticated users can view active promotions" 
ON promotions FOR SELECT 
TO authenticated
USING (deleted_at IS NULL);

-- RLS Policy: Only master admins can insert promotions
CREATE POLICY "Master admins can create promotions" 
ON promotions FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin') 
    AND id = auth.uid()
  )
);

-- RLS Policy: Only master admins can update promotions
CREATE POLICY "Master admins can update promotions" 
ON promotions FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
);

-- RLS Policy: Only master admins can soft delete promotions
CREATE POLICY "Master admins can delete promotions" 
ON promotions FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
);

-- RLS Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON promotions_audit FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE role IN ('master_admin', 'admin')
    AND id = auth.uid()
  )
);

-- Create secure function for inserting promotions (prevents SQL injection)
CREATE OR REPLACE FUNCTION insert_promotion(
  p_tier promotion_tier_type,
  p_original_price DECIMAL(10, 2),
  p_promo_price DECIMAL(10, 2),
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promotion_id UUID;
  v_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_user_id 
    AND role IN ('master_admin', 'admin')
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create promotions'
      USING ERRCODE = 'P0001';
  END IF;
  
  -- Validate inputs
  IF p_original_price < 0 THEN
    RAISE EXCEPTION 'Original price must be non-negative'
      USING ERRCODE = '23514';
  END IF;
  
  IF p_promo_price < 0 OR p_promo_price > p_original_price THEN
    RAISE EXCEPTION 'Promo price must be between 0 and original price'
      USING ERRCODE = '23514';
  END IF;
  
  IF p_end_date IS NOT NULL AND p_end_date < p_start_date THEN
    RAISE EXCEPTION 'End date must be after start date'
      USING ERRCODE = '23514';
  END IF;
  
  IF p_description IS NOT NULL AND length(p_description) > 1000 THEN
    RAISE EXCEPTION 'Description must be 1000 characters or less'
      USING ERRCODE = '22001';
  END IF;
  
  -- Insert the promotion
  INSERT INTO promotions (
    tier,
    original_price,
    promo_price,
    start_date,
    end_date,
    description,
    created_by
  ) VALUES (
    p_tier,
    p_original_price,
    p_promo_price,
    p_start_date,
    p_end_date,
    p_description,
    v_user_id
  ) RETURNING id INTO v_promotion_id;
  
  RETURN v_promotion_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating promotion: %', SQLERRM;
    RAISE;
END;
$$;

-- Create secure function for updating promotions
CREATE OR REPLACE FUNCTION update_promotion(
  p_promotion_id UUID,
  p_original_price DECIMAL(10, 2) DEFAULT NULL,
  p_promo_price DECIMAL(10, 2) DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status promotion_status DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_current_version INTEGER;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_user_id 
    AND role IN ('master_admin', 'admin')
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update promotions'
      USING ERRCODE = 'P0001';
  END IF;
  
  -- Get current version for optimistic locking
  SELECT version INTO v_current_version
  FROM promotions
  WHERE id = p_promotion_id
  AND deleted_at IS NULL;
  
  IF v_current_version IS NULL THEN
    RAISE EXCEPTION 'Promotion not found or deleted'
      USING ERRCODE = 'P0002';
  END IF;
  
  -- Update only provided fields
  UPDATE promotions
  SET
    original_price = COALESCE(p_original_price, original_price),
    promo_price = COALESCE(p_promo_price, promo_price),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    description = CASE 
      WHEN p_description IS NOT NULL THEN p_description 
      ELSE description 
    END,
    status = COALESCE(p_status, status),
    updated_by = v_user_id,
    updated_at = NOW(),
    version = version + 1
  WHERE id = p_promotion_id
  AND version = v_current_version
  AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Concurrent update detected. Please retry.'
      USING ERRCODE = '40001';
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error updating promotion: %', SQLERRM;
    RAISE;
END;
$$;

-- Create secure function for soft deleting promotions
CREATE OR REPLACE FUNCTION delete_promotion(p_promotion_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Check if user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = v_user_id 
    AND role IN ('master_admin', 'admin')
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete promotions'
      USING ERRCODE = 'P0001';
  END IF;
  
  -- Soft delete the promotion
  UPDATE promotions
  SET
    deleted_at = NOW(),
    deleted_by = v_user_id,
    status = 'cancelled'
  WHERE id = p_promotion_id
  AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Promotion not found or already deleted'
      USING ERRCODE = 'P0002';
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error deleting promotion: %', SQLERRM;
    RAISE;
END;
$$;

-- Create view for active promotions (simplified secure access)
CREATE OR REPLACE VIEW active_promotions AS
SELECT 
  id,
  tier,
  original_price,
  promo_price,
  ROUND(((original_price - promo_price) / NULLIF(original_price, 0) * 100), 2) AS discount_percentage,
  start_date,
  end_date,
  description,
  status
FROM promotions
WHERE deleted_at IS NULL
AND status = 'active'
AND start_date <= CURRENT_DATE
AND (end_date IS NULL OR end_date >= CURRENT_DATE);

-- Grant appropriate permissions
GRANT SELECT ON active_promotions TO authenticated;
GRANT SELECT ON promotions TO authenticated;
GRANT ALL ON promotions TO authenticated; -- RLS will handle actual access control
GRANT ALL ON promotions_audit TO authenticated; -- RLS will handle actual access control

-- Add promotion tracking to signup_requests table if needed
DO $$ 
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'signup_requests'
  ) THEN
    -- Add promo_applied column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'signup_requests' 
      AND column_name = 'promo_applied'
    ) THEN
      ALTER TABLE signup_requests 
      ADD COLUMN promo_applied BOOLEAN DEFAULT false,
      ADD COLUMN promo_id UUID REFERENCES promotions(id),
      ADD COLUMN promo_discount DECIMAL(10, 2);
      
      COMMENT ON COLUMN signup_requests.promo_applied IS 'Indicates if promotional pricing was applied';
      COMMENT ON COLUMN signup_requests.promo_id IS 'Reference to the applied promotion';
      COMMENT ON COLUMN signup_requests.promo_discount IS 'Amount discounted from original price';
    END IF;
  END IF;
END $$;

-- Create scheduled job to update promotion statuses daily
CREATE OR REPLACE FUNCTION update_expired_promotions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update expired promotions
  UPDATE promotions
  SET status = 'expired'
  WHERE status = 'active'
  AND end_date IS NOT NULL
  AND end_date < CURRENT_DATE
  AND deleted_at IS NULL;
  
  -- Update scheduled promotions that should now be active
  UPDATE promotions
  SET status = 'active'
  WHERE status = 'scheduled'
  AND start_date <= CURRENT_DATE
  AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  AND deleted_at IS NULL;
END;
$$;

-- Insert sample promotion with secure function (commented out for production)
-- SELECT insert_promotion(
--   'finance_manager_only'::promotion_tier_type, 
--   5.00, 
--   0.00, 
--   '2025-01-01'::DATE, 
--   NULL, 
--   'Finance Manager Only - Free for a limited time'
-- );

-- Commit the transaction
COMMIT;

-- Create rollback savepoint for error recovery
-- In case of errors, you can run: ROLLBACK TO SAVEPOINT before_promotions;
-- SAVEPOINT before_promotions;

-- Verification queries (run these to verify the migration)
DO $$
BEGIN
  -- Verify table was created
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions') THEN
    RAISE EXCEPTION 'Promotions table was not created successfully';
  END IF;
  
  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'promotions' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'Row Level Security is not enabled on promotions table';
  END IF;
  
  RAISE NOTICE 'Promotions table migration completed successfully';
END $$;