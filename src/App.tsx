import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SecurityHeadersManager from './lib/securityHeaders';
import AuthPage from './pages/AuthPage';
import StorageMigration from './lib/storageMigration';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// =================== ERROR BOUNDARY IMPORTS ===================
import {
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
  withAsyncErrorHandling,
  type SafeErrorInfo,
} from './components/ErrorBoundary';
import {
  createSafeQueryClient,
  safeStateUpdate,
  reportError,
  createSpecializedErrorBoundary,
} from './lib/errorHandling';
import AuthErrorBoundary, { type AuthErrorInfo } from './components/AuthErrorBoundary';

// Create safe query client with enhanced error handling
const safeQueryClient = createSafeQueryClient();
import { ToastContextProvider } from './lib/use-toast';
import {
  SalesDashboard,
  FinanceDashboard,
  SalesManagerDashboard,
  GMDashboard,
} from './components/dashboards';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AVPFullDashboard from './components/dashboards/AVPDashboard';
import { GroupAdminDashboard } from './components/admin/GroupAdminDashboard';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import AuthDebugger from './components/debug/AuthDebugger';
import DirectLoginPage from './pages/DirectLoginPage';
import DirectAuthProvider from './components/auth/DirectAuthProvider';
import {
  isDirectAuthAuthenticated,
  getCurrentDirectAuthUser,
  getRedirectPath,
} from './lib/directAuth';
import LogoutPage from './pages/LogoutPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallback from './components/auth/AuthCallback';
import GroupAdminBypass from './pages/GroupAdminBypass';
import DashboardSelector from './pages/DashboardSelector';
import SalesExperienceDemo from './pages/SalesExperienceDemo';
import DealLogPage from './pages/DealLogPage';
import TeamManagementPage from './pages/manager/TeamManagementPage';
import GoalsPage from './pages/manager/GoalsPage';
import SchedulePage from './pages/manager/SchedulePage';
import SalesReportPage from './pages/manager/SalesReportPage';
import SingleFinanceManagerDashboard from './components/dashboards/SingleFinanceManagerDashboard';
import SingleFinanceWelcome from './pages/welcome/SingleFinanceWelcome';
import FinanceDirectorDashboard from './components/dashboards/FinanceDirectorDashboard';
import LogFinanceManagerDeal from './pages/finance/LogFinanceManagerDeal';
import LogSingleFinanceDeal from './pages/finance/LogSingleFinanceDeal';
import MasterAdminPage from './pages/admin/MasterAdminPage';
import SignUp from './components/auth/SignUp';
import SignupChoice from './pages/SignupChoice';
import SingleFinanceSignup from './components/auth/SingleFinanceSignup';
import DealershipSignupPage from './pages/DealershipSignup';
import DealerGroupSignup from './components/auth/DealerGroupSignup';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import SimpleSignup from './pages/SimpleSignup';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SubscriptionSignup from './pages/SubscriptionSignup';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import SubscriptionPage from './pages/legal/SubscriptionPage';
import AboutPage from './pages/AboutPage';
import ScreenshotsPage from './pages/ScreenshotsPage';
import { TranslationProvider } from './contexts/TranslationContext';
import ResetAuth from './pages/ResetPage';
import CookieConsent from './components/CookieConsent';
import TestUserMiddleware from './components/auth/TestUserMiddleware';
import DemoPage from './pages/DemoPage';

// Add global type declaration for app event tracking
declare global {
  interface Window {
    appEvents?: Array<{
      event: string;
      details: Record<string, unknown>;
    }>;
    debugStorage?: {
      inspect: () => unknown;
      forceClean: () => void;
      clearAll: () => void;
      status: () => unknown;
    };
    debugSupabase?: {
      testConnection: () => Promise<unknown>;
      getStatus: () => unknown;
    };
  }
}

// Application environment variables and deployment info
const APP_VERSION = import.meta.env.VITE_DEPLOYMENT_VERSION || '1.0.0';
const APP_ENV = import.meta.env.MODE || 'development';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'http://localhost:3000';
const IS_PRODUCTION = APP_ENV === 'production';


// Enhanced logging function with error handling and runtime safety
const logAppEvent = withAsyncErrorHandling(
  (event: string, details: Record<string, unknown> = {}) => {
    try {
      // RUNTIME SAFETY: Ensure event string is valid
      const safeEvent = typeof event === 'string' ? event : 'unknown_event';
      const safeDetails = details && typeof details === 'object' ? details : {};
      
      const timestamp = new Date().toISOString();
      console.log(`[App][${timestamp}] ${safeEvent}`, {
        ...safeDetails,
        app_version: APP_VERSION,
        environment: APP_ENV,
        timestamp,
      });

      // Track navigation events in window object if in development
      if (!IS_PRODUCTION && typeof window !== 'undefined') {
        try {
          if (!window.appEvents) {
            window.appEvents = [];
          }

          // Keep last 100 events
          if (window.appEvents.length > 100) {
            window.appEvents.shift();
          }

          window.appEvents.push({
            event: safeEvent,
            details: {
              ...safeDetails,
              timestamp,
            },
          });
        } catch (trackingError) {
          console.warn('[RUNTIME_SAFETY] Failed to track app event:', trackingError);
        }
      }
    } catch (loggingError) {
      console.error('[RUNTIME_SAFETY] App event logging error:', loggingError);
    }
  },
  (error: SafeErrorInfo) => {
    console.error('App event logging failed:', error.message);
  }
);

// DealershipContext for multi-dealership support
interface DealershipContextType {
  currentDealershipId: number | null;
  setCurrentDealershipId: (id: number | null) => void;
  currentDealershipName: string | null;
  setCurrentDealershipName: (name: string | null) => void;
}

const DealershipContext = createContext<DealershipContextType | undefined>(undefined);

export const DealershipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDealershipId, setCurrentDealershipId] = useState<number | null>(null);
  const [currentDealershipName, setCurrentDealershipName] = useState<string | null>(null);
  
  // RUNTIME SAFETY: Safe access to useAuth with fallback
  let authContextValue;
  try {
    authContextValue = useAuth();
  } catch (authError) {
    console.error('[RUNTIME_SAFETY] Failed to access AuthContext in DealershipProvider:', authError);
    authContextValue = { setDealershipContext: () => {} }; // Fallback
  }
  
  const { setDealershipContext } = authContextValue;

  // Safe state update functions with enhanced error handling
  const safeSetDealershipId = (id: number | null) => {
    try {
      safeStateUpdate(setCurrentDealershipId, id, 'DealershipProvider');
    } catch (error) {
      console.error('[RUNTIME_SAFETY] Failed to update dealership ID:', error);
    }
  };

  const safeSetDealershipName = (name: string | null) => {
    try {
      safeStateUpdate(setCurrentDealershipName, name, 'DealershipProvider');
    } catch (error) {
      console.error('[RUNTIME_SAFETY] Failed to update dealership name:', error);
    }
  };

  // Update the AuthContext when dealership changes
  useEffect(() => {
    try {
      if (currentDealershipId) {
        logAppEvent('Setting dealership context', {
          dealership_id: currentDealershipId,
          dealership_name: currentDealershipName,
        });

        setDealershipContext(currentDealershipId);
      }
    } catch (error) {
      reportError(error instanceof Error ? error : new Error(String(error)), {
        operation: 'setDealershipContext',
        dealership_id: currentDealershipId,
      });
    }
  }, [currentDealershipId, currentDealershipName, setDealershipContext]);

  const value = {
    currentDealershipId,
    setCurrentDealershipId: safeSetDealershipId,
    currentDealershipName,
    setCurrentDealershipName: safeSetDealershipName,
  };

  return (
    <SectionErrorBoundary identifier="DealershipProvider">
      <DealershipContext.Provider value={value}>{children}</DealershipContext.Provider>
    </SectionErrorBoundary>
  );
};

export const useDealership = () => {
  const context = useContext(DealershipContext);
  if (context === undefined) {
    throw new Error('useDealership must be used within a DealershipProvider');
  }
  return context;
};

// Enhanced Route Logger Component with performance metrics
function RouteLogger() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { user, role } = useAuth();

  useEffect(() => {
    // Track navigation events with user context info
    logAppEvent('Navigation event', {
      path: location.pathname,
      search: location.search,
      type: navigationType,
      state: location.state ? 'present' : 'none',
      hash: location.hash || 'none',
      user_id: user?.id,
      user_email: user?.email,
      user_role: role,
    });

    // Measure render time - only if performance API is available
    const hasPerformanceAPI = typeof window !== 'undefined' && window.performance;
    const start = hasPerformanceAPI ? window.performance.now() : 0;
    const navigationStart = hasPerformanceAPI
      ? window.performance.timeOrigin + window.performance.now()
      : 0;

    return () => {
      if (hasPerformanceAPI) {
        const end = window.performance.now();
        const renderTime = end - start;

        logAppEvent('Route render completed', {
          path: location.pathname,
          render_time_ms: renderTime.toFixed(2),
          total_time_ms: (end - navigationStart).toFixed(2),
        });

        // Report to analytics if render time is too long (over 1000ms)
        if (renderTime > 1000) {
          console.warn(
            `[Performance Warning] Slow render (${renderTime.toFixed(2)}ms) for ${
              location.pathname
            }`
          );
        }
      }
    };
  }, [location, navigationType, user, role]);

  return null;
}

// Enhanced Redirect logger component
function RedirectLogger({
  to,
  replace = false,
  state = undefined,
}: {
  to: string;
  replace?: boolean;
  state?: Record<string, unknown>;
}) {
  const { user, role } = useAuth();

  useEffect(() => {
    logAppEvent('Redirect triggered', {
      from: window.location.pathname,
      to,
      replace,
      has_state: state !== undefined,
      user_id: user?.id,
      user_email: user?.email,
      user_role: role,
    });
  }, [to, replace, state, user, role]);

  return <Navigate to={to} replace={replace} state={state} />;
}

// Update RoleBasedRedirect to check direct auth
function RoleBasedRedirect() {
  const {
    role,
    loading,
    userRole,
    user,
    hasSession,
    dealershipId,
    currentDealershipName,
    logAccessAttempt,
    isGroupAdmin,
    authCheckComplete,
  } = useAuth();
  const location = useLocation();

  // Add specific debugging for finance users
  useEffect(() => {
    if (user?.email === 'testfinance@example.com' || user?.email === 'finance1@exampletest.com') {
      console.warn('[FINANCE DEBUG] Finance user detected in RoleBasedRedirect:', {
        email: user.email,
        userRole,
        role,
        dealershipId,
        isGroupAdmin,
        userMetadata: user.user_metadata,
      });
    }
  }, [user, userRole, role, dealershipId, isGroupAdmin]);

  useEffect(() => {
    console.warn('[DEBUG REDIRECT] Role-based redirect check', {
      role,
      user_role: userRole,
      user_email: user?.email,
      dealership_id: dealershipId,
      dealership_name: currentDealershipName,
      is_group_admin: isGroupAdmin,
      loading,
      auth_check_complete: authCheckComplete,
      has_session: hasSession,
      path: location.pathname,
    });
  }, [
    role,
    loading,
    location,
    userRole,
    user,
    hasSession,
    dealershipId,
    currentDealershipName,
    isGroupAdmin,
    authCheckComplete,
  ]);

  // First check for direct auth
  const isDirectAuth = isDirectAuthAuthenticated();
  console.log('[ROLE REDIRECT DEBUG] Direct auth check', {
    isDirectAuth,
    currentPath: location.pathname,
    timestamp: new Date().toISOString(),
  });

  if (isDirectAuth) {
    const directUser = getCurrentDirectAuthUser();
    console.log('[ROLE REDIRECT DEBUG] Direct auth user found', {
      user: directUser,
      currentPath: location.pathname,
    });

    if (directUser) {
      const redirectPath = getRedirectPath(directUser);
      console.log('[ROLE REDIRECT] Direct auth user detected, redirecting to appropriate route', {
        email: directUser.email,
        role: directUser.role,
        redirectPath,
        fromPath: location.pathname,
      });
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Wait for auth check to complete before redirecting
  if (loading || !authCheckComplete) {
    logAppEvent('Role redirect - Still loading or auth check incomplete', {
      path: location.pathname,
      loading,
      authCheckComplete,
    });
    return <div>Loading...</div>;
  }

  if (!user || !hasSession) {
    logAppEvent('Role redirect - Not authenticated', {
      path: location.pathname,
      redirect_to: '/',
    });

    logAccessAttempt(location.pathname, false, {
      reason: 'No authenticated session',
      redirect_to: '/',
    });

    return <Navigate to="/" replace />;
  }

  logAppEvent('Role redirect - User authenticated', {
    user_email: user.email,
    role,
    user_role: userRole,
    is_admin: role === 'admin' || userRole === 'admin',
    is_group_admin: isGroupAdmin,
    user_metadata: user.user_metadata ? 'present' : 'missing',
    dealership_id: dealershipId,
    dealership_name: currentDealershipName,
  });

  // Check both role and userRole fields, case-insensitive
  const roleValue = (role || userRole || '').toLowerCase();
  console.warn('[DEBUG REDIRECT] User role determined:', {
    roleValue,
    isGroupAdmin,
    email: user.email,
    dealershipId,
  });

  // Special case for admin accounts
  let redirectPath = '/dashboard/sales';
  let redirectReason = 'Default to sales dashboard';

  // Always redirect admin@thedasboard.com to master admin
  if (user?.email === 'admin@thedasboard.com') {
    redirectPath = '/master-admin';
    redirectReason = 'Main admin account';
  }
  // Only redirect testadmin@example.com to master-admin if they actually have admin role
  else if (
    user?.email === 'testadmin@example.com' &&
    (roleValue === 'admin' || roleValue === 'master_admin')
  ) {
    redirectPath = '/master-admin';
    redirectReason = 'Test admin account with admin role';
  }
  // Check if user is a group admin first (this takes priority)
  else if (isGroupAdmin) {
    redirectPath = '/group-admin';
    redirectReason = 'Group admin flag is set to true';
    console.warn(
      '[DEBUG REDIRECT] User is redirected to Group Admin Dashboard because is_group_admin=true',
      {
        user_id: user.id,
        email: user.email,
        is_group_admin: isGroupAdmin,
        role: roleValue,
      }
    );
  }
  // Next check by role name
  else if (
    roleValue === 'dealer_group_admin' ||
    roleValue === 'group_dealer_admin' ||
    roleValue.includes('group_admin') ||
    roleValue.includes('group') ||
    roleValue.includes('dealergroup_admin')
  ) {
    redirectPath = '/group-admin';
    redirectReason = 'Dealer group admin role';
    console.warn(
      '[DEBUG REDIRECT] User is redirected to Group Admin Dashboard because of role name',
      {
        user_id: user.id,
        email: user.email,
        role: roleValue,
      }
    );
  } else if (
    roleValue === 'single_dealer_admin' ||
    roleValue === 'dealership_admin' ||
    roleValue.includes('dealership_admin') ||
    roleValue === 'admin'
  ) {
    redirectPath = '/dashboard/admin';
    redirectReason = 'Single dealership admin role';
    console.log('[AUTH DEBUG] User is redirected to Dealership Admin Dashboard', {
      user_id: user.id,
      email: user.email,
      dealership_id: dealershipId,
      role: roleValue,
    });
  } else if (
    roleValue === 'single_finance_manager' ||
    (roleValue === 'finance_manager' &&
      (user?.email?.includes('finance') || user?.email?.includes('testfinance')))
  ) {
    // Check if this is a new user who should see the welcome page
    const welcomeKey = user?.id ? `welcome_seen_${user.id}` : 'welcome_seen_current_user';
    const hasSeenWelcome = localStorage.getItem(welcomeKey) === 'true';
    const isNewSignup =
      window.location.search.includes('newuser=true') ||
      window.location.pathname.includes('/welcome/');

    if (!hasSeenWelcome && !isNewSignup) {
      // First-time user - show welcome page
      redirectPath = '/welcome/single-finance?newuser=true';
      redirectReason = 'New single finance manager - welcome page';
      console.log('[AUTH DEBUG] New Single Finance Manager redirected to welcome page', {
        user_id: user.id,
        email: user.email,
        role: roleValue,
        hasSeenWelcome,
      });
    } else {
      // Existing user or returning from welcome - go to dashboard
      redirectPath = '/dashboard/single-finance';
      redirectReason = 'Single finance manager role (email-based routing)';
      console.log('[AUTH DEBUG] User is redirected to Single Finance Manager Dashboard', {
        user_id: user.id,
        email: user.email,
        role: roleValue,
        hasSeenWelcome,
      });
    }
  } else if (roleValue === 'finance_manager' || roleValue.includes('finance')) {
    redirectPath = '/dashboard/finance';
    redirectReason = 'Finance manager role (regular)';
  } else if (roleValue === 'sales_manager' || roleValue.includes('sales_manager')) {
    redirectPath = '/dashboard/sales-manager';
    redirectReason = 'Sales manager role';
  } else if (roleValue === 'general_manager' || roleValue.includes('general')) {
    redirectPath = '/dashboard/gm';
    redirectReason = 'General manager role';
  } else if (roleValue === 'area_vice_president' || roleValue.includes('vice_president')) {
    redirectPath = '/avp-full-dashboard';
    redirectReason = 'Area Vice President role';
  } else {
    redirectPath = '/dashboard/sales';
    redirectReason = 'Sales role (default)';
  }

  console.warn('[DEBUG REDIRECT] Final redirection decision:', {
    redirectPath,
    redirectReason,
    roleValue,
    isGroupAdmin,
    email: user.email,
    userEmail: user.email,
    isTestFinanceUser:
      user.email === 'testfinance@example.com' || user.email === 'finance1@exampletest.com',
    roleConditions: {
      isSingleFinanceManager: roleValue === 'single_finance_manager',
      isFinanceManagerWithEmail:
        roleValue === 'finance_manager' &&
        (user?.email?.includes('finance') || user?.email?.includes('testfinance')),
      combinedFinanceCondition:
        roleValue === 'single_finance_manager' ||
        (roleValue === 'finance_manager' &&
          (user?.email?.includes('finance') || user?.email?.includes('testfinance'))),
    },
  });

  logAccessAttempt(redirectPath, true, {
    source_path: location.pathname,
    reason: redirectReason,
    role: roleValue,
  });

  return <Navigate to={redirectPath} replace />;
}

function GroupAdminAccessCheck({ children }: { children: React.ReactNode }) {
  const { user, isGroupAdmin, loading, userRole, authCheckComplete } = useAuth();
  const location = useLocation();

  // First check for direct auth
  if (isDirectAuthAuthenticated()) {
    const directUser = getCurrentDirectAuthUser();
    if (directUser && directUser.isGroupAdmin) {
      console.log('[GROUP ADMIN ACCESS] Direct auth user granted access to group admin', {
        email: directUser.email,
        role: directUser.role,
      });
      return <>{children}</>;
    }
  }

  // Then check regular Supabase auth
  // Wait for auth check to complete
  if (loading || !authCheckComplete) {
    console.log('[GROUP ADMIN ACCESS] Still loading auth state');
    return <div>Loading...</div>;
  }

  // Special case - if user is accessing /group-admin path
  if (location.pathname === '/group-admin') {
    // If the user is a group admin by flag or role name, allow access
    const isGroupAdminByRole =
      userRole?.toLowerCase().includes('group') ||
      userRole?.toLowerCase().includes('dealer_group_admin');

    // Also check email pattern for test accounts
    const isGroupAdminByEmail =
      user?.email?.toLowerCase().includes('group') &&
      user?.email?.toLowerCase().includes('@exampletest.com');

    if (isGroupAdmin || isGroupAdminByRole || isGroupAdminByEmail) {
      console.warn('[GROUP ADMIN ACCESS] Access granted - User is identified as a group admin', {
        by_flag: isGroupAdmin,
        by_role: isGroupAdminByRole,
        by_email: isGroupAdminByEmail,
        email: user?.email,
        role: userRole,
      });
      return <>{children}</>;
    } else {
      console.warn('[GROUP ADMIN ACCESS] Access denied - User is not a group admin');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Default to protected route for other cases
  return (
    <ProtectedRoute
      requiredRoles={['admin', 'dealer_group_admin', 'dealership_admin', 'area_vice_president']}
    >
      {children}
    </ProtectedRoute>
  );
}

function App() {
  // RUNTIME SAFETY: Verify React hooks are available
  if (typeof useState === 'undefined' || typeof useMemo === 'undefined' || typeof useEffect === 'undefined') {
    console.error('[CRITICAL_ERROR] React hooks are not available in App component');
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h1>Critical Error: React Hooks Unavailable</h1>
        <p>The application failed to load properly due to missing React hooks.</p>
        <p>Please refresh the page or check your browser console for details.</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  // STABILITY ENHANCEMENT: Track app initialization state
  const [appInitialized, setAppInitialized] = useState(false);
  const [initErrors, setInitErrors] = useState<string[]>([]);
  
  // RUNTIME SAFETY: Generate app instance ID for debugging with fallback
  const appInstanceId = useMemo(() => {
    try {
      return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } catch (error) {
      console.error('[RUNTIME_SAFETY] Failed to generate app instance ID:', error);
      return `app_fallback_${Date.now()}`;
    }
  }, []);
  
  useEffect(() => {
    logAppEvent('[APP_INIT] Starting application initialization', { appInstanceId });
    
    // TEMPORARILY DISABLED: Focus manager causing 74s render times due to resumePausedMutations
    console.log('[App] React Query focus manager disabled to prevent performance issues');
    
    // Simple no-op focus manager to prevent React Query from trying to resume mutations
    try {
      focusManager.setEventListener(() => {
        // Return empty cleanup function - no actual focus handling
        return () => {};
      });
      logAppEvent('[APP_INIT] Focus manager configured successfully');
    } catch (error) {
      console.warn('Failed to configure focus manager:', error);
      setInitErrors(prev => [...prev, 'Focus manager configuration failed']);
    }

    // Initialize security features with error handling
    const initializeSecurity = withAsyncErrorHandling(
      () => {
        // Set up CSP violation reporting
        SecurityHeadersManager.setupCSPReporting();

        // Check secure context
        if (!SecurityHeadersManager.isSecureContext() && process.env.NODE_ENV === 'production') {
          console.warn('[Security] Application is not running in a secure context (HTTPS)');
        }

        console.log('[Security] Security features initialized');
      },
      (error: SafeErrorInfo) => {
        console.error('[Security] Failed to initialize security features:', error.message);
        reportError(error);
      }
    );

    // Migrate sensitive data to encrypted storage on app load
    const migrateStorageData = async () => {
      try {
        if (StorageMigration.needsMigration()) {
          console.log('[App] Starting automatic storage migration...');

          // Storage migration without cleanup (method doesn't exist)

          // Now attempt migration
          const result = await StorageMigration.migrateAllSensitiveData();

          if (result.success) {
            console.log('[App] Storage migration completed successfully');
            if (result.migratedKeys.length > 0) {
              console.log(
                `[App] Migrated ${result.migratedKeys.length} keys:`,
                result.migratedKeys
              );
            }
          } else {
            console.warn('[App] Storage migration completed with errors:', result.errors);
            // Don't block app loading due to migration errors
          }
        } else {
          console.log('[App] No storage migration needed');
        }
      } catch (error) {
        console.error('[App] Storage migration failed:', error);
        // Don't block app loading due to migration errors
      }
    };

    // Initialize security first
    try {
      initializeSecurity();
      logAppEvent('[APP_INIT] Security initialization completed');
    } catch (securityError) {
      console.error('[APP_INIT] Security initialization failed:', securityError);
      setInitErrors(prev => [...prev, 'Security initialization failed']);
    }

    // Add failsafe for group admin detection on app load
    const checkForAuthenticatedGroupAdmin = async () => {
      try {
        // Initialize Supabase client before using it
        const { getSecureSupabaseClient } = await import('./lib/supabaseClient');
        const supabaseClient = await getSecureSupabaseClient();

        const { data } = await supabaseClient.auth.getSession();
        if (data?.session?.user) {
          console.warn('[App] Found authenticated user on app load:', data.session.user.email);

          // Skip redirection if a special query parameter is present
          const searchParams =
            typeof window !== 'undefined' && window.URLSearchParams
              ? new window.URLSearchParams(window.location.search)
              : null;
          if (searchParams && (searchParams.has('noredirect') || searchParams.has('forcelogin'))) {
            console.log('[App] Skipping redirect due to special parameter');
            return;
          }

          // Check if this is a group admin
          const email = data.session.user.email || '';
          const isGroupAdminByEmail =
            email.toLowerCase().includes('group') &&
            email.toLowerCase().includes('@exampletest.com');

          // Also check metadata
          const isGroupAdminByMetadata = !!data.session.user.user_metadata?.is_group_admin;

          if (isGroupAdminByEmail || isGroupAdminByMetadata) {
            console.warn('[App] FAILSAFE - Detected group admin user, redirecting');

            // Check if we're not already on the group admin page
            if (typeof window !== 'undefined' && window.location.pathname !== '/group-admin') {
              console.warn('[App] Forcing redirection to group admin dashboard');
              window.location.href = '/group-admin';
            }
          } else if (email.toLowerCase() === 'testadmin@example.com') {
            console.warn('[App] FAILSAFE - Detected test admin user');

            // Check if we're not already on the master admin page
            if (typeof window !== 'undefined' && window.location.pathname !== '/master-admin') {
              console.warn('[App] Forcing redirection to master admin dashboard');
              window.location.href = '/master-admin';
            }
          }
        }
      } catch (error) {
        console.error('[App] Error in failsafe auth check:', error);
      }
    };

    // Skip check if we're on the logout page or have noredirect parameter
    const searchParams =
      typeof window !== 'undefined' && window.URLSearchParams
        ? new window.URLSearchParams(window.location.search)
        : null;
    // Run migration first
    migrateStorageData();

    // Add debug helper to window in development
    if (import.meta.env.DEV) {
      window.debugStorage = {
        inspect: () => StorageMigration.debugStorageData(),
        forceClean: () => StorageMigration.forceCleanMigration(),
        clearAll: () => StorageMigration.clearUnencryptedSensitiveData(),
        status: () => StorageMigration.getMigrationStatus(),
      };

      // Add Supabase debug helper
      window.debugSupabase = {
        testConnection: async () => {
          const { testSupabaseConnection } = await import('./lib/supabaseClient');
          return testSupabaseConnection();
        },
        getSession: async () => {
          const { getSecureSupabaseClient } = await import('./lib/supabaseClient');
          const supabaseClient = await getSecureSupabaseClient();
          return supabaseClient.auth.getSession();
        },
        getUser: async () => {
          const { getSecureSupabaseClient } = await import('./lib/supabaseClient');
          const supabaseClient = await getSecureSupabaseClient();
          return supabaseClient.auth.getUser();
        },
      };

      console.log('[App] Debug helpers available: window.debugStorage, window.debugSupabase');
    }

    if (
      typeof window !== 'undefined' &&
      window.location.pathname !== '/logout' &&
      (!searchParams || (!searchParams.has('noredirect') && !searchParams.has('forcelogin')))
    ) {
      checkForAuthenticatedGroupAdmin()
        .then(() => {
          logAppEvent('[APP_INIT] Group admin check completed');
        })
        .catch((error) => {
          console.error('[APP_INIT] Group admin check failed:', error);
          setInitErrors(prev => [...prev, 'Group admin check failed']);
        });
    }
    
    // Mark initialization as complete
    setTimeout(() => {
      setAppInitialized(true);
      logAppEvent('[APP_INIT] Application initialization completed', { 
        appInstanceId,
        initErrors: initErrors.length,
        errorsList: initErrors 
      });
    }, 100);
  }, [appInstanceId, initErrors]);

  useEffect(() => {
    // Log application startup
    logAppEvent('Application initialized', {
      version: APP_VERSION,
      environment: APP_ENV,
      app_url: APP_URL,
      marketing_url: MARKETING_URL,
      user_agent:
        typeof window !== 'undefined' && window.navigator ? window.navigator.userAgent : 'unknown',
      language:
        typeof window !== 'undefined' && window.navigator ? window.navigator.language : 'unknown',
      screen_size:
        typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
    });

    // Initialize Supabase client and add listener for authentication state changes
    let subscription: { unsubscribe?: () => void } | null = null;

    const initializeAuthListener = async () => {
      try {
        // Initialize the Supabase client first
        const { getSecureSupabaseClient } = await import('./lib/supabaseClient');
        const supabaseClient = await getSecureSupabaseClient();

        // Now set up the auth state change listener
        const {
          data: { subscription: authSubscription },
        } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
          console.warn('[DEBUG AUTH] Auth state changed:', event);

          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
            console.warn(`[DEBUG AUTH] User authenticated: ${session.user.email}`);

            try {
              // Check if user is a group admin using the initialized client
              const { data, error } = await supabaseClient
                .from('profiles')
                .select('is_group_admin, role')
                .eq('id', session.user.id)
                .maybeSingle();

              if (!error && data) {
                console.warn('[DEBUG AUTH] User profile data:', data);
                console.warn(
                  `[DEBUG AUTH] is_group_admin: ${data.is_group_admin}, role: ${data.role}`
                );

                if (data.is_group_admin) {
                  console.warn(
                    '[DEBUG AUTH] User is a group admin, should be redirected to /group-admin'
                  );
                } else {
                  console.warn('[DEBUG AUTH] User is NOT a group admin');
                }
              } else if (error) {
                console.error('[DEBUG AUTH] Error fetching user profile:', error);
              }
            } catch (error) {
              console.error('[DEBUG AUTH] Exception while fetching user profile:', error);
            }
          }
        });

        // Store the subscription for cleanup
        subscription = authSubscription;

        // Listen for network changes
        const handleNetworkChange = () => {
          logAppEvent('Network status change', {
            online:
              typeof window !== 'undefined' && window.navigator ? window.navigator.onLine : true,
          });
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('online', handleNetworkChange);
          window.addEventListener('offline', handleNetworkChange);
        }

        // Return cleanup function for this specific initialization
        return () => {
          if (subscription) {
            subscription.unsubscribe();
          }
          if (typeof window !== 'undefined') {
            window.removeEventListener('online', handleNetworkChange);
            window.removeEventListener('offline', handleNetworkChange);
          }
        };
      } catch (error) {
        console.error('[App] Error initializing Supabase auth listener:', error);

        // Still set up network listeners even if auth fails
        const handleNetworkChange = () => {
          logAppEvent('Network status change', {
            online:
              typeof window !== 'undefined' && window.navigator ? window.navigator.onLine : true,
          });
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('online', handleNetworkChange);
          window.addEventListener('offline', handleNetworkChange);
        }

        return () => {
          if (typeof window !== 'undefined') {
            window.removeEventListener('online', handleNetworkChange);
            window.removeEventListener('offline', handleNetworkChange);
          }
        };
      }
    };

    // Initialize the auth listener
    const cleanup = initializeAuthListener();

    // Return cleanup function
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (cleanupFn && typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, []);

  // STABILITY ENHANCEMENT: Show initialization status if not yet complete
  if (!appInitialized && initErrors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing DAS Board...</p>
          <p className="text-xs text-gray-400 mt-2">Instance: {appInstanceId}</p>
        </div>
      </div>
    );
  }

  // STABILITY ENHANCEMENT: Show error state if initialization failed
  if (initErrors.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Initialization Failed</h1>
          <p className="text-gray-600 mb-4">The DAS Board failed to initialize properly.</p>
          <div className="text-sm text-gray-500 space-y-1">
            {initErrors.map((error, index) => (
              <div key={index} className="bg-red-100 p-2 rounded text-red-700">{error}</div>
            ))}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
          <p className="text-xs text-gray-400 mt-2">Instance: {appInstanceId}</p>
        </div>
      </div>
    );
  }

  return (
    <PageErrorBoundary
      identifier="AppRoot"
      onError={(error: SafeErrorInfo) => {
        console.error('[STABILITY] Critical app-level error caught:', error);
        reportError(error);
        logAppEvent('[ERROR_BOUNDARY] App root error', { 
          errorId: error.id,
          errorType: error.type,
          severity: error.severity,
          appInstanceId 
        });
      }}
    >
      <TranslationProvider>
        <QueryClientProvider client={safeQueryClient}>
          <ToastContextProvider>
            <AuthErrorBoundary
              enableAutoRecovery={true}
              maxRetries={3}
              onError={(authError: AuthErrorInfo) => {
                console.error('[STABILITY] Auth error caught by boundary:', authError);
                
                // Enhanced development logging
                if (import.meta.env.DEV) {
                  console.warn(`🔐 [AUTH BOUNDARY] ${authError.type}: ${authError.message}`);
                  if (authError.sessionInfo) {
                    console.warn('Session Info:', authError.sessionInfo);
                  }
                }
                
                // Enhanced error reporting with app context
                logAppEvent('[ERROR_BOUNDARY] Auth error', {
                  authErrorType: authError.type,
                  recoverable: authError.recoverable,
                  appInstanceId
                });
                
                // Report to error tracking service
                reportError({
                  message: `Auth Error: ${authError.type}`,
                  stack: authError.originalError.stack,
                  name: authError.originalError.name,
                } as any, {
                  authErrorType: authError.type,
                  recoverable: authError.recoverable,
                  sessionInfo: authError.sessionInfo,
                  appInstanceId,
                });
              }}
            >
              <SectionErrorBoundary
                identifier="AuthProvider"
                onError={(error: SafeErrorInfo) => {
                  console.error('[STABILITY] AuthProvider error boundary triggered:', error);
                  logAppEvent('[ERROR_BOUNDARY] AuthProvider error', { 
                    errorId: error.id,
                    appInstanceId 
                  });
                }}
                {...createSpecializedErrorBoundary('auth')}
              >
                <AuthProvider>
                  <SectionErrorBoundary
                    identifier="DealershipProvider"
                    onError={(error: SafeErrorInfo) => {
                      console.error('[STABILITY] DealershipProvider error boundary triggered:', error);
                      logAppEvent('[ERROR_BOUNDARY] DealershipProvider error', { 
                        errorId: error.id,
                        appInstanceId 
                      });
                    }}
                  >
                    <DealershipProvider>
                      <SectionErrorBoundary
                        identifier="Router"
                        onError={(error: SafeErrorInfo) => {
                          console.error('[STABILITY] Router error boundary triggered:', error);
                          logAppEvent('[ERROR_BOUNDARY] Router error', { 
                            errorId: error.id,
                            appInstanceId 
                          });
                        }}
                        {...createSpecializedErrorBoundary('navigation')}
                      >
                        <Router>
                          <ComponentErrorBoundary 
                            identifier="DirectAuthProvider"
                            onError={(error: SafeErrorInfo) => {
                              console.error('[STABILITY] DirectAuthProvider error:', error);
                              logAppEvent('[ERROR_BOUNDARY] DirectAuthProvider error', { 
                                errorId: error.id,
                                appInstanceId 
                              });
                            }}
                          >
                            <DirectAuthProvider>
                              <ComponentErrorBoundary 
                                identifier="TestUserMiddleware"
                                onError={(error: SafeErrorInfo) => {
                                  console.error('[STABILITY] TestUserMiddleware error:', error);
                                  logAppEvent('[ERROR_BOUNDARY] TestUserMiddleware error', { 
                                    errorId: error.id,
                                    appInstanceId 
                                  });
                                }}
                              >
                                <TestUserMiddleware>
                                  <ComponentErrorBoundary 
                                    identifier="AppComponents"
                                    onError={(error: SafeErrorInfo) => {
                                      console.error('[STABILITY] AppComponents error:', error);
                                      logAppEvent('[ERROR_BOUNDARY] AppComponents error', { 
                                        errorId: error.id,
                                        appInstanceId 
                                      });
                                    }}
                                  >
                                    <RouteLogger />
                                    <CookieConsent />
                                  </ComponentErrorBoundary>
                                  <SectionErrorBoundary
                                    identifier="Routes"
                                    onError={(error: SafeErrorInfo) => {
                                      console.error('[STABILITY] Routes error boundary triggered:', error);
                                      logAppEvent('[ERROR_BOUNDARY] Routes error', { 
                                        errorId: error.id,
                                        path: window.location.pathname,
                                        appInstanceId 
                                      });
                                    }}
                                    {...createSpecializedErrorBoundary('navigation')}
                                  >
                                    <Routes>
                              {/* Marketing Pages - Public Access */}
                              <Route path="/" element={<HomePage />} />
                              <Route path="/demo" element={<DemoPage />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/screenshots" element={<ScreenshotsPage />} />
                              <Route path="/pricing" element={<PricingPage />} />
                              <Route path="/subscriptions" element={<SubscriptionsPage />} />
                              <Route path="/signup/subscription" element={<SubscriptionSignup />} />
                              <Route path="/signup/success" element={<SubscriptionSuccess />} />
                              <Route
                                path="/subscription/success"
                                element={<SubscriptionSuccess />}
                              />
                              <Route path="/auth" element={<AuthPage />} />

                              {/* Legal Pages - Public Access */}
                              <Route path="/legal/terms" element={<TermsPage />} />
                              <Route path="/legal/privacy" element={<PrivacyPage />} />
                              <Route path="/legal/subscription" element={<SubscriptionPage />} />

                              {/* Signup routes - public access */}
                              <Route path="/signup" element={<SignupChoice />} />
                              <Route path="/signup/dealership-legacy" element={<SignUp />} />
                              <Route path="/simple-signup" element={<SimpleSignup />} />
                              <Route
                                path="/signup/single-finance"
                                element={<SingleFinanceSignup />}
                              />
                              <Route path="/signup/dealership" element={<DealershipSignupPage />} />
                              <Route path="/signup/dealer-group" element={<DealerGroupSignup />} />

                              {/* Welcome pages */}
                              <Route
                                path="/welcome/single-finance"
                                element={<SingleFinanceWelcome />}
                              />

                              {/* New Logout Route - accessible to everyone */}
                              <Route path="/logout" element={<LogoutPage />} />

                              {/* Password Reset Route - accessible to everyone */}
                              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                              {/* Auth Callback Route for email verification */}
                              <Route path="/auth/callback" element={<AuthCallback />} />

                              {/* New Direct Login route */}
                              <Route path="/direct-login" element={<DirectLoginPage />} />

                              {/* Auth Reset route - to escape redirect loops */}
                              <Route path="/reset" element={<ResetAuth />} />

                              {/* New Auth Debugger route */}
                              <Route path="/auth-debug" element={<AuthDebugger />} />

                              {/* Role-based redirect after login */}
                              <Route
                                path="/dashboard"
                                element={
                                  <ProtectedRoute>
                                    <RoleBasedRedirect />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Marketing website link */}
                              <Route
                                path="/marketing"
                                element={<RedirectLogger to={MARKETING_URL} />}
                              />

                              {/* Admin routes */}
                              <Route
                                path="/master-admin"
                                element={
                                  <ProtectedRoute requiredRoles={['admin']}>
                                    <DashboardLayout title="Master Admin Panel">
                                      <MasterAdminPage />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Group Admin Route - allow group admins by email, flag, or role */}
                              <Route
                                path="/group-admin"
                                element={
                                  <GroupAdminAccessCheck>
                                    <DashboardLayout title="Group Admin Dashboard">
                                      <GroupAdminDashboard />
                                    </DashboardLayout>
                                  </GroupAdminAccessCheck>
                                }
                              />

                              {/* Area VP Full Dashboard Route */}
                              <Route
                                path="/avp-full-dashboard"
                                element={
                                  <ProtectedRoute requiredRoles={['area_vice_president']}>
                                    <DashboardLayout title="Area VP Full Dashboard">
                                      <AVPFullDashboard />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Role-specific dashboards */}
                              <Route
                                path="/dashboard/admin"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={[
                                      'admin',
                                      'dealership_admin',
                                      'single_dealer_admin',
                                    ]}
                                  >
                                    <AdminDashboardPage />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/dashboard/sales"
                                element={
                                  <ProtectedRoute requiredRoles={['salesperson']}>
                                    <DashboardLayout>
                                      <SalesDashboard />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/dashboard/finance/*"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <FinanceDashboard />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Single Finance Manager Dashboard */}
                              <Route
                                path="/dashboard/single-finance/*"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <SingleFinanceManagerDashboard />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Finance Director Dashboard */}
                              <Route
                                path="/dashboard/finance-director/*"
                                element={
                                  <ProtectedRoute requiredRoles={['finance_director']}>
                                    <DashboardLayout>
                                      <FinanceDirectorDashboard />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Finance Manager Deal Logging */}
                              <Route
                                path="/finance-manager/log-deal"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <LogFinanceManagerDeal />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Direct deal log route */}
                              <Route
                                path="/deal-log"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <DealLogPage />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Finance Dashboard specific deal log route */}
                              <Route
                                path="/finance-deal-log"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <DealLogPage dashboardType="finance" />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/dashboard/sales-manager/*"
                                element={
                                  <ProtectedRoute requiredRoles={['sales_manager']}>
                                    <DashboardLayout>
                                      <Routes>
                                        <Route path="/" element={<SalesManagerDashboard />} />
                                        <Route path="team" element={<TeamManagementPage />} />
                                        <Route path="goals" element={<GoalsPage />} />
                                        <Route path="schedule" element={<SchedulePage />} />
                                        <Route path="sales-report" element={<SalesReportPage />} />
                                      </Routes>
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/dashboard/gm"
                                element={
                                  <ProtectedRoute requiredRoles={['general_manager']}>
                                    <DashboardLayout>
                                      <GMDashboard />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Specific dealership routes with dealership ID parameter */}
                              <Route
                                path="/dealership/:dealershipId/*"
                                element={<DealershipLayout />}
                              />

                              {/* Test Login Redirect - Route removed as component was undefined */}

                              {/* Group Admin Bypass */}
                              <Route path="/group-admin-bypass" element={<GroupAdminBypass />} />

                              {/* Dashboard Selector - Direct Access */}
                              <Route path="/dashboard-selector" element={<DashboardSelector />} />

                              {/* Sales Experience Demo - Protected Route for Demo Users */}
                              <Route
                                path="/sales-experience-demo"
                                element={
                                  <ProtectedRoute>
                                    <SalesExperienceDemo />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Single Finance Manager Deal Log - Separate Route */}
                              <Route
                                path="/single-finance-deal-log"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <LogSingleFinanceDeal />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Single Finance Manager Deal Edit Route */}
                              <Route
                                path="/single-finance-deal-log/edit/:dealId"
                                element={
                                  <ProtectedRoute
                                    requiredRoles={['finance_manager', 'single_finance_manager']}
                                  >
                                    <DashboardLayout>
                                      <LogSingleFinanceDeal />
                                    </DashboardLayout>
                                  </ProtectedRoute>
                                }
                              />

                              {/* Fallback - redirect to dashboard */}
                              <Route path="*" element={<RedirectLogger to="/dashboard" />} />
                                    </Routes>
                                  </SectionErrorBoundary>
                                  <ComponentErrorBoundary 
                                    identifier="Toaster"
                                    onError={(error: SafeErrorInfo) => {
                                      console.error('[STABILITY] Toaster error:', error);
                                      logAppEvent('[ERROR_BOUNDARY] Toaster error', { 
                                        errorId: error.id,
                                        appInstanceId 
                                      });
                                    }}
                                  >
                                    <Toaster />
                                  </ComponentErrorBoundary>
                                </TestUserMiddleware>
                              </ComponentErrorBoundary>
                            </DirectAuthProvider>
                          </ComponentErrorBoundary>
                        </Router>
                      </SectionErrorBoundary>
                    </DealershipProvider>
                  </SectionErrorBoundary>
                </AuthProvider>
              </SectionErrorBoundary>
            </AuthErrorBoundary>
            {APP_ENV !== 'production' && (
              <ComponentErrorBoundary 
                identifier="ReactQueryDevtools"
                onError={(error: SafeErrorInfo) => {
                  console.error('[STABILITY] ReactQueryDevtools error:', error);
                  logAppEvent('[ERROR_BOUNDARY] ReactQueryDevtools error', { 
                    errorId: error.id,
                    appInstanceId 
                  });
                }}
              >
                <ReactQueryDevtools />
              </ComponentErrorBoundary>
            )}
          </ToastContextProvider>
        </QueryClientProvider>
      </TranslationProvider>
    </PageErrorBoundary>
  );
}

// Layout for dealership-specific routes
function DealershipLayout() {
  const { dealershipId } = useParams<{ dealershipId: string }>();
  const parsedId = dealershipId ? parseInt(dealershipId, 10) : null;

  if (!parsedId) {
    logAppEvent('Invalid dealership ID in URL', {
      dealership_id: dealershipId,
    });
    return <Navigate to="/dashboard" replace />;
  }

  logAppEvent('Rendering dealership layout', {
    dealership_id: parsedId,
  });

  return <DealershipLayoutContent dealershipId={parsedId} />;
}

// Content for dealership-specific routes with error handling
function DealershipLayoutContent({ dealershipId }: { dealershipId: number }) {
  const { setCurrentDealershipId, setCurrentDealershipName } = useDealership();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDealershipData = withAsyncErrorHandling(
      async () => {
        // Set the current dealership in context
        setCurrentDealershipId(dealershipId);

        // Fetch the dealership name with error handling
        const { data, error } = await supabase
          .from('dealerships')
          .select('name')
          .eq('id', dealershipId)
          .single();

        if (error) {
          throw new Error(`Failed to fetch dealership name: ${error.message}`);
        }

        if (data) {
          setCurrentDealershipName(data.name);
          logAppEvent('Set dealership name in context', {
            dealership_id: dealershipId,
            dealership_name: data.name,
          });
        }

        safeStateUpdate(setLoading, false, 'DealershipLayoutContent');
      },
      (error: SafeErrorInfo) => {
        console.error('Failed to load dealership data:', error.message);
        reportError(error);
        safeStateUpdate(setLoading, false, 'DealershipLayoutContent');
      }
    );

    loadDealershipData();
  }, [dealershipId, setCurrentDealershipId, setCurrentDealershipName]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SectionErrorBoundary
      identifier="DealershipRoutes"
      {...createSpecializedErrorBoundary('navigation')}
    >
      <Routes>
        <Route
          path="sales"
          element={
            <ProtectedRoute requiredRoles={['salesperson']} requiredDealership={dealershipId}>
              <DashboardLayout>
                <ComponentErrorBoundary identifier="SalesDashboard">
                  <SalesDashboard />
                </ComponentErrorBoundary>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute requiredRoles={['finance_manager']} requiredDealership={dealershipId}>
              <DashboardLayout>
                <FinanceDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="sales-manager"
          element={
            <ProtectedRoute requiredRoles={['sales_manager']} requiredDealership={dealershipId}>
              <DashboardLayout>
                <SalesManagerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="gm"
          element={
            <ProtectedRoute requiredRoles={['general_manager']} requiredDealership={dealershipId}>
              <DashboardLayout>
                <GMDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute
              requiredRoles={['admin', 'dealership_admin']}
              requiredDealership={dealershipId}
            >
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="deal-log"
          element={
            <ProtectedRoute requiredRoles={['finance_manager']} requiredDealership={dealershipId}>
              <DashboardLayout>
                <DealLogPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Add more dealership-specific routes as needed */}
        <Route path="*" element={<Navigate to={`/dealership/${dealershipId}/sales`} replace />} />
      </Routes>
    </SectionErrorBoundary>
  );
}

export default App;
