/**
 * Test Authentication Script
 * 
 * Run this script with:
 * node src/test-auth.js
 * 
 * This script tests authentication with both the mock API and live Supabase.
 */

const { testMockAuth, testSupabaseAuth } = require('./test-helpers');

async function runTests() {
  console.log('=== TESTING AUTHENTICATION ===');
  console.log('\n1. Testing Mock API Authentication:');
  
  const mockResults = await testMockAuth();
  console.log(`Mock API Authentication: ${mockResults.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!mockResults.success) {
    console.error(`Error: ${mockResults.error}`);
  }
  
  console.log('\n2. Testing Supabase Authentication:');
  
  const supabaseResults = await testSupabaseAuth();
  console.log(`Supabase Authentication: ${supabaseResults.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  if (!supabaseResults.success) {
    console.error(`Error: ${supabaseResults.error}`);
  }
  
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Mock API: ${mockResults.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Supabase: ${supabaseResults.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (mockResults.success && supabaseResults.success) {
    console.log('\n✅ All tests passed! Authentication is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
}); 