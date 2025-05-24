// Script to update the role of a test user
import { createClient } from '@supabase/supabase-js';

// Supabase connection info
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration for the users to update - Note: Use valid roles from profiles table check
const usersToUpdate = [
  {
    email: 'group1.admin@exampletest.com',
    password: 'Password123!',
    name: 'Group Admin User',
    // Must use a role that is valid in the profiles table
    role: 'admin', // Using 'admin' as a substitute for 'dealer_group_admin'
    dealership_id: 1,
    metadata: {
      role: 'dealer_group_admin', // Keep the real role in metadata
      is_group_admin: true,
    },
  },
  {
    email: 'jp@exampletest.com',
    password: 'Password123!',
    name: 'JP Admin User',
    role: 'dealership_admin',
    dealership_id: 1,
  },
];

// Update profile role for a user
async function updateUserRole(userConfig) {
  try {
    console.log(`Starting role update for ${userConfig.email}...`);

    // Sign in as the user
    console.log(`Signing in as ${userConfig.email}...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userConfig.email,
      password: userConfig.password,
    });

    if (signInError) {
      console.error(`Sign in failed for ${userConfig.email}:`, signInError.message);
      return;
    }

    console.log(`Successfully signed in as ${userConfig.email}`);
    const userId = signInData.user.id;

    // Update the profile with the new role
    console.log(`Updating profile role for ${userConfig.email} to ${userConfig.role}...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: userConfig.role,
        name:
          userConfig.name || signInData.user.user_metadata?.name || userConfig.email.split('@')[0],
      })
      .eq('id', userId);

    if (profileError) {
      console.error(`Error updating profile:`, profileError.message);
    } else {
      console.log(`Profile role updated for ${userConfig.email}`);
    }

    // Update the user metadata in auth with the actual desired role and group_admin flag
    console.log(
      `Updating user metadata with actual role: ${userConfig.metadata?.role || userConfig.role}...`
    );
    const { error: metadataError } = await supabase.auth.updateUser({
      data: userConfig.metadata || { role: userConfig.role },
    });

    if (metadataError) {
      console.error(`Error updating user metadata:`, metadataError.message);
    } else {
      console.log(`User metadata updated for ${userConfig.email}`);
    }

    // Get updated profile information
    const { data: updatedProfile, error: updatedProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (updatedProfileError) {
      console.error(`Error getting updated profile:`, updatedProfileError.message);
    } else {
      console.log(`Updated profile for ${userConfig.email}:`, {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        role: updatedProfile.role,
        dealership_id: updatedProfile.dealership_id,
        metadata: signInData.user.user_metadata,
      });
    }

    // Sign out
    await supabase.auth.signOut();
    console.log(`Signed out`);

    console.log(`Role update completed for ${userConfig.email}`);
    console.log('----------------------------------');
  } catch (error) {
    console.error(`Error updating role:`, error);
    console.log('----------------------------------');
  }
}

// Main function
async function main() {
  try {
    // Check connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');

    // Update roles for all users
    for (const user of usersToUpdate) {
      await updateUserRole(user);
    }

    console.log('All role updates completed.');
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
});
