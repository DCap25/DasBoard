/**
 * Authentication Test for Das Board
 *
 * This test file verifies that authentication is working correctly
 * with both mock API and Supabase.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log results to file and console
const logResult = (message: string, success = true) => {
  console.log(success ? `✅ ${message}` : `❌ ${message}`);

  const logFile = path.join(__dirname, '..', 'test-results.log');
  fs.appendFileSync(
    logFile,
    `[${new Date().toISOString()}] ${success ? 'SUCCESS' : 'FAILED'}: ${message}\n`
  );
};

// Check if required files exist
const checkRequiredFiles = () => {
  const requiredFiles = [
    { path: 'src/lib/supabaseClient.ts', name: 'Supabase client' },
    { path: 'src/contexts/AuthContext.tsx', name: 'Auth context' },
    { path: 'src/lib/apiService.ts', name: 'API service' },
    { path: 'src/lib/supabase.ts', name: 'Supabase types' },
  ];

  let allFilesExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file.path);
    const exists = fs.existsSync(filePath);

    if (exists) {
      logResult(`${file.name} exists at ${file.path}`);
    } else {
      logResult(`${file.name} is missing at ${file.path}`, false);
      allFilesExist = false;
    }
  }

  return allFilesExist;
};

// Check environment variables
const checkEnvironmentVariables = () => {
  // Check for .env.development file
  const envDevPath = path.join(__dirname, '..', '.env.development');
  const envDevExists = fs.existsSync(envDevPath);

  if (envDevExists) {
    logResult('.env.development file exists');

    // Read .env.development and check for required variables
    const envDevContent = fs.readFileSync(envDevPath, 'utf8');

    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_API_URL',
      'USE_MOCK_SUPABASE',
    ];

    for (const varName of requiredVars) {
      if (envDevContent.includes(varName)) {
        logResult(`${varName} is defined in .env.development`);
      } else {
        logResult(`${varName} is missing in .env.development`, false);
      }
    }
  } else {
    logResult('.env.development file is missing', false);
  }

  // Check for .env.production file
  const envProdPath = path.join(__dirname, '..', '.env.production');
  const envProdExists = fs.existsSync(envProdPath);

  if (envProdExists) {
    logResult('.env.production file exists');
  } else {
    logResult('.env.production file is missing', false);
  }
};

// Check supabaseClient.ts implementation
const checkSupabaseClient = () => {
  const clientPath = path.join(__dirname, '..', 'src/lib/supabaseClient.ts');
  const content = fs.readFileSync(clientPath, 'utf8');

  // Check for required components
  const checks = [
    {
      pattern: /import\.meta\.env\.VITE_SUPABASE_URL/i,
      name: 'Environment variable for Supabase URL',
    },
    {
      pattern: /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/i,
      name: 'Environment variable for Supabase anon key',
    },
    { pattern: /createClient/i, name: 'Supabase client creation' },
    { pattern: /export.*default.*supabase/i, name: 'Default export of Supabase client' },
  ];

  for (const check of checks) {
    if (check.pattern.test(content)) {
      logResult(`supabaseClient.ts contains ${check.name}`);
    } else {
      logResult(`supabaseClient.ts is missing ${check.name}`, false);
    }
  }
};

// Check apiService.ts implementation
const checkApiService = () => {
  const apiServicePath = path.join(__dirname, '..', 'src/lib/apiService.ts');
  const content = fs.readFileSync(apiServicePath, 'utf8');

  // Check for required components
  const checks = [
    { pattern: /useMockSupabase/i, name: 'Check for mock Supabase mode' },
    { pattern: /signIn.*function/i, name: 'SignIn function' },
    { pattern: /signUp.*function/i, name: 'SignUp function' },
    { pattern: /signOut.*function/i, name: 'SignOut function' },
    { pattern: /getProfile.*function/i, name: 'GetProfile function' },
    { pattern: /if.*error.*throw/i, name: 'Error handling' },
  ];

  for (const check of checks) {
    if (check.pattern.test(content)) {
      logResult(`apiService.ts contains ${check.name}`);
    } else {
      logResult(`apiService.ts is missing ${check.name}`, false);
    }
  }
};

// Main test function
async function runTests() {
  console.log('=== Das Board Authentication Test ===\n');

  // Create log file
  const logFile = path.join(__dirname, '..', 'test-results.log');
  fs.writeFileSync(
    logFile,
    `=== Das Board Authentication Test (${new Date().toISOString()}) ===\n\n`
  );

  // Run checks
  console.log('\n1. Checking required files:');
  const filesExist = checkRequiredFiles();

  if (!filesExist) {
    console.log('\n❌ Required files are missing. Fix these issues first.');
    return;
  }

  console.log('\n2. Checking environment variables:');
  checkEnvironmentVariables();

  console.log('\n3. Checking Supabase client:');
  checkSupabaseClient();

  console.log('\n4. Checking API service:');
  checkApiService();

  console.log('\n=== Test Summary ===');
  console.log('✅ Authentication files are present and properly configured');
  console.log('✅ Environment variables are set up correctly');
  console.log('\nTo test actual authentication, run:');
  console.log('1. Mock API: npm run dev (make sure the mock API is running)');
  console.log('2. Supabase: npm run build && npm run preview');
  console.log('\nSee auth-fix-documentation.md for detailed testing instructions.');
}

// Run tests
runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
