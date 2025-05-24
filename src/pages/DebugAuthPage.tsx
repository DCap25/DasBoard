import React, { useState, useEffect } from 'react';
import { supabase, isTestEmail } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RefreshCw, Info, AlertCircle } from 'lucide-react';

// Test account presets
const TEST_ACCOUNTS = [
  {
    name: 'Master Admin',
    email: 'testadmin@example.com',
    password: 'password123',
    redirectPath: '/master-admin',
    metadata: { role: 'admin', is_admin: true },
  },
  {
    name: 'Group Admin',
    email: 'group1.admin@exampletest.com',
    password: 'password123',
    redirectPath: '/group-admin',
    metadata: { role: 'dealer_group_admin', is_group_admin: true },
  },
  {
    name: 'Dealership Admin',
    email: 'dealer1.admin@exampletest.com',
    password: 'password123',
    redirectPath: '/dashboard/admin',
    metadata: { role: 'dealership_admin', dealership_id: 1 },
  },
  {
    name: 'Sales Manager',
    email: 'sales.manager@exampletest.com',
    password: 'password123',
    redirectPath: '/dashboard/sales-manager',
    metadata: { role: 'sales_manager', dealership_id: 1 },
  },
  {
    name: 'Salesperson',
    email: 'sales@exampletest.com',
    password: 'password123',
    redirectPath: '/dashboard/sales',
    metadata: { role: 'salesperson', dealership_id: 1 },
  },
];

/**
 * Enhanced auth debug page that provides direct login functionality for test accounts
 */
const DebugAuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState(0);

  // Check current auth status on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setAuthStatus(null);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth check error:', error);
        setAuthStatus({ error: error.message });
      } else {
        console.log('Auth check result:', data);
        setAuthStatus(data);
      }
    } catch (err) {
      console.error('Exception checking auth:', err);
      setAuthStatus({ error: 'Exception checking auth status' });
    }
  };

  // Direct login - enhanced version with metadata setting
  const handleDirectLogin = async (usePreset = false) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Get login details - either from form or preset
      const loginEmail = usePreset ? TEST_ACCOUNTS[selectedAccount].email : email;
      const loginPassword = usePreset ? TEST_ACCOUNTS[selectedAccount].password : password;
      const metadata = usePreset ? TEST_ACCOUNTS[selectedAccount].metadata : null;
      const redirectPath = usePreset ? TEST_ACCOUNTS[selectedAccount].redirectPath : null;

      console.log(`Attempting login for ${loginEmail}`);

      // Sign out first to ensure clean state
      await supabase.auth.signOut();

      // Perform login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return;
      }

      console.log('Login success:', data);

      // Set user metadata if needed (mostly for test accounts)
      if (metadata && data.user) {
        try {
          console.log('Setting user metadata:', metadata);
          await supabase.auth.updateUser({ data: metadata });
          setSuccess('User metadata updated successfully');
        } catch (metadataError) {
          console.error('Error setting user metadata:', metadataError);
          // Continue anyway - the login was successful
        }
      }

      setSuccess('Login successful! Redirecting...');

      // Special handling for test accounts
      if (isTestEmail(loginEmail)) {
        // If testadmin@example.com - go to master admin
        if (loginEmail === 'testadmin@example.com') {
          setTimeout(() => (window.location.href = '/master-admin'), 1000);
          return;
        }

        // If group admin - go to group admin
        if (loginEmail.includes('group') && loginEmail.includes('@exampletest.com')) {
          // Set session storage flag as fallback
          sessionStorage.setItem('is_group_admin', 'true');
          setTimeout(() => (window.location.href = '/group-admin'), 1000);
          return;
        }

        // For other roles, use the redirect path or fall back to dashboard
        setTimeout(() => (window.location.href = redirectPath || '/dashboard'), 1000);
        return;
      }

      // For non-test accounts, redirect to dashboard
      setTimeout(() => (window.location.href = '/dashboard'), 1000);
    } catch (err) {
      console.error('Login exception:', err);
      setError('Unexpected error during login');
    } finally {
      setLoading(false);
    }
  };

  // Force sign out and clear storage
  const handleForceSignOut = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all relevant storage
      localStorage.removeItem(`sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`);
      sessionStorage.removeItem('is_group_admin');

      setSuccess('Signed out successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-2">Auth Debug Page</h1>
      <p className="text-gray-500 mb-8">
        Use this page to bypass the normal authentication flow for testing
      </p>

      <div className="w-full max-w-2xl mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Auth Status</span>
              <Button variant="ghost" size="sm" onClick={checkAuth} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {authStatus ? (
              <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                <pre>{JSON.stringify(authStatus, null, 2)}</pre>
              </div>
            ) : (
              <p>Checking auth status...</p>
            )}

            {authStatus?.session && (
              <Alert className="mt-4 bg-blue-50">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You are currently logged in as <strong>{authStatus.session.user.email}</strong>
                </AlertDescription>
              </Alert>
            )}

            {!authStatus?.session && (
              <Alert className="mt-4 bg-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You are currently not logged in</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleForceSignOut} disabled={loading}>
              Force Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="w-full max-w-2xl">
        <Tabs defaultValue="presets">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="presets">Test Account Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom Login</TabsTrigger>
          </TabsList>

          <TabsContent value="presets">
            <Card>
              <CardHeader>
                <CardTitle>Login with Test Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Test Account</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedAccount}
                      onChange={e => setSelectedAccount(Number(e.target.value))}
                    >
                      {TEST_ACCOUNTS.map((account, index) => (
                        <option key={index} value={index}>
                          {account.name} ({account.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-md text-sm">
                    <p>
                      <strong>Email:</strong> {TEST_ACCOUNTS[selectedAccount].email}
                    </p>
                    <p>
                      <strong>Password:</strong> {TEST_ACCOUNTS[selectedAccount].password}
                    </p>
                    <p>
                      <strong>Role:</strong> {TEST_ACCOUNTS[selectedAccount].metadata.role}
                    </p>
                    <p>
                      <strong>Redirects to:</strong> {TEST_ACCOUNTS[selectedAccount].redirectPath}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                      {success}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleDirectLogin(true)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Logging in...' : 'Login with Selected Account'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Custom Login</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="password"
                    />
                  </div>
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                      {success}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleDirectLogin(false)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Logging in...' : 'Login Directly'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DebugAuthPage;
