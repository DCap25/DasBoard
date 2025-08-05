#!/usr/bin/env node

/**
 * Deploy security features via Supabase client
 * Uses the existing Supabase client to deploy security features
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Deploying security features via Supabase client...\n');

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

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function deploySecurityFeatures() {
  console.log('🗄️ Creating security tables and policies...\n');

  const steps = [
    {
      name: 'Create rate_limits table',
      action: async () => {
        const { error } = await supabase.rpc('exec_sql', {
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
        });
        return !error;
      }
    },
    
    {
      name: 'Enable RLS on rate_limits table',
      action: async () => {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Service role can manage rate limits" ON public.rate_limits
                FOR ALL TO service_role
                USING (true)
                WITH CHECK (true);
          `
        });
        return !error;
      }
    },
    
    {
      name: 'Create security audit log table',
      action: async () => {
        const { error } = await supabase.rpc('exec_sql', {
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
          `
        });
        return !error;
      }
    },
    
    {
      name: 'Enable RLS on security audit log',
      action: async () => {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY IF NOT EXISTS "Service role can insert audit logs" ON public.security_audit_log
                FOR INSERT TO service_role
                WITH CHECK (true);
          `
        });
        return !error;
      }
    },
    
    {
      name: 'Test database connection',
      action: async () => {
        const { data, error } = await supabase
          .from('rate_limits')
          .select('count(*)')
          .limit(1);
        return !error;
      }
    }
  ];

  let success = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      console.log(`📝 ${step.name}...`);
      const result = await step.action();
      
      if (result) {
        console.log(`   ✅ Success`);
        success++;
      } else {
        console.log(`   ❌ Failed`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Deployment Summary:`);
  console.log(`✅ Successful: ${success}/${steps.length}`);
  console.log(`❌ Failed: ${failed}/${steps.length}`);

  if (failed === 0) {
    console.log('\n🎉 Security features deployed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Deploy Edge Functions via Supabase dashboard');
    console.log('2. Upload rate-limiter function from supabase/functions/rate-limiter/');
    console.log('3. Test rate limiting and RLS policies');
    console.log('4. Monitor security audit logs');
    
    return true;
  } else {
    console.log('\n⚠️ Some deployments failed. Check the errors above.');
    return false;
  }
}

// Alternative: Simple table creation without RPC
async function deployViaDDL() {
  console.log('🗄️ Attempting deployment via direct DDL...\n');
  
  try {
    // Test basic connection first
    console.log('📝 Testing database connection...');
    const { data, error: testError } = await supabase.auth.getUser();
    if (testError && !testError.message.includes('Invalid JWT')) {
      console.log('   ❌ Connection failed:', testError.message);
      return false;
    }
    console.log('   ✅ Connection successful');
    
    // Try to create a simple test
    console.log('📝 Creating rate_limits table via DDL...');
    
    // Since we can't execute arbitrary SQL, let's provide manual instructions
    console.log('\n📋 Manual deployment required:');
    console.log('\n1. Open Supabase Dashboard: https://app.supabase.com/project/iugjtokydvbcvmrpeziv');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the following SQL scripts:');
    
    const migrationFiles = [
      'supabase/migrations/20250205_rate_limiting.sql',
      'supabase/migrations/20250205_enable_rls.sql'
    ];
    
    migrationFiles.forEach((file, index) => {
      const fullPath = path.join(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        console.log(`\n${index + 1}. Content from ${file}:`);
        console.log('   Copy and paste this SQL into Supabase SQL Editor:');
        console.log('   ' + '='.repeat(50));
        
        const content = fs.readFileSync(fullPath, 'utf8');
        console.log(content.split('\n').map(line => '   ' + line).join('\n'));
        console.log('   ' + '='.repeat(50));
      }
    });
    
    console.log('\n4. For Edge Functions:');
    console.log('   - Go to Edge Functions in Supabase Dashboard');
    console.log('   - Create new function named "rate-limiter"');
    console.log('   - Copy content from supabase/functions/rate-limiter/index.ts');
    
    return true;
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return false;
  }
}

// Run deployment
deployViaDDL()
  .then(success => {
    if (success) {
      console.log('\n🎯 Security deployment guidance provided!');
      console.log('📖 For detailed instructions, see SECURITY.md');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });