/**
 * Setup Environment Variables Helper
 *
 * This script helps you set up your environment variables for the project.
 * Run this with: node setup-env.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Sample configuration
const SAMPLE_ENV = `# Das Board Master (Main Project)
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.XCNQoJbGQiXuyR_CFevro1Y8lqvh2_jmjrD181UYtY4

# Dealership1 Project
VITE_DEALERSHIP1_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co
VITE_DEALERSHIP1_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA`;

const ENV_FILE_PATH = path.join(__dirname, '.env.local');

// Check if .env.local already exists
const checkEnvFile = () => {
  try {
    return fs.existsSync(ENV_FILE_PATH);
  } catch (error) {
    console.error('Error checking for .env.local file:', error);
    return false;
  }
};

// Create .env.local file with sample content
const createEnvFile = () => {
  try {
    fs.writeFileSync(ENV_FILE_PATH, SAMPLE_ENV);
    console.log('✅ Created .env.local file with sample configuration');
    return true;
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error);
    console.log('\nPlease manually create a .env.local file with the following content:');
    console.log('\n' + SAMPLE_ENV + '\n');
    return false;
  }
};

// Display environment test tips
const displayTestingInstructions = () => {
  console.log('\n=========================================');
  console.log('Environment Testing Instructions');
  console.log('=========================================');
  console.log('1. Restart your development server:');
  console.log('   npm run dev');
  console.log('\n2. If you still see 500 errors, check your Supabase project:');
  console.log('   - Verify API keys are correct');
  console.log('   - Check if the project is active (not paused)');
  console.log('   - Verify the tables exist: dealership_groups, dealerships, roles');
  console.log('   - Check Row Level Security (RLS) settings');
  console.log('\n3. To test Supabase connection directly, run:');
  console.log('   node src/test-supabase-connection.cjs');
};

// Main function
const main = async () => {
  console.log('=========================================');
  console.log('Das Board Environment Setup');
  console.log('=========================================');

  const envExists = checkEnvFile();

  if (envExists) {
    console.log('🔍 Found existing .env.local file');

    // Create interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Ask if user wants to overwrite existing file
    rl.question(
      'Do you want to overwrite it with the sample configuration? (y/N): ',
      async answer => {
        if (answer.toLowerCase() === 'y') {
          createEnvFile();
        } else {
          console.log('✅ Keeping existing .env.local file');
        }

        displayTestingInstructions();
        rl.close();
      }
    );
  } else {
    console.log('❌ No .env.local file found');
    createEnvFile();
    displayTestingInstructions();
  }
};

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
});
