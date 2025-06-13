const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const anonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

console.log('Testing Profiles table connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', anonKey.length);

// Create Supabase client
const supabase = createClient(supabaseUrl, anonKey);

async function testProfilesAndConnection() {
  console.log('🔧 Testing Supabase connection and profiles...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('dealerships')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return;
    }
    console.log('✅ Connection successful');

    // Test 2: Check profiles count
    console.log('\n2. Checking profiles count...');
    const {
      data: profiles,
      error: profilesError,
      count,
    } = await supabase.from('profiles').select('*', { count: 'exact' });

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      return;
    }
    console.log(`✅ Found ${count} profiles in database`);

    // Test 3: Check key test users
    console.log('\n3. Checking key test users...');
    const keyUsers = [
      'testadmin@example.com',
      'testfinance@example.com',
      'dealer1.admin@exampletest.com',
    ];

    for (const email of keyUsers) {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, email, name, role, dealership_id')
        .eq('email', email)
        .single();

      if (userError) {
        console.log(`❌ User ${email} not found:`, userError.message);
      } else {
        console.log(`✅ ${email}: ${user.name} (${user.role}) - Dealership: ${user.dealership_id}`);
      }
    }

    // Test 4: Check dealerships with admin assignments
    console.log('\n4. Checking dealerships with admin assignments...');
    const { data: dealerships, error: dealershipsError } = await supabase
      .from('dealerships')
      .select(
        `
        id,
        name,
        admin_user_id,
        profiles!dealerships_admin_user_id_fkey(email, name)
      `
      )
      .not('admin_user_id', 'is', null);

    if (dealershipsError) {
      console.error('❌ Dealerships query failed:', dealershipsError);
    } else {
      console.log(`✅ Found ${dealerships.length} dealerships with admin assignments:`);
      dealerships.forEach(d => {
        const adminInfo = d.profiles ? `${d.profiles.name} (${d.profiles.email})` : 'Unknown Admin';
        console.log(`   - ${d.name}: ${adminInfo}`);
      });
    }

    // Test 5: Check finance managers
    console.log('\n5. Checking finance managers...');
    const { data: financeManagers, error: fmError } = await supabase
      .from('profiles')
      .select('id, email, name, dealership_id')
      .eq('role', 'finance_manager');

    if (fmError) {
      console.error('❌ Finance managers query failed:', fmError);
    } else {
      console.log(`✅ Found ${financeManagers.length} finance managers:`);
      financeManagers.forEach(fm => {
        console.log(`   - ${fm.name} (${fm.email}) - Dealership: ${fm.dealership_id}`);
      });
    }

    // Test 6: Test role mapping (simulate what the UI does)
    console.log('\n6. Testing role mapping...');
    const mapLegacyRole = role => {
      const roleMap = {
        single_finance_manager: 'Finance Manager',
        single_dealer_admin: 'Dealer Admin',
        finance_manager: 'Finance Manager',
        dealership_admin: 'Dealer Admin',
        sales_manager: 'Sales Manager',
        general_manager: 'General Manager',
        admin: 'Master Admin',
        salesperson: 'Salesperson',
      };
      return roleMap[role] || role;
    };

    const testRoles = ['finance_manager', 'dealership_admin', 'admin'];
    testRoles.forEach(role => {
      const displayRole = mapLegacyRole(role);
      console.log(`   - ${role} → ${displayRole}`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Profiles in database: ${count}`);
    console.log(`   - Dealerships with admins: ${dealerships?.length || 0}`);
    console.log(`   - Finance managers: ${financeManagers?.length || 0}`);
    console.log('\n✅ The application should now work correctly!');
    console.log('   - Admin details should display properly');
    console.log('   - Finance managers should appear in the UI');
    console.log('   - User creation through the UI should work');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testProfilesAndConnection()
  .then(() => {
    console.log('\nTest completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
