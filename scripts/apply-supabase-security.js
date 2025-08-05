import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTcxOTc2NSwiZXhwIjoyMDYxMjk1NzY1fQ.f6a3c5_u-P5VOvovj1iYeeNuRgyFgBSy5DWNaJMsd-s';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyRLSPolicies() {
  console.log('=== Applying Enhanced RLS Policies ===\n');
  
  // SQL to create additional security policies
  const securityPolicies = [
    // Enhanced profiles table security
    {
      name: 'profiles_security_check',
      sql: `
        -- Ensure profiles table has RLS enabled
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies to recreate with better security
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        
        -- Create more restrictive policies
        CREATE POLICY "Users can view own profile only"
          ON profiles FOR SELECT
          USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own non-sensitive fields"
          ON profiles FOR UPDATE
          USING (auth.uid() = id)
          WITH CHECK (
            auth.uid() = id AND
            -- Prevent users from changing their own role
            (role = OLD.role OR auth.uid() IN (
              SELECT id FROM profiles WHERE role = 'master_admin'
            ))
          );
      `
    },
    
    // Single finance deals security
    {
      name: 'single_finance_deals_security',
      sql: `
        -- Enable RLS on single_finance_deals
        ALTER TABLE single_finance_deals ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for single finance deals
        CREATE POLICY IF NOT EXISTS "Users can view their own single finance deals"
          ON single_finance_deals FOR SELECT
          USING (
            user_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() 
              AND role IN ('single_finance_manager', 'master_admin')
            )
          );
        
        CREATE POLICY IF NOT EXISTS "Single finance managers can insert deals"
          ON single_finance_deals FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() 
              AND role IN ('single_finance_manager', 'master_admin')
            )
          );
      `
    },
    
    // Audit log table
    {
      name: 'create_audit_log',
      sql: `
        -- Create audit log table if it doesn't exist
        CREATE TABLE IF NOT EXISTS security_audit_log (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          action TEXT NOT NULL,
          table_name TEXT,
          record_id TEXT,
          old_data JSONB,
          new_data JSONB,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Enable RLS on audit log
        ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
        
        -- Only admins can view audit logs
        CREATE POLICY IF NOT EXISTS "Only admins can view audit logs"
          ON security_audit_log FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() 
              AND role IN ('master_admin', 'dealer_group_admin')
            )
          );
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON security_audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON security_audit_log(created_at);
      `
    }
  ];
  
  for (const policy of securityPolicies) {
    try {
      console.log(`Applying ${policy.name}...`);
      const { error } = await supabase.rpc('exec_sql', { 
        sql: policy.sql 
      });
      
      if (error) {
        // Try direct execution as fallback
        console.log(`Note: Direct SQL execution not available. ${policy.name} needs to be applied manually.`);
      } else {
        console.log(`✅ ${policy.name} applied successfully`);
      }
    } catch (err) {
      console.log(`⚠️  ${policy.name} needs to be applied manually via Supabase Dashboard`);
    }
  }
}

async function createSecurityFunctions() {
  console.log('\n=== Creating Security Functions ===\n');
  
  const functions = [
    {
      name: 'log_security_event',
      sql: `
        CREATE OR REPLACE FUNCTION log_security_event(
          p_action TEXT,
          p_table_name TEXT DEFAULT NULL,
          p_record_id TEXT DEFAULT NULL,
          p_old_data JSONB DEFAULT NULL,
          p_new_data JSONB DEFAULT NULL
        )
        RETURNS UUID AS $$
        DECLARE
          v_log_id UUID;
        BEGIN
          INSERT INTO security_audit_log (
            user_id, action, table_name, record_id, 
            old_data, new_data, ip_address
          )
          VALUES (
            auth.uid(), p_action, p_table_name, p_record_id,
            p_old_data, p_new_data, inet_client_addr()
          )
          RETURNING id INTO v_log_id;
          
          RETURN v_log_id;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    },
    
    {
      name: 'check_password_strength',
      sql: `
        CREATE OR REPLACE FUNCTION check_password_strength(password TEXT)
        RETURNS BOOLEAN AS $$
        BEGIN
          -- Check minimum length
          IF LENGTH(password) < 8 THEN
            RETURN FALSE;
          END IF;
          
          -- Check for uppercase letter
          IF password !~ '[A-Z]' THEN
            RETURN FALSE;
          END IF;
          
          -- Check for lowercase letter
          IF password !~ '[a-z]' THEN
            RETURN FALSE;
          END IF;
          
          -- Check for number
          IF password !~ '[0-9]' THEN
            RETURN FALSE;
          END IF;
          
          RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql;
      `
    }
  ];
  
  for (const func of functions) {
    console.log(`Creating function: ${func.name}`);
    console.log(`⚠️  Function needs to be created manually via Supabase SQL Editor`);
  }
}

async function removeTestAccounts() {
  console.log('\n=== Checking for Test Accounts ===\n');
  
  const testEmails = [
    'test@example.com',
    'demo@example.com',
    'testmaster@das.com',
    'testdealergroup@das.com',
    'testdealership@das.com'
  ];
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (!error && users) {
      for (const email of testEmails) {
        const testUser = users.find(u => u.email === email);
        if (testUser) {
          console.log(`Found test account: ${email}`);
          // Note: Not automatically deleting - just reporting
          console.log(`  ⚠️  This account should be removed before production`);
        }
      }
    }
  } catch (err) {
    console.log('Unable to check test accounts - requires admin access');
  }
}

async function generateSecuritySQL() {
  console.log('\n=== Generated SQL for Manual Application ===\n');
  
  const sqlStatements = `
-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE single_finance_deals ENABLE ROW LEVEL SECURITY;

-- 2. Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, action, table_name, record_id,
    old_data, new_data, created_at
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    to_jsonb(OLD),
    to_jsonb(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add audit triggers to sensitive tables
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 4. Create function to check user permissions
CREATE OR REPLACE FUNCTION has_permission(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add additional security constraints
ALTER TABLE profiles 
  ADD CONSTRAINT check_role_values 
  CHECK (role IN ('master_admin', 'dealer_group_admin', 'dealership_admin', 
                  'general_manager', 'sales_manager', 'salesperson', 
                  'finance_manager', 'single_finance_manager', 'viewer'));
`;
  
  console.log('Copy and paste the following SQL into Supabase SQL Editor:');
  console.log('=' . repeat(60));
  console.log(sqlStatements);
  console.log('=' . repeat(60));
}

async function main() {
  console.log('=== Applying Supabase Security Configurations ===\n');
  console.log(`Project: ${SUPABASE_URL}\n`);
  
  await applyRLSPolicies();
  await createSecurityFunctions();
  await removeTestAccounts();
  await generateSecuritySQL();
  
  console.log('\n\n=== Manual Configuration Required ===\n');
  console.log('Please complete the following in Supabase Dashboard:');
  console.log('');
  console.log('1. Authentication Settings (Dashboard > Authentication > Settings):');
  console.log('   - Enable "Confirm email" ');
  console.log('   - Set "Minimum password length" to 8');
  console.log('   - Enable "Require uppercase, lowercase, and numbers"');
  console.log('   - Set session timeout to 24 hours');
  console.log('');
  console.log('2. API Settings (Dashboard > Settings > API):');
  console.log('   - Enable rate limiting');
  console.log('   - Set rate limit to 100 requests per minute');
  console.log('');
  console.log('3. Database Security (Dashboard > SQL Editor):');
  console.log('   - Run the generated SQL statements above');
  console.log('');
  console.log('4. Backup Configuration (Dashboard > Settings > Backups):');
  console.log('   - Enable automated daily backups');
  console.log('   - Enable point-in-time recovery');
  console.log('');
  console.log('5. Monitoring (Dashboard > Settings > Logs):');
  console.log('   - Enable query performance monitoring');
  console.log('   - Set up alerts for failed auth attempts');
}

main().catch(console.error);