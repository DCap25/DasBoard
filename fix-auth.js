// Authentication Fix Script
// Copy and paste this ENTIRE script into your browser console

console.log('🔧 FIXING AUTHENTICATION ISSUES...');

// Step 1: Clear ALL existing authentication data
console.log('Step 1: Clearing all auth data...');
localStorage.clear();
sessionStorage.clear();

// Step 2: Set up proper test user
console.log('Step 2: Setting up test user...');
const testUser = {
  id: 'test-finance-user-123',
  email: 'finance@test.com',
  role: 'finance_manager',
  dealership_id: 1,
  authenticated: true,
  created_at: new Date().toISOString(),
  user_metadata: {
    role: 'finance_manager',
    dealership_id: 1,
  },
};

// Store user in multiple locations to ensure compatibility
localStorage.setItem('directAuthUser', JSON.stringify(testUser));
localStorage.setItem('dashboardSelectorUser', JSON.stringify(testUser));

// Step 3: Set up Supabase auth simulation
console.log('Step 3: Setting up Supabase auth simulation...');
const supabaseSession = {
  access_token: 'test_token_123',
  refresh_token: 'test_refresh_123',
  expires_in: 3600,
  token_type: 'bearer',
  user: testUser,
};

localStorage.setItem(
  'sb-iugjtokydvbcvmrpeziv-auth-token',
  JSON.stringify({
    access_token: 'test_token_123',
    refresh_token: 'test_refresh_123',
    expires_at: Date.now() + 3600000,
    user: testUser,
  })
);

// Step 4: Set authentication flags
console.log('Step 4: Setting auth flags...');
localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('authCheckComplete', 'true');

// Step 5: Create test deal data
console.log('Step 5: Creating test deal data...');
const testDeals = [
  {
    id: 'deal-001',
    customer: 'John Smith',
    vehicle: '2024 Toyota Camry LE',
    vin: '1234567890ABCDEFG',
    saleDate: new Date().toISOString().split('T')[0],
    salesperson: 'Mike Johnson',
    amount: 35000,
    status: 'Completed',
    products: ['Extended Warranty', 'GAP Insurance', 'Paint Protection'],
    profit: 2500,
    back_end_gross: 2500,
    created_at: new Date().toISOString(),
  },
  {
    id: 'deal-002',
    customer: 'Sarah Wilson',
    vehicle: '2024 Honda Accord Sport',
    vin: '9876543210ZYXWVUT',
    saleDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    salesperson: 'Lisa Brown',
    amount: 42000,
    status: 'Completed',
    products: ['Extended Warranty', 'Tire Protection'],
    profit: 1800,
    back_end_gross: 1800,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

localStorage.setItem('singleFinanceDeals', JSON.stringify(testDeals));
localStorage.setItem('financeDeals', JSON.stringify(testDeals));

// Step 6: Force auth context refresh
console.log('Step 6: Forcing auth refresh...');

// Create a custom event to trigger auth refresh
const authEvent = new CustomEvent('forceAuthRefresh', {
  detail: {
    user: testUser,
    authenticated: true,
  },
});
window.dispatchEvent(authEvent);

// Step 7: Override window functions for debugging
console.log('Step 7: Setting up debug functions...');
window.forceReload = () => {
  console.log('🔄 Force reloading page...');
  window.location.reload();
};

window.testAuth = () => {
  console.log('Current Auth State:', {
    directAuthUser: localStorage.getItem('directAuthUser'),
    isAuthenticated: localStorage.getItem('isAuthenticated'),
    authCheckComplete: localStorage.getItem('authCheckComplete'),
    currentPath: window.location.pathname,
  });
};

window.goToFinanceDashboard = () => {
  console.log('📊 Navigating to finance dashboard...');
  window.location.href = '/dashboard/finance';
};

window.goToSingleFinanceDashboard = () => {
  console.log('📊 Navigating to single finance dashboard...');
  window.location.href = '/dashboard/single-finance';
};

console.log('✅ Authentication fix complete!');
console.log('📋 Available functions:');
console.log('- window.testAuth() - Check current auth state');
console.log('- window.forceReload() - Force page reload');
console.log('- window.goToFinanceDashboard() - Go to finance dashboard');
console.log('- window.goToSingleFinanceDashboard() - Go to single finance dashboard');

console.log('🎯 Now run: window.forceReload() or refresh the page manually');
