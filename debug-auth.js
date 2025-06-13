// Debug script for authentication and routing issues
// Paste this into your browser console when on the dashboard

console.log('=== AUTH DEBUG SCRIPT ===');

// Get current user from localStorage
const directAuthUser = localStorage.getItem('directAuthUser');
console.log('Direct Auth User:', directAuthUser ? JSON.parse(directAuthUser) : 'None');

// Check if we're using Supabase auth
console.log('Checking Supabase auth...');
if (window.supabase) {
  window.supabase.auth.getUser().then(({ data: { user }, error }) => {
    console.log('Supabase User:', user);
    console.log('Supabase Error:', error);
  });
}

// Test navigation to finance manager log deal
function testFinanceNavigation() {
  console.log('Testing navigation to /finance-manager/log-deal');
  console.log('Current path:', window.location.pathname);

  // Try direct navigation
  window.history.pushState({}, '', '/finance-manager/log-deal');
  console.log('Navigated to:', window.location.pathname);

  // Force reload
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Test what happens when we click the button
function testButtonClick() {
  const button =
    document.querySelector('button[onClick*="handleLogNewDealClick"]') ||
    document.querySelector('span:contains("Log New Deal")');

  if (button) {
    console.log('Found Log New Deal button:', button);
    button.click();
  } else {
    console.log('Log New Deal button not found');
    console.log('Available buttons:', document.querySelectorAll('button'));
  }
}

// Check current page and auth context
console.log('Current user context from React:');
try {
  // This might work if React DevTools is available
  if (window.React) {
    console.log('React is available');
  }
} catch (e) {
  console.log('React context not accessible from console');
}

console.log('Available actions:');
console.log('- testFinanceNavigation() - Test navigation to finance-manager/log-deal');
console.log('- testButtonClick() - Try to click the Log New Deal button');

// Make functions globally available
window.testFinanceNavigation = testFinanceNavigation;
window.testButtonClick = testButtonClick;
