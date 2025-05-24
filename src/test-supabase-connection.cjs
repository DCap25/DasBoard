/**
 * Supabase Connection Test Script
 *
 * This script tests the connection to Supabase and shows detailed error information.
 */
const { createClient } = require('@supabase/supabase-js');

// Das Board Master config from scripts/supabase-config.js
const DAS_BOARD_MASTER_URL = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const DAS_BOARD_MASTER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// List of tables to check
const TABLES_TO_CHECK = ['dealership_groups', 'dealerships', 'roles', 'users', 'profiles'];

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

    // Check auth connection
    console.log(`\nTesting auth.getSession()...`);
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(`❌ auth.getSession failed:`, sessionError);
    } else {
      console.log(`✅ auth.getSession successful:`, !!sessionData?.session);
    }

    // Test tables
    console.log('\nTesting table existence and accessibility:');
    console.log('======================================');

    let tablesExist = 0;

    for (const table of TABLES_TO_CHECK) {
      try {
        console.log(`\nTesting query to ${table} table...`);
        const { data, error, status, statusText } = await supabase.from(table).select('*').limit(1);

        if (error) {
          console.error(`❌ Query to ${table} failed:`);
          console.error(`   Code: ${error.code}`);
          console.error(`   Message: ${error.message}`);
          if (error.details) console.error(`   Details: ${JSON.stringify(error.details)}`);
          if (error.hint) console.error(`   Hint: ${error.hint}`);
        } else if (status !== 200) {
          console.error(`❌ Query to ${table} returned status ${status}: ${statusText}`);
        } else {
          console.log(`✅ Successfully queried ${table}`);
          console.log(`   Found ${data.length} records`);
          if (data.length > 0) {
            console.log(`   Sample data:`, data);
          }
          tablesExist++;
        }
      } catch (error) {
        console.error(`❌ Exception querying ${table}:`, error);
      }
    }

    // Test a simple count query
    try {
      console.log('\nTesting COUNT query...');
      const { data, error } = await supabase.from('roles').select('*', { count: 'exact' });

      if (error) {
        console.error('❌ COUNT query failed:', error);
      } else {
        console.log(`✅ COUNT query successful: found ${data.length} roles`);
      }
    } catch (error) {
      console.error('❌ Exception in COUNT query:', error);
    }

    return {
      success: tablesExist > 0,
      tablesChecked: TABLES_TO_CHECK.length,
      tablesExist,
    };
  } catch (error) {
    console.error(`❌ Error connecting to ${projectName}:`, error);
    return { success: false, tablesChecked: 0, tablesExist: 0 };
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
    result.success
      ? `✅ Connection test completed successfully (${result.tablesExist}/${result.tablesChecked} tables exist)`
      : '❌ Connection test failed'
  );
  console.log('==================================');

  if (result.tablesExist === 0) {
    console.log('\n⚠️ IMPORTANT: No tables were found or accessible!');
    console.log('Please run the SQL script in SETUP-DATABASE-INSTRUCTIONS.md');
    console.log('to create the required tables in your Supabase project.');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
