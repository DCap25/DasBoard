import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import LoginForm from '../components/auth/LoginForm';
import { AlertCircle } from 'lucide-react';
import AuthDebugButton from '../components/debug/AuthDebugButton';

const AuthPage: React.FC = () => {
  const { user, loading, hasSession, isGroupAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Check for special query parameters
  const searchParams = new URLSearchParams(location.search);
  const noRedirect = searchParams.has('noredirect');
  const forceLogin = searchParams.has('forcelogin');

  // Add safety timeout for loading state
  useEffect(() => {
    let timeoutId: number;

    // If loading takes too long, show a message
    if (loading) {
      console.log('[AuthPage] Setting safety timeout for loading state');
      timeoutId = window.setTimeout(() => {
        console.error('[AuthPage] Loading timeout reached');
        setLoadingTimeout(true);
      }, 10000); // 10 second timeout
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [loading]);

  // Add direct redirection for group admin accounts
  useEffect(() => {
    // Skip redirect if noRedirect or forceLogin is true
    if (noRedirect || forceLogin) {
      console.log('[AuthPage] Skipping redirects due to query parameters');
      return;
    }

    if (user && user.email && !loading) {
      // Check if user is a group admin by email pattern
      const isGroupAdminByEmail =
        user.email.toLowerCase().includes('group') &&
        user.email.toLowerCase().includes('@exampletest.com');

      if (isGroupAdminByEmail || isGroupAdmin || user.user_metadata?.is_group_admin) {
        console.log('[AuthPage] *** GROUP ADMIN DETECTED - FORCING DIRECT REDIRECT ***', {
          email: user.email,
          byEmail: isGroupAdminByEmail,
          byFlag: isGroupAdmin,
          byMetadata: user.user_metadata?.is_group_admin,
        });

        // Use direct browser navigation to break out of React Router cycles
        window.location.href = '/group-admin';
      }
    }
  }, [user, loading, isGroupAdmin, noRedirect, forceLogin]);

  // Add logging for authentication state changes
  useEffect(() => {
    console.log('[AuthPage] Auth state changed:', {
      hasUser: !!user,
      hasSession,
      loading,
      email: user?.email,
      isGroupAdmin: isGroupAdmin,
      noRedirect,
      forceLogin,
      timestamp: new Date().toISOString(),
    });

    // Skip redirect if noRedirect or forceLogin is true
    if (noRedirect || forceLogin) {
      console.log('[AuthPage] Skipping redirects due to query parameters');
      return;
    }

    // Redirect if user is authenticated (but not group admin, handled separately)
    if (user && hasSession && !loading) {
      const isGroupAdminByEmail =
        user.email?.toLowerCase().includes('group') &&
        user.email?.toLowerCase().includes('@exampletest.com');

      // Skip normal redirect if group admin (handled by separate effect)
      if (isGroupAdminByEmail || isGroupAdmin || user.user_metadata?.is_group_admin) {
        return;
      }

      console.log('[AuthPage] Regular user authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, hasSession, loading, navigate, isGroupAdmin, noRedirect, forceLogin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-500">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          {loadingTimeout && (
            <div className="text-sm text-white max-w-md text-center mt-4 flex items-center gap-2 bg-orange-600 p-2 rounded border border-orange-400">
              <AlertCircle className="h-4 w-4 text-orange-200" />
              <span>
                Taking longer than expected. Please try refreshing the page if this continues.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If forceLogin or noRedirect is true, always show the login form
  if (forceLogin || noRedirect) {
    console.log('[AuthPage] Showing login form due to query parameters');
    // Continue to login form
  }
  // Otherwise check if user is authenticated and redirect if needed
  else if (user && hasSession) {
    // Check again for group admin to ensure they go to the right place
    const isGroupAdminByEmail =
      user.email?.toLowerCase().includes('group') &&
      user.email?.toLowerCase().includes('@exampletest.com');

    if (isGroupAdminByEmail || isGroupAdmin || user.user_metadata?.is_group_admin) {
      console.log('[AuthPage] Group admin authenticated, redirecting to group admin dashboard');
      return <Navigate to="/group-admin" replace />;
    }

    console.log('[AuthPage] User is already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-orange-500">
      {/* Black border top section with 1" height (approximately 96px) */}
      <div className="h-24 bg-black flex items-center justify-center">
        <h1 className="text-white text-3xl font-bold text-center">The DAS Board</h1>
      </div>

      {/* Main content area */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card className="bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-gray-800">
                The DAS Board Login
              </CardTitle>
              {(forceLogin || noRedirect) && (
                <p className="text-sm text-center text-green-600">
                  Force login mode active - you can log in again
                </p>
              )}
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <p className="text-sm text-gray-500 text-center">
                Don't have an account? Contact your administrator.
              </p>
              <div className="text-center mt-2 flex flex-col gap-1">
                <a
                  href="/debug-auth"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Test User Login
                </a>
                <a
                  href="/direct-login"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold"
                >
                  Reliable Direct Login
                </a>
                <a
                  href="/force-login"
                  className="text-xs text-red-600 hover:text-red-800 hover:underline"
                >
                  Emergency Force Login
                </a>
                <a
                  href="/group-admin-bypass?auto=true"
                  className="text-xs text-green-600 hover:text-green-800 hover:underline font-bold"
                >
                  ★ Direct Group Admin Login ★
                </a>
                <a
                  href="/logout"
                  className="text-xs text-red-600 hover:text-red-800 hover:underline mt-2"
                >
                  Force Logout
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AuthDebugButton placement="bottom-right" />
    </div>
  );
};

export default AuthPage;
