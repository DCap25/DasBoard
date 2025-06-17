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
  {
    id: 'finance-manager-1-id',
    email: 'finance@exampletest.com',
    role: 'finance_manager',
    dealershipId: 1,
    name: 'Finance Manager',
  },
  {
    id: 'finance-manager-2-id',
    email: 'testfinance@example.com',
    role: 'single_finance_manager',
    dealershipId: 1,
    name: 'Single Finance Manager',
  },
  {
    id: 'finance-manager-3-id',
    email: 'finance1@exampletest.com',
    role: 'single_finance_manager',
    dealershipId: 1,
    name: 'Single Finance Manager 2',
  },
  {
    id: 'avp-id',
    email: 'avp@exampletest.com',
    role: 'area_vice_president',
    name: 'Area Vice President',
  },
  {
    id: 'avp-id',
    email: 'avp@exampletest.com',
    role: 'area_vice_president',
    name: 'Area Vice President',
  },
];

// Storage key for the auth user
const STORAGE_KEY = 'direct_auth_user';
// New key used by dashboard selector
const DASHBOARD_SELECTOR_KEY = 'directauth_user';

// ---------- Memoised helpers ----------
let _cachedUser: DirectAuthUser | null | undefined;
let _lastCacheTime = 0;
const CACHE_TTL_MS = 1000; // 1 second cache window is enough to prevent thrashing

function _readUserFromStorage(): DirectAuthUser | null {
  // 1) Original storage key (legacy)
  const jsonA = localStorage.getItem(STORAGE_KEY);
  if (jsonA) {
    try {
      return JSON.parse(jsonA) as DirectAuthUser;
    } catch {}
  }

  // 2) New dashboard-selector key
  const jsonB = localStorage.getItem(DASHBOARD_SELECTOR_KEY);
  if (jsonB) {
    try {
      console.log('[directAuth] Found user from dashboard selector');
      return JSON.parse(jsonB) as DirectAuthUser;
    } catch {}
  }
  return null;
}

export function getCurrentUser(): DirectAuthUser | null {
  const now = Date.now();
  if (_cachedUser !== undefined && now - _lastCacheTime < CACHE_TTL_MS) {
    return _cachedUser;
  }

  _cachedUser = _readUserFromStorage();
  _lastCacheTime = now;
  return _cachedUser;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Reset cache on logout
export function logout(): void {
  console.log('[directAuth] Logging out - clearing all auth keys');
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DASHBOARD_SELECTOR_KEY);
  localStorage.removeItem('directauth_timestamp');
  _cachedUser = undefined;
}

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

  if (user.role === 'single_finance_manager') {
    return '/dashboard/single-finance';
  }

  if (user.role === 'general_manager') {
    return '/dashboard/gm';
  }

  if (user.role === 'area_vice_president') {
    return '/avp-full-dashboard';
  }

  // Default to sales dashboard
  return '/dashboard/sales';
}
