import { getDemoData } from './signupService';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
  dealership: string;
  account_type: string;
}

export interface DemoSession {
  user: DemoUser;
  metrics: any;
  deals: any[];
  isDemo: true;
}

/**
 * Check if user is in demo mode
 */
export const isDemoSession = (): boolean => {
  if (typeof window === 'undefined') return false;

  const demoMode = localStorage.getItem('demo_mode');
  const demoSession = localStorage.getItem('demo_session');

  return demoMode === 'true' && !!demoSession;
};

/**
 * Get current demo session data
 */
export const getDemoSession = (): DemoSession | null => {
  if (!isDemoSession()) return null;

  try {
    const sessionData = localStorage.getItem('demo_session');
    if (!sessionData) return null;

    const parsedData = JSON.parse(sessionData);
    return {
      ...parsedData,
      isDemo: true,
    };
  } catch (error) {
    console.error('[DEMO] Error parsing demo session:', error);
    clearDemoSession();
    return null;
  }
};

/**
 * Get demo user info
 */
export const getDemoUser = (): DemoUser | null => {
  const session = getDemoSession();
  return session ? session.user : null;
};

/**
 * Get demo metrics data
 */
export const getDemoMetrics = () => {
  const session = getDemoSession();
  return session ? session.metrics : null;
};

/**
 * Get demo deals data
 */
export const getDemoDeals = () => {
  const session = getDemoSession();
  return session ? session.deals : [];
};

/**
 * Create a new demo session
 */
export const createDemoSession = (): DemoSession => {
  const demoData = getDemoData();

  localStorage.setItem('demo_session', JSON.stringify(demoData));
  localStorage.setItem('demo_mode', 'true');

  console.log('[DEMO] Demo session created:', demoData.user);

  return {
    ...demoData,
    isDemo: true,
  };
};

/**
 * Clear demo session
 */
export const clearDemoSession = (): void => {
  localStorage.removeItem('demo_session');
  localStorage.removeItem('demo_mode');
  console.log('[DEMO] Demo session cleared');
};

/**
 * Check if current user should use demo data
 */
export const shouldUseDemoData = (): boolean => {
  return isDemoSession();
};

/**
 * Get user role for demo session
 */
export const getDemoUserRole = (): string | null => {
  const user = getDemoUser();
  return user ? user.role : null;
};

/**
 * Check if demo user has specific role
 */
export const demoUserHasRole = (requiredRole: string): boolean => {
  const userRole = getDemoUserRole();
  if (!userRole) return false;

  // Demo user is sales_manager, so they have access to most roles
  const roleHierarchy = {
    sales_manager: ['salesperson', 'finance_manager', 'sales_manager'],
    general_manager: ['salesperson', 'finance_manager', 'sales_manager', 'general_manager'],
    admin: ['salesperson', 'finance_manager', 'sales_manager', 'general_manager', 'admin'],
  };

  const allowedRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || [userRole];
  return allowedRoles.includes(requiredRole);
};

/**
 * Demo navigation helper
 */
export const getDemoRedirectPath = (accountType?: string): string => {
  if (accountType === 'single-finance') {
    return '/dashboard/single-finance';
  }

  return '/dashboard-selector';
};

/**
 * Demo data refresh (simulates real-time updates)
 */
export const refreshDemoData = (): void => {
  if (!isDemoSession()) return;

  // Simulate some data changes for demo purposes
  const session = getDemoSession();
  if (!session) return;

  // Update metrics with slight variations
  const updatedMetrics = {
    ...session.metrics,
    monthly_sales: session.metrics.monthly_sales + Math.floor(Math.random() * 3),
    monthly_revenue: session.metrics.monthly_revenue + Math.floor(Math.random() * 10000),
  };

  const updatedSession = {
    ...session,
    metrics: updatedMetrics,
  };

  localStorage.setItem('demo_session', JSON.stringify(updatedSession));
  console.log('[DEMO] Demo data refreshed');
};
