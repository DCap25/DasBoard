// Script to fix profiles for test users using only sign-in method
import { createClient } from '@supabase/supabase-js';

// Supabase connection info
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// List of test users to fix
const testUsers = [
  {
    email: 'admin1@exampletest.com',
    password: 'Password123!',
    name: 'Admin User',
    role: 'admin',
    dealership_id: 1,
  },
  {
    email: 'sales1@exampletest.com',
    password: 'Password123!',
    name: 'Sales Person',
    role: 'salesperson',
    dealership_id: 1,
  },
  {
    email: 'finance1@exampletest.com',
    password: 'Password123!',
    name: 'Finance Manager',
    role: 'finance_manager',
    dealership_id: 1,
  },
  {
    email: 'salesmgr1@exampletest.com',
    password: 'Password123!',
    name: 'Sales Manager',
    role: 'sales_manager',
    dealership_id: 1,
  },
  {
    email: 'gm1@exampletest.com',
    password: 'Password123!',
    name: 'General Manager',
    role: 'general_manager',
    dealership_id: 1,
  },
];

// Fix profiles for test users
async function fixProfiles() {
  console.log('Starting profile fixes for test users...');

  for (const user of testUsers) {
    try {
      console.log(`Processing ${user.email}...`);

      // Try to sign in with the user
      console.log(`Trying to sign in as ${user.email}...`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (signInError) {
        console.error(`Sign in failed for ${user.email}:`, signInError.message);
        continue;
      }

      console.log(`Successfully signed in as ${user.email}`);
      const userId = signInData.user.id;

      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error(`Error checking profile for ${user.email}:`, profileError.message);
      }

      if (!profileData) {
        // Create profile
        console.log(`Creating profile for ${user.email}...`);
        const { error: createError } = await supabase.from('profiles').upsert({
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
          dealership_id: user.dealership_id,
        });

        if (createError) {
          console.error(`Error creating profile for ${user.email}:`, createError.message);

          // Try without is_test_account if that's causing issues
          if (createError.message.includes('is_test_account')) {
            console.log(`Retrying profile creation without problematic fields...`);
            const { error: retryError } = await supabase.from('profiles').upsert({
              id: userId,
              email: user.email,
              name: user.name,
              role: user.role,
              dealership_id: user.dealership_id,
            });

            if (retryError) {
              console.error(`Retry failed for ${user.email}:`, retryError.message);
            } else {
              console.log(`Profile created for ${user.email} on second attempt`);
            }
          }
        } else {
          console.log(`Profile created for ${user.email}`);
        }
      } else {
        // Update profile
        console.log(`Updating profile for ${user.email}...`);
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: user.name,
            role: user.role,
            dealership_id: user.dealership_id,
          })
          .eq('id', userId);

        if (updateError) {
          console.error(`Error updating profile for ${user.email}:`, updateError.message);
        } else {
          console.log(`Profile updated for ${user.email}`);
        }
      }

      // Get the updated profile
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (updatedProfile) {
        console.log(`Profile for ${user.email}:`, {
          id: updatedProfile.id,
          email: updatedProfile.email,
          name: updatedProfile.name,
          role: updatedProfile.role,
          dealership_id: updatedProfile.dealership_id,
        });
      }

      // Sign out
      await supabase.auth.signOut();
      console.log(`Signed out`);
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error.message);
    }

    console.log('----------------------------------');
  }

  console.log('Profile fixes completed.');
}

// Main function
async function main() {
  try {
    // Check connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');

    // Fix profiles
    await fixProfiles();
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
});
