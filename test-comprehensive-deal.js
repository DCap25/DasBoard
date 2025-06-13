// Comprehensive test script for Single Finance Dashboard
console.log('=== Creating Comprehensive Test Deal ===');

// Clear existing deals first
localStorage.removeItem('singleFinanceDeals');

// Create a comprehensive test deal with all the fields needed for metrics
const comprehensiveDeal = {
  // Basic deal info
  id: 'SF1001',
  deal_number: 'SF1001',
  customer_name: 'Smith',
  customer: 'Smith', // backward compatibility
  vehicle: 'New - 2024 Toyota Camry XLE',
  vin: 'ABC12345',
  stock_number: 'ST2024001',
  sale_date: '2024-01-15',
  saleDate: '2024-01-15', // backward compatibility
  deal_type: 'Finance',
  salesperson: 'Self',
  salesperson_id: '1',
  lender: 'Toyota Financial',

  // Financial data
  front_end_gross: 500,
  back_end_gross: 2200,
  total_gross: 2700,
  amount: 2700, // backward compatibility
  profit: 2200, // backward compatibility (back end gross)
  reserve_flat: 400,

  // Individual product profits
  vsc_profit: 800,
  gap_profit: 400,
  ppm_profit: 300,
  tire_wheel_profit: 250,
  appearance_profit: 150,
  key_replacement_profit: 100,
  theft_profit: 0,
  windshield_profit: 0,
  lojack_profit: 0,
  ext_warranty_profit: 200,
  other_profit: 0,

  // Products array (for display and calculation)
  products: [
    'Vehicle Service Contract (VSC)',
    'GAP Insurance',
    'PrePaid Maintenance (PPM)',
    'Tire & Wheel Protection',
    'Appearance Protection',
    'Key Replacement',
    'Extended Warranty',
  ],

  // Status and metadata
  status: 'pending',
  notes: 'Test comprehensive deal for metrics validation',
  vsc_sold: true,
  created_by: 'test@example.com',
  created_at: new Date().toISOString(),
  dashboard_type: 'single_finance',
};

// Add a second deal for better metrics
const secondDeal = {
  id: 'SF1002',
  deal_number: 'SF1002',
  customer_name: 'Johnson',
  customer: 'Johnson',
  vehicle: 'Used - 2023 Honda Accord Sport',
  vin: 'DEF67890',
  stock_number: 'ST2024002',
  sale_date: '2024-01-20',
  saleDate: '2024-01-20',
  deal_type: 'Finance',
  salesperson: 'Self',
  salesperson_id: '2',
  lender: 'Honda Financial',

  front_end_gross: 300,
  back_end_gross: 1500,
  total_gross: 1800,
  amount: 1800,
  profit: 1500,
  reserve_flat: 250,

  vsc_profit: 600,
  gap_profit: 300,
  ppm_profit: 0,
  tire_wheel_profit: 200,
  appearance_profit: 100,
  key_replacement_profit: 0,
  theft_profit: 0,
  windshield_profit: 0,
  lojack_profit: 0,
  ext_warranty_profit: 250,
  other_profit: 0,

  products: [
    'Vehicle Service Contract (VSC)',
    'GAP Insurance',
    'Tire & Wheel Protection',
    'Appearance Protection',
    'Extended Warranty',
  ],

  status: 'funded',
  notes: 'Second test deal',
  vsc_sold: true,
  created_by: 'test@example.com',
  created_at: new Date().toISOString(),
  dashboard_type: 'single_finance',
};

// Save both deals to localStorage
const testDeals = [comprehensiveDeal, secondDeal];
localStorage.setItem('singleFinanceDeals', JSON.stringify(testDeals));

console.log('✅ Created 2 comprehensive test deals:', testDeals);
console.log('📊 Expected metrics:');
console.log('- Total Revenue:', comprehensiveDeal.back_end_gross + secondDeal.back_end_gross);
console.log('- Deals Processed:', testDeals.length);
console.log(
  '- Products Per Deal:',
  (comprehensiveDeal.products.length + secondDeal.products.length) / 2
);
console.log(
  '- PVR:',
  (comprehensiveDeal.back_end_gross + secondDeal.back_end_gross) / testDeals.length
);

// Trigger refresh if function is available
if (typeof window.refreshSingleFinanceDeals === 'function') {
  console.log('🔄 Triggering automatic refresh...');
  window.refreshSingleFinanceDeals();
} else {
  console.log('ℹ️ Manual refresh function not available, click refresh button on page');
}

console.log('=== Test Complete ===');
