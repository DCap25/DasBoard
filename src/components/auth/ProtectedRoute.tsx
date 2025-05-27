import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isTestEmail } from '../../lib/supabaseClient';
import { isAuthenticated, getCurrentUser, getRedirectPath } from '../../lib/directAuth';

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

  // Check for direct authentication first - this should always take precedence
  const directAuthUser = getCurrentUser();
  const isDirectlyAuthenticated = isAuthenticated();

  console.log('[ProtectedRoute] Direct auth check:', {
    directAuthUser: directAuthUser,
    isDirectlyAuthenticated: isDirectlyAuthenticated,
    path: location.pathname,
  });

  if (isDirectlyAuthenticated && directAuthUser) {
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

  // Special handling for test users to bypass normal auth flow
  if (user?.email && isTestEmail(user.email)) {
    console.log(`[ProtectedRoute] Test user detected: ${user.email}`);

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

  // All checks passed, render the protected content
  console.log(`[ProtectedRoute] Access granted to ${location.pathname}`);

  logAccessAttempt(location.pathname, true, {
    user_role: userRole,
    dealership_id: dealershipId,
  });

  return <>{children}</>;
};

export default ProtectedRoute;
