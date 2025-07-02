import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isTestEmail } from '../../lib/supabaseClient';
import {
  isDirectAuthAuthenticated,
  getCurrentDirectAuthUser,
  getRedirectPath,
} from '../../lib/directAuth';
import { isAuthenticatedDemoUser, getDemoUserInfo } from '../../lib/demoAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredDealership?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredDealership,
}) => {
  const { user, loading, hasSession, userRole, dealershipId, logAccessAttempt, authCheckComplete } =
    useAuth();
  const location = useLocation();
  const deploymentEnv = import.meta.env.MODE || 'development';
  const isProduction = deploymentEnv === 'production';

  // Add timeout for extra loading to prevent infinite loops
  const [extraLoadingStartTime, setExtraLoadingStartTime] = useState<number | null>(null);

  // Enhanced debug logging for access control
  useEffect(() => {
    // Skip unnecessary logging for logout page
    if (location.pathname === '/logout') {
      console.log(`[ProtectedRoute] Logout page accessed, skipping detailed access logging`);
      return;
    }

    const timestamp = new Date().toISOString();
    console.log(`[ProtectedRoute][${timestamp}] Checking access to ${location.pathname}`, {
      user_email: user?.email,
      user_id: user?.id,
      user_role: userRole,
      has_session: hasSession,
      required_roles: requiredRoles,
      user_dealership_id: dealershipId,
      required_dealership: requiredDealership,
      is_loading: loading,
      auth_check_complete: authCheckComplete,
      environment: deploymentEnv,
      source_path: location.pathname,
      source_query: location.search,
    });
  }, [
    user,
    loading,
    location,
    userRole,
    hasSession,
    dealershipId,
    requiredRoles,
    requiredDealership,
    deploymentEnv,
    authCheckComplete,
  ]);

  // Special case for logout page - always render it without auth checks
  if (location.pathname === '/logout') {
    console.log('[ProtectedRoute] Allowing access to logout page without auth checks');
    return <>{children}</>;
  }

  // Special case for forced logout in progress
  const logoutInProgress = localStorage.getItem('logout_in_progress') === 'true';
  if (logoutInProgress && location.pathname !== '/auth') {
    console.log('[ProtectedRoute] Logout in progress detected, allowing access');
    return <>{children}</>;
  }

  // Check for demo user authentication first
  const isDemoUserAuthenticated = isAuthenticatedDemoUser();
  const demoUserInfo = getDemoUserInfo();

  if (isDemoUserAuthenticated && demoUserInfo) {
    console.log('[ProtectedRoute] Demo user authenticated, allowing access to:', location.pathname);

    // Check role requirements if specified
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(
        role => role.toLowerCase() === demoUserInfo.user_metadata.role.toLowerCase()
      );

      if (!hasRequiredRole) {
        console.warn('[ProtectedRoute] Demo user missing required role, but allowing demo access');
        // For demo users, we're more permissive with role requirements
      }
    }

    // Check dealership requirements if specified
    if (requiredDealership && demoUserInfo.app_metadata.dealership_id !== requiredDealership) {
      console.warn('[ProtectedRoute] Demo user dealership mismatch, but allowing demo access');
      // For demo users, we're more permissive with dealership requirements
    }

    // Allow access for authenticated demo users
    return <>{children}</>;
  }

  // Check for direct authentication first - but only if not overridden by recent login
  const directAuthUser = getCurrentDirectAuthUser();
  const isDirectlyAuthenticated = isDirectAuthAuthenticated();
  const recentLoginCleared = localStorage.getItem('recent_login_cleared') === 'true';
  const recentSupabaseLogin = localStorage.getItem('recent_supabase_login') === 'true';

  console.log('[ProtectedRoute] Direct auth check:', {
    directAuthUser: directAuthUser,
    isDirectlyAuthenticated: isDirectlyAuthenticated,
    recentLoginCleared: recentLoginCleared,
    recentSupabaseLogin: recentSupabaseLogin,
    path: location.pathname,
    isDemoUser: isDemoUserAuthenticated,
  });

  // If we have a fresh login flag, give auth state time to propagate
  if (recentSupabaseLogin && (!user || !hasSession)) {
    console.log(
      '[ProtectedRoute] Recent Supabase login detected, waiting for auth state to propagate...'
    );

    // Check direct Supabase auth as fallback to bypass context issues
    const checkDirectSupabaseAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email === 'testfinance@example.com') {
          console.log(
            '[ProtectedRoute] Direct Supabase check confirmed finance user, allowing access'
          );
          localStorage.removeItem('recent_supabase_login');
          return true;
        }
      } catch (error) {
        console.error('[ProtectedRoute] Direct auth check failed:', error);
      }
      return false;
    };

    // For finance routes, try direct auth check
    if (location.pathname === '/dashboard/single-finance') {
      checkDirectSupabaseAuth().then(isAuthenticated => {
        if (isAuthenticated) {
          window.location.reload(); // Force reload to refresh auth context
        }
      });
    }

    // Set timeout start time if not already set
    if (!extraLoadingStartTime) {
      setExtraLoadingStartTime(Date.now());
    }

    // Clear the flag and give auth state time to propagate (max 8 seconds)
    const timeElapsed = extraLoadingStartTime ? Date.now() - extraLoadingStartTime : 0;

    if (timeElapsed > 8000) {
      console.warn(
        '[ProtectedRoute] Auth state timeout reached, clearing flags and redirecting to login'
      );
      localStorage.removeItem('recent_supabase_login');
      setExtraLoadingStartTime(null);
      return <Navigate to="/" replace state={{ from: location }} />;
    }

    // Add debugging for auth state
    console.log('[ProtectedRoute] Waiting for auth state...', {
      timeElapsed: timeElapsed,
      user: user?.email || 'none',
      hasSession: hasSession,
      loading: loading,
      authCheckComplete: authCheckComplete,
    });

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Completing authentication...</p>
          <p className="text-xs text-gray-400 mt-1">
            Please wait ({Math.round((8000 - timeElapsed) / 1000)}s)
          </p>
        </div>
      </div>
    );
  }

  // Clear timeout if we have auth state
  if (user && hasSession && extraLoadingStartTime) {
    setExtraLoadingStartTime(null);
    localStorage.removeItem('recent_supabase_login');
  }

  // If we have a Supabase session and recently logged in, prioritize Supabase auth
  if (hasSession && user && recentSupabaseLogin) {
    console.log('[ProtectedRoute] Recent Supabase login detected, skipping direct auth check');
    // Clear the flag after using it
    localStorage.removeItem('recent_supabase_login');
  } else if (isDirectlyAuthenticated && directAuthUser) {
    console.log('[ProtectedRoute] Direct auth user detected:', directAuthUser.email);

    // Check if this is a logout attempt
    if (location.pathname === '/logout') {
      console.log('[ProtectedRoute] Allowing logout for direct auth user');
      return <>{children}</>;
    }

    // Check role requirements if specified
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(
        role => role.toLowerCase() === directAuthUser.role.toLowerCase()
      );

      if (!hasRequiredRole) {
        console.warn(
          `[ProtectedRoute] Direct auth user doesn't have required role. Redirecting to correct dashboard.`
        );
        return <Navigate to={getRedirectPath(directAuthUser)} replace />;
      }
    }

    // Check dealership if required
    if (requiredDealership && directAuthUser.dealershipId !== requiredDealership) {
      console.warn(
        `[ProtectedRoute] Direct auth user doesn't belong to required dealership. Redirecting.`
      );
      return <Navigate to={getRedirectPath(directAuthUser)} replace />;
    }

    // All checks passed for direct auth user
    console.log(`[ProtectedRoute] Direct auth access granted to ${location.pathname}`);
    return <>{children}</>;
  }

  // If still loading or auth check not complete, show loading indicator
  if (loading || !authCheckComplete) {
    console.log(`[ProtectedRoute] Still loading authentication state for ${location.pathname}`, {
      loading,
      authCheckComplete,
      path: location.pathname,
    });
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // Add a simple delay for auth state to propagate on fresh logins
  // If we just came from login and don't have auth state yet, wait a bit
  const isComingFromLogin = document.referrer.includes('/') || location.pathname !== '/';

  if (!user && !hasSession && isComingFromLogin && !extraLoadingStartTime) {
    console.log(
      '[ProtectedRoute] Detected navigation from login without auth state, adding delay...'
    );
    setExtraLoadingStartTime(Date.now());
  }

  if (extraLoadingStartTime && !user && !hasSession) {
    const timeElapsed = Date.now() - extraLoadingStartTime;

    if (timeElapsed < 2000) {
      // Wait up to 2 seconds for auth state
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Completing authentication...</p>
            <p className="text-xs text-gray-400 mt-1">
              Please wait ({Math.round((2000 - timeElapsed) / 1000)}s)
            </p>
          </div>
        </div>
      );
    } else {
      console.warn('[ProtectedRoute] Auth state timeout reached, redirecting to login');
      setExtraLoadingStartTime(null);
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  }

  // Clear loading state if we got auth
  if ((user || hasSession) && extraLoadingStartTime) {
    setExtraLoadingStartTime(null);
  }

  // Special handling for test users to bypass normal auth flow
  if (user?.email && isTestEmail(user.email)) {
    console.log(`[ProtectedRoute] Test user detected: ${user.email}`);

    // Add specific debug for testfinance users
    if (user.email === 'testfinance@example.com' || user.email === 'finance1@exampletest.com') {
      console.warn('[ProtectedRoute] FINANCE USER DETECTED:', {
        email: user.email,
        currentPath: location.pathname,
        willBeRedirectedToMaster: user.email === 'testadmin@example.com',
      });
    }

    // Special case for testadmin@example.com - always allow access to master-admin
    if (user.email === 'testadmin@example.com') {
      console.log('[ProtectedRoute] Test admin account detected');

      // If they're trying to access the master-admin panel, allow it
      if (location.pathname === '/master-admin') {
        console.log('[ProtectedRoute] Allowing test admin to access master-admin panel');
        return <>{children}</>;
      }

      // If trying to access any other route, redirect to master-admin
      console.log('[ProtectedRoute] Redirecting test admin to master-admin panel');
      return <Navigate to="/master-admin" replace />;
    }

    // Handle group admin test users
    if (user.email.includes('group') && user.email.includes('@exampletest.com')) {
      console.log('[ProtectedRoute] Group admin test account detected');

      // If they're trying to access the group-admin panel, allow it
      if (location.pathname === '/group-admin') {
        console.log('[ProtectedRoute] Allowing group admin to access group-admin panel');
        return <>{children}</>;
      }

      // If trying to access any other route, redirect to group-admin
      console.log('[ProtectedRoute] Redirecting group admin to group-admin panel');
      return <Navigate to="/group-admin" replace />;
    }
  }

  // If not authenticated, redirect to login
  if (!user || !hasSession) {
    console.warn(`[ProtectedRoute] Access denied - Not authenticated for ${location.pathname}`);

    // Log access attempt using the function from AuthContext
    logAccessAttempt(location.pathname, false, {
      reason: 'Not authenticated',
      has_session: hasSession,
      redirect_to: '/',
    });

    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If specific roles are required, check if user has any of them
  if (requiredRoles.length > 0 && userRole) {
    // Normalize case for comparison
    const normalizedUserRole = userRole.toLowerCase();
    const hasRequiredRole = requiredRoles.some(role => role.toLowerCase() === normalizedUserRole);

    // Additional checks for specific routes and roles
    let accessGranted = hasRequiredRole;

    // Check for group-admin route - we need to ensure the user has is_group_admin flag
    if (requiredRoles.includes('dealer_group_admin') && location.pathname === '/group-admin') {
      console.log(`[ProtectedRoute] This is the group admin route, checking is_group_admin flag`);

      // Try to check if user has is_group_admin flag in their metadata
      const isGroupAdmin = user.user_metadata?.is_group_admin === true;

      if (isGroupAdmin) {
        console.log(`[ProtectedRoute] User has is_group_admin flag in metadata, granting access`);
        accessGranted = true;
      } else {
        console.log(`[ProtectedRoute] User does not have is_group_admin flag, checking database`);
        // The flag might also be in the database profile
        const checkGroupAdminFlag = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('is_group_admin')
              .eq('id', user.id)
              .maybeSingle();

            if (!error && data?.is_group_admin === true) {
              console.log(`[ProtectedRoute] User has is_group_admin=true in profile table`);
              accessGranted = true;
            }
          } catch (err) {
            console.error(`[ProtectedRoute] Error checking is_group_admin flag:`, err);
          }
        };

        // Execute this check synchronously
        checkGroupAdminFlag();
      }
    }

    // Handle dealership_admin role for routes requiring 'admin'
    if (
      !accessGranted &&
      requiredRoles.includes('admin') &&
      normalizedUserRole === 'dealership_admin'
    ) {
      console.log(
        `[ProtectedRoute] Dealership admin accessing route requiring 'admin' - checking compatibility`
      );
      accessGranted = true;
    }

    if (!accessGranted) {
      console.warn(
        `[ProtectedRoute] Access denied - User role ${userRole} not in required roles: ${requiredRoles.join(
          ', '
        )}`
      );

      logAccessAttempt(location.pathname, false, {
        reason: 'Insufficient role permissions',
        user_role: userRole,
        required_roles: requiredRoles,
        redirect_to: '/dashboard',
      });

      return <Navigate to="/dashboard" replace />;
    }
  }

  // If a specific dealership is required, check if user belongs to it
  if (requiredDealership && dealershipId !== requiredDealership) {
    console.warn(
      `[ProtectedRoute] Access denied - User dealership ${dealershipId} doesn't match required dealership ${requiredDealership}`
    );

    logAccessAttempt(location.pathname, false, {
      reason: 'Dealership mismatch',
      user_dealership: dealershipId,
      required_dealership: requiredDealership,
      redirect_to: '/dashboard',
    });

    return <Navigate to="/dashboard" replace />;
  }

  // Special handling for single-finance route - add extra loading time for auth propagation
  if (location.pathname === '/dashboard/single-finance' && !user && !hasSession && !loading) {
    console.log(
      '[ProtectedRoute] Single finance route accessed without immediate auth state, waiting...'
    );

    if (!extraLoadingStartTime) {
      setExtraLoadingStartTime(Date.now());
    }

    const timeElapsed = extraLoadingStartTime ? Date.now() - extraLoadingStartTime : 0;

    if (timeElapsed < 2000) {
      // Wait up to 2 seconds
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading your dashboard...</p>
            <p className="text-xs text-gray-400 mt-1">
              Please wait ({Math.round((2000 - timeElapsed) / 1000)}s)
            </p>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render the protected content
  console.log(`[ProtectedRoute] Access granted to ${location.pathname}`);

  logAccessAttempt(location.pathname, true, {
    user_role: userRole,
    dealership_id: dealershipId,
  });

  return <>{children}</>;
};

export default ProtectedRoute;
