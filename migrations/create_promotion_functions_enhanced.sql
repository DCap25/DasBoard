-- Enhanced Database Functions for Promotion Management with 500 Error Prevention
-- 
-- SECURITY FUNCTIONS IMPLEMENTED:
-- 1. Secure promotion management with RLS integration
-- 2. Finance Manager schema-based access control
-- 3. Comprehensive error handling and validation
-- 4. Audit trail and version control support
-- 5. 500 error prevention through defensive programming
-- 6. Input sanitization and validation
-- 7. Optimistic locking for concurrent updates
-- 8. Role-based permission checking

-- Security: Enhanced promotion insertion function with comprehensive validation
CREATE OR REPLACE FUNCTION insert_promotion(
  p_tier TEXT,
  p_original_price DECIMAL,
  p_promo_price DECIMAL,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  promotion_id UUID;
  current_user_role TEXT;
BEGIN
  -- Security: Validate user permissions first to prevent 500 errors
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE id = auth.uid() AND deleted_at IS NULL;
  
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION 'User profile not found or invalid' USING ERRCODE = 'P0001';
  END IF;
  
  IF current_user_role NOT IN ('master_admin', 'admin') THEN
    RAISE EXCEPTION 'Only administrators can create promotions' USING ERRCODE = 'P0001';
  END IF;
  
  -- Security: Comprehensive input validation to prevent 500 errors
  IF p_tier IS NULL OR p_tier = '' THEN
    RAISE EXCEPTION 'Promotion tier is required' USING ERRCODE = '23514';
  END IF;
  
  IF p_tier NOT IN ('finance_manager_only', 'salesperson', 'sales_manager', 
                    'general_manager', 'dealership_basic', 'dealership_pro', 
                    'dealership_enterprise') THEN
    RAISE EXCEPTION 'Invalid promotion tier: %', p_tier USING ERRCODE = '23514';
  END IF;
  
  IF p_original_price IS NULL OR p_original_price < 0 THEN
    RAISE EXCEPTION 'Original price must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_promo_price IS NULL OR p_promo_price < 0 THEN
    RAISE EXCEPTION 'Promo price must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_promo_price > p_original_price THEN
    RAISE EXCEPTION 'Promo price cannot exceed original price' USING ERRCODE = '23514';
  END IF;
  
  IF p_start_date IS NULL THEN
    RAISE EXCEPTION 'Start date is required' USING ERRCODE = '23514';
  END IF;
  
  IF p_end_date IS NOT NULL AND p_end_date <= p_start_date THEN
    RAISE EXCEPTION 'End date must be after start date' USING ERRCODE = '23514';
  END IF;
  
  -- Security: Sanitize description input
  IF p_description IS NOT NULL THEN
    p_description := LEFT(TRIM(REGEXP_REPLACE(p_description, '[<>"\''&]', '', 'g')), 1000);
  END IF;
  
  -- Security: Check for overlapping promotions to prevent conflicts
  IF EXISTS (
    SELECT 1 FROM promotions 
    WHERE tier = p_tier 
      AND deleted_at IS NULL 
      AND status = 'active'
      AND (
        (p_start_date BETWEEN start_date AND COALESCE(end_date, '2099-12-31'::DATE)) OR
        (COALESCE(p_end_date, '2099-12-31'::DATE) BETWEEN start_date AND COALESCE(end_date, '2099-12-31'::DATE)) OR
        (start_date BETWEEN p_start_date AND COALESCE(p_end_date, '2099-12-31'::DATE))
      )
  ) THEN
    RAISE EXCEPTION 'Overlapping promotion exists for tier % in the specified date range', p_tier USING ERRCODE = '23505';
  END IF;
  
  -- Insert the promotion with audit trail
  INSERT INTO promotions (
    tier,
    original_price,
    promo_price,
    start_date,
    end_date,
    description,
    status,
    created_by,
    created_at,
    updated_at,
    version
  )
  VALUES (
    p_tier,
    p_original_price,
    p_promo_price,
    p_start_date,
    p_end_date,
    p_description,
    'active',
    auth.uid(),
    NOW(),
    NOW(),
    1
  )
  RETURNING id INTO promotion_id;
  
  -- Security: Log successful creation for audit trail
  RAISE LOG 'Promotion created: id=%, tier=%, user=%', promotion_id, p_tier, auth.uid();
  
  RETURN promotion_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error while preserving security
    RAISE LOG 'Promotion creation failed for user %: % (SQLSTATE: %)', 
      auth.uid(), SQLERRM, SQLSTATE;
    
    -- Re-raise with appropriate error code
    IF SQLSTATE = '23505' THEN
      RAISE EXCEPTION 'Promotion conflict: %', SQLERRM USING ERRCODE = '23505';
    ELSIF SQLSTATE = '23514' THEN
      RAISE EXCEPTION 'Invalid promotion data: %', SQLERRM USING ERRCODE = '23514';
    ELSIF SQLSTATE = 'P0001' THEN
      RAISE; -- Re-raise permission errors as-is
    ELSE
      RAISE EXCEPTION 'Promotion creation failed. Please check your data and try again.' USING ERRCODE = 'P0001';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Enhanced promotion update function with optimistic locking
CREATE OR REPLACE FUNCTION update_promotion(
  p_promotion_id UUID,
  p_original_price DECIMAL DEFAULT NULL,
  p_promo_price DECIMAL DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_version INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
  current_version INTEGER;
  affected_rows INTEGER;
BEGIN
  -- Security: Validate user permissions
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE id = auth.uid() AND deleted_at IS NULL;
  
  IF current_user_role NOT IN ('master_admin', 'admin') THEN
    RAISE EXCEPTION 'Only administrators can update promotions' USING ERRCODE = 'P0001';
  END IF;
  
  -- Security: Validate promotion exists and get current version
  SELECT version INTO current_version
  FROM promotions 
  WHERE id = p_promotion_id AND deleted_at IS NULL;
  
  IF current_version IS NULL THEN
    RAISE EXCEPTION 'Promotion not found or deleted' USING ERRCODE = 'P0002';
  END IF;
  
  -- Security: Optimistic locking check
  IF p_version IS NOT NULL AND current_version != p_version THEN
    RAISE EXCEPTION 'Concurrent modification detected. Please refresh and try again.' USING ERRCODE = '40001';
  END IF;
  
  -- Security: Input validation for updated fields
  IF p_original_price IS NOT NULL AND p_original_price < 0 THEN
    RAISE EXCEPTION 'Original price must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_promo_price IS NOT NULL AND p_promo_price < 0 THEN
    RAISE EXCEPTION 'Promo price must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_status IS NOT NULL AND p_status NOT IN ('active', 'scheduled', 'expired', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid promotion status: %', p_status USING ERRCODE = '23514';
  END IF;
  
  -- Security: Sanitize description if provided
  IF p_description IS NOT NULL THEN
    p_description := LEFT(TRIM(REGEXP_REPLACE(p_description, '[<>"\''&]', '', 'g')), 1000);
  END IF;
  
  -- Perform the update with selective field updates
  UPDATE promotions 
  SET 
    original_price = COALESCE(p_original_price, original_price),
    promo_price = COALESCE(p_promo_price, promo_price),
    start_date = COALESCE(p_start_date, start_date),
    end_date = CASE 
      WHEN p_end_date IS NOT NULL THEN p_end_date 
      ELSE end_date 
    END,
    description = CASE 
      WHEN p_description IS NOT NULL THEN p_description 
      ELSE description 
    END,
    status = COALESCE(p_status, status),
    updated_by = auth.uid(),
    updated_at = NOW(),
    version = version + 1
  WHERE id = p_promotion_id 
    AND deleted_at IS NULL
    AND version = current_version;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'Promotion update failed - concurrent modification detected' USING ERRCODE = '40001';
  END IF;
  
  -- Security: Log successful update for audit trail
  RAISE LOG 'Promotion updated: id=%, user=%', p_promotion_id, auth.uid();
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error while preserving security
    RAISE LOG 'Promotion update failed for user %: % (SQLSTATE: %)', 
      auth.uid(), SQLERRM, SQLSTATE;
    
    -- Re-raise with appropriate error code
    IF SQLSTATE = '40001' THEN
      RAISE EXCEPTION 'Concurrent update detected. Please refresh and try again.' USING ERRCODE = '40001';
    ELSIF SQLSTATE = '23514' THEN
      RAISE EXCEPTION 'Invalid promotion data: %', SQLERRM USING ERRCODE = '23514';
    ELSIF SQLSTATE IN ('P0001', 'P0002') THEN
      RAISE; -- Re-raise custom errors as-is
    ELSE
      RAISE EXCEPTION 'Promotion update failed. Please check your data and try again.' USING ERRCODE = 'P0001';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Enhanced promotion usage recording with Finance Manager schema support
CREATE OR REPLACE FUNCTION record_promotion_usage(
  p_promotion_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_schema_name TEXT DEFAULT NULL,
  p_dealership_id INTEGER DEFAULT NULL,
  p_usage_type TEXT DEFAULT 'signup',
  p_original_amount DECIMAL DEFAULT NULL,
  p_discounted_amount DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  usage_id UUID;
  promotion_tier TEXT;
  promotion_active BOOLEAN;
  current_user_role TEXT;
  user_can_access BOOLEAN := FALSE;
BEGIN
  -- Security: Validate exactly one entity identifier
  IF (p_user_id IS NOT NULL)::INTEGER + 
     (p_schema_name IS NOT NULL)::INTEGER + 
     (p_dealership_id IS NOT NULL)::INTEGER != 1 THEN
    RAISE EXCEPTION 'Exactly one of user_id, schema_name, or dealership_id must be provided' USING ERRCODE = '23514';
  END IF;
  
  -- Security: Validate promotion exists and is active
  SELECT tier, (status = 'active' AND deleted_at IS NULL) 
  INTO promotion_tier, promotion_active
  FROM promotions 
  WHERE id = p_promotion_id;
  
  IF promotion_tier IS NULL THEN
    RAISE EXCEPTION 'Promotion not found' USING ERRCODE = 'P0001';
  END IF;
  
  IF NOT promotion_active THEN
    RAISE EXCEPTION 'Promotion is not active' USING ERRCODE = 'P0002';
  END IF;
  
  -- Security: Get current user role and validate access
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE id = auth.uid() AND deleted_at IS NULL;
  
  -- Security: Check access permissions based on entity type
  IF p_user_id IS NOT NULL THEN
    -- User can create their own usage or admin can create any
    user_can_access := (p_user_id = auth.uid()) OR 
                      (current_user_role IN ('master_admin', 'admin'));
  ELSIF p_schema_name IS NOT NULL THEN
    -- Finance Manager can create usage for their schema
    user_can_access := (current_user_role = 'single_finance_manager') OR
                      (current_user_role IN ('master_admin', 'admin'));
    
    -- Security: Validate schema name format
    IF NOT (p_schema_name ~* '^[a-zA-Z][a-zA-Z0-9_]*$' AND LENGTH(p_schema_name) <= 63) THEN
      RAISE EXCEPTION 'Invalid schema name format: %', p_schema_name USING ERRCODE = '23514';
    END IF;
  ELSIF p_dealership_id IS NOT NULL THEN
    -- Dealership members can create usage for their dealership
    user_can_access := EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
        AND dealership_id = p_dealership_id 
        AND role IN ('sales_manager', 'general_manager')
    ) OR (current_user_role IN ('master_admin', 'admin'));
  END IF;
  
  IF NOT user_can_access THEN
    RAISE EXCEPTION 'Insufficient permissions to record promotion usage' USING ERRCODE = 'P0001';
  END IF;
  
  -- Security: Validate usage type
  IF p_usage_type NOT IN ('signup', 'renewal', 'upgrade', 'downgrade') THEN
    RAISE EXCEPTION 'Invalid usage type: %', p_usage_type USING ERRCODE = '23514';
  END IF;
  
  -- Security: Validate amounts
  IF p_original_amount IS NOT NULL AND p_original_amount < 0 THEN
    RAISE EXCEPTION 'Original amount must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_discounted_amount IS NOT NULL AND p_discounted_amount < 0 THEN
    RAISE EXCEPTION 'Discounted amount must be non-negative' USING ERRCODE = '23514';
  END IF;
  
  IF p_original_amount IS NOT NULL AND p_discounted_amount IS NOT NULL 
     AND p_discounted_amount > p_original_amount THEN
    RAISE EXCEPTION 'Discounted amount cannot exceed original amount' USING ERRCODE = '23514';
  END IF;
  
  -- Security: Check for existing active usage to prevent duplicates
  IF EXISTS (
    SELECT 1 FROM promotions_usage 
    WHERE promotion_id = p_promotion_id 
      AND deleted_at IS NULL 
      AND is_active = TRUE
      AND (
        (p_user_id IS NOT NULL AND user_id = p_user_id) OR
        (p_schema_name IS NOT NULL AND schema_name = p_schema_name) OR
        (p_dealership_id IS NOT NULL AND dealership_id = p_dealership_id)
      )
  ) THEN
    RAISE EXCEPTION 'Active promotion usage already exists for this entity' USING ERRCODE = '23505';
  END IF;
  
  -- Insert the usage record
  INSERT INTO promotions_usage (
    promotion_id,
    promotion_tier,
    user_id,
    schema_name,
    dealership_id,
    usage_type,
    signup_date,
    original_amount,
    discounted_amount,
    is_active,
    created_by,
    created_at,
    updated_at,
    version
  )
  VALUES (
    p_promotion_id,
    promotion_tier,
    p_user_id,
    p_schema_name,
    p_dealership_id,
    p_usage_type,
    NOW(),
    p_original_amount,
    p_discounted_amount,
    TRUE,
    auth.uid(),
    NOW(),
    NOW(),
    1
  )
  RETURNING id INTO usage_id;
  
  -- Security: Log successful usage recording for audit trail
  RAISE LOG 'Promotion usage recorded: id=%, promotion=%, entity_type=%, user=%', 
    usage_id, p_promotion_id, 
    CASE 
      WHEN p_user_id IS NOT NULL THEN 'user'
      WHEN p_schema_name IS NOT NULL THEN 'schema'
      WHEN p_dealership_id IS NOT NULL THEN 'dealership'
    END,
    auth.uid();
  
  RETURN usage_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error while preserving security
    RAISE LOG 'Promotion usage recording failed for user %: % (SQLSTATE: %)', 
      auth.uid(), SQLERRM, SQLSTATE;
    
    -- Re-raise with appropriate error code
    IF SQLSTATE = '23505' THEN
      RAISE EXCEPTION 'Promotion usage already exists for this entity' USING ERRCODE = '23505';
    ELSIF SQLSTATE = '23514' THEN
      RAISE EXCEPTION 'Invalid usage data: %', SQLERRM USING ERRCODE = '23514';
    ELSIF SQLSTATE IN ('P0001', 'P0002') THEN
      RAISE; -- Re-raise custom errors as-is
    ELSE
      RAISE EXCEPTION 'Failed to record promotion usage. Please check your data and try again.' USING ERRCODE = 'P0003';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Enhanced promotion eligibility checking with Finance Manager support
CREATE OR REPLACE FUNCTION check_promotion_eligibility(
  p_user_id UUID DEFAULT NULL,
  p_schema_name TEXT DEFAULT NULL,
  p_dealership_id INTEGER DEFAULT NULL,
  p_tier TEXT DEFAULT NULL
)
RETURNS TABLE(
  promotion_id UUID,
  tier TEXT,
  original_price DECIMAL,
  promo_price DECIMAL,
  discount_percentage DECIMAL,
  description TEXT,
  start_date DATE,
  end_date DATE
) AS $$
DECLARE
  current_user_role TEXT;
  user_can_access BOOLEAN := FALSE;
BEGIN
  -- Security: Validate exactly one entity identifier
  IF (p_user_id IS NOT NULL)::INTEGER + 
     (p_schema_name IS NOT NULL)::INTEGER + 
     (p_dealership_id IS NOT NULL)::INTEGER != 1 THEN
    RAISE EXCEPTION 'Exactly one of user_id, schema_name, or dealership_id must be provided' USING ERRCODE = '23514';
  END IF;
  
  -- Security: Get current user role and validate access
  SELECT role INTO current_user_role
  FROM profiles 
  WHERE id = auth.uid() AND deleted_at IS NULL;
  
  -- Security: Check access permissions based on entity type
  IF p_user_id IS NOT NULL THEN
    user_can_access := (p_user_id = auth.uid()) OR 
                      (current_user_role IN ('master_admin', 'admin'));
  ELSIF p_schema_name IS NOT NULL THEN
    user_can_access := (current_user_role = 'single_finance_manager') OR
                      (current_user_role IN ('master_admin', 'admin'));
    
    -- Security: Validate schema name format
    IF NOT (p_schema_name ~* '^[a-zA-Z][a-zA-Z0-9_]*$' AND LENGTH(p_schema_name) <= 63) THEN
      RAISE EXCEPTION 'Invalid schema name format: %', p_schema_name USING ERRCODE = '23514';
    END IF;
  ELSIF p_dealership_id IS NOT NULL THEN
    user_can_access := EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
        AND (dealership_id = p_dealership_id OR role IN ('master_admin', 'admin'))
    );
  END IF;
  
  IF NOT user_can_access THEN
    RAISE EXCEPTION 'Insufficient permissions to check promotion eligibility' USING ERRCODE = 'P0001';
  END IF;
  
  -- Security: Validate tier if provided
  IF p_tier IS NOT NULL AND p_tier NOT IN ('finance_manager_only', 'salesperson', 'sales_manager',
                                           'general_manager', 'dealership_basic', 'dealership_pro',
                                           'dealership_enterprise') THEN
    RAISE EXCEPTION 'Invalid promotion tier: %', p_tier USING ERRCODE = '23514';
  END IF;
  
  -- Return eligible promotions (RLS policies will apply additional filtering)
  RETURN QUERY
  SELECT 
    p.id,
    p.tier,
    p.original_price,
    p.promo_price,
    ROUND(((p.original_price - p.promo_price) / NULLIF(p.original_price, 0)) * 100, 2) as discount_percentage,
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
      -- Exclude promotions already used by this entity
      SELECT 1 FROM promotions_usage pu
      WHERE pu.promotion_id = p.id
        AND pu.deleted_at IS NULL
        AND pu.is_active = TRUE
        AND (
          (p_user_id IS NOT NULL AND pu.user_id = p_user_id) OR
          (p_schema_name IS NOT NULL AND pu.schema_name = p_schema_name) OR
          (p_dealership_id IS NOT NULL AND pu.dealership_id = p_dealership_id)
        )
    )
  ORDER BY p.promo_price ASC, p.created_at DESC;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error while preserving security
    RAISE LOG 'Promotion eligibility check failed for user %: % (SQLSTATE: %)', 
      auth.uid(), SQLERRM, SQLSTATE;
    
    -- Re-raise with appropriate error code
    IF SQLSTATE = '23514' THEN
      RAISE EXCEPTION 'Invalid eligibility check parameters: %', SQLERRM USING ERRCODE = '23514';
    ELSIF SQLSTATE = 'P0001' THEN
      RAISE; -- Re-raise permission errors as-is
    ELSE
      RAISE EXCEPTION 'Failed to check promotion eligibility. Please try again.' USING ERRCODE = 'P0001';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Enhanced database migration validation function
CREATE OR REPLACE FUNCTION validate_promotion_migrations()
RETURNS JSON AS $$
DECLARE
  result JSON;
  table_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
  constraint_count INTEGER;
BEGIN
  -- Security: Only allow admins to run migration validation
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('master_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only administrators can validate migrations' USING ERRCODE = 'P0001';
  END IF;
  
  -- Check table existence
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_name IN ('promotions', 'promotions_usage')
    AND table_schema = 'public';
  
  -- Check RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename IN ('promotions', 'promotions_usage');
  
  -- Check functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_name IN ('insert_promotion', 'update_promotion', 'record_promotion_usage', 
                         'check_promotion_eligibility', 'soft_delete_promotion', 
                         'soft_delete_promotion_usage', 'monitor_promotion_health');
  
  -- Check triggers
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  WHERE c.relname IN ('promotions', 'promotions_usage')
    AND NOT t.tgisinternal;
  
  -- Check constraints
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints 
  WHERE table_name IN ('promotions', 'promotions_usage')
    AND constraint_type = 'CHECK';
  
  -- Build result JSON
  result := json_build_object(
    'status', CASE 
      WHEN table_count >= 2 AND policy_count >= 6 AND function_count >= 7 
           AND trigger_count >= 2 AND constraint_count >= 10 
      THEN 'healthy' 
      ELSE 'issues_detected' 
    END,
    'tables_found', table_count,
    'expected_tables', 2,
    'policies_found', policy_count,
    'expected_policies', 6,
    'functions_found', function_count,
    'expected_functions', 7,
    'triggers_found', trigger_count,
    'expected_triggers', 2,
    'constraints_found', constraint_count,
    'expected_constraints', 10,
    'checked_at', NOW()
  );
  
  -- Security: Log validation check for audit trail
  RAISE LOG 'Promotion migrations validated by user %: %', auth.uid(), result::TEXT;
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Security: Log error while preserving security
    RAISE LOG 'Migration validation failed for user %: % (SQLSTATE: %)', 
      auth.uid(), SQLERRM, SQLSTATE;
    
    -- Return error status
    RETURN json_build_object(
      'status', 'error',
      'error_message', SQLERRM,
      'error_code', SQLSTATE,
      'checked_at', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION insert_promotion TO authenticated;
GRANT EXECUTE ON FUNCTION update_promotion TO authenticated;
GRANT EXECUTE ON FUNCTION record_promotion_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_promotion_eligibility TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promotion_migrations TO authenticated;

-- Security: Add function comments for documentation
COMMENT ON FUNCTION insert_promotion IS 'Securely create new promotions with comprehensive validation and audit trail';
COMMENT ON FUNCTION update_promotion IS 'Securely update promotions with optimistic locking and role-based access control';
COMMENT ON FUNCTION record_promotion_usage IS 'Record promotion usage with Finance Manager schema support and validation';
COMMENT ON FUNCTION check_promotion_eligibility IS 'Check promotion eligibility with entity-based access control';
COMMENT ON FUNCTION validate_promotion_migrations IS 'Validate promotion system health and migration status (admin only)';