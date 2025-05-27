import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');

    // Test 1: Simple select from dealerships table
    console.log('2. Testing SELECT query on dealerships table...');
    const { data: dealerships, error: dealershipsError } = await supabase
      .from('dealerships')
      .select('id, name')
      .limit(5);

    if (dealershipsError) {
      console.error('❌ Dealerships query failed:', dealershipsError);
      return;
    }

    console.log('✅ Dealerships query successful!');
    console.log('Found dealerships:', dealerships?.length || 0);
    console.log('Sample data:', dealerships);

    // Test 2: Check if table exists by trying to get count
    console.log('\n3. Testing table structure...');
    const { count, error: countError } = await supabase
      .from('dealerships')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query failed:', countError);
      return;
    }

    console.log('✅ Table structure check successful!');
    console.log('Total dealerships count:', count);

    // Test 3: Test insert/delete cycle (like in the app)
    console.log('\n4. Testing INSERT/DELETE cycle...');
    const testName = `Test_${Date.now()}`;

    const { data: insertData, error: insertError } = await supabase
      .from('dealerships')
      .insert({
        name: testName,
        type: 'test',
        store_hours: '9:00 AM - 6:00 PM Mon-Fri',
        num_teams: 1,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ INSERT test failed:', insertError);
      return;
    }

    console.log('✅ INSERT test successful! ID:', insertData.id);

    // Clean up the test record
    const { error: deleteError } = await supabase
      .from('dealerships')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('❌ DELETE test failed:', deleteError);
      return;
    }

    console.log('✅ DELETE test successful!');
    console.log('\n🎉 All database tests passed!');
  } catch (error) {
    console.error('❌ Connection test failed with exception:', error);
  }
}

testConnection()
  .then(() => {
    console.log('\nTest completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
