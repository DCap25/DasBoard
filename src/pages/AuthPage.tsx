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
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Ghosted background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-gray-300 text-[12rem] font-bold transform -rotate-12 select-none whitespace-nowrap opacity-60">
            The DAS Board
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          {loadingTimeout && (
            <div className="text-sm text-blue-800 max-w-md text-center mt-4 flex items-center gap-2 bg-blue-100 p-2 rounded border border-blue-300 shadow-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Ghosted background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-gray-300 text-[12rem] font-bold transform -rotate-12 select-none whitespace-nowrap opacity-60">
          The DAS Board
        </div>
      </div>

      {/* Professional header with subtle gradient */}
      <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg flex items-center relative z-10">
        <div className="flex items-center ml-6">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">The DAS Board</h1>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex items-center justify-center py-16 px-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-2xl border border-gray-200 rounded-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-3xl font-bold text-center text-gray-800 mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600 text-center text-sm">Sign in to your DAS Board account</p>
              {(forceLogin || noRedirect) && (
                <p className="text-sm text-center text-blue-600 bg-blue-50 p-2 rounded-lg">
                  Force login mode active - you can log in again
                </p>
              )}
            </CardHeader>
            <CardContent className="px-6">
              <LoginForm />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-6">
              <p className="text-sm text-gray-500 text-center">
                Don't have an account?{' '}
                <span className="text-blue-600 font-medium">Contact your administrator</span>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100/50 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-gray-100/50 rounded-full blur-lg"></div>
    </div>
  );
};

export default AuthPage;
