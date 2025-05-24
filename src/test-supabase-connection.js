/**
 * Supabase Connection Test Script
 *
 * This script tests the connection to Supabase and shows detailed error information.
 */
const { createClient } = require('@supabase/supabase-js');

// Das Board Master config from scripts/supabase-config.js
const DAS_BOARD_MASTER_URL = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const DAS_BOARD_MASTER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQyNjI5NjYsImV4cCI6MjAyOTgzODk2Nn0.HkOUHJz-bF1kY21hfh2eZH1Wf9k0wJG1PSC5eQ4Jgjc';

// Function to test connection with detailed error reporting
async function testConnectionDetailed(url, key, projectName) {
  console.log(`Testing connection to ${projectName}...`);
  console.log(`URL: ${url}`);
  console.log(`Key: ${key.substring(0, 10)}...${key.substring(key.length - 10)}`);

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Test a simple query to dealership_groups
    console.log(`Testing query to dealership_groups table...`);
    const { data: groupsData, error: groupsError } = await supabase
      .from('dealership_groups')
      .select('*')
      .limit(1);

    if (groupsError) {
      console.error(`❌ Query to dealership_groups failed:`);
      console.error(`   Code: ${groupsError.code}`);
      console.error(`   Message: ${groupsError.message}`);
      console.error(`   Details: ${JSON.stringify(groupsError.details)}`);
      console.error(`   Hint: ${groupsError.hint}`);
    } else {
      console.log(`✅ Successfully queried dealership_groups`);
      console.log('Sample data:', groupsData);
    }

    // Test another table to see if it's a permissions issue
    console.log(`Testing query to roles table...`);
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(1);

    if (rolesError) {
      console.error(`❌ Query to roles failed:`);
      console.error(`   Code: ${rolesError.code}`);
      console.error(`   Message: ${rolesError.message}`);
      console.error(`   Details: ${JSON.stringify(rolesError.details)}`);
      console.error(`   Hint: ${rolesError.hint}`);
    } else {
      console.log(`✅ Successfully queried roles`);
      console.log('Sample data:', rolesData);
    }

    // Check project status
    console.log(`Testing auth.getSession()...`);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`❌ auth.getSession failed:`, sessionError);
    } else {
      console.log(`✅ auth.getSession successful:`, !!sessionData?.session);
    }

    // Return true if at least one query was successful
    return !groupsError || !rolesError;
  } catch (error) {
    console.error(`❌ Error connecting to ${projectName}:`, error);
    return false;
  }
}

// Run the test
async function main() {
  console.log('==================================');
  console.log('Supabase Connection Detailed Test');
  console.log('==================================\n');

  const result = await testConnectionDetailed(
    DAS_BOARD_MASTER_URL,
    DAS_BOARD_MASTER_KEY,
    'Das Board Master'
  );

  console.log('\n==================================');
  console.log(
    result ? '✅ Connection test completed with some success' : '❌ All connection tests failed'
  );
  console.log('==================================');
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
