// Test User Setup Script
// Run this in browser console to set up a test user

console.log('=== SETTING UP TEST USER ===');

// Create test user for finance manager
const testUser = {
  id: 'test-finance-user',
  email: 'finance@test.com',
  role: 'finance_manager',
  dealership_id: 1,
  authenticated: true,
  created_at: new Date().toISOString(),
};

// Store the test user
localStorage.setItem('directAuthUser', JSON.stringify(testUser));
console.log('✅ Test user created:', testUser);

// Create some test deal data
const testDeals = [
  {
    id: 'deal-001',
    customer: 'John Smith',
    vehicle: '2024 Toyota Camry',
    vin: '1234567890ABCDEFG',
    saleDate: new Date().toISOString().split('T')[0],
    salesperson: 'Test Sales',
    amount: 35000,
    status: 'Completed',
    products: ['Extended Warranty', 'GAP Insurance'],
    profit: 2500,
    back_end_gross: 2500,
    created_at: new Date().toISOString(),
  },
  {
    id: 'deal-002',
    customer: 'Jane Doe',
    vehicle: '2024 Honda Accord',
    vin: '0987654321ZYXWVU',
    saleDate: new Date().toISOString().split('T')[0],
    salesperson: 'Test Sales 2',
    amount: 32000,
    status: 'Completed',
    products: ['Paint Protection', 'Extended Warranty'],
    profit: 1800,
    back_end_gross: 1800,
    created_at: new Date().toISOString(),
  },
];

// Store test deals for both finance systems
localStorage.setItem('singleFinanceDeals', JSON.stringify(testDeals));
localStorage.setItem('financeDeals', JSON.stringify(testDeals));
console.log('✅ Test deals created:', testDeals);

// Refresh the page to apply changes
console.log('🔄 Refreshing page to apply changes...');
setTimeout(() => {
  window.location.reload();
}, 1000);
