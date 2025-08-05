import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Dashboard Selector - Access to All Dashboards
 * For development and testing purposes - provides direct access to any dashboard role
 * This is the original dashboard selector without demo functionality
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
      name: 'Finance Director',
      path: '/dashboard/finance-director',
      email: 'finance.director@exampletest.com',
      role: 'finance_director',
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
    {
      name: 'Area Vice President',
      path: '/avp-full-dashboard',
      email: 'avp@exampletest.com',
      role: 'area_vice_president',
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

      // SECURITY FIX: Only allow in development mode
      if (process.env.NODE_ENV !== 'development') {
        throw new Error('Demo mode is only available in development');
      }

      // Use environment variable for test password
      const testPassword = import.meta.env.VITE_TEST_USER_PASSWORD || 'defaultTestPassword123';

      // 2. Login with the test account for this role - with better error handling
      console.log(`[DashboardSelector] Signing in as ${dashboard.email}...`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dashboard.email,
        password: testPassword,
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
          email: dashboard.email,
        },
      });

      if (userUpdateResult.error) {
        console.error('[DashboardSelector] User metadata update error:', userUpdateResult.error);
        // Continue anyway - metadata update failure shouldn't block access
      }

      // 4. Update the profiles table
      console.log(`[DashboardSelector] Updating profile record for user: ${data.user.id}`);
      const profileUpdateResult = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: dashboard.email,
          role: dashboard.role,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (profileUpdateResult.error) {
        console.error('[DashboardSelector] Profile update error:', profileUpdateResult.error);
        // Continue anyway
      }

      // 5. Navigate to the dashboard
      console.log(`[DashboardSelector] Redirecting to: ${dashboard.path}`);
      window.location.href = dashboard.path;
    } catch (err) {
      console.error('[DashboardSelector] Error:', err);
      setError(
        `Failed to access dashboard: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Selector
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Development & Testing - Direct Access to All Dashboard Types
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🔧 Development Tool
          </div>
        </div>

        {/* Authentication Method Toggle */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Access Method
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authMethod"
                  checked={useBypass}
                  onChange={() => setUseBypass(true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Direct Bypass (Recommended)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="authMethod"
                  checked={!useBypass}
                  onChange={() => setUseBypass(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Supabase Authentication
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              {message}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {dashboards.map((dashboard, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {dashboard.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <strong>Role:</strong> {dashboard.role}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Email:</strong> {dashboard.email}
                </p>
                <button
                  onClick={() => accessDashboard(dashboard)}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  {loading ? 'Accessing...' : 'Access Dashboard'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This tool is for development and testing purposes only.
            <br />
            In production, users will access dashboards through normal authentication flows.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;
