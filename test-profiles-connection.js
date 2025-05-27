import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

console.log('Testing Profiles table connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey.length);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfilesTable() {
  try {
    console.log('\n1. Testing profiles table...');

    // Test 1: Check if profiles table exists and query it
    console.log('2. Testing SELECT query on profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      return;
    }

    console.log('✅ Profiles query successful!');
    console.log('Found profiles:', profiles.length);
    if (profiles.length > 0) {
      console.log('Sample data:', profiles.slice(0, 3));
    } else {
      console.log('📊 No profiles found in the table');
    }

    // Test 2: Check auth users
    console.log('\n3. Testing auth users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.error('❌ Auth users query failed:', authError);
      } else {
        console.log('✅ Auth users query successful!');
        console.log('Found auth users:', authUsers.users.length);
        if (authUsers.users.length > 0) {
          console.log('Sample auth users:');
          authUsers.users.slice(0, 3).forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id})`);
          });
        }
      }
    } catch (authError) {
      console.error('❌ Cannot access auth admin (expected with anon key):', authError.message);
    }

    // Test 3: Try to insert a test profile if none exist
    if (profiles.length === 0) {
      console.log('\n4. Testing profile insertion...');
      const testProfile = {
        id: '00000000-0000-4000-8000-000000000001', // Mock UUID for testing
        email: 'test@example.com',
        name: 'Test User',
        role: 'single_finance_manager',
        phone: '555-1234',
        dealership_id: null,
      };

      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert(testProfile)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Profile insertion failed:', insertError);
      } else {
        console.log('✅ Profile insertion successful!', insertData);

        // Clean up the test profile
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', testProfile.id);

        if (!deleteError) {
          console.log('✅ Test profile cleaned up');
        }
      }
    }

    console.log('\n🎉 Profiles table test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProfilesTable();
