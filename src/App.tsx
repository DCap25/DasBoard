import React, { createContext, useContext, useState, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import LogNewDeal from './components/dealership/LogNewDeal';
import { Toaster } from './components/ui/toaster';
import { AdminDashboard as MasterAdminDashboard } from './components/admin/AdminDashboard';
import TempAdminDashboard from './components/TempAdminDashboard';
import MasterAdminPanel from './components/admin/MasterAdminPanel';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from './lib/react-query';
import { DealLogEditor } from './components/manager/DealLogEditor';
import { ScheduleEditor } from './components/manager/ScheduleEditor';
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
import DebugAuthPage from './pages/DebugAuthPage';
import AuthDebugger from './components/debug/AuthDebugger';
import TestUserMiddleware from './components/auth/TestUserMiddleware';
import DirectLoginPage from './pages/DirectLoginPage';
import DirectAuthProvider from './components/auth/DirectAuthProvider';
import { isAuthenticated, getCurrentUser, getRedirectPath } from './lib/directAuth';
import ForceLoginPage from './pages/ForceLoginPage';
import ResetPage from './pages/ResetPage';
import LogoutPage from './pages/LogoutPage';
import TestLoginRedirect from './pages/TestLoginRedirect';
import GroupAdminBypass from './pages/GroupAdminBypass';
import DashboardSelector from './pages/DashboardSelector';
import { DealsProvider } from './contexts/DealsContext';
import DealLogPage from './pages/DealLogPage';
import TeamManagementPage from './pages/manager/TeamManagementPage';
import GoalsPage from './pages/manager/GoalsPage';
import SchedulePage from './pages/manager/SchedulePage';
import SalesReportPage from './pages/manager/SalesReportPage';
import SingleFinanceManagerDashboard from './components/dashboards/SingleFinanceManagerDashboard';
import FinanceDirectorDashboard from './components/dashboards/FinanceDirectorDashboard';
import LogFinanceManagerDeal from './pages/finance/LogFinanceManagerDeal';
import MasterAdminPage from './pages/admin/MasterAdminPage';
import SignUp from './components/auth/SignUp';
import SingleFinanceSignup from './components/auth/SingleFinanceSignup';
import DealershipSignup from './components/auth/DealershipSignup';
import DealerGroupSignup from './components/auth/DealerGroupSignup';

// Add global type declaration for app event tracking
declare global {
  interface Window {
    appEvents?: Array<{
      event: string;
      details: any;
    }>;
  }
}

// Application environment variables and deployment info
const APP_VERSION = import.meta.env.VITE_DEPLOYMENT_VERSION || '1.0.0';
const APP_ENV = import.meta.env.MODE || 'development';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'http://localhost:3000';
const IS_PRODUCTION = APP_ENV === 'production';

// Enhanced logging function
const logAppEvent = (event: string, details: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[App][${timestamp}] ${event}`, {
    ...details,
    app_version: APP_VERSION,
    environment: APP_ENV,
    timestamp,
  });

  // Track navigation events in window object if in development
  if (!IS_PRODUCTION && typeof window !== 'undefined') {
    if (!window.appEvents) {
      window.appEvents = [];
    }

    // Keep last 100 events
    if (window.appEvents.length > 100) {
      window.appEvents.shift();
    }

    window.appEvents.push({
      event,
      details: {
        ...details,
        timestamp,
      },
    });
  }
};

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
  const { setDealershipContext } = useAuth();

  // Update the AuthContext when dealership changes
  useEffect(() => {
    if (currentDealershipId) {
      logAppEvent('Setting dealership context', {
        dealership_id: currentDealershipId,
        dealership_name: currentDealershipName,
      });

      setDealershipContext(currentDealershipId);
    }
  }, [currentDealershipId, currentDealershipName, setDealershipContext]);

  const value = {
    currentDealershipId,
    setCurrentDealershipId,
    currentDealershipName,
    setCurrentDealershipName,
  };

  return <DealershipContext.Provider value={value}>{children}</DealershipContext.Provider>;
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
  state?: any;
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
  if (isAuthenticated()) {
    const directUser = getCurrentUser();
    if (directUser) {
      console.log('[ROLE REDIRECT] Direct auth user detected, redirecting to appropriate route', {
        email: directUser.email,
        role: directUser.role,
        redirectPath: getRedirectPath(directUser),
      });
      return <Navigate to={getRedirectPath(directUser)} replace />;
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
    redirectPath = '/dashboard/single-finance';
    redirectReason = 'Single finance manager role (email-based routing)';
    console.log('[AUTH DEBUG] User is redirected to Single Finance Manager Dashboard', {
      user_id: user.id,
      email: user.email,
      role: roleValue,
    });
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
  if (isAuthenticated()) {
    const directUser = getCurrentUser();
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

// Add this function before the App component
function ResetAuth() {
  useEffect(() => {
    console.log('[ResetAuth] Clearing all auth state...');

    // Sign out from Supabase
    supabase.auth
      .signOut()
      .then(() => {
        console.log('[ResetAuth] Signed out from Supabase');
      })
      .catch(error => {
        console.error('[ResetAuth] Error signing out from Supabase:', error);
      });

    // Clear all storage
    try {
      console.log('[ResetAuth] Clearing localStorage and sessionStorage');

      // Clear localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }

      // Clear sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }

      // Clear cookies (non-HTTP only cookies)
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }

      console.log('[ResetAuth] All storage cleared');
    } catch (error) {
      console.error('[ResetAuth] Error clearing storage:', error);
    }

    // Redirect to login page after a short delay
    setTimeout(() => {
      console.log('[ResetAuth] Redirecting to login page');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }, 1000);

    return () => {
      console.log('[ResetAuth] Reset component unmounted');
    };
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Resetting Auth State...</h1>
      <p>Clearing all authentication state and redirecting to login page.</p>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Add failsafe for group admin detection on app load
    const checkForAuthenticatedGroupAdmin = async () => {
      try {
        const { data } = await supabase.auth.getSession();
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
    if (
      typeof window !== 'undefined' &&
      window.location.pathname !== '/logout' &&
      (!searchParams || (!searchParams.has('noredirect') && !searchParams.has('forcelogin')))
    ) {
      checkForAuthenticatedGroupAdmin();
    }
  }, []);

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

    // Add listener for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.warn('[DEBUG AUTH] Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        console.warn(`[DEBUG AUTH] User signed in: ${session.user.email}`);

        // Check if user is a group admin
        const { data, error } = await supabase
          .from('profiles')
          .select('is_group_admin, role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!error && data) {
          console.warn('[DEBUG AUTH] User profile data:', data);
          console.warn(`[DEBUG AUTH] is_group_admin: ${data.is_group_admin}, role: ${data.role}`);

          if (data.is_group_admin) {
            console.warn(
              '[DEBUG AUTH] User is a group admin, should be redirected to /group-admin'
            );
          } else {
            console.warn('[DEBUG AUTH] User is NOT a group admin');
          }
        }
      }
    });

    // Listen for network changes
    const handleNetworkChange = () => {
      logAppEvent('Network status change', {
        online: typeof window !== 'undefined' && window.navigator ? window.navigator.onLine : true,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleNetworkChange);
      window.addEventListener('offline', handleNetworkChange);
    }

    return () => {
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleNetworkChange);
        window.removeEventListener('offline', handleNetworkChange);
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContextProvider>
        <AuthProvider>
          <DealershipProvider>
            <Router>
              <DirectAuthProvider>
                <TestUserMiddleware>
                  <RouteLogger />
                  <Routes>
                    {/* Public route for authentication - the main entry point */}
                    <Route path="/" element={<AuthPage />} />

                    {/* Signup routes - public access */}
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/signup/single-finance" element={<SingleFinanceSignup />} />
                    <Route path="/signup/dealership" element={<DealershipSignup />} />
                    <Route path="/signup/dealer-group" element={<DealerGroupSignup />} />

                    {/* New Logout Route - accessible to everyone */}
                    <Route path="/logout" element={<LogoutPage />} />

                    {/* New Direct Login route */}
                    <Route path="/direct-login" element={<DirectLoginPage />} />

                    {/* Force Login route - emergency bypass */}
                    <Route path="/force-login" element={<ForceLoginPage />} />

                    {/* Auth Reset route - to escape redirect loops */}
                    <Route path="/reset" element={<ResetAuth />} />

                    {/* Debug auth page - direct login bypass */}
                    <Route path="/debug-auth" element={<DebugAuthPage />} />

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
                    <Route path="/marketing" element={<RedirectLogger to={MARKETING_URL} />} />

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
                          requiredRoles={['admin', 'dealership_admin', 'single_dealer_admin']}
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

                    {/* Single Finance Manager Dashboard specific deal log route */}
                    <Route
                      path="/single-finance-deal-log"
                      element={
                        <ProtectedRoute
                          requiredRoles={['finance_manager', 'single_finance_manager']}
                        >
                          <DashboardLayout>
                            <DealLogPage dashboardType="single-finance" />
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
                    <Route path="/dealership/:dealershipId/*" element={<DealershipLayout />} />

                    {/* Test Login Redirect */}
                    <Route path="/test-login-redirect" element={<TestLoginRedirect />} />

                    {/* Group Admin Bypass */}
                    <Route path="/group-admin-bypass" element={<GroupAdminBypass />} />

                    {/* Dashboard Selector - Direct Access */}
                    <Route path="/dashboard-selector" element={<DashboardSelector />} />

                    {/* Fallback - redirect to dashboard */}
                    <Route path="*" element={<RedirectLogger to="/dashboard" />} />
                  </Routes>
                  <Toaster />
                </TestUserMiddleware>
              </DirectAuthProvider>
            </Router>
          </DealershipProvider>
        </AuthProvider>
        {APP_ENV !== 'production' && <ReactQueryDevtools />}
      </ToastContextProvider>
    </QueryClientProvider>
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

// Content for dealership-specific routes
function DealershipLayoutContent({ dealershipId }: { dealershipId: number }) {
  const { setCurrentDealershipId, setCurrentDealershipName } = useDealership();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set the current dealership in context
    setCurrentDealershipId(dealershipId);

    // Fetch the dealership name
    supabase
      .from('dealerships')
      .select('name')
      .eq('id', dealershipId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching dealership name:', error);
        } else if (data) {
          setCurrentDealershipName(data.name);
          logAppEvent('Set dealership name in context', {
            dealership_id: dealershipId,
            dealership_name: data.name,
          });
        }
        setLoading(false);
      });
  }, [dealershipId, setCurrentDealershipId, setCurrentDealershipName]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="sales"
        element={
          <ProtectedRoute requiredRoles={['salesperson']} requiredDealership={dealershipId}>
            <DashboardLayout>
              <SalesDashboard />
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
  );
}

export default App;
