import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * This page provides direct access to any dashboard by bypassing the authentication flow
 * For development and testing purposes only
 */
const DashboardSelector: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Select a dashboard to access');
  const [error, setError] = useState<string | null>(null);
  const [useBypass, setUseBypass] = useState(true); // Default to bypass mode

  const dashboards = [
    { name: 'Master Admin', path: '/master-admin', email: 'testadmin@example.com', role: 'admin' },
    {
      name: 'Group Admin',
      path: '/group-admin',
      email: 'group1.admin@exampletest.com',
      role: 'dealer_group_admin',
    },
    {
      name: 'Dealership Admin',
      path: '/dashboard/admin',
      email: 'dealer1.admin@exampletest.com',
      role: 'dealership_admin',
    },
    {
      name: 'Finance Manager',
      path: '/dashboard/finance',
      email: 'finance@exampletest.com',
      role: 'finance_manager',
    },
    {
      name: 'Single Finance Manager',
      path: '/dashboard/single-finance',
      email: 'testfinance@example.com',
      role: 'single_finance_manager',
    },
    {
      name: 'Sales Manager',
      path: '/dashboard/sales-manager',
      email: 'sales.manager@exampletest.com',
      role: 'sales_manager',
    },
    {
      name: 'General Manager',
      path: '/dashboard/gm',
      email: 'gm@exampletest.com',
      role: 'general_manager',
    },
    {
      name: 'Salesperson',
      path: '/dashboard/sales',
      email: 'sales@exampletest.com',
      role: 'salesperson',
    },
  ];

  // Direct bypass method - just store user info and redirect
  const bypassAuth = (dashboard: (typeof dashboards)[0]) => {
    try {
      console.log(`[DashboardSelector] Using direct bypass for ${dashboard.name}`);

      // First completely clear ALL authentication data
      console.log('[DashboardSelector] Clearing all auth data');
      localStorage.removeItem('direct_auth_user');
      localStorage.removeItem('directauth_user');
      localStorage.removeItem('directauth_timestamp');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.expires_at');
      localStorage.removeItem('supabase.auth.expires_in');

      // Store the user info in localStorage for direct auth
      console.log('[DashboardSelector] Setting new auth data for', dashboard.email);
      const userData = {
        id: `${dashboard.role}-id-${Date.now()}`,
        email: dashboard.email,
        role: dashboard.role,
        isAdmin: dashboard.role === 'admin',
        isGroupAdmin: dashboard.role === 'dealer_group_admin',
        name: dashboard.name,
        dealershipId:
          dashboard.role === 'dealership_admin' || dashboard.role === 'single_finance_manager'
            ? 1
            : undefined,
      };

      localStorage.setItem('directauth_user', JSON.stringify(userData));
      localStorage.setItem('directauth_timestamp', Date.now().toString());

      // Force an immediate redirect
      console.log(`[DashboardSelector] Redirecting to ${dashboard.path}`);
      window.location.href = dashboard.path;
    } catch (err) {
      console.error('[DashboardSelector] Bypass error:', err);
      setError(`Bypass failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const accessDashboard = async (dashboard: (typeof dashboards)[0]) => {
    if (useBypass) {
      bypassAuth(dashboard);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(`Accessing ${dashboard.name} dashboard...`);

    try {
      // 1. Clear existing session and storage
      console.log('[DashboardSelector] Clearing existing session...');
      await supabase.auth.signOut();
      localStorage.clear();
      // Use window.sessionStorage to fix linter error
      window.sessionStorage.clear();

      // 2. Login with the test account for this role - with better error handling
      console.log(`[DashboardSelector] Signing in as ${dashboard.email}...`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dashboard.email,
        password: 'test123', // Default test password
      });

      if (error) {
        console.error('[DashboardSelector] Sign in error:', error);
        throw error;
      }

      if (!data || !data.user) {
        console.error('[DashboardSelector] No user data returned from sign in');
        throw new Error('Authentication failed - no user data returned');
      }

      console.log(`[DashboardSelector] Logged in as ${dashboard.email}`);

      // Special case for fast routing - skip the metadata updates to avoid issues
      if (dashboard.role === 'single_finance_manager' || dashboard.role === 'finance_manager') {
        console.log(
          '[DashboardSelector] Using direct navigation for Finance Manager:',
          dashboard.role
        );
        // Force direct navigation instead of React Router to avoid auth redirects
        window.location.href = dashboard.path;
        return; // Exit early
      }

      // 3. Set appropriate role in user metadata
      console.log(`[DashboardSelector] Updating user metadata with role: ${dashboard.role}`);
      const userUpdateResult = await supabase.auth.updateUser({
        data: {
          role: dashboard.role,
          is_group_admin: dashboard.role === 'dealer_group_admin',
        },
      });

      if (userUpdateResult.error) {
        console.error('[DashboardSelector] User metadata update error:', userUpdateResult.error);
        // Continue anyway - this might not be critical
      }

      // 4. Update profile record - with better error handling
      console.log(`[DashboardSelector] Updating profile record for user: ${data.user.id}`);
      const profileUpdateResult = await supabase
        .from('profiles')
        .update({
          role: dashboard.role,
          is_group_admin: dashboard.role === 'dealer_group_admin',
        })
        .eq('id', data.user.id);

      if (profileUpdateResult.error) {
        console.error('[DashboardSelector] Profile update error:', profileUpdateResult.error);
        // Continue anyway - this might not be critical
      }

      // 5. Force redirect to appropriate dashboard using direct browser navigation
      // This bypasses React Router and any potential redirect loops
      console.log(`[DashboardSelector] Redirecting to: ${dashboard.path}`);
      window.location.href = dashboard.path;
    } catch (err) {
      console.error('[DashboardSelector] Error:', err);
      setError(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Direct Access</h1>
          <p className="text-sm text-red-500 font-bold">FOR DEVELOPMENT USE ONLY</p>

          <div className="flex items-center mb-2 w-full justify-between">
            <span className="text-sm text-gray-700">Authentication Method:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setUseBypass(true)}
                className={`px-3 py-1 text-xs rounded ${
                  useBypass ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Quick Bypass
              </button>
              <button
                onClick={() => setUseBypass(false)}
                className={`px-3 py-1 text-xs rounded ${
                  !useBypass ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                Full Auth
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 text-red-800 w-full">
              <p>{error}</p>
            </div>
          )}

          <p className="text-center text-gray-600">{message}</p>

          <div className="grid grid-cols-1 gap-3 w-full">
            {dashboards.map(dashboard => (
              <button
                key={dashboard.path}
                onClick={() => accessDashboard(dashboard)}
                disabled={loading}
                className={`p-3 rounded-md text-white w-full
                  ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
                  ${dashboard.name === 'Master Admin' ? 'bg-purple-700 hover:bg-purple-800' : ''}
                  ${dashboard.name === 'Group Admin' ? 'bg-green-600 hover:bg-green-700' : ''}
                  ${
                    dashboard.name.includes('Finance Manager')
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : ''
                  }
                `}
              >
                {dashboard.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4 w-full">
            <a href="/" className="text-sm text-blue-600 hover:underline">
              Back to regular login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;
