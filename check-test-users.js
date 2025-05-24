// Script to check test users in Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase connection info from the mcp.json file
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co'; // From TestLogin.html
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';
const accessToken = 'sbp_ad02d08c9feedc846628181b2bc70955003a56a3'; // From MCP config

// List of test users to verify
const testUsers = [
  {
    email: 'testadmin@example.com',
    password: 'Password123!',
    role: 'master_admin',
  },
  {
    email: 'group1.admin@exampletest.com',
    password: 'Password123!',
    role: 'dealer_group_admin',
  },
  {
    email: 'jp@exampletest.com',
    password: 'Password123!',
    role: 'dealership_admin',
  },
  {
    email: 'sales@exampletest.com',
    password: 'Password123!',
    role: 'salesperson',
  },
  {
    email: 'admin1@exampletest.com',
    password: 'Password123!',
    role: 'admin',
  },
  {
    email: 'sales1@exampletest.com',
    password: 'Password123!',
    role: 'salesperson',
  },
  {
    email: 'finance1@exampletest.com',
    password: 'Password123!',
    role: 'finance_manager',
  },
  {
    email: 'salesmgr1@exampletest.com',
    password: 'Password123!',
    role: 'sales_manager',
  },
  {
    email: 'gm1@exampletest.com',
    password: 'Password123!',
    role: 'general_manager',
  },
];

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTestUsers() {
  console.log('Checking test users in Supabase...\n');
  console.log('==================================');

  for (const user of testUsers) {
    try {
      console.log(`Testing login for ${user.email} (${user.role})...`);

      // Try to sign in with the test user credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        console.log(`❌ Login failed for ${user.email}: ${error.message}`);

        // Check if the user exists but password is wrong
        const { data: userCheck } = await supabase
          .from('profiles')
          .select('email, role')
          .eq('email', user.email)
          .maybeSingle();

        if (userCheck) {
          console.log(`   User exists in profiles table with role: ${userCheck.role || 'unknown'}`);
          console.log(`   Password might be incorrect or account might not be confirmed`);
        } else {
          console.log(`   User not found in profiles table`);
        }
      } else {
        console.log(`✓ Successfully logged in as ${user.email}`);

        // Check profile data for this user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.log(`   Profile fetch error: ${profileError.message}`);
        } else if (profile) {
          console.log(
            `   Profile data: role=${profile.role || 'none'}, dealership_id=${
              profile.dealership_id || 'none'
            }`
          );
          console.log(`   is_group_admin=${profile.is_group_admin ? 'true' : 'false'}`);
        }

        // Sign out after successful login
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`❌ Error testing ${user.email}: ${error.message}`);
    }

    console.log('----------------------------------');
  }

  // Try to get a list of all profiles with test email domains
  try {
    console.log('\nListing all profiles with test email domains:');

    const { data: testProfiles, error: testProfilesError } = await supabase
      .from('profiles')
      .select('*')
      .or('email.ilike.%@exampletest.com,email.ilike.%@example.com');

    if (testProfilesError) {
      console.log(`Error fetching test profiles: ${testProfilesError.message}`);
    } else if (testProfiles && testProfiles.length > 0) {
      console.log(`Found ${testProfiles.length} test profiles:`);
      testProfiles.forEach(profile => {
        console.log(
          `- ${profile.email} (${profile.role || 'no role'}) - dealership_id: ${
            profile.dealership_id || 'none'
          }`
        );
      });
    } else {
      console.log('No test profiles found');
    }
  } catch (error) {
    console.log(`Error listing test profiles: ${error.message}`);
  }
}

// Run the check
checkTestUsers().catch(error => {
  console.error('Error running test users check:', error);
});
