#!/usr/bin/env node

/**
 * Delete Auth User Script
 * This script deletes a specific authenticated user by email
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

async function deleteAuthUser(email) {
  if (!email) {
    console.error('❌ Usage: node delete-auth-user.cjs <email>');
    process.exit(1);
  }

  console.log(`🔍 Looking for user: ${email}...\n`);

  try {
    // Find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    console.log('👤 User found:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Created: ${new Date(user.created_at).toLocaleDateString()}`);
    console.log(`   - Status: ${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`);
    console.log();

    // Delete the user
    console.log('🗑️  Deleting user from auth system...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    console.log(`✅ Successfully deleted user: ${email}`);

    // Also clean up any related profile data
    console.log('🧹 Cleaning up related profile data...');
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found (not an error)
      console.log(`⚠️  Warning: Could not delete profile data: ${profileError.message}`);
    } else {
      console.log('✅ Profile data cleaned up');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
deleteAuthUser(email).then(() => {
  console.log('\n🎉 User deletion completed!');
  console.log('🔄 You can now signup with this email again');
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});