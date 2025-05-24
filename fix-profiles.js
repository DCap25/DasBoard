// Script to fix profiles for test users
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
    name: 'Admin User',
    role: 'admin',
    dealership_id: 1,
  },
  {
    email: 'sales1@exampletest.com',
    name: 'Sales Person',
    role: 'salesperson',
    dealership_id: 1,
  },
  {
    email: 'finance1@exampletest.com',
    name: 'Finance Manager',
    role: 'finance_manager',
    dealership_id: 1,
  },
  {
    email: 'salesmgr1@exampletest.com',
    name: 'Sales Manager',
    role: 'sales_manager',
    dealership_id: 1,
  },
  {
    email: 'gm1@exampletest.com',
    name: 'General Manager',
    role: 'general_manager',
    dealership_id: 1,
  },
];

// Fix profiles for test users
async function fixProfiles() {
  console.log('Starting profile fixes for test users...');

  // First get the auth users to find their IDs
  for (const user of testUsers) {
    try {
      console.log(`Looking up user ID for ${user.email}...`);

      // Get user by email from auth.users
      const { data: authData, error } = await supabase.auth.admin.getUserByEmail(user.email);

      if (error) {
        // Standard API doesn't have admin access, try lookup from profiles
        console.log(`Admin API not available, trying alternative lookup for ${user.email}`);

        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (profilesError || !data) {
          // Try another method - raw auth sign in
          console.log(`Trying sign in method for ${user.email}`);
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: 'Password123!',
          });

          if (signInError) {
            console.error(`Could not find user ID for ${user.email}:`, signInError);
            continue;
          }

          // Create profile with the ID from sign in
          const userId = signInData.user.id;
          console.log(`Found user ID via sign in: ${userId}`);

          await createProfile(userId, user);

          // Sign out after creating profile
          await supabase.auth.signOut();
        } else {
          // We found the ID in profiles but it might be incomplete
          console.log(`Found user ID in profiles: ${data.id}`);
          await updateProfile(data.id, user);
        }
      } else if (authData && authData.user) {
        // We got the user from the admin API
        const userId = authData.user.id;
        console.log(`Found user ID via admin API: ${userId}`);
        await createProfile(userId, user);
      }
    } catch (error) {
      console.error(`Error processing ${user.email}:`, error);
    }
  }

  console.log('Profile fixes completed.');
}

// Create a profile for a user
async function createProfile(userId, userData) {
  try {
    console.log(`Creating profile for ${userData.email} (${userId})...`);

    // Create profile record
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      dealership_id: userData.dealership_id,
    });

    if (error) {
      console.error(`Error creating profile for ${userData.email}:`, error);
    } else {
      console.log(`Profile created for ${userData.email}`);
    }
  } catch (error) {
    console.error(`Error in createProfile for ${userData.email}:`, error);
  }
}

// Update an existing profile
async function updateProfile(userId, userData) {
  try {
    console.log(`Updating profile for ${userData.email} (${userId})...`);

    // Update profile record
    const { error } = await supabase
      .from('profiles')
      .update({
        name: userData.name,
        role: userData.role,
        dealership_id: userData.dealership_id,
      })
      .eq('id', userId);

    if (error) {
      console.error(`Error updating profile for ${userData.email}:`, error);
    } else {
      console.log(`Profile updated for ${userData.email}`);
    }
  } catch (error) {
    console.error(`Error in updateProfile for ${userData.email}:`, error);
  }
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
