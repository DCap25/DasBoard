// COMPREHENSIVE AUTHENTICATION FIX SCRIPT
// Paste this entire script into your browser console (F12 -> Console)
// This will completely bypass the authentication system and set up a working test user

console.log('🚀 Starting COMPREHENSIVE authentication fix...');

// Step 1: Clear ALL authentication data
console.log('Step 1: Clearing all authentication data...');
localStorage.clear();
sessionStorage.clear();

// Clear any Supabase-specific storage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('auth') || key.includes('user')) {
    localStorage.removeItem(key);
    console.log(`Cleared: ${key}`);
  }
});

// Step 2: Set up DirectAuth user (the system the app actually uses)
console.log('Step 2: Setting up DirectAuth user...');

const testUser = {
  id: '12345678-1234-1234-1234-123456789abc',
  email: 'testfinance@dasboard.com',
  name: 'Test Finance Manager',
  role: 'finance_manager',
  dealership_id: 2,
  is_authenticated: true,
  auth_method: 'direct',
  login_timestamp: Date.now(),
  is_test_account: true,
};

// Set DirectAuth data (what the app checks for)
localStorage.setItem('directAuthUser', JSON.stringify(testUser));
localStorage.setItem('isDirectlyAuthenticated', 'true');
localStorage.setItem('authMethod', 'direct');
localStorage.setItem('userRole', 'finance_manager');
localStorage.setItem('dealershipId', '2');

// Step 3: Set up Supabase auth data (fallback system)
console.log('Step 3: Setting up Supabase auth data...');

const supabaseSession = {
  access_token: 'test-access-token-' + Date.now(),
  refresh_token: 'test-refresh-token-' + Date.now(),
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: {
    id: testUser.id,
    email: testUser.email,
    email_confirmed_at: new Date().toISOString(),
    user_metadata: {
      role: 'finance_manager',
      dealership_id: 2,
      name: 'Test Finance Manager',
    },
    app_metadata: {
      provider: 'direct',
      role: 'finance_manager',
    },
  },
};

// Set Supabase session data
localStorage.setItem(`sb-iugjtokydvbcvmrpeziv-auth-token`, JSON.stringify(supabaseSession));

// Step 4: Create test deal data for the dashboard
console.log('Step 4: Creating test deal data...');

const testDeals = [
  {
    id: 'deal-001',
    deal_number: 'FIN-2025-001',
    customer_name: 'John Smith',
    customer: 'John Smith',
    vehicle: '2024 Honda Accord LX',
    vin: 'JH4TB2H26PC123456',
    sale_date: new Date().toISOString().split('T')[0],
    saleDate: new Date().toISOString().split('T')[0],
    salesperson: 'Test Finance Manager',
    amount: 25000,
    total_gross: 25000,
    back_end_gross: 1800,
    profit: 1800,
    status: 'funded',
    products: ['Extended Warranty', 'GAP Insurance'],
    created_at: new Date().toISOString(),
    created_by: testUser.id,
  },
  {
    id: 'deal-002',
    deal_number: 'FIN-2025-002',
    customer_name: 'Sarah Johnson',
    customer: 'Sarah Johnson',
    vehicle: '2024 Toyota Camry SE',
    vin: 'JT2BK1FK2PC654321',
    sale_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    saleDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    salesperson: 'Test Finance Manager',
    amount: 28500,
    total_gross: 28500,
    back_end_gross: 2200,
    profit: 2200,
    status: 'pending',
    products: ['Extended Warranty', 'Paint Protection'],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: testUser.id,
  },
  {
    id: 'deal-003',
    deal_number: 'FIN-2025-003',
    customer_name: 'Mike Davis',
    customer: 'Mike Davis',
    vehicle: '2024 Ford F-150 XLT',
    vin: 'JF1ZNAA19P1234567',
    sale_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    saleDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    salesperson: 'Test Finance Manager',
    amount: 42000,
    total_gross: 42000,
    back_end_gross: 2975,
    profit: 2975,
    status: 'funded',
    products: ['Extended Warranty', 'GAP Insurance', 'Tire & Wheel Protection'],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    created_by: testUser.id,
  },
];

// Store test deals in multiple formats to ensure compatibility
localStorage.setItem('singleFinanceDeals', JSON.stringify(testDeals));
localStorage.setItem('financeDeals', JSON.stringify(testDeals));
localStorage.setItem('deals', JSON.stringify(testDeals));

// Step 5: Set authentication state flags
console.log('Step 5: Setting authentication state flags...');

localStorage.setItem('authInitialized', 'true');
localStorage.setItem('userLoggedIn', 'true');
localStorage.setItem('loginTimestamp', Date.now().toString());
localStorage.setItem('sessionValid', 'true');

// Step 6: Force clear any auth loading states
console.log('Step 6: Clearing auth loading states...');

// Clear any stored loading states
sessionStorage.removeItem('authLoading');
sessionStorage.removeItem('authError');
localStorage.removeItem('authError');

// Set successful auth flags
localStorage.setItem('authSuccess', 'true');
localStorage.setItem('lastAuthCheck', Date.now().toString());

// Step 7: Display authentication status
console.log('Step 7: Authentication setup complete!');
console.log('✅ Test User Created:');
console.log('   Email: testfinance@dasboard.com');
console.log('   Role: finance_manager');
console.log('   Dealership ID: 2');
console.log('   User ID: 12345678-1234-1234-1234-123456789abc');
console.log('');
console.log('✅ Test Deals Created: 3 deals with realistic F&I data');
console.log('   Total Profit: $6,975');
console.log('   Mix of funded and pending deals');
console.log('');
console.log('🔄 Reloading page to apply changes...');

// Step 8: Force page reload to apply changes
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('Authentication fix completed! Page will reload in 1 second.');
