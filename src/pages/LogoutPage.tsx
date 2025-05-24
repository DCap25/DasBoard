import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { logout as directAuthLogout } from '../lib/directAuth';
import { Loader2 } from 'lucide-react';
import { signOut } from '../lib/apiService';

const LogoutPage: React.FC = () => {
  const [message, setMessage] = useState('Signing you out...');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [logoutSteps, setLogoutSteps] = useState<string[]>([]);
  const navigate = useNavigate();

  // Helper function to add a logout step with timestamp
  const addLogoutStep = (step: string) => {
    const timestamp = new Date().toISOString();
    const stepWithTime = `${timestamp} - ${step}`;
    console.log(`[LogoutPage] ${step}`);
    setLogoutSteps(prev => [...prev, stepWithTime]);
  };

  useEffect(() => {
    // Function to check Supabase session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        const hasSession = !!data?.session;

        console.log('[LogoutPage] Session check:', {
          hasSession,
          error: error?.message || null,
          timestamp: new Date().toISOString(),
          sessionExpiry: data?.session?.expires_at
            ? new Date(data.session.expires_at * 1000).toISOString()
            : null,
        });

        return hasSession;
      } catch (e) {
        console.error('[LogoutPage] Error checking session:', e);
        return false;
      }
    };

    // Function to clear all browser storage
    const clearAllStorage = () => {
      try {
        addLogoutStep('Clearing all storage');

        // Clear redirect flags first to prevent redirect loops
        localStorage.removeItem('force_redirect_after_login');
        localStorage.removeItem('force_redirect_timestamp');
        localStorage.removeItem('logout_in_progress');

        // Get localStorage keys for logging
        const localStorageKeys = Object.keys(localStorage);
        console.log('[LogoutPage] LocalStorage keys before clearing:', localStorageKeys);

        // Clear localStorage
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear cookies (non-HTTP only cookies)
        const cookies = document.cookie.split(';');
        console.log('[LogoutPage] Cookies before clearing:', cookies);

        cookies.forEach(cookie => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        addLogoutStep('All storage cleared successfully');
        return true;
      } catch (e) {
        console.error('[LogoutPage] Error clearing storage:', e);
        addLogoutStep(`Error clearing storage: ${e instanceof Error ? e.message : String(e)}`);
        return false;
      }
    };

    const performLogout = async () => {
      try {
        // First check if we have a session
        addLogoutStep('Starting logout process');

        const hasInitialSession = await checkSession();
        addLogoutStep(
          `Initial session check: ${
            hasInitialSession ? 'Active session found' : 'No active session'
          }`
        );

        if (!hasInitialSession) {
          addLogoutStep('No active session found, just clearing storage');
          clearAllStorage();
          setMessage('No active session. Clearing data and redirecting...');
          setIsComplete(true);

          setTimeout(() => {
            window.location.href = '/auth?forcelogin=true';
          }, 1000);
          return;
        }

        // 1. Set logout in progress flag
        localStorage.setItem('logout_in_progress', 'true');
        addLogoutStep('Set logout_in_progress flag');

        // 2. Try to sign out from Supabase using apiService's signOut method first
        try {
          setMessage('Signing out from Supabase...');
          addLogoutStep('Attempting signOut via apiService');

          const startTime = Date.now();
          await signOut();
          const duration = Date.now() - startTime;

          addLogoutStep(`apiService.signOut completed in ${duration}ms`);
        } catch (e) {
          addLogoutStep(
            `Error with apiService.signOut: ${e instanceof Error ? e.message : String(e)}`
          );

          // Fallback to direct Supabase signOut
          try {
            addLogoutStep('Falling back to direct supabase.auth.signOut');
            const startTime = Date.now();
            const { error: supabaseError } = await supabase.auth.signOut();
            const duration = Date.now() - startTime;

            if (supabaseError) {
              addLogoutStep(`Direct Supabase signOut error: ${supabaseError.message}`);
            } else {
              addLogoutStep(`Direct Supabase signOut successful in ${duration}ms`);
            }
          } catch (supabaseException) {
            addLogoutStep(
              `Exception during direct Supabase signOut: ${
                supabaseException instanceof Error
                  ? supabaseException.message
                  : String(supabaseException)
              }`
            );
          }
        }

        // 3. Verify session is gone
        const hasSessionAfterSignOut = await checkSession();
        addLogoutStep(
          `Session check after signOut: ${
            hasSessionAfterSignOut ? 'Session still exists!' : 'Session successfully removed'
          }`
        );

        // 4. Clear direct auth state
        setMessage('Clearing direct auth session...');
        try {
          directAuthLogout();
          addLogoutStep('Direct auth logout successful');
        } catch (e) {
          addLogoutStep(
            `Error during direct auth logout: ${e instanceof Error ? e.message : String(e)}`
          );
        }

        // 5. Clear all storage
        setMessage('Clearing browser storage...');
        const storageCleared = clearAllStorage();
        addLogoutStep(`All storage cleared: ${storageCleared ? 'success' : 'failed'}`);

        // 6. Final check
        const finalSessionCheck = await checkSession();
        addLogoutStep(
          `Final session check: ${
            finalSessionCheck ? 'Session still exists! (unexpected)' : 'No session (expected)'
          }`
        );

        // 7. Complete
        setMessage('Logout successful! Redirecting...');
        setIsComplete(true);

        // 8. Redirect after successful logout with a slight delay to ensure UI updates
        setTimeout(() => {
          addLogoutStep('Redirecting to auth page');
          // Force a full page reload to clear any remaining state
          window.location.href = '/auth?forcelogin=true';
        }, 1000);
      } catch (error) {
        console.error('[LogoutPage] Error during logout process:', error);
        addLogoutStep(
          `Logout process error: ${error instanceof Error ? error.message : String(error)}`
        );

        setError(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setMessage('Error occurred during logout');

        // Even if we encounter an error, try to redirect after a timeout
        setTimeout(() => {
          addLogoutStep('Redirecting after error');
          window.location.href = '/auth?forcelogin=true';
        }, 2000);
      }
    };

    performLogout();

    // Set a maximum timeout to ensure we don't get stuck indefinitely
    const timeout = setTimeout(() => {
      if (!isComplete) {
        addLogoutStep('Logout timeout reached, forcing redirect');
        setMessage('Logout taking too long, redirecting...');
        window.location.href = '/auth?forcelogin=true';
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          {!isComplete && !error ? (
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          ) : error ? (
            <div className="text-red-500">⚠️</div>
          ) : (
            <div className="text-green-500">✓</div>
          )}

          <h1 className="text-2xl font-bold text-gray-900">
            {error ? 'Logout Failed' : isComplete ? 'Logged Out' : 'Logging Out'}
          </h1>

          <p className="text-center text-gray-600">{message}</p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <p className="text-sm text-gray-500">
            {isComplete
              ? 'Redirecting to login page...'
              : error
              ? 'Trying to redirect to login page...'
              : 'You will be redirected to the login page automatically.'}
          </p>

          {/* Show logout steps in development mode */}
          {import.meta.env.DEV && (
            <div className="mt-4 text-xs text-gray-500">
              <details>
                <summary>Logout Steps Log</summary>
                <ul className="mt-2 list-disc pl-5">
                  {logoutSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
