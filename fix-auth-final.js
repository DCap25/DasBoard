// Comprehensive Authentication Fix Script
// Paste this into your browser console (F12 -> Console)

console.log('🔧 Starting comprehensive authentication fix...');

// Clear all existing authentication data
localStorage.clear();
sessionStorage.clear();

// Test user data from Supabase
const testUser = {
  id: '12345678-1234-1234-1234-123456789abc',
  email: 'testfinance@dasboard.com',
  role: 'finance_manager',
  dealership_id: 2,
  name: 'Test Finance Manager',
  is_test_account: true
};

// Create comprehensive authentication data
const authSession = {
  access_token: 'test-jwt-token-' + Date.now(),
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: testUser
};

// Set up Supabase authentication
localStorage.setItem('sb-iugjtokydvbcvmrpeziv-auth-token', JSON.stringify(authSession));

// Set up direct authentication
localStorage.setItem('directAuthUser', JSON.stringify(testUser));
localStorage.setItem('directAuthToken', `test-token-${Date.now()}`);

// Set up session storage
sessionStorage.setItem('user', JSON.stringify(testUser));
sessionStorage.setItem('authToken', authSession.access_token);

// Set authentication flags
localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('hasValidSession', 'true');

// Create test deals data
const testDeals = [
  {
    id: 'deal-1',
    customer: 'Johnson, Mike',
    vehicle: '2024 Toyota Camry',
    amount: 28500,
    status: 'Funded',
    profit: 1550,
    saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'deal-2',
    customer: 'Smith, Sarah', 
    vehicle: '2023 Honda Civic',
    amount: 22800,
    status: 'Pending',
    profit: 1175,
    saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: 'deal-3',
    customer: 'Williams, John',
    vehicle: '2024 Ford F-150', 
    amount: 42000,
    status: 'Funded',
    profit: 2250,
    saleDate: new Date().toISOString().split('T')[0]
  }
];

localStorage.setItem('financeManagerDeals', JSON.stringify(testDeals));

console.log('✅ Authentication setup complete!');
console.log('📊 Test user:', testUser);
console.log('📈 Test deals loaded:', testDeals.length);

// Force page reload
setTimeout(() => {
  console.log('🔄 Reloading page...');
  window.location.reload();
}, 1000); 