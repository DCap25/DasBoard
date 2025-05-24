// Script to execute SQL commands to create test users
import { createClient } from '@supabase/supabase-js';

// Supabase connection info
const supabaseUrl = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create auto-verify test emails function
const createAutoVerifyFunction = async () => {
  try {
    console.log('Creating auto_verify_test_emails function...');

    // Define the SQL for creating the function
    const functionSql = `
    CREATE OR REPLACE FUNCTION public.auto_verify_test_emails()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Check if the email is a test email (@exampletest.com)
      IF NEW.email LIKE '%@exampletest.com' OR NEW.email LIKE '%@example.com' THEN
        -- Update the user's email verification status
        UPDATE auth.users
        SET email_confirmed_at = now(),
            updated_at = now()
        WHERE id = NEW.id;
        
        -- Log the auto-verification
        RAISE NOTICE 'Auto-verified test email: %', NEW.email;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: functionSql });

    if (error) {
      console.error('Error creating function:', error);
      return false;
    }

    console.log('Function created successfully');
    return true;
  } catch (error) {
    console.error('Error creating function:', error);
    return false;
  }
};

// Create trigger for auto-verifying test emails
const createAutoVerifyTrigger = async () => {
  try {
    console.log('Creating auto_verify_test_emails_trigger...');

    // Define the SQL for creating the trigger
    const triggerSql = `
    DROP TRIGGER IF EXISTS auto_verify_test_emails_trigger ON auth.users;
    CREATE TRIGGER auto_verify_test_emails_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_verify_test_emails();
    `;

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: triggerSql });

    if (error) {
      console.error('Error creating trigger:', error);
      return false;
    }

    console.log('Trigger created successfully');
    return true;
  } catch (error) {
    console.error('Error creating trigger:', error);
    return false;
  }
};

// Create test users
const createTestUsers = async () => {
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

  console.log('Creating test users...');

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);

      // Create user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
            dealership_id: user.dealership_id,
          },
        },
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
        continue;
      }

      console.log(`User created: ${user.email} (ID: ${data.user.id})`);

      // Create profile entry
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        dealership_id: user.dealership_id,
        is_test_account: true,
      });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
      } else {
        console.log(`Profile created for ${user.email}`);
      }

      // Force email verification for test users
      try {
        // Try to directly verify the email using RPC if available
        const { error: verifyError } = await supabase.rpc('force_confirm_email', {
          user_id_param: data.user.id,
        });

        if (verifyError) {
          console.warn(`Could not force verify ${user.email}:`, verifyError);
        } else {
          console.log(`Email verified for ${user.email}`);
        }
      } catch (verifyError) {
        console.warn(`Error in verification process for ${user.email}:`, verifyError);
      }
    } catch (error) {
      console.error(`Error in user creation process for ${user.email}:`, error);
    }
  }
};

// Main function
async function main() {
  console.log('Starting test user setup...');

  // First try to list all users to verify connection
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) throw error;
    console.log('Successfully connected to Supabase');
  } catch (error) {
    console.error('Could not connect to Supabase:', error);
    return;
  }

  // Check if 'exec_sql' RPC function exists
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    if (error) {
      console.error('exec_sql RPC function not available. Cannot execute SQL directly.');
      console.log('Will use alternative auth API methods to create users.');
    } else {
      console.log('exec_sql RPC function available. Can execute SQL directly.');

      // Create function and trigger for auto-verifying test emails
      await createAutoVerifyFunction();
      await createAutoVerifyTrigger();
    }
  } catch (error) {
    console.log('Will use auth API to create users.');
  }

  // Create test users
  await createTestUsers();

  console.log('Test user setup completed.');
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
});
