#!/usr/bin/env node

/**
 * Clear All Signup Requests
 * This completely empties the signup_requests table
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function clearAllSignupRequests() {
  console.log('🧹 Clearing ALL signup_requests...\n');
  
  try {
    // Delete all records from signup_requests table
    const { error } = await supabase
      .from('signup_requests')
      .delete()
      .neq('id', 0); // Delete where id != 0 (which means delete all)

    if (error) throw error;

    console.log('✅ All signup_requests cleared!');
    
    // Verify
    const { data: remaining, error: checkError } = await supabase
      .from('signup_requests')
      .select('count');

    if (!checkError) {
      console.log(`📊 Remaining records: ${remaining.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearAllSignupRequests().then(() => {
  console.log('\n🎉 Signup requests table cleared!');
  console.log('🚀 Now try signup with: testsingle758_1753110602135@example.com');
});