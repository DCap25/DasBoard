import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import LoginForm from '../components/auth/LoginForm';
import {
  testSupabaseConnection,
  testSupabaseConnectionHttp,
  quickHasSupabaseSessionToken,
} from '../lib/supabaseClient';
import { supabase } from '../lib/supabaseClient';
import { AlertCircle } from 'lucide-react';
import AuthDebugButton from '../components/debug/AuthDebugButton';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const AuthPage: React.FC = () => {
  const { user, loading, hasSession, isGroupAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [connectivity, setConnectivity] = useState<{ ok: boolean; message?: string } | null>(null);

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

  // Quick connectivity test to surface network/CORS issues
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rpc, http] = await Promise.all([
          testSupabaseConnection(),
          testSupabaseConnectionHttp(4000),
        ]);
        const hasToken = quickHasSupabaseSessionToken();
        if (!cancelled) setConnectivity({ ok: rpc.success && http.success && hasToken });
      } catch (e) {
        if (!cancelled) setConnectivity({ ok: false, message: 'Connection failed' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Immediate redirect hook on direct auth event to avoid waiting for context propagation
  useEffect(() => {
    const computeDashboardPath = (
      roleName?: string | null,
      isGroupAdminFlag?: boolean,
      email?: string | null
    ): string => {
      const rv = (roleName || '').toLowerCase();
      const e = (email || '').toLowerCase();
      if (isGroupAdminFlag) return '/group-admin';
      if (rv === 'dealer_group_admin' || rv.includes('group')) return '/group-admin';
      if (
        rv === 'single_finance_manager' ||
        (rv === 'finance_manager' && (e.includes('finance') || e.includes('testfinance')))
      ) {
        return '/dashboard/single-finance';
      }
      if (rv === 'finance_manager' || rv.includes('finance')) return '/dashboard/finance';
      if (rv === 'sales_manager' || rv.includes('sales_manager')) return '/dashboard/sales-manager';
      if (rv === 'general_manager' || rv.includes('general')) return '/dashboard/gm';
      if (rv === 'area_vice_president' || rv.includes('vice_president'))
        return '/avp-full-dashboard';
      if (
        rv === 'single_dealer_admin' ||
        rv === 'dealership_admin' ||
        rv.includes('dealership_admin') ||
        rv === 'admin'
      )
        return '/dashboard/admin';
      return '/dashboard/sales';
    };

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (noRedirect || forceLogin) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const metaRole = (session.user.user_metadata as any)?.role as string | undefined;
        const isGA = !!(session.user.user_metadata as any)?.is_group_admin;
        if (metaRole) {
          window.location.href = computeDashboardPath(metaRole, isGA, session.user.email || null);
        } else {
          supabase
            .from('profiles')
            .select('role,is_group_admin')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              const role = data?.role || null;
              const isGroupAdmin = !!data?.is_group_admin;
              window.location.href = computeDashboardPath(
                role,
                isGroupAdmin,
                session.user.email || null
              );
            })
            .catch(() => {
              window.location.href = '/dashboard/sales';
            });
        }
      }
    });
    // As a safety, if a token already exists, redirect after short delay
    const tokenCheck = setTimeout(() => {
      if (!noRedirect && !forceLogin && quickHasSupabaseSessionToken()) {
        window.location.href = '/dashboard';
      }
    }, 1500);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(tokenCheck);
    };
  }, [noRedirect, forceLogin]);

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

  // Do not block rendering while loading; show the form with a subtle notice instead

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
              {loading && (
                <p className="text-xs text-blue-700 text-center bg-blue-50 border border-blue-200 rounded p-2">
                  Checking your session… You can still log in below.
                </p>
              )}
              {connectivity && !connectivity.ok && (
                <p className="text-xs text-red-700 text-center bg-red-50 border border-red-200 rounded p-2">
                  Supabase connection check failed. Please verify network access and environment
                  keys.
                </p>
              )}
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
