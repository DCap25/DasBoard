/**
 * Supabase Configuration Script
 *
 * This script extracts the Supabase URL and anon key for each project.
 * It helps debug and set up the .env.local file.
 */
import { createClient } from '@supabase/supabase-js';

// Das Board Master config
const DAS_BOARD_MASTER_URL = 'https://iugjtokydvbcvmrpeziv.supabase.co';
const DAS_BOARD_MASTER_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQyNjI5NjYsImV4cCI6MjAyOTgzODk2Nn0.HkOUHJz-bF1kY21hfh2eZH1Wf9k0wJG1PSC5eQ4Jgjc';

// Dealership1 config
const DEALERSHIP1_URL = 'https://dijulexxrgfmaiewtavb.supabase.co';
const DEALERSHIP1_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA';

// Function to test connection to a Supabase project
async function testConnection(url, key, projectName) {
  console.log(`Testing connection to ${projectName}...`);

  try {
    const supabase = createClient(url, key);

    // Test a simple query
    const { data, error } = await supabase.from('roles').select('*').limit(1);

    if (error) {
      console.error(`❌ Connection to ${projectName} failed:`, error);
      return false;
    }

    console.log(`✅ Successfully connected to ${projectName}`);
    console.log('Sample data:', data);

    return true;
  } catch (error) {
    console.error(`❌ Error connecting to ${projectName}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Supabase Configuration Checker');
  console.log('=============================\n');

  console.log('Das Board Master configuration:');
  console.log(`URL: ${DAS_BOARD_MASTER_URL}`);
  console.log(
    `Key: ${DAS_BOARD_MASTER_KEY.substring(0, 10)}...${DAS_BOARD_MASTER_KEY.substring(
      DAS_BOARD_MASTER_KEY.length - 10
    )}`
  );

  await testConnection(DAS_BOARD_MASTER_URL, DAS_BOARD_MASTER_KEY, 'Das Board Master');

  console.log('\nDealership1 configuration:');
  console.log(`URL: ${DEALERSHIP1_URL}`);
  console.log(
    `Key: ${DEALERSHIP1_KEY.substring(0, 10)}...${DEALERSHIP1_KEY.substring(
      DEALERSHIP1_KEY.length - 10
    )}`
  );

  await testConnection(DEALERSHIP1_URL, DEALERSHIP1_KEY, 'Dealership1');

  console.log('\n.env.local Configuration:');
  console.log('```');
  console.log('# Das Board Master (Main Project)');
  console.log(`VITE_SUPABASE_URL=${DAS_BOARD_MASTER_URL}`);
  console.log(`VITE_SUPABASE_ANON_KEY=${DAS_BOARD_MASTER_KEY}`);
  console.log('');
  console.log('# Dealership1 Project');
  console.log(`VITE_DEALERSHIP1_SUPABASE_URL=${DEALERSHIP1_URL}`);
  console.log(`VITE_DEALERSHIP1_SUPABASE_ANON_KEY=${DEALERSHIP1_KEY}`);
  console.log('```');
}

// Run the main function
main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
