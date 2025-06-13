// SIMPLE AUTHENTICATION FIX
// Copy and paste this ENTIRE script into your browser console

console.log('🔧 SIMPLE AUTH FIX - STARTING...');

// Step 1: Clear everything
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared all storage');

// Step 2: Create test user
const testUser = {
  id: 'finance-user-123',
  email: 'finance@test.com',
  role: 'finance_manager',
  dealership_id: 1,
  authenticated: true,
  created_at: new Date().toISOString(),
};

// Step 3: Store user data
localStorage.setItem('directAuthUser', JSON.stringify(testUser));
console.log('✅ Set directAuthUser:', testUser);

// Step 4: Set auth flags
localStorage.setItem('isAuthenticated', 'true');
localStorage.setItem('authCheckComplete', 'true');
console.log('✅ Set auth flags');

// Step 5: Create test deals
const testDeals = [
  {
    id: 'deal-001',
    customer: 'John Smith',
    vehicle: '2024 Toyota Camry',
    vin: 'TEST123456789',
    saleDate: new Date().toISOString().split('T')[0],
    salesperson: 'Mike Johnson',
    amount: 35000,
    status: 'Completed',
    products: ['Extended Warranty', 'GAP Insurance'],
    profit: 2500,
    back_end_gross: 2500,
    created_at: new Date().toISOString(),
  },
];

localStorage.setItem('singleFinanceDeals', JSON.stringify(testDeals));
localStorage.setItem('financeDeals', JSON.stringify(testDeals));
console.log('✅ Set test deals');

// Step 6: Override window authentication check
window.isAuthenticated = () => true;
window.getCurrentUser = () => testUser;
console.log('✅ Set window auth functions');

// Step 7: Force reload
console.log('🔄 RELOADING PAGE IN 2 SECONDS...');
setTimeout(() => {
  window.location.reload();
}, 2000);

console.log('✅ AUTH FIX COMPLETE - PAGE WILL RELOAD');
