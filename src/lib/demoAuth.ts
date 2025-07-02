import { getDemoData } from './signupService';

// Demo user credentials
const DEMO_USER_EMAIL = 'demo@thedasboard.com';
const DEMO_USER_PASSWORD = 'DemoUser2025!';

export interface DemoAuthResult {
  isDemo: boolean;
  demoData?: any;
  message?: string;
}

/**
 * Check if login credentials are for demo user
 */
export const isDemoLogin = (email: string, password: string): boolean => {
  return email.toLowerCase() === DEMO_USER_EMAIL.toLowerCase() && password === DEMO_USER_PASSWORD;
};

/**
 * Authenticate demo user and set up demo session
 */
export const authenticateDemoUser = (email: string, password: string): DemoAuthResult => {
  if (!isDemoLogin(email, password)) {
    return { isDemo: false };
  }

  console.log('[DEMO AUTH] Demo user login detected');

  // Get demo data and store in session
  const demoData = getDemoData();

  // Store demo session data
  localStorage.setItem('demo_session', JSON.stringify(demoData));
  localStorage.setItem('demo_mode', 'true');
  localStorage.setItem('demo_user_authenticated', 'true');

  console.log('[DEMO AUTH] Demo session created for authenticated user');

  return {
    isDemo: true,
    demoData,
    message: 'Demo user authenticated successfully',
  };
};

/**
 * Check if current session is an authenticated demo user
 */
export const isAuthenticatedDemoUser = (): boolean => {
  if (typeof window === 'undefined') return false;

  const demoMode = localStorage.getItem('demo_mode') === 'true';
  const demoAuth = localStorage.getItem('demo_user_authenticated') === 'true';

  return demoMode && demoAuth;
};

/**
 * Get demo user credentials for display (masked password)
 */
export const getDemoCredentials = () => {
  return {
    email: DEMO_USER_EMAIL,
    password: '••••••••••••', // Masked for security
    instructions: 'Use these credentials to access the sales demonstration environment',
  };
};

/**
 * Clear demo authentication
 */
export const clearDemoAuth = (): void => {
  localStorage.removeItem('demo_session');
  localStorage.removeItem('demo_mode');
  localStorage.removeItem('demo_user_authenticated');
  console.log('[DEMO AUTH] Demo authentication cleared');
};

/**
 * Check if email is the demo user email
 */
export const isDemoUserEmail = (email: string): boolean => {
  return email.toLowerCase() === DEMO_USER_EMAIL.toLowerCase();
};

/**
 * Validate demo user access
 */
export const validateDemoAccess = (): {
  hasAccess: boolean;
  redirectPath?: string;
  message?: string;
} => {
  if (!isAuthenticatedDemoUser()) {
    return {
      hasAccess: false,
      redirectPath: '/auth',
      message: 'Demo access requires authentication with demo credentials',
    };
  }

  return {
    hasAccess: true,
    redirectPath: '/demo-dashboard',
    message: 'Demo access granted',
  };
};

/**
 * Get demo user info for authentication context
 */
export const getDemoUserInfo = () => {
  if (!isAuthenticatedDemoUser()) return null;

  return {
    id: 'demo-user-authenticated',
    email: DEMO_USER_EMAIL,
    user_metadata: {
      full_name: 'Demo Sales Manager',
      role: 'sales_manager',
      is_demo_user: true,
    },
    app_metadata: {
      role: 'sales_manager',
      dealership_id: 1,
      is_demo: true,
    },
  };
};
