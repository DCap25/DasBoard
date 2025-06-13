// Comprehensive Authentication Fix Script
// This script will properly set up authentication for the Finance Manager Dashboard

console.log('🔧 Starting comprehensive authentication fix...');

// Clear all existing authentication data
localStorage.clear();
sessionStorage.clear();

// Remove any Supabase session data
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('supabase')) {
    localStorage.removeItem(key);
  }
});

Object.keys(sessionStorage).forEach(key => {
  if (key.startsWith('supabase')) {
    sessionStorage.removeItem(key);
  }
});

// Test user data from Supabase
const testUser = {
  id: '12345678-1234-1234-1234-123456789abc',
  email: 'testfinance@dasboard.com',
  role: 'finance_manager',
  dealership_id: 2,
  name: 'Test Finance Manager',
  is_test_account: true,
};

// Create comprehensive authentication data
const authSession = {
  access_token:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMCwidXNlcl9pZCI6IjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OWFiYyIsImVtYWlsIjoidGVzdGZpbmFuY2VAZGFzYm9hcmQuY29tIiwicm9sZSI6ImZpbmFuY2VfbWFuYWdlciJ9.test-signature',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: {
    id: testUser.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: testUser.email,
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    user_metadata: {
      sub: testUser.id,
      name: testUser.name,
      role: testUser.role,
      email: testUser.email,
      dealership_id: testUser.dealership_id,
      email_verified: true,
      phone_verified: false,
      is_test_account: true,
    },
    identities: [
      {
        id: testUser.id,
        user_id: testUser.id,
        identity_data: {
          sub: testUser.id,
          email: testUser.email,
        },
        provider: 'email',
        last_sign_in_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Set up Supabase authentication
const supabaseAuthKey = `sb-iugjtokydvbcvmrpeziv-auth-token`;
localStorage.setItem(supabaseAuthKey, JSON.stringify(authSession));

// Set up direct authentication
localStorage.setItem('directAuthUser', JSON.stringify(testUser));
localStorage.setItem('directAuthToken', `test-token-${Date.now()}`);
localStorage.setItem('directAuthRole', testUser.role);
localStorage.setItem('directAuthDealershipId', testUser.dealership_id.toString());

// Set up session storage
sessionStorage.setItem('user', JSON.stringify(testUser));
sessionStorage.setItem('authToken', authSession.access_token);
sessionStorage.setItem('userRole', testUser.role);

// Set up application-specific user data
localStorage.setItem('user', JSON.stringify(testUser));
localStorage.setItem('authUser', JSON.stringify(testUser));
localStorage.setItem('currentUser', JSON.stringify(testUser));

// Set authentication flags
localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('hasValidSession', 'true');
localStorage.setItem('authState', 'authenticated');

// Create test deals data for the dashboard
const testDeals = [
  {
    id: 'deal-1',
    customer: 'Johnson, Mike',
    vehicle: '2024 Toyota Camry',
    vin: '12345678',
    saleDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    salesperson: 'Test Finance Manager',
    amount: 28500,
    status: 'Funded',
    products: ['VSC', 'PPM', 'Paint Protection'],
    profit: 1550,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stock_number: 'ST001',
    deal_type: 'Finance',
    front_end_gross: 2500,
    total_fi_profit: 1550,
  },
  {
    id: 'deal-2',
    customer: 'Smith, Sarah',
    vehicle: '2023 Honda Civic',
    vin: '87654321',
    saleDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    salesperson: 'Test Finance Manager',
    amount: 22800,
    status: 'Pending',
    products: ['VSC', 'Tire & Wheel'],
    profit: 1175,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    stock_number: 'ST002',
    deal_type: 'Lease',
    front_end_gross: 1800,
    total_fi_profit: 1175,
  },
  {
    id: 'deal-3',
    customer: 'Williams, John',
    vehicle: '2024 Ford F-150',
    vin: '11223344',
    saleDate: new Date().toISOString().split('T')[0],
    salesperson: 'Test Finance Manager',
    amount: 42000,
    status: 'Funded',
    products: ['VSC', 'PPM', 'Paint Protection', 'Tire & Wheel'],
    profit: 2250,
    created_at: new Date().toISOString(),
    stock_number: 'ST003',
    deal_type: 'Cash',
    front_end_gross: 3200,
    total_fi_profit: 2250,
  },
];

// Store deals data
localStorage.setItem('financeManagerDeals', JSON.stringify(testDeals));
localStorage.setItem('singleFinanceDeals', JSON.stringify(testDeals));
localStorage.setItem('dashboardDeals', JSON.stringify(testDeals));

// Set up metrics data
const metricsData = {
  totalDeals: testDeals.length,
  totalProfit: testDeals.reduce((sum, deal) => sum + deal.profit, 0),
  avgProfit: testDeals.reduce((sum, deal) => sum + deal.profit, 0) / testDeals.length,
  fundedDeals: testDeals.filter(deal => deal.status === 'Funded').length,
  pendingDeals: testDeals.filter(deal => deal.status === 'Pending').length,
  monthlyDeals: testDeals.length,
  monthlyProfit: testDeals.reduce((sum, deal) => sum + deal.profit, 0),
};

localStorage.setItem('financeMetrics', JSON.stringify(metricsData));

// Set application state
localStorage.setItem('appInitialized', 'true');
localStorage.setItem('authContextReady', 'true');

// Clear any error states
localStorage.removeItem('authError');
localStorage.removeItem('loginError');

console.log('✅ Authentication setup complete!');
console.log('📊 Test user:', testUser);
console.log('📈 Test deals loaded:', testDeals.length);
console.log('💰 Total profit:', metricsData.totalProfit);
console.log('🎯 Now you can navigate to:');
console.log('   - /dashboard/finance');
console.log('   - /dashboard/single-finance');
console.log('   - /finance-manager/log-deal');

// Store configuration for debugging
window.testAuthData = {
  user: testUser,
  session: authSession,
  deals: testDeals,
  metrics: metricsData,
};

console.log('🔍 Debug data available at window.testAuthData');

// Force page reload to apply changes
setTimeout(() => {
  console.log('🔄 Reloading page to apply authentication...');
  window.location.reload();
}, 1000);
