/**
 * Dealership1 Test Script
 * This script helps validate the Dealership1 Supabase project setup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const masterUrl = process.env.VITE_SUPABASE_URL;
const masterKey = process.env.VITE_SUPABASE_ANON_KEY;
const dealership1Url = process.env.VITE_DEALERSHIP1_SUPABASE_URL;
const dealership1Key = process.env.VITE_DEALERSHIP1_SUPABASE_ANON_KEY;

console.log('==== Das Board Dealership1 Test ====');
console.log('Checking environment variables:');
console.log('- Master URL:', masterUrl ? '✓' : '✗');
console.log('- Master Key:', masterKey ? '✓' : '✗');
console.log('- Dealership1 URL:', dealership1Url ? '✓' : '✗');
console.log('- Dealership1 Key:', dealership1Key ? '✓' : '✗');

// Exit if any required variables are missing
if (!masterUrl || !masterKey || !dealership1Url || !dealership1Key) {
  console.error('Error: Missing environment variables. Please check your .env file.');
  process.exit(1);
}

// Create Supabase clients
const masterClient = createClient(masterUrl, masterKey);
const dealership1Client = createClient(dealership1Url, dealership1Key);

// Test Master project connection
async function testMasterConnection() {
  try {
    console.log('\nTesting Master project connection...');
    const { data, error } = await masterClient.from('dealerships').select('*').limit(1);

    if (error) throw error;

    console.log('✅ Master project connection successful');
    console.log(`Found ${data.length} dealerships`);
    return true;
  } catch (err) {
    console.error('❌ Master project connection failed:', err.message);
    return false;
  }
}

// Test Dealership1 project connection
async function testDealership1Connection() {
  try {
    console.log('\nTesting Dealership1 project connection...');
    const { data, error } = await dealership1Client.from('users').select('*').limit(1);

    if (error) throw error;

    console.log('✅ Dealership1 project connection successful');
    console.log(`Found ${data.length} users`);
    return true;
  } catch (err) {
    console.error('❌ Dealership1 project connection failed:', err.message);
    return false;
  }
}

// Test authentication
async function testAuthentication() {
  try {
    console.log('\nTesting authentication with Dealership1...');
    const { data, error } = await dealership1Client.auth.signInWithPassword({
      email: 'testadmin@example.com',
      password: 'temppassword',
    });

    if (error) throw error;

    console.log('✅ Authentication successful');
    console.log(`Logged in as: ${data.user.email}`);

    // Test RLS
    console.log('\nTesting row-level security...');
    const { data: usersData, error: usersError } = await dealership1Client
      .from('users')
      .select('*');

    if (usersError) {
      console.error('❌ RLS test failed:', usersError.message);
    } else {
      console.log('✅ RLS test passed');
      console.log(`Retrieved ${usersData.length} users`);
    }

    return true;
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const masterConnected = await testMasterConnection();
  const dealership1Connected = await testDealership1Connection();

  if (masterConnected && dealership1Connected) {
    await testAuthentication();
  }

  console.log('\n==== Test Summary ====');
  console.log('Master project:', masterConnected ? '✅ Connected' : '❌ Failed');
  console.log('Dealership1 project:', dealership1Connected ? '✅ Connected' : '❌ Failed');

  if (!masterConnected || !dealership1Connected) {
    console.error('\n⚠️ Some tests failed. Please check your configuration.');
    process.exit(1);
  }

  console.log('\n✅ All connection tests passed!');
  console.log('You can now test the application with Dealership1 users:');
  console.log('- Admin: testadmin@example.com');
  console.log('- Sales: testsales@example.com');
  console.log('- Finance: testfinance@example.com');
  console.log('- Manager: testmanager@example.com');
  console.log('- GM: testgm@example.com');
}

// Run the tests
runTests().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
