#!/usr/bin/env node

/**
 * Check Auth Users Script
 * This script lists all authenticated users so we can see what test accounts exist
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAuthUsers() {
  console.log('👥 Checking authenticated users...\n');

  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    console.log(`📊 Found ${authUsers.users.length} authenticated users:\n`);

    authUsers.users.forEach((user, index) => {
      const createdDate = new Date(user.created_at).toLocaleDateString();
      const confirmedAt = user.email_confirmed_at ? '✅ Confirmed' : '❌ Unconfirmed';
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Created: ${createdDate}`);
      console.log(`   - Status: ${confirmedAt}`);
      console.log(`   - Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}`);
      console.log();
    });

    // Find test-related emails
    const testEmails = authUsers.users.filter(user => 
      user.email.includes('test') || 
      user.email.includes('example.com') ||
      user.email.includes('single') ||
      user.email.includes('finance')
    );

    if (testEmails.length > 0) {
      console.log('🧪 Test/Example accounts found:');
      testEmails.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`);
      });
      console.log();
      console.log('💡 To delete a test user, use:');
      console.log('   node delete-auth-user.cjs <email>');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the check
checkAuthUsers().then(() => {
  console.log('✅ User check completed!');
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});