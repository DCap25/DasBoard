// Script to check the schema of the profiles table
import { createClient } from '@supabase/supabase-js';

// Supabase connection info
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Main function to check the schema
async function checkSchema() {
  try {
    console.log('Checking profiles schema...');

    // First try to get info about the role column constraints
    const { data: roleLookup, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .limit(20);

    if (roleError) {
      console.error('Error getting roles:', roleError.message);
    } else {
      // Collect unique roles
      const uniqueRoles = new Set();
      roleLookup.forEach(row => {
        if (row.role) uniqueRoles.add(row.role);
      });

      console.log('Roles found in profiles table:', Array.from(uniqueRoles));
    }

    // Check if we can see all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(20);

    if (profilesError) {
      console.error('Error getting profiles:', profilesError.message);
    } else {
      console.log(`Found ${profiles.length} profiles`);

      // Check the columns present
      if (profiles.length > 0) {
        const columnNames = Object.keys(profiles[0]);
        console.log('Columns in profiles table:', columnNames);
      }
    }

    // Check table information
    try {
      // NOTE: This will only work if we have special permissions, which we probably don't
      const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', {
        table_name: 'profiles',
      });

      if (tableError) {
        console.warn('Error getting table info (expected):', tableError.message);
      } else if (tableInfo) {
        console.log('Table info:', tableInfo);
      }
    } catch (error) {
      console.warn('Error calling RPC (expected):', error.message);
    }
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

// Main function
async function main() {
  try {
    // Check connection
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');

    // Check schema
    await checkSchema();
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
});
