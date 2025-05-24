/**
 * Supabase Schema Check Script
 *
 * This script checks if the required tables exist in the Supabase database
 * and creates them if they don't.
 */
const { createClient } = require('@supabase/supabase-js');

// Das Board Master config
const SUPABASE_URL = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4';

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function to check if a table exists
async function tableExists(tableName) {
  try {
    // Query the information_schema to check if the table exists
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);

    if (error) {
      console.error(`Error checking if table exists: ${tableName}`, error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error(`Exception checking if table exists: ${tableName}`, error);
    return false;
  }
}

// Helper function to execute SQL
async function executeSQL(sql, description) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error(`❌ Error ${description}:`, error);
      return false;
    }

    console.log(`✅ Successfully ${description}`);
    return true;
  } catch (error) {
    console.error(`❌ Exception ${description}:`, error);
    return false;
  }
}

// Function to create dealership_groups table
async function createDealershipGroupsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS dealership_groups (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  return executeSQL(sql, 'creating dealership_groups table');
}

// Function to create dealerships table
async function createDealershipsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS dealerships (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      zip VARCHAR(20),
      phone VARCHAR(20),
      group_id INTEGER REFERENCES dealership_groups(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  return executeSQL(sql, 'creating dealerships table');
}

// Function to check RLS policies
async function checkRLSPolicies() {
  try {
    // Check RLS status for tables
    const tables = ['dealership_groups', 'dealerships', 'roles'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', table);

      if (error) {
        console.error(`❌ Error checking RLS for ${table}:`, error);
      } else if (data && data.length > 0) {
        console.log(`Table ${table} RLS: ${data[0].rowsecurity ? 'Enabled' : 'Disabled'}`);
      } else {
        console.log(`Table ${table} not found in pg_tables`);
      }
    }
  } catch (error) {
    console.error('❌ Exception checking RLS policies:', error);
  }
}

// Function to disable RLS on tables
async function disableRLS(tableName) {
  const sql = `ALTER TABLE ${tableName} DISABLE ROW LEVEL SECURITY;`;
  return executeSQL(sql, `disabling RLS on ${tableName}`);
}

// Main function
async function main() {
  console.log('==================================');
  console.log('Supabase Schema Check');
  console.log('==================================\n');

  // Check if tables exist
  const dealershipGroupsExists = await tableExists('dealership_groups');
  const dealershipsExists = await tableExists('dealerships');
  const rolesExists = await tableExists('roles');

  console.log(`dealership_groups table exists: ${dealershipGroupsExists}`);
  console.log(`dealerships table exists: ${dealershipsExists}`);
  console.log(`roles table exists: ${rolesExists}`);

  // Create tables if they don't exist
  if (!dealershipGroupsExists) {
    await createDealershipGroupsTable();
  }

  if (!dealershipsExists) {
    await createDealershipsTable();
  }

  // Check RLS policies
  console.log('\nChecking Row Level Security policies...');
  await checkRLSPolicies();

  // Disable RLS if needed (uncomment to use)
  /*
  console.log('\nDisabling Row Level Security...');
  if (dealershipGroupsExists) await disableRLS('dealership_groups');
  if (dealershipsExists) await disableRLS('dealerships');
  if (rolesExists) await disableRLS('roles');
  */

  console.log('\n==================================');
  console.log('Schema check completed');
  console.log('==================================');
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
});
