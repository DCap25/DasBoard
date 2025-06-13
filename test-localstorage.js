// Test script to check localStorage deals
console.log('=== Testing localStorage for singleFinanceDeals ===');

// Check what's in localStorage
const storedDeals = localStorage.getItem('singleFinanceDeals');
console.log('Raw localStorage data:', storedDeals);

if (storedDeals) {
  try {
    const parsedDeals = JSON.parse(storedDeals);
    console.log('Parsed deals count:', parsedDeals.length);
    console.log('First deal (if exists):', parsedDeals[0]);
    console.log('All deals:', parsedDeals);
  } catch (error) {
    console.error('Error parsing stored deals:', error);
  }
} else {
  console.log('No deals found in localStorage - creating a test deal...');

  // Create a test deal
  const testDeal = {
    id: 'TEST001',
    customer_name: 'Test Customer',
    customer: 'Test Customer',
    vehicle: 'New - 2024 Toyota Camry',
    vin: 'TEST1234',
    sale_date: '2024-01-15',
    saleDate: '2024-01-15',
    salesperson: 'Self',
    amount: 2500,
    total_gross: 2500,
    status: 'pending',
    products: ['Vehicle Service Contract (VSC)', 'GAP Insurance'],
    profit: 1800,
    back_end_gross: 1800,
    created_at: new Date().toISOString(),
    dashboard_type: 'single_finance',
  };

  localStorage.setItem('singleFinanceDeals', JSON.stringify([testDeal]));
  console.log('Test deal created:', testDeal);
}

console.log('=== Test complete ===');
