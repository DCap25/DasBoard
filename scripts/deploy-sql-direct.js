#!/usr/bin/env node

/**
 * Direct SQL deployment script
 * Applies security migrations directly to Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Deploying security SQL migrations directly...\n');

// Read environment variables
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env');
  process.exit(1);
}

// Function to execute SQL via Supabase REST API
async function executeSql(sql, description) {
  try {
    console.log(`📝 Executing: ${description}`);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`   ❌ Failed: ${error}`);
      return false;
    }

    console.log(`   ✅ Success: ${description}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Alternative approach: Use direct SQL execution
async function deployViaSqlStatements() {
  console.log('🗄️ Deploying via direct SQL execution...\n');

  const migrations = [
    // Create rate_limits table
    {
      name: 'Create rate_limits table',
      sql: `
        CREATE TABLE IF NOT EXISTS public.rate_limits (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            window_start TIMESTAMP WITH TIME ZONE NOT NULL,
            attempts INTEGER DEFAULT 0,
            blocked_until TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
        CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked_until ON public.rate_limits(blocked_until);
      `
    },
    
    // Enable RLS on profiles
    {
      name: 'Enable RLS on profiles table',
      sql: `
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
        
        -- Create new policies
        CREATE POLICY "Users can view their own profile" ON public.profiles
            FOR SELECT TO authenticated
            USING (auth.uid() = id);
            
        CREATE POLICY "Users can update their own profile" ON public.profiles
            FOR UPDATE TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
            
        CREATE POLICY "Service role can manage all profiles" ON public.profiles
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true);
      `
    },
    
    // Enable RLS on rate_limits
    {
      name: 'Enable RLS on rate_limits table',
      sql: `
        ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true);
      `
    },
    
    // Create security audit log
    {
      name: 'Create security audit log',
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
        CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
        
        ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_log;
        
        CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log
            FOR INSERT TO service_role
            WITH CHECK (true);
      `
    }
  ];

  let success = 0;
  let failed = 0;

  for (const migration of migrations) {
    const result = await executeSql(migration.sql, migration.name);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Migration Summary:`);
  console.log(`✅ Successful: ${success}/${migrations.length}`);
  console.log(`❌ Failed: ${failed}/${migrations.length}`);

  if (failed === 0) {
    console.log('\n🎉 All security migrations deployed successfully!');
    console.log('\n📋 Manual steps required:');
    console.log('1. Deploy Edge Functions manually in Supabase dashboard');
    console.log('2. Upload the rate-limiter function from supabase/functions/rate-limiter/');
    console.log('3. Test the security features in your application');
    
    return true;
  } else {
    console.log('\n⚠️ Some migrations failed. Please check the errors above.');
    return false;
  }
}

// Run the deployment
deployViaSqlStatements()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });