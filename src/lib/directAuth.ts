// Direct auth system for dashboard selector bypass

export interface DirectAuthUser {
  id: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  isGroupAdmin?: boolean;
  dealershipId?: number;
  name?: string;
}

// Test accounts for direct authentication
export const TEST_USERS: DirectAuthUser[] = [
  { id: 'admin', email: 'testadmin@example.com', role: 'admin', isAdmin: true },
  {
    id: 'group-admin',
    email: 'group1.admin@exampletest.com',
    role: 'dealer_group_admin',
    isGroupAdmin: true,
  },
  {
    id: 'dealer-admin',
    email: 'dealer1.admin@exampletest.com',
    role: 'dealership_admin',
    dealershipId: 1,
  },
  { id: 'finance', email: 'finance@exampletest.com', role: 'finance_manager' },
  { id: 'finance-director', email: 'finance.director@exampletest.com', role: 'finance_director' },
  {
    id: 'single-finance',
    email: 'testfinance@example.com',
    role: 'single_finance_manager',
    dealershipId: 1,
  },
  {
    id: 'single-finance-2',
    email: 'testsingle@example.com',
    role: 'single_finance_manager',
    dealershipId: 1,
  },
  {
    id: 'single-finance-3',
    email: 'testsingle758_1753110602135@example.com',
    role: 'single_finance_manager',
    dealershipId: 1,
  },
  { id: 'sales-manager', email: 'sales.manager@exampletest.com', role: 'sales_manager' },
  { id: 'gm', email: 'gm@exampletest.com', role: 'general_manager' },
  { id: 'sales', email: 'sales@exampletest.com', role: 'salesperson' },
  { id: 'avp', email: 'avp@exampletest.com', role: 'area_vice_president' },
];

const STORAGE_KEY = 'directauth_user';

// Get current direct auth user
export function getCurrentDirectAuthUser(): DirectAuthUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const user = JSON.parse(stored);

    // Check if the auth is still valid (expires after 24 hours)
    const timestamp = localStorage.getItem('directauth_timestamp');
    if (timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age > 24 * 60 * 60 * 1000) {
        logoutDirectAuth();
        return null;
      }
    }

    return user;
  } catch {
    return null;
  }
}

// Check if user is authenticated
export function isDirectAuthAuthenticated(): boolean {
  return getCurrentDirectAuthUser() !== null;
}

// Login with a test account
export function loginWithTestAccount(email: string): { success: boolean; message: string } {
  const user = TEST_USERS.find(u => u.email === email);
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem('directauth_timestamp', Date.now().toString());

  return { success: true, message: 'Logged in successfully' };
}

// Logout direct auth user
export function logoutDirectAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('directauth_timestamp');
}

// Get redirect path based on user role
export function getRedirectPath(user: DirectAuthUser): string {
  switch (user.role) {
    case 'admin':
      return '/master-admin';
    case 'dealer_group_admin':
      return '/group-admin';
    case 'dealership_admin':
      return '/dashboard/admin';
    case 'finance_manager':
      return '/dashboard/finance';
    case 'finance_director':
      return '/dashboard/finance-director';
    case 'single_finance_manager':
      return '/dashboard/single-finance';
    case 'sales_manager':
      return '/dashboard/sales-manager';
    case 'general_manager':
      return '/dashboard/gm';
    case 'area_vice_president':
      return '/avp-full-dashboard';
    case 'salesperson':
    default:
      return '/dashboard/sales';
  }
}

// Check if email is a test email
export function isTestEmail(email: string): boolean {
  return TEST_USERS.some(user => user.email === email);
}
