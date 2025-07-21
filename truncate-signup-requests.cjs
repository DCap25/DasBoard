#!/usr/bin/env node

/**
 * Truncate Signup Requests using raw SQL
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function truncateSignupRequests() {
  console.log('🗑️  Truncating signup_requests table...\n');
  
  try {
    // Use raw SQL to truncate
    const { error } = await supabase.rpc('exec_sql', {
      query: 'TRUNCATE TABLE signup_requests RESTART IDENTITY CASCADE'
    });

    if (error) {
      // If RPC doesn't work, try direct SQL
      console.log('⚠️  RPC failed, trying direct DELETE...');
      const { error: deleteError } = await supabase
        .from('signup_requests')
        .delete()
        .gte('id', 0);
      
      if (deleteError) throw deleteError;
    }

    console.log('✅ Table truncated!');
    
    // Verify
    const { data, error: checkError } = await supabase
      .from('signup_requests')
      .select('*');

    console.log(`📊 Remaining records: ${data ? data.length : 'unknown'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Manual SQL to run in Supabase:');
    console.log('TRUNCATE TABLE signup_requests RESTART IDENTITY CASCADE;');
  }
}

truncateSignupRequests();