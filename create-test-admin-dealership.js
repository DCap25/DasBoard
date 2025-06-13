import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://cljxbrgdkjdrzxbefczh.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsanhicmdka2pkrnp4YmVmY3poIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzU5ODgyNSwkXCI6MTc0OTE1MDgyNX0.9-Ls9QOPmllbXAeNNn2PZLRLm1IojXNI3w3QJKzTZQE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAdminDealership() {
  console.log('🧪 Creating test dealership with admin to verify admin details fix...');

  try {
    // Step 1: Check existing admin users
    console.log('1. Checking existing admin users...');
    const { data: existingAdmins, error: adminError } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .ilike('role', '%admin%')
      .limit(3);

    if (adminError) {
      console.error('Error fetching admins:', adminError);
    } else {
      console.log('Existing admins:', existingAdmins);
    }

    // Step 2: Create/update test admin user
    console.log('2. Creating test admin user...');
    const { data: adminData, error: adminInsertError } = await supabase
      .from('profiles')
      .upsert({
        id: 'test-admin-123',
        email: 'testadmin@testdealership.com',
        name: 'Test Admin User',
        role: 'single_dealer_admin',
        phone: '+1-555-0123',
        created_at: new Date().toISOString(),
      })
      .select();

    if (adminInsertError) {
      console.error('Error creating admin:', adminInsertError);
      return;
    }
    console.log('✅ Test admin created:', adminData);

    // Step 3: Create test dealership with admin assigned
    console.log('3. Creating test dealership...');
    const { data: dealershipData, error: dealershipError } = await supabase
      .from('dealerships')
      .upsert({
        name: 'Test Dealership for Admin Fix',
        type: 'single',
        subscription_tier: 'base',
        num_teams: 1,
        admin_user_id: 'test-admin-123',
        store_hours: {
          status: 'not_configured',
          note: 'Store hours to be configured by dealer admin',
        },
        schema_name: 'test_dealership_admin_fix_schema',
      })
      .select();

    if (dealershipError) {
      console.error('Error creating dealership:', dealershipError);
      return;
    }
    console.log('✅ Test dealership created:', dealershipData);

    // Step 4: Verify the test data with JOIN
    console.log('4. Verifying test data...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('dealerships')
      .select(
        `
        id,
        name,
        admin_user_id,
        profiles!dealerships_admin_user_id_fkey (
          name,
          email,
          phone
        )
      `
      )
      .eq('name', 'Test Dealership for Admin Fix');

    if (verifyError) {
      console.error('Error verifying data:', verifyError);
    } else {
      console.log('✅ Verification result:', JSON.stringify(verifyData, null, 2));
    }

    console.log('\n🎯 TEST INSTRUCTIONS:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Login with testadmin@example.com / testadmin123');
    console.log('3. Go to Master Admin > Overview tab');
    console.log('4. Find "Test Dealership for Admin Fix" in the Single Dealerships section');
    console.log('5. Click "View" button on that dealership');
    console.log('6. Check the "Admin Details Display" section');
    console.log('7. You should see:');
    console.log('   - Admin Name: Test Admin User');
    console.log('   - Admin Email: testadmin@testdealership.com');
    console.log('   - Admin Phone: +1-555-0123');
    console.log('\n✅ If the admin details show correctly, the fix is working!');
    console.log('❌ If it shows "No admin assigned", the fix needs more work.');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
createTestAdminDealership();
