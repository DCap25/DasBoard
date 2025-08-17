-- ================================================================
-- MIGRATION ROLLBACK PROCEDURES
-- ================================================================
-- Provides safe rollback procedures for promotion table migrations
-- with data preservation and error recovery capabilities
-- ================================================================

-- Create rollback functions for promotions table migration
CREATE OR REPLACE FUNCTION rollback_promotions_table_migration(
  p_preserve_data BOOLEAN DEFAULT true,
  p_force_rollback BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB := '{}'::jsonb;
  v_table_exists BOOLEAN;
  v_data_count INTEGER := 0;
  v_audit_count INTEGER := 0;
  v_error_details TEXT;
BEGIN
  -- Check if user has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform rollbacks'
      USING ERRCODE = 'P0001';
  END IF;
  
  -- Start rollback process
  v_result := v_result || jsonb_build_object('status', 'starting');
  v_result := v_result || jsonb_build_object('timestamp', NOW());
  v_result := v_result || jsonb_build_object('performed_by', auth.uid());
  
  -- Check if promotions table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'promotions'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    v_result := v_result || jsonb_build_object(
      'status', 'completed',
      'message', 'Promotions table does not exist - nothing to rollback'
    );
    RETURN v_result;
  END IF;
  
  -- Count existing data
  SELECT COUNT(*) INTO v_data_count FROM promotions WHERE deleted_at IS NULL;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions_audit') THEN
    SELECT COUNT(*) INTO v_audit_count FROM promotions_audit;
  END IF;
  
  v_result := v_result || jsonb_build_object('data_count', v_data_count);
  v_result := v_result || jsonb_build_object('audit_count', v_audit_count);
  
  -- Check if data exists and preserve_data is true
  IF v_data_count > 0 AND p_preserve_data AND NOT p_force_rollback THEN
    -- Create backup before rollback
    RAISE NOTICE 'Creating backup of promotions data before rollback';
    
    CREATE TABLE IF NOT EXISTS promotions_backup_% AS 
    SELECT *, NOW() as backup_created_at 
    FROM promotions;
    
    v_result := v_result || jsonb_build_object(
      'backup_created', true,
      'backup_table', 'promotions_backup_' || EXTRACT(EPOCH FROM NOW())::text
    );
  END IF;
  
  -- Begin rollback transaction
  BEGIN
    -- Drop triggers first to prevent issues
    DROP TRIGGER IF EXISTS trg_audit_promotions ON promotions;
    DROP TRIGGER IF EXISTS trg_update_promotions_updated_at ON promotions;
    DROP TRIGGER IF EXISTS trg_update_promotion_status ON promotions;
    
    -- Drop functions
    DROP FUNCTION IF EXISTS update_promotion_status() CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS audit_promotions_changes() CASCADE;
    DROP FUNCTION IF EXISTS insert_promotion(promotion_tier_type, DECIMAL, DECIMAL, DATE, DATE, TEXT) CASCADE;
    DROP FUNCTION IF EXISTS update_promotion(UUID, DECIMAL, DECIMAL, DATE, DATE, TEXT, promotion_status) CASCADE;
    DROP FUNCTION IF EXISTS delete_promotion(UUID) CASCADE;
    DROP FUNCTION IF EXISTS update_expired_promotions() CASCADE;
    
    -- Drop views
    DROP VIEW IF EXISTS active_promotions CASCADE;
    
    -- Drop audit table
    DROP TABLE IF EXISTS promotions_audit CASCADE;
    
    -- Drop main table
    DROP TABLE IF EXISTS promotions CASCADE;
    
    -- Drop types
    DROP TYPE IF EXISTS promotion_status CASCADE;
    DROP TYPE IF EXISTS promotion_tier_type CASCADE;
    
    -- Remove columns from signup_requests if they exist
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'signup_requests' 
      AND column_name = 'promo_applied'
    ) THEN
      ALTER TABLE signup_requests 
      DROP COLUMN IF EXISTS promo_applied,
      DROP COLUMN IF EXISTS promo_id,
      DROP COLUMN IF EXISTS promo_discount;
    END IF;
    
    v_result := v_result || jsonb_build_object(
      'status', 'completed',
      'message', 'Promotions table migration rolled back successfully'
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      v_error_details := SQLERRM;
      v_result := v_result || jsonb_build_object(
        'status', 'error',
        'error_code', SQLSTATE,
        'error_message', v_error_details
      );
      RAISE;
  END;
  
  RETURN v_result;
END;
$$;

-- Create rollback function for promotions_usage table
CREATE OR REPLACE FUNCTION rollback_promotions_usage_table_migration(
  p_preserve_data BOOLEAN DEFAULT true,
  p_force_rollback BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB := '{}'::jsonb;
  v_table_exists BOOLEAN;
  v_data_count INTEGER := 0;
  v_audit_count INTEGER := 0;
  v_error_details TEXT;
BEGIN
  -- Check if user has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform rollbacks'
      USING ERRCODE = 'P0001';
  END IF;
  
  -- Start rollback process
  v_result := v_result || jsonb_build_object('status', 'starting');
  v_result := v_result || jsonb_build_object('timestamp', NOW());
  v_result := v_result || jsonb_build_object('performed_by', auth.uid());
  
  -- Check if promotions_usage table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'promotions_usage'
  ) INTO v_table_exists;
  
  IF NOT v_table_exists THEN
    v_result := v_result || jsonb_build_object(
      'status', 'completed',
      'message', 'Promotions usage table does not exist - nothing to rollback'
    );
    RETURN v_result;
  END IF;
  
  -- Count existing data
  SELECT COUNT(*) INTO v_data_count FROM promotions_usage WHERE deleted_at IS NULL;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotions_usage_audit') THEN
    SELECT COUNT(*) INTO v_audit_count FROM promotions_usage_audit;
  END IF;
  
  v_result := v_result || jsonb_build_object('data_count', v_data_count);
  v_result := v_result || jsonb_build_object('audit_count', v_audit_count);
  
  -- Create backup if needed
  IF v_data_count > 0 AND p_preserve_data AND NOT p_force_rollback THEN
    RAISE NOTICE 'Creating backup of promotions_usage data before rollback';
    
    EXECUTE format('CREATE TABLE promotions_usage_backup_%s AS SELECT *, NOW() as backup_created_at FROM promotions_usage', 
                   EXTRACT(EPOCH FROM NOW())::text);
    
    v_result := v_result || jsonb_build_object(
      'backup_created', true,
      'backup_table', 'promotions_usage_backup_' || EXTRACT(EPOCH FROM NOW())::text
    );
  END IF;
  
  -- Begin rollback transaction
  BEGIN
    -- Drop triggers first
    DROP TRIGGER IF EXISTS trg_audit_promotions_usage ON promotions_usage;
    DROP TRIGGER IF EXISTS trg_update_promotions_usage_updated_at ON promotions_usage;
    
    -- Drop functions
    DROP FUNCTION IF EXISTS update_promotions_usage_updated_at() CASCADE;
    DROP FUNCTION IF EXISTS audit_promotions_usage_changes() CASCADE;
    DROP FUNCTION IF EXISTS record_promotion_usage(UUID, UUID, TEXT, INTEGER, usage_type, DECIMAL, DECIMAL) CASCADE;
    DROP FUNCTION IF EXISTS check_promotion_eligibility(UUID, TEXT, INTEGER, promotion_tier_type) CASCADE;
    DROP FUNCTION IF EXISTS cleanup_expired_promotion_usage() CASCADE;
    
    -- Drop views
    DROP VIEW IF EXISTS promotion_usage_stats CASCADE;
    
    -- Drop audit table
    DROP TABLE IF EXISTS promotions_usage_audit CASCADE;
    
    -- Drop main table
    DROP TABLE IF EXISTS promotions_usage CASCADE;
    
    -- Drop types
    DROP TYPE IF EXISTS usage_type CASCADE;
    
    -- Remove columns from subscription_events if they exist
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'subscription_events' 
      AND column_name = 'is_promotional'
    ) THEN
      ALTER TABLE subscription_events 
      DROP COLUMN IF EXISTS is_promotional,
      DROP COLUMN IF EXISTS promotion_usage_id,
      DROP COLUMN IF EXISTS original_amount,
      DROP COLUMN IF EXISTS discount_applied;
    END IF;
    
    v_result := v_result || jsonb_build_object(
      'status', 'completed',
      'message', 'Promotions usage table migration rolled back successfully'
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      v_error_details := SQLERRM;
      v_result := v_result || jsonb_build_object(
        'status', 'error',
        'error_code', SQLSTATE,
        'error_message', v_error_details
      );
      RAISE;
  END;
  
  RETURN v_result;
END;
$$;

-- Create comprehensive rollback function for both tables
CREATE OR REPLACE FUNCTION rollback_all_promotion_migrations(
  p_preserve_data BOOLEAN DEFAULT true,
  p_force_rollback BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB := '{}'::jsonb;
  v_usage_result JSONB;
  v_promotions_result JSONB;
BEGIN
  -- Check if user has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform rollbacks'
      USING ERRCODE = 'P0001';
  END IF;
  
  v_result := v_result || jsonb_build_object('operation', 'full_rollback');
  v_result := v_result || jsonb_build_object('started_at', NOW());
  
  -- Rollback promotions_usage table first (due to foreign key dependencies)
  BEGIN
    v_usage_result := rollback_promotions_usage_table_migration(p_preserve_data, p_force_rollback);
    v_result := v_result || jsonb_build_object('usage_table_rollback', v_usage_result);
  EXCEPTION
    WHEN OTHERS THEN
      v_result := v_result || jsonb_build_object('usage_table_error', SQLERRM);
  END;
  
  -- Rollback promotions table
  BEGIN
    v_promotions_result := rollback_promotions_table_migration(p_preserve_data, p_force_rollback);
    v_result := v_result || jsonb_build_object('promotions_table_rollback', v_promotions_result);
  EXCEPTION
    WHEN OTHERS THEN
      v_result := v_result || jsonb_build_object('promotions_table_error', SQLERRM);
  END;
  
  v_result := v_result || jsonb_build_object('completed_at', NOW());
  
  RETURN v_result;
END;
$$;

-- Create migration validation function
CREATE OR REPLACE FUNCTION validate_promotion_migrations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB := '{}'::jsonb;
  v_tables_exist JSONB := '{}'::jsonb;
  v_constraints_exist JSONB := '{}'::jsonb;
  v_rls_enabled JSONB := '{}'::jsonb;
  v_functions_exist JSONB := '{}'::jsonb;
BEGIN
  -- Check if tables exist
  v_tables_exist := v_tables_exist || jsonb_build_object(
    'promotions', EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'promotions'
    )
  );
  
  v_tables_exist := v_tables_exist || jsonb_build_object(
    'promotions_usage', EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'promotions_usage'
    )
  );
  
  v_tables_exist := v_tables_exist || jsonb_build_object(
    'promotions_audit', EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'promotions_audit'
    )
  );
  
  v_tables_exist := v_tables_exist || jsonb_build_object(
    'promotions_usage_audit', EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'promotions_usage_audit'
    )
  );
  
  -- Check if key constraints exist
  v_constraints_exist := v_constraints_exist || jsonb_build_object(
    'chk_original_price_positive', EXISTS (
      SELECT 1 FROM information_schema.check_constraints 
      WHERE constraint_name = 'chk_original_price_positive'
    )
  );
  
  v_constraints_exist := v_constraints_exist || jsonb_build_object(
    'chk_single_entity', EXISTS (
      SELECT 1 FROM information_schema.check_constraints 
      WHERE constraint_name = 'chk_single_entity'
    )
  );
  
  -- Check if RLS is enabled
  v_rls_enabled := v_rls_enabled || jsonb_build_object(
    'promotions', EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'promotions' AND rowsecurity = true
    )
  );
  
  v_rls_enabled := v_rls_enabled || jsonb_build_object(
    'promotions_usage', EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'promotions_usage' AND rowsecurity = true
    )
  );
  
  -- Check if key functions exist
  v_functions_exist := v_functions_exist || jsonb_build_object(
    'insert_promotion', EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'insert_promotion'
    )
  );
  
  v_functions_exist := v_functions_exist || jsonb_build_object(
    'record_promotion_usage', EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'record_promotion_usage'
    )
  );
  
  -- Compile results
  v_result := v_result || jsonb_build_object('tables_exist', v_tables_exist);
  v_result := v_result || jsonb_build_object('constraints_exist', v_constraints_exist);
  v_result := v_result || jsonb_build_object('rls_enabled', v_rls_enabled);
  v_result := v_result || jsonb_build_object('functions_exist', v_functions_exist);
  v_result := v_result || jsonb_build_object('validated_at', NOW());
  
  RETURN v_result;
END;
$$;

-- Create migration error recovery function
CREATE OR REPLACE FUNCTION recover_from_migration_error(
  p_error_type TEXT,
  p_recovery_action TEXT DEFAULT 'auto'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB := '{}'::jsonb;
  v_recovery_steps TEXT[];
BEGIN
  -- Check admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('master_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can perform error recovery'
      USING ERRCODE = 'P0001';
  END IF;
  
  v_result := v_result || jsonb_build_object('error_type', p_error_type);
  v_result := v_result || jsonb_build_object('recovery_action', p_recovery_action);
  v_result := v_result || jsonb_build_object('started_at', NOW());
  
  CASE p_error_type
    WHEN 'constraint_violation' THEN
      v_recovery_steps := ARRAY[
        'Check data integrity constraints',
        'Fix constraint violations',
        'Re-run migration'
      ];
      
    WHEN 'rls_policy_error' THEN
      v_recovery_steps := ARRAY[
        'Disable RLS temporarily',
        'Fix policy definitions',
        'Re-enable RLS with corrected policies'
      ];
      
    WHEN 'function_creation_error' THEN
      v_recovery_steps := ARRAY[
        'Drop incomplete functions',
        'Check for syntax errors',
        'Re-create functions with corrections'
      ];
      
    WHEN 'table_creation_error' THEN
      v_recovery_steps := ARRAY[
        'Drop incomplete tables',
        'Check for dependency issues',
        'Re-run table creation'
      ];
      
    ELSE
      v_recovery_steps := ARRAY[
        'Perform full rollback',
        'Review error logs',
        'Fix underlying issues',
        'Re-run migration'
      ];
  END CASE;
  
  v_result := v_result || jsonb_build_object('recovery_steps', v_recovery_steps);
  
  -- Auto-recovery for specific errors
  IF p_recovery_action = 'auto' THEN
    CASE p_error_type
      WHEN 'rls_policy_error' THEN
        -- Disable and re-enable RLS
        BEGIN
          ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
          ALTER TABLE promotions_usage DISABLE ROW LEVEL SECURITY;
          
          -- Re-enable with basic policies
          ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE promotions_usage ENABLE ROW LEVEL SECURITY;
          
          v_result := v_result || jsonb_build_object('auto_recovery', 'completed');
        EXCEPTION
          WHEN OTHERS THEN
            v_result := v_result || jsonb_build_object('auto_recovery', 'failed');
            v_result := v_result || jsonb_build_object('auto_recovery_error', SQLERRM);
        END;
        
      ELSE
        v_result := v_result || jsonb_build_object('auto_recovery', 'not_available');
    END CASE;
  END IF;
  
  v_result := v_result || jsonb_build_object('completed_at', NOW());
  
  RETURN v_result;
END;
$$;

-- Grant permissions on rollback functions to admins only
REVOKE ALL ON FUNCTION rollback_promotions_table_migration(BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION rollback_promotions_usage_table_migration(BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION rollback_all_promotion_migrations(BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION validate_promotion_migrations() FROM PUBLIC;
REVOKE ALL ON FUNCTION recover_from_migration_error(TEXT, TEXT) FROM PUBLIC;

-- Only allow authenticated users to execute (RLS will handle admin check)
GRANT EXECUTE ON FUNCTION rollback_promotions_table_migration(BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_promotions_usage_table_migration(BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_all_promotion_migrations(BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promotion_migrations() TO authenticated;
GRANT EXECUTE ON FUNCTION recover_from_migration_error(TEXT, TEXT) TO authenticated;