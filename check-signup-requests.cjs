#!/usr/bin/env node

/**
 * Check signup_requests table
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkSignupRequests() {
  try {
    const { data, error } = await supabase
      .from('signup_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`📊 Found ${data.length} signup_requests:\n`);
    
    data.forEach((request, index) => {
      console.log(`${index + 1}. ${request.email}`);
      console.log(`   - ID: ${request.id}`);
      console.log(`   - Status: ${request.status}`);
      console.log(`   - Created: ${new Date(request.created_at).toISOString()}`);
      console.log();
    });

    if (data.length > 0) {
      console.log('🧹 To clear all signup_requests:');
      console.log('   node clear-all-signup-requests.cjs');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSignupRequests();