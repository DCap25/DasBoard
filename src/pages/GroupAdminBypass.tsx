import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/**
 * This is a special page that provides direct authentication for group admin test users
 * It bypasses the regular flow and directly handles the auth + redirection
 */
const GroupAdminBypass: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Click the button to log in as group admin');
  const [countdown, setCountdown] = useState(3);

  // Auto-login if there's a query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auto') === 'true') {
      handleGroupAdminLogin();
    }
  }, []);

  // Countdown and redirect after successful login
  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/group-admin';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleGroupAdminLogin = async () => {
    setStatus('loading');
    setMessage('Logging in...');

    try {
      // First clear any existing session to prevent issues
      await supabase.auth.signOut();

      // Clear localStorage
      localStorage.clear();

      // Clear any existing direct auth
      if ('logout' in window) {
        try {
          // @ts-ignore
          window.logout();
        } catch (e) {
          console.error('Error calling direct logout:', e);
        }
      }

      // Set a flag to force redirect after login
      localStorage.setItem('bypass_redirect', '/group-admin');

      // Wait a moment to ensure logout is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // SECURITY FIX: Only allow in development mode
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('This bypass is only available in development mode');
      }

      // Use environment variables for test credentials
      const testEmail = import.meta.env.VITE_TEST_ADMIN_EMAIL;
      const testPassword = import.meta.env.VITE_TEST_ADMIN_PASSWORD;

      if (!testEmail || !testPassword) {
        throw new Error(
          'Test credentials not configured. Please set VITE_TEST_ADMIN_EMAIL and VITE_TEST_ADMIN_PASSWORD in your .env file'
        );
      }

      // Now login with the test group admin credentials from environment
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        throw error;
      }

      console.log('[GroupAdminBypass] Login successful:', data);

      // Add metadata for group admin
      await supabase.auth.updateUser({
        data: {
          is_group_admin: true,
          role: 'dealer_group_admin',
        },
      });

      // Update profile record
      await supabase
        .from('profiles')
        .update({
          is_group_admin: true,
          role: 'dealer_group_admin',
        })
        .eq('id', data.user.id);

      setStatus('success');
      setMessage('Login successful! Redirecting to group admin dashboard...');

      // Force immediate redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/group-admin';
      }, 3000);
    } catch (error) {
      console.error('[GroupAdminBypass] Login error:', error);
      setStatus('error');
      setMessage(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Group Admin Login Bypass</h1>

          <p className="text-center text-gray-600">{message}</p>

          {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />}

          {status === 'success' && (
            <p className="text-green-600 font-semibold">Redirecting in {countdown} seconds...</p>
          )}

          {status === 'error' && (
            <p className="text-red-600">An error occurred. Please try again.</p>
          )}

          {status === 'idle' && (
            <button
              onClick={handleGroupAdminLogin}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Login as Group Admin
            </button>
          )}

          {status === 'error' && (
            <button
              onClick={handleGroupAdminLogin}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          )}

          <a href="/" className="text-sm text-indigo-600 hover:underline">
            Back to regular login
          </a>
        </div>
      </div>
    </div>
  );
};

export default GroupAdminBypass;
