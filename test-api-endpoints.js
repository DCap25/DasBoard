// API Endpoint Test Script
// Run with: node test-api-endpoints.js

const fetch = require('node-fetch');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = 'http://localhost:3001';
const CREDENTIALS = {
  admin: { email: 'admin@example.com', password: 'password' },
  salesperson1: { email: 'salesperson@dealer1.com', password: 'password' },
  salesperson2: { email: 'salesperson@dealer2.com', password: 'password' },
  financeManager1: { email: 'finance@dealer1.com', password: 'password' },
  salesManager1: { email: 'salesmanager@dealer1.com', password: 'password' },
  gm1: { email: 'gm@dealer1.com', password: 'password' },
};

// Test result tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Utility functions
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function authenticate(credentials) {
  const { response, data } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

  if (response.ok && data.token) {
    return data.token;
  }
  throw new Error(`Authentication failed for ${credentials.email}`);
}

async function runTest(description, testFn) {
  console.log(chalk.blue(`Running test: ${description}`));
  try {
    await testFn();
    console.log(chalk.green(`✓ PASSED: ${description}`));
    results.passed++;
    results.tests.push({ description, status: 'passed' });
  } catch (error) {
    console.log(chalk.red(`✗ FAILED: ${description}`));
    console.log(chalk.red(`  Error: ${error.message}`));
    results.failed++;
    results.tests.push({ description, status: 'failed', error: error.message });
  }
}

// Test Suite
async function runTests() {
  console.log(chalk.yellow('======================================'));
  console.log(chalk.yellow('      API ENDPOINT TEST SUITE'));
  console.log(chalk.yellow('======================================'));

  // Authentication Tests
  await runTest('Authentication - Valid Login', async () => {
    const { response, data } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS.salesperson1)
    });

    if (!response.ok || !data.token) {
      throw new Error(`Login failed with status ${response.status}`);
    }
  });

  await runTest('Authentication - Invalid Login', async () => {
    const { response } = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrongpassword' })
    });

    if (response.ok) {
      throw new Error('Login should have failed but succeeded');
    }
  });

  await runTest('Authentication - Signup with New User', async () => {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User',
      role: 'salesperson',
      dealership_id: 1
    };

    const { response, data } = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(newUser)
    });

    if (!response.ok || !data.token) {
      throw new Error(`Signup failed with status ${response.status}`);
    }
  });

  // Sales Data Tests
  const salesToken = await authenticate(CREDENTIALS.salesperson1);
  const salesperson2Token = await authenticate(CREDENTIALS.salesperson2);

  await runTest('Sales - Get Sales (Tenant Isolation)', async () => {
    const { data: dealer1Sales } = await apiRequest('/api/sales', {
      headers: { Authorization: `Bearer ${salesToken}` }
    });

    const { data: dealer2Sales } = await apiRequest('/api/sales', {
      headers: { Authorization: `Bearer ${salesperson2Token}` }
    });

    // Verify both users get different sales data based on their dealership
    if (!dealer1Sales.length || !dealer2Sales.length) {
      throw new Error('Expected sales data for both dealerships');
    }

    // Check that the dealership IDs are correct in each dataset
    const dealer1HasOnlyDealer1Data = dealer1Sales.every(sale => sale.dealership_id === 1);
    const dealer2HasOnlyDealer2Data = dealer2Sales.every(sale => sale.dealership_id === 2);

    if (!dealer1HasOnlyDealer1Data || !dealer2HasOnlyDealer2Data) {
      throw new Error('Tenant isolation failed - users can see data from other dealerships');
    }
  });

  await runTest('Sales - Create New Sale', async () => {
    const newSale = {
      customer_name: 'Test Customer',
      vehicle_type: 'New SUV',
      sale_date: new Date().toISOString().split('T')[0],
      sale_amount: 35000,
      status: 'pending'
    };

    const { response, data } = await apiRequest('/api/sales', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: JSON.stringify(newSale)
    });

    if (!response.ok || !data.id) {
      throw new Error(`Creating sale failed with status ${response.status}`);
    }
  });

  // F&I Data Tests
  const financeToken = await authenticate(CREDENTIALS.financeManager1);

  await runTest('F&I - Get F&I Details', async () => {
    const { response, data } = await apiRequest('/api/fni', {
      headers: { Authorization: `Bearer ${financeToken}` }
    });

    if (!response.ok || !Array.isArray(data)) {
      throw new Error(`Getting F&I details failed with status ${response.status}`);
    }
  });

  await runTest('F&I - Create New F&I Detail', async () => {
    const newFni = {
      sale_id: 1, // Assuming sale ID 1 exists
      product_type: 'Extended Warranty',
      amount: 2500,
      commission_amount: 500
    };

    const { response, data } = await apiRequest('/api/fni', {
      method: 'POST',
      headers: { Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify(newFni)
    });

    if (!response.ok || !data.id) {
      throw new Error(`Creating F&I detail failed with status ${response.status}`);
    }
  });

  // Metrics Tests
  const salesManagerToken = await authenticate(CREDENTIALS.salesManager1);

  await runTest('Metrics - Get Metrics', async () => {
    const { response, data } = await apiRequest('/api/metrics', {
      headers: { Authorization: `Bearer ${salesManagerToken}` }
    });

    if (!response.ok || !Array.isArray(data)) {
      throw new Error(`Getting metrics failed with status ${response.status}`);
    }
  });

  // Access Control Tests
  await runTest('Access Control - Salesperson Cannot Access Admin Data', async () => {
    const { response } = await apiRequest('/data/users', {
      headers: { Authorization: `Bearer ${salesToken}` }
    });

    if (response.ok) {
      throw new Error('Salesperson should not have access to users data but request succeeded');
    }
  });

  const adminToken = await authenticate(CREDENTIALS.admin);

  await runTest('Access Control - Admin Can Access All Dealerships', async () => {
    const { response, data } = await apiRequest('/data/dealerships', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (!response.ok || !Array.isArray(data) || data.length < 2) {
      throw new Error('Admin should have access to all dealerships');
    }
  });

  // Generic Data Table Tests
  await runTest('Data Tables - Get Dealerships', async () => {
    const { response, data } = await apiRequest('/data/dealerships', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (!response.ok || !Array.isArray(data)) {
      throw new Error(`Getting dealerships failed with status ${response.status}`);
    }
  });

  // Print test summary
  console.log(chalk.yellow('\n======================================'));
  console.log(chalk.yellow('           TEST SUMMARY'));
  console.log(chalk.yellow('======================================'));
  console.log(chalk.green(`✓ Passed: ${results.passed}`));
  console.log(chalk.red(`✗ Failed: ${results.failed}`));
  console.log(chalk.blue(`- Skipped: ${results.skipped}`));
  console.log(chalk.yellow('======================================'));

  // Return results for potential further processing
  return results;
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed to run:', error);
  process.exit(1);
}); 