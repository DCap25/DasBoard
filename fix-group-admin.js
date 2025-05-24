// Script to fix the group admin account
import { createClient } from '@supabase/supabase-js';

// Supabase connection info
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration for group admin
const groupAdminEmail = 'group1.admin@exampletest.com';
const groupAdminPassword = 'Password123!';

// Main function to fix the group admin account
async function fixGroupAdmin() {
  try {
    console.log(`Starting group admin fix for ${groupAdminEmail}...`);

    // Sign in as the group admin
    console.log(`Signing in as ${groupAdminEmail}...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: groupAdminEmail,
      password: groupAdminPassword,
    });

    if (signInError) {
      console.error(`Sign in failed for ${groupAdminEmail}:`, signInError.message);
      return;
    }

    console.log(`Successfully signed in as ${groupAdminEmail}`);
    const userId = signInData.user.id;

    // Step 1: Update the profile to make it a group admin
    console.log(`Updating profile for ${groupAdminEmail} to be a group admin...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'dealer_group_admin', // Update the role
        is_group_admin: true, // Set the group admin flag
      })
      .eq('id', userId);

    if (profileError) {
      console.error(`Error updating profile:`, profileError.message);
    } else {
      console.log(`Profile updated for ${groupAdminEmail}`);
    }

    // Step 2: Update the user metadata in auth
    console.log(`Updating user metadata...`);
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        role: 'dealer_group_admin',
        is_group_admin: true,
      },
    });

    if (metadataError) {
      console.error(`Error updating user metadata:`, metadataError.message);
    } else {
      console.log(`User metadata updated for ${groupAdminEmail}`);
    }

    // Step 3: Get a dealership group to associate with this admin
    console.log(`Getting dealership groups...`);
    const { data: groups, error: groupsError } = await supabase
      .from('dealership_groups')
      .select('id, name')
      .limit(1);

    if (groupsError) {
      console.error(`Error getting dealership groups:`, groupsError.message);
    } else if (groups && groups.length > 0) {
      const groupId = groups[0].id;
      console.log(`Using dealership group: ${groups[0].name} (ID: ${groupId})`);

      // Step 4: Check if dealer_group_admins table exists
      console.log(`Checking if dealer_group_admins table exists...`);
      try {
        const { data: dga, error: dgaError } = await supabase
          .from('dealer_group_admins')
          .select('id')
          .limit(1);

        if (dgaError && dgaError.code === 'PGRST204') {
          // Table doesn't exist, skip this step
          console.log(`dealer_group_admins table doesn't exist, skipping association`);
        } else {
          // Table exists, associate the admin with the group
          console.log(`Associating admin with dealership group ${groupId}...`);
          const { error: associateError } = await supabase.from('dealer_group_admins').upsert({
            user_id: userId,
            dealer_group_id: groupId,
          });

          if (associateError) {
            console.error(`Error associating admin with group:`, associateError.message);
          } else {
            console.log(`Admin associated with dealership group ${groupId}`);
          }
        }
      } catch (error) {
        console.error(`Error checking dealer_group_admins table:`, error);
      }
    } else {
      console.log(`No dealership groups found`);
    }

    // Step 5: Get updated profile information
    const { data: updatedProfile, error: updatedProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (updatedProfileError) {
      console.error(`Error getting updated profile:`, updatedProfileError.message);
    } else {
      console.log(`Updated profile for ${groupAdminEmail}:`, {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        role: updatedProfile.role,
        dealership_id: updatedProfile.dealership_id,
        is_group_admin: updatedProfile.is_group_admin,
      });
    }

    // Sign out
    await supabase.auth.signOut();
    console.log(`Signed out`);

    console.log(`Group admin fix completed for ${groupAdminEmail}`);
  } catch (error) {
    console.error(`Error fixing group admin:`, error);
  }
}

// Main function
async function main() {
  try {
    // Check connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');

    // Fix group admin
    await fixGroupAdmin();
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
});
