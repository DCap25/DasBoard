/**
 * Authentication Redirect Handler
 *
 * Centralized management of authentication-related redirects
 * to ensure consistent behavior across the application.
 */

import type { User } from '@supabase/supabase-js';

interface RedirectOptions {
  user: User;
  role?: string;
  isGroupAdmin?: boolean;
  dealershipId?: number;
  fromPath?: string;
  forceRedirect?: boolean;
  sessionExpired?: boolean;
  authError?: string;
}

interface RedirectResult {
  shouldRedirect: boolean;
  redirectTo: string;
  reason: string;
  delay?: number;
  clearStorage?: boolean;
  showMessage?: {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  };
}

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/master-admin',
  '/group-admin',
  '/dealership',
  '/finance',
  '/sales',
  '/manager',
  '/settings',
  '/profile',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/login',
  '/signup',
  '/reset-password',
  '/about',
  '/pricing',
  '/legal',
  '/screenshots',
  '/demo',
  '/sales-experience-demo',
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/master-admin',
  '/group-admin',
  '/admin/users',
  '/admin/dealerships',
  '/admin/system',
];

/**
 * Check if a path is protected and requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Check if a path is public and doesn't require authentication
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route));
}

/**
 * Check if a path requires admin privileges
 */
export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
}

/**
 * Determine the appropriate redirect path based on user role and context
 */
export function determineRedirectPath(options: RedirectOptions): RedirectResult {
  const {
    user,
    role,
    isGroupAdmin,
    dealershipId,
    fromPath,
    forceRedirect,
    sessionExpired,
    authError,
  } = options;

  console.log('[AuthRedirect] Determining redirect path:', {
    userEmail: user.email,
    role,
    isGroupAdmin,
    dealershipId,
    fromPath,
    forceRedirect,
    sessionExpired,
    authError,
  });

  // Handle session expiration
  if (sessionExpired) {
    return {
      shouldRedirect: true,
      redirectTo: '/auth',
      reason: 'Session expired',
      delay: 100,
      clearStorage: true,
      showMessage: {
        type: 'info',
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again.',
      },
    };
  }

  // Handle authentication errors
  if (authError) {
    return {
      shouldRedirect: true,
      redirectTo: '/auth',
      reason: `Authentication error: ${authError}`,
      delay: 100,
      clearStorage: true,
      showMessage: {
        type: 'error',
        title: 'Authentication Error',
        message: 'There was an issue with your authentication. Please try signing in again.',
      },
    };
  }

  // Skip redirect if coming from logout page
  if (fromPath === '/logout') {
    return {
      shouldRedirect: false,
      redirectTo: '',
      reason: 'Coming from logout page',
    };
  }

  // Skip redirect if already on a public route and not forcing
  if (fromPath && isPublicRoute(fromPath) && !forceRedirect) {
    return {
      shouldRedirect: false,
      redirectTo: '',
      reason: 'Already on public route',
    };
  }

  // Handle group admin users
  if (isGroupAdmin || user.email?.toLowerCase().includes('group')) {
    return {
      shouldRedirect: true,
      redirectTo: '/group-admin',
      reason: 'Group admin user',
      delay: 100,
      showMessage: {
        type: 'success',
        title: 'Welcome Back!',
        message: 'Redirecting to Group Admin Dashboard...',
      },
    };
  }

  // Handle known admin users
  if (user.email === 'admindan@thedasboard.com' || user.email === 'testadmin@example.com') {
    return {
      shouldRedirect: true,
      redirectTo: '/master-admin',
      reason: 'Known admin user',
      delay: 100,
      showMessage: {
        type: 'success',
        title: 'Welcome Back!',
        message: 'Redirecting to Master Admin Dashboard...',
      },
    };
  }

  // Handle role-based redirects
  const normalizedRole = (role || '').toLowerCase();

  switch (normalizedRole) {
    case 'admin':
    case 'master_admin':
      return {
        shouldRedirect: true,
        redirectTo: '/master-admin',
        reason: 'Admin role',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to Admin Dashboard...',
        },
      };

    case 'dealership_admin':
      return {
        shouldRedirect: true,
        redirectTo: dealershipId ? `/dealership/${dealershipId}/admin` : '/dashboard/admin',
        reason: 'Dealership admin role',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to Dealership Admin Dashboard...',
        },
      };

    case 'single_finance_manager':
      return {
        shouldRedirect: true,
        redirectTo: '/dashboard/single-finance',
        reason: 'Single finance manager role',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to Finance Dashboard...',
        },
      };

    case 'finance_manager':
      return {
        shouldRedirect: true,
        redirectTo: '/dashboard/finance',
        reason: 'Finance manager role',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to Finance Dashboard...',
        },
      };

    case 'sales_manager':
      return {
        shouldRedirect: true,
        redirectTo: '/dashboard/sales-manager',
        reason: 'Sales manager role',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to Sales Manager Dashboard...',
        },
      };

    case 'general_manager':
      return {
        shouldRedirect: true,
        redirectTo: '/dashboard/gm',
        reason: 'General manager role',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to General Manager Dashboard...',
        },
      };

    case 'salesperson':
    default:
      return {
        shouldRedirect: true,
        redirectTo: '/dashboard/sales',
        reason: 'Default sales dashboard',
        delay: 100,
        showMessage: {
          type: 'success',
          title: 'Welcome Back!',
          message: 'Redirecting to Sales Dashboard...',
        },
      };
  }
}

/**
 * Execute a redirect with proper timing and logging
 */
export function executeRedirect(redirectResult: RedirectResult): void {
  if (!redirectResult.shouldRedirect) {
    console.log('[AuthRedirect] Skipping redirect:', redirectResult.reason);
    return;
  }

  console.log('[AuthRedirect] Executing redirect:', {
    redirectTo: redirectResult.redirectTo,
    reason: redirectResult.reason,
    delay: redirectResult.delay,
    clearStorage: redirectResult.clearStorage,
  });

  // Clear storage if requested
  if (redirectResult.clearStorage) {
    try {
      localStorage.removeItem('dasboard-auth-token');
      localStorage.removeItem('demo_session');
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('logout_in_progress');
      console.log('[AuthRedirect] Cleared authentication storage');
    } catch (error) {
      console.error('[AuthRedirect] Error clearing storage:', error);
    }
  }

  // Show message if provided
  if (redirectResult.showMessage) {
    try {
      // Import toast dynamically to avoid circular dependencies
      import('../lib/use-toast').then(({ toast }) => {
        toast({
          title: redirectResult.showMessage!.title,
          description: redirectResult.showMessage!.message,
          variant: redirectResult.showMessage!.type === 'error' ? 'destructive' : 'default',
          duration: redirectResult.showMessage!.type === 'error' ? 8000 : 3000,
        });
      });
    } catch (error) {
      console.error('[AuthRedirect] Error showing message:', error);
    }
  }

  const performRedirect = () => {
    // Use window.location.href for full page navigation to ensure clean state
    window.location.href = redirectResult.redirectTo;
  };

  if (redirectResult.delay) {
    setTimeout(performRedirect, redirectResult.delay);
  } else {
    performRedirect();
  }
}

/**
 * Handle authentication success redirect
 */
export function handleAuthSuccessRedirect(options: RedirectOptions): void {
  const redirectResult = determineRedirectPath(options);

  if (redirectResult.shouldRedirect) {
    console.log(
      '[AuthRedirect] Authentication successful, redirecting to:',
      redirectResult.redirectTo
    );
    executeRedirect(redirectResult);
  } else {
    console.log('[AuthRedirect] No redirect needed:', redirectResult.reason);
  }
}

/**
 * Handle authentication failure redirect
 */
export function handleAuthFailureRedirect(error: any, fromPath?: string): void {
  console.log('[AuthRedirect] Authentication failed, redirecting to login:', {
    error: error.message,
    fromPath,
  });

  // Always redirect to login page on authentication failure
  const redirectResult: RedirectResult = {
    shouldRedirect: true,
    redirectTo: '/auth',
    reason: 'Authentication failed',
    delay: 100,
    clearStorage: true,
    showMessage: {
      type: 'error',
      title: 'Authentication Failed',
      message: 'Please sign in to continue.',
    },
  };

  executeRedirect(redirectResult);
}

/**
 * Handle logout redirect
 */
export function handleLogoutRedirect(): void {
  console.log('[AuthRedirect] Logout completed, redirecting to home');

  const redirectResult: RedirectResult = {
    shouldRedirect: true,
    redirectTo: '/',
    reason: 'Logout completed',
    delay: 500, // Slight delay to ensure cleanup is complete
    clearStorage: true,
    showMessage: {
      type: 'success',
      title: 'Signed Out',
      message: 'You have been signed out successfully.',
    },
  };

  executeRedirect(redirectResult);
}

/**
 * Handle role change redirect (when user role is updated)
 */
export function handleRoleChangeRedirect(options: RedirectOptions): void {
  console.log('[AuthRedirect] User role changed, determining new redirect');

  const redirectResult = determineRedirectPath({ ...options, forceRedirect: true });

  if (redirectResult.shouldRedirect) {
    console.log('[AuthRedirect] Role changed, redirecting to:', redirectResult.redirectTo);
    executeRedirect(redirectResult);
  }
}

/**
 * Check if user is on the correct path for their role
 */
export function isOnCorrectPath(currentPath: string, options: RedirectOptions): boolean {
  const { role, isGroupAdmin } = options;

  // Admin users can access any path
  if (isGroupAdmin || role === 'admin' || role === 'master_admin') {
    return true;
  }

  // Check role-specific paths
  const normalizedRole = (role || '').toLowerCase();

  switch (normalizedRole) {
    case 'dealership_admin':
      return currentPath.startsWith('/dealership') || currentPath.startsWith('/dashboard/admin');
    case 'single_finance_manager':
      return currentPath.startsWith('/dashboard/single-finance');
    case 'finance_manager':
      return currentPath.startsWith('/dashboard/finance');
    case 'sales_manager':
      return currentPath.startsWith('/dashboard/sales-manager');
    case 'general_manager':
      return currentPath.startsWith('/dashboard/gm');
    case 'salesperson':
      return currentPath.startsWith('/dashboard/sales');
    default:
      return isPublicRoute(currentPath);
  }
}

/**
 * Get the appropriate redirect path for a role
 */
export function getRedirectPathForRole(
  role: string,
  isGroupAdmin = false,
  dealershipId?: number
): string {
  if (isGroupAdmin) return '/group-admin';

  const normalizedRole = role.toLowerCase();

  switch (normalizedRole) {
    case 'admin':
    case 'master_admin':
      return '/master-admin';
    case 'dealership_admin':
      return dealershipId ? `/dealership/${dealershipId}/admin` : '/dashboard/admin';
    case 'single_finance_manager':
      return '/dashboard/single-finance';
    case 'finance_manager':
      return '/dashboard/finance';
    case 'sales_manager':
      return '/dashboard/sales-manager';
    case 'general_manager':
      return '/dashboard/gm';
    case 'salesperson':
    default:
      return '/dashboard/sales';
  }
}

/**
 * Validate if a redirect path is appropriate for the user
 */
export function validateRedirectPath(path: string, options: RedirectOptions): boolean {
  const { role, isGroupAdmin } = options;

  // Admin users can access any path
  if (isGroupAdmin || role === 'admin' || role === 'master_admin') {
    return true;
  }

  // Check if the path is appropriate for the user's role
  const expectedPath = getRedirectPathForRole(role || '', isGroupAdmin, options.dealershipId);
  return path.startsWith(expectedPath) || isPublicRoute(path);
}

/**
 * Handle deep link redirect (when user tries to access a specific path)
 */
export function handleDeepLinkRedirect(
  targetPath: string,
  options: RedirectOptions
): RedirectResult {
  console.log('[AuthRedirect] Handling deep link redirect:', {
    targetPath,
    userRole: options.role,
    isGroupAdmin: options.isGroupAdmin,
  });

  // Check if user has permission to access the target path
  if (validateRedirectPath(targetPath, options)) {
    return {
      shouldRedirect: true,
      redirectTo: targetPath,
      reason: 'Deep link access granted',
      delay: 100,
    };
  }

  // Redirect to appropriate dashboard if access denied
  const appropriatePath = getRedirectPathForRole(
    options.role || '',
    options.isGroupAdmin,
    options.dealershipId
  );

  return {
    shouldRedirect: true,
    redirectTo: appropriatePath,
    reason: 'Deep link access denied, redirecting to appropriate dashboard',
    delay: 100,
    showMessage: {
      type: 'info',
      title: 'Access Restricted',
      message: "You don't have permission to access that page. Redirecting to your dashboard.",
    },
  };
}

/**
 * Handle protected route access
 */
export function handleProtectedRouteAccess(
  currentPath: string,
  options: RedirectOptions
): RedirectResult {
  console.log('[AuthRedirect] Checking protected route access:', {
    currentPath,
    userRole: options.role,
    isGroupAdmin: options.isGroupAdmin,
  });

  // Check if route is protected
  if (!isProtectedRoute(currentPath)) {
    return {
      shouldRedirect: false,
      redirectTo: '',
      reason: 'Route is not protected',
    };
  }

  // Check if user has access to admin routes
  if (isAdminRoute(currentPath)) {
    const hasAdminAccess =
      options.isGroupAdmin ||
      options.role === 'admin' ||
      options.role === 'master_admin' ||
      options.role === 'dealership_admin';

    if (!hasAdminAccess) {
      return {
        shouldRedirect: true,
        redirectTo: getRedirectPathForRole(
          options.role || '',
          options.isGroupAdmin,
          options.dealershipId
        ),
        reason: 'Insufficient permissions for admin route',
        delay: 100,
        showMessage: {
          type: 'error',
          title: 'Access Denied',
          message: "You don't have permission to access this admin area.",
        },
      };
    }
  }

  // Check if user is on the correct path for their role
  if (!isOnCorrectPath(currentPath, options)) {
    return {
      shouldRedirect: true,
      redirectTo: getRedirectPathForRole(
        options.role || '',
        options.isGroupAdmin,
        options.dealershipId
      ),
      reason: 'User on incorrect path for their role',
      delay: 100,
      showMessage: {
        type: 'info',
        title: 'Redirected',
        message: 'Redirecting to your appropriate dashboard.',
      },
    };
  }

  return {
    shouldRedirect: false,
    redirectTo: '',
    reason: 'Access granted',
  };
}

/**
 * Emergency redirect to clear authentication loops
 */
export function emergencyRedirect(reason: string): void {
  console.warn('[AuthRedirect] Emergency redirect triggered:', reason);

  // Clear all authentication state
  localStorage.clear();
  sessionStorage.clear();

  // Force redirect to home page
  window.location.href = '/';
}

/**
 * Handle session timeout redirect
 */
export function handleSessionTimeoutRedirect(): void {
  console.log('[AuthRedirect] Session timeout detected');

  const redirectResult: RedirectResult = {
    shouldRedirect: true,
    redirectTo: '/auth',
    reason: 'Session timeout',
    delay: 100,
    clearStorage: true,
    showMessage: {
      type: 'info',
      title: 'Session Timeout',
      message: 'Your session has timed out. Please sign in again.',
    },
  };

  executeRedirect(redirectResult);
}

/**
 * Handle unauthorized access redirect
 */
export function handleUnauthorizedAccess(currentPath: string, requiredRole?: string): void {
  console.log('[AuthRedirect] Unauthorized access detected:', {
    currentPath,
    requiredRole,
  });

  const redirectResult: RedirectResult = {
    shouldRedirect: true,
    redirectTo: '/auth',
    reason: 'Unauthorized access',
    delay: 100,
    clearStorage: true,
    showMessage: {
      type: 'error',
      title: 'Access Denied',
      message: requiredRole
        ? `This page requires ${requiredRole} privileges. Please sign in with the appropriate account.`
        : "You don't have permission to access this page. Please sign in.",
    },
  };

  executeRedirect(redirectResult);
}

// Export route checking functions
export {
  isProtectedRoute,
  isPublicRoute,
  isAdminRoute,
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
};
