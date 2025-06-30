import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  isDirectAuthAuthenticated,
  getCurrentDirectAuthUser,
  getRedirectPath,
  logoutDirectAuth,
} from '../../lib/directAuth';

/**
 * DirectAuthProvider detects if the user is authenticated using the direct auth system
 * and redirects them to the appropriate dashboard.
 */
const DirectAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if logout is in progress
    const logoutInProgress = localStorage.getItem('logout_in_progress') === 'true';
    if (logoutInProgress) {
      console.log('[DirectAuthProvider] Logout in progress, skipping redirect');
      setChecking(false);
      return;
    }

    // Check for forced redirect from test login
    const forceRedirectTo = localStorage.getItem('force_redirect_after_login');
    const forceRedirectTimestamp = localStorage.getItem('force_redirect_timestamp');

    // Only use the redirect if it was set in the last 10 seconds
    const isRecentRedirect =
      forceRedirectTimestamp && Date.now() - parseInt(forceRedirectTimestamp) < 10000;

    if (forceRedirectTo && isRecentRedirect) {
      console.log('[DirectAuthProvider] Force redirect detected, navigating to:', forceRedirectTo);
      // Clear the flags to prevent redirect loops
      localStorage.removeItem('force_redirect_after_login');
      localStorage.removeItem('force_redirect_timestamp');

      navigate(forceRedirectTo, { replace: true });
      setChecking(false);
      return;
    }

    // Skip the check if we're on a special page or path
    const excludedPaths = [
      '/direct-login',
      '/force-login',
      '/logout',
      '/reset',
      '/',
      '/auth',
      '/dashboard-selector',
      '/deal-log',
      '/finance-deal-log',
      '/single-finance-deal-log',
      '/finance-manager/log-deal',
    ];
    if (excludedPaths.includes(location.pathname)) {
      console.log(`[DirectAuthProvider] Skipping redirect for excluded path: ${location.pathname}`);
      setChecking(false);
      return;
    }

    // Skip redirection if a special query parameter is present
    const searchParams = new URLSearchParams(location.search);
    if (
      searchParams.has('noredirect') ||
      searchParams.has('forcelogin') ||
      searchParams.has('reset')
    ) {
      console.log('[DirectAuthProvider] Skipping redirect due to special parameter');
      setChecking(false);
      return;
    }

    // Check if we have a direct auth user
    if (isDirectAuthAuthenticated()) {
      const user = getCurrentDirectAuthUser();
      if (user) {
        console.log('[DirectAuthProvider] Direct auth user detected:', user.email);

        // Check if this is a dashboard-selector originated session
        const isDashboardSelectorSession = localStorage.getItem('directauth_timestamp') !== null;
        if (isDashboardSelectorSession) {
          console.log(
            '[DirectAuthProvider] Dashboard selector session detected - allowing specific dashboard access'
          );

          // If we're trying to access a dashboard path or deal-log, allow it regardless of role
          if (
            location.pathname.startsWith('/dashboard/') ||
            location.pathname === '/master-admin' ||
            location.pathname === '/group-admin' ||
            location.pathname === '/avp-full-dashboard' ||
            location.pathname === '/deal-log'
          ) {
            console.log('[DirectAuthProvider] Allowing access to path:', location.pathname);
            setChecking(false);
            return;
          }
        }

        // If we're accessing the regular login page or auth page, redirect to the appropriate dashboard
        if (location.pathname === '/' || location.pathname === '/auth') {
          console.log('[DirectAuthProvider] Redirecting to dashboard:', getRedirectPath(user));
          navigate(getRedirectPath(user), { replace: true });
        }
        // If we're trying to access a protected route, check if it matches the user's role
        else {
          const correctPath = getRedirectPath(user);
          // Consider /deal-log as a valid path for finance managers
          const isFinanceManager = user.role?.toLowerCase() === 'finance_manager';
          const isDealLogPath = location.pathname === '/deal-log';

          // Allow deal-log path for finance managers
          if (isFinanceManager && isDealLogPath) {
            console.log('[DirectAuthProvider] Allowing finance manager to access deal-log path');
            setChecking(false);
            return;
          }

          // Allow both AVP dashboard paths for area_vice_president users
          const isAreaVicePresident = user.role === 'area_vice_president';
          const isAVPDashboardPath = location.pathname === '/avp-full-dashboard';

          if (isAreaVicePresident && isAVPDashboardPath) {
            console.log('[DirectAuthProvider] Allowing AVP user to access:', location.pathname);
            setChecking(false);
            return;
          }

          // Check if current path is the correct path OR a sub-route of the correct path
          if (
            location.pathname !== correctPath &&
            !location.pathname.startsWith(correctPath + '/')
          ) {
            console.log(`[DirectAuthProvider] Current path doesn't match user role, redirecting:`, {
              current: location.pathname,
              correct: correctPath,
            });
            navigate(correctPath, { replace: true });
          }
        }
      }
    }

    setChecking(false);
  }, [navigate, location.pathname, location.search]);

  // Show minimal loading state while checking
  if (checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DirectAuthProvider;
