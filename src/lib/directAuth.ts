// Direct authentication system that bypasses Supabase
// This provides a reliable way to test the application without auth issues

export interface DirectAuthUser {
  id: string;
  email: string;
  role: string;
  dealershipId?: number;
  isGroupAdmin?: boolean;
  isAdmin?: boolean;
  name?: string;
}

// Test accounts that will always work
export const TEST_USERS: DirectAuthUser[] = [
  {
    id: 'test-admin-id',
    email: 'testadmin@example.com',
    role: 'admin',
    isAdmin: true,
    name: 'Test Admin',
  },
  {
    id: 'group-admin-id',
    email: 'group1.admin@exampletest.com',
    role: 'dealer_group_admin',
    isGroupAdmin: true,
    name: 'Group Admin',
  },
  {
    id: 'dealership-admin-id',
    email: 'dealer1.admin@exampletest.com',
    role: 'dealership_admin',
    dealershipId: 1,
    name: 'Dealership Admin',
  },
  {
    id: 'sales-manager-id',
    email: 'sales.manager@exampletest.com',
    role: 'sales_manager',
    dealershipId: 1,
    name: 'Sales Manager',
  },
  {
    id: 'sales-id',
    email: 'sales@exampletest.com',
    role: 'salesperson',
    dealershipId: 1,
    name: 'Salesperson',
  },
];

// Storage key for the auth user
const STORAGE_KEY = 'direct_auth_user';
// New key used by dashboard selector
const DASHBOARD_SELECTOR_KEY = 'directauth_user';

// Login with a test account
export function loginWithTestAccount(email: string): { success: boolean; message: string } {
  // Find matching test user
  const user = TEST_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return {
      success: false,
      message: `No test account found for ${email}`,
    };
  }

  // Store user in localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

  return {
    success: true,
    message: `Logged in as ${user.name || user.email}`,
  };
}

// Get the current user
export function getCurrentUser(): DirectAuthUser | null {
  // First try the original storage key
  const userJson = localStorage.getItem(STORAGE_KEY);

  if (userJson) {
    try {
      return JSON.parse(userJson) as DirectAuthUser;
    } catch (e) {
      console.error('[directAuth] Error parsing user from STORAGE_KEY', e);
    }
  }

  // Then try the dashboard selector key
  const dashboardSelectorJson = localStorage.getItem(DASHBOARD_SELECTOR_KEY);
  if (dashboardSelectorJson) {
    try {
      console.log('[directAuth] Found user from dashboard selector');
      return JSON.parse(dashboardSelectorJson) as DirectAuthUser;
    } catch (e) {
      console.error('[directAuth] Error parsing user from DASHBOARD_SELECTOR_KEY', e);
    }
  }

  return null;
}

// Check if the user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Log out
export function logout(): void {
  console.log('[directAuth] Logging out - clearing all auth keys');
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DASHBOARD_SELECTOR_KEY);
  localStorage.removeItem('directauth_timestamp');

  // Also clear any potential Supabase auth data to be thorough
  localStorage.removeItem('supabase.auth.token');
}

// Get redirect path based on role
export function getRedirectPath(user: DirectAuthUser): string {
  if (user.isAdmin) {
    return '/master-admin';
  }

  if (user.isGroupAdmin) {
    return '/group-admin';
  }

  if (user.role === 'dealership_admin') {
    return '/dashboard/admin';
  }

  if (user.role === 'sales_manager') {
    return '/dashboard/sales-manager';
  }

  if (user.role === 'finance_manager') {
    return '/dashboard/finance';
  }

  if (user.role === 'general_manager') {
    return '/dashboard/gm';
  }

  // Default to sales dashboard
  return '/dashboard/sales';
}
