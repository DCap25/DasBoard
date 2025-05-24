import { supabase } from '../lib/supabaseClient';

async function testAdminDashboard() {
  console.log('Starting Admin Dashboard Tests...\n');

  // 1. Test Database Connection
  console.log('1. Testing Database Connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('✓ Database connection successful\n');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    return;
  }

  // 2. Test RLS Policies
  console.log('2. Testing RLS Policies...');
  try {
    // Try to insert a user without admin role
    const { error } = await supabase.from('profiles').insert({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      role_id: 'sales',
    });
    
    if (!error) {
      console.error('✗ RLS policy failed: Non-admin was able to insert user');
      return;
    }
    console.log('✓ RLS policies working correctly\n');
  } catch (error) {
    console.error('✗ Error testing RLS:', error);
    return;
  }

  // 3. Test Pay Plan Structure
  console.log('3. Testing Pay Plan Structure...');
  try {
    const { error } = await supabase.from('pay_plans').insert({
      role_id: 'test-role',
      front_end_percent: 25.00,
      back_end_percent: 10.00,
      csi_bonus: 100.00,
      demo_allowance: 500.00,
      vsc_bonus: 50.00,
      ppm_bonus: 30.00,
      volume_bonus: { '10': 1000, '20': 2000 },
    });
    
    if (error) {
      console.error('✗ Pay plan structure test failed:', error);
      return;
    }
    console.log('✓ Pay plan structure working correctly\n');
  } catch (error) {
    console.error('✗ Error testing pay plan structure:', error);
    return;
  }

  // 4. Test Data Types
  console.log('4. Testing Data Types...');
  try {
    const { error } = await supabase.from('profiles').insert({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      role_id: 'admin',
    });
    
    if (error) {
      console.error('✗ Data type test failed:', error);
      return;
    }
    console.log('✓ Data types working correctly\n');
  } catch (error) {
    console.error('✗ Error testing data types:', error);
    return;
  }

  console.log('All tests completed successfully! 🎉');
  console.log('\nNext Steps:');
  console.log('1. Log in as an admin user');
  console.log('2. Navigate to the Admin Dashboard');
  console.log('3. Test the following features:');
  console.log('   - Create a new user');
  console.log('   - Update a pay plan');
  console.log('   - Verify password protection');
  console.log('   - Check form validation');
}

// Run the tests
testAdminDashboard(); 