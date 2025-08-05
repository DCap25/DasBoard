import fetch from 'node-fetch';

// Supabase configuration from environment
const SUPABASE_URL = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTcxOTc2NSwiZXhwIjoyMDYxMjk1NzY1fQ.f6a3c5_u-P5VOvovj1iYeeNuRgyFgBSy5DWNaJMsd-s';

// Helper function to make Supabase API calls
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Check current auth configuration
async function checkAuthConfig() {
  console.log('Checking Supabase Auth Configuration...\n');
  
  try {
    // Get auth settings
    const authSettings = await supabaseRequest('/auth/v1/settings');
    console.log('Current Auth Settings:', JSON.stringify(authSettings, null, 2));
    
    // Security recommendations
    console.log('\n=== Security Recommendations ===\n');
    
    if (!authSettings.email_confirmations) {
      console.log('⚠️  Email confirmation is disabled. Consider enabling it for production.');
    } else {
      console.log('✅ Email confirmation is enabled');
    }
    
    if (!authSettings.security_update_token) {
      console.log('⚠️  Security update tokens not configured');
    }
    
  } catch (error) {
    console.error('Error checking auth config:', error.message);
  }
}

// Check RLS policies
async function checkRLSPolicies() {
  console.log('\n\nChecking RLS Policies...\n');
  
  const tables = ['profiles', 'deals', 'users', 'schedules'];
  
  for (const table of tables) {
    try {
      // Check if RLS is enabled
      const tableInfo = await supabaseRequest(`/rest/v1/${table}`, {
        method: 'HEAD'
      });
      
      console.log(`Table: ${table}`);
      console.log(`- RLS Status: Checking...`);
      
      // Try to query without auth to test RLS
      const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': SUPABASE_URL.includes('supabase.co') ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4' : ''
        }
      });
      
      if (testResponse.status === 401 || testResponse.status === 403) {
        console.log(`✅ RLS appears to be enabled (got ${testResponse.status})`);
      } else {
        console.log(`⚠️  RLS might not be properly configured (got ${testResponse.status})`);
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${table}: ${error.message}`);
    }
    console.log('');
  }
}

// Check for common security issues
async function checkSecurityIssues() {
  console.log('\n\nChecking Common Security Issues...\n');
  
  // Check for exposed functions
  try {
    const functions = await supabaseRequest('/rest/v1/rpc/');
    console.log(`Found ${Object.keys(functions).length} exposed RPC functions`);
    
    // List potentially dangerous functions
    const dangerousFunctions = Object.keys(functions).filter(fn => 
      fn.includes('admin') || fn.includes('delete') || fn.includes('drop')
    );
    
    if (dangerousFunctions.length > 0) {
      console.log('⚠️  Potentially dangerous functions exposed:', dangerousFunctions);
    }
  } catch (error) {
    console.log('Could not check RPC functions:', error.message);
  }
}

// Main execution
async function main() {
  console.log('=== Supabase Security Check ===\n');
  console.log(`Project URL: ${SUPABASE_URL}\n`);
  
  await checkAuthConfig();
  await checkRLSPolicies();
  await checkSecurityIssues();
  
  console.log('\n=== Additional Security Recommendations ===\n');
  console.log('1. Enable MFA for admin accounts');
  console.log('2. Set up webhook security for auth events');
  console.log('3. Configure rate limiting at the API Gateway level');
  console.log('4. Regularly rotate service role keys');
  console.log('5. Enable audit logging for sensitive operations');
  console.log('6. Set up automated backups with encryption');
}

main().catch(console.error);