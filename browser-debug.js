// Browser Console Debug Script
// Copy and paste this into the browser console while on your dashboard

console.log('=== AUTHENTICATION & ROUTING DEBUG ===');

// Check localStorage for authentication data
console.log('1. Authentication Check:');
const directAuthUser = localStorage.getItem('directAuthUser');
console.log('- Direct Auth User:', directAuthUser ? JSON.parse(directAuthUser) : 'None');

// Check current location
console.log('2. Current Location:');
console.log('- Path:', window.location.pathname);
console.log('- Hash:', window.location.hash);
console.log('- Search:', window.location.search);

// Check deal data
console.log('3. Deal Data Check:');
const singleFinanceDeals = localStorage.getItem('singleFinanceDeals');
const financeDeals = localStorage.getItem('financeDeals');
console.log(
  '- Single Finance Deals:',
  singleFinanceDeals ? JSON.parse(singleFinanceDeals) : 'None'
);
console.log('- Regular Finance Deals:', financeDeals ? JSON.parse(financeDeals) : 'None');

// Test navigation function
window.testNavigation = function (path) {
  console.log(`Attempting to navigate to: ${path}`);
  try {
    window.location.href = path;
  } catch (error) {
    console.error('Navigation failed:', error);
  }
};

// Test authentication function
window.testAuth = function () {
  const user = localStorage.getItem('directAuthUser');
  if (user) {
    const parsedUser = JSON.parse(user);
    console.log('Current user role:', parsedUser.role);
    console.log('Current user dealership:', parsedUser.dealership_id);
    return parsedUser;
  } else {
    console.log('No user found in localStorage');
    return null;
  }
};

// Try to get React Router info
console.log('4. React Router Info:');
try {
  // This will only work if the app is using React Router
  const reactRouter = window.history;
  console.log('- React Router History:', reactRouter);
} catch (error) {
  console.log('- Cannot access React Router:', error.message);
}

// Check for Supabase
console.log('5. Supabase Check:');
if (window.supabase) {
  console.log('- Supabase client found');
  window.supabase.auth.getUser().then(({ data: { user }, error }) => {
    console.log('- Supabase user:', user);
    console.log('- Supabase error:', error);
  });
} else {
  console.log('- No Supabase client found');
}

console.log('=== DEBUG FUNCTIONS AVAILABLE ===');
console.log('- testNavigation("/finance-manager/log-deal") - Test navigation');
console.log('- testAuth() - Check current authentication');
console.log('=== END DEBUG ===');
