#!/usr/bin/env node

/**
 * Cleanup Script: Remove orphaned signup_requests
 * This script removes signup_requests that don't have corresponding auth users
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌');
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupSignupRequests() {
  console.log('🔍 Starting cleanup of signup_requests table...\n');

  try {
    // Step 1: Get all signup_requests
    console.log('📊 Fetching all signup_requests...');
    const { data: signupRequests, error: signupError } = await supabase
      .from('signup_requests')
      .select('email, status, created_at')
      .order('created_at', { ascending: false });

    if (signupError) {
      throw new Error(`Failed to fetch signup_requests: ${signupError.message}`);
    }

    console.log(`Found ${signupRequests.length} signup_requests\n`);

    // Step 2: Get all auth users
    console.log('👥 Fetching all authenticated users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    console.log(`Found ${authUsers.users.length} authenticated users\n`);

    // Step 3: Find orphaned signup_requests
    const authUserEmails = new Set(authUsers.users.map(user => user.email));
    const orphanedRequests = signupRequests.filter(request => !authUserEmails.has(request.email));

    console.log('📋 Analysis Results:');
    console.log(`   Total signup_requests: ${signupRequests.length}`);
    console.log(`   Total auth users: ${authUsers.users.length}`);
    console.log(`   Orphaned requests: ${orphanedRequests.length}\n`);

    if (orphanedRequests.length === 0) {
      console.log('✅ No orphaned signup_requests found. Database is clean!');
      return;
    }

    // Step 4: Show what will be deleted
    console.log('🗑️  Orphaned signup_requests to be deleted:');
    orphanedRequests.forEach(request => {
      console.log(`   - ${request.email} (${request.status}) - ${request.created_at}`);
    });
    console.log();

    // Step 5: Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const confirmation = await new Promise((resolve) => {
      rl.question('❓ Do you want to delete these orphaned requests? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase());
      });
    });

    if (confirmation !== 'yes' && confirmation !== 'y') {
      console.log('❌ Cleanup cancelled by user');
      return;
    }

    // Step 6: Delete orphaned requests
    console.log('🧹 Deleting orphaned signup_requests...');
    const emailsToDelete = orphanedRequests.map(request => request.email);
    
    const { data: deleteResult, error: deleteError } = await supabase
      .from('signup_requests')
      .delete()
      .in('email', emailsToDelete);

    if (deleteError) {
      throw new Error(`Failed to delete orphaned requests: ${deleteError.message}`);
    }

    console.log(`✅ Successfully deleted ${orphanedRequests.length} orphaned signup_requests\n`);

    // Step 7: Verify cleanup
    console.log('🔍 Verifying cleanup...');
    const { data: remainingRequests, error: verifyError } = await supabase
      .from('signup_requests')
      .select('email, status, created_at')
      .order('created_at', { ascending: false });

    if (verifyError) {
      throw new Error(`Failed to verify cleanup: ${verifyError.message}`);
    }

    console.log(`✅ Cleanup complete! Remaining signup_requests: ${remainingRequests.length}`);
    
    if (remainingRequests.length > 0) {
      console.log('📋 Remaining signup_requests (all should have corresponding auth users):');
      remainingRequests.forEach(request => {
        const hasAuth = authUserEmails.has(request.email) ? '✅' : '❌';
        console.log(`   ${hasAuth} ${request.email} (${request.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupSignupRequests().then(() => {
  console.log('\n🎉 Cleanup process completed!');
  process.exit(0);
});