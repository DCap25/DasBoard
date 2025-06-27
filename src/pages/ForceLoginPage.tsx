import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { TEST_USERS, loginWithTestAccount, getRedirectPath } from '../lib/directAuth';

// Mock auth tokens for testing - these are example tokens that won't work in production
const ACCESS_TOKEN = 'example-access-token-placeholder';
const REFRESH_TOKEN = 'example-refresh-token-placeholder';

/**
 * This page forces authentication by directly manipulating localStorage
 * to inject tokens that Supabase will recognize as a valid session
 */
const ForceLoginPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check URL for a special parameter to clear all auth data
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('reset')) {
      handleCompleteReset();
    }
  }, []);

  const handleCompleteReset = () => {
    try {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      setMessage(
        'All authentication data has been completely cleared. You can now use any login option.'
      );
      setStatus('success');
    } catch (err) {
      console.error('Reset error:', err);
      setMessage('Error while resetting: ' + String(err));
      setStatus('error');
    }
  };

  const handleLogin = () => {
    try {
      setLoading(true);
      setMessage('');
      setStatus('idle');

      // 1. Log in with direct auth first
      const userToLogin = TEST_USERS[selectedUser];
      loginWithTestAccount(userToLogin.email);

      // 2. Get storage key for Supabase
      const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'dasboard';
      const storageKey = `sb-${projectRef}-auth-token`;

      // 3. Create fake session data
      const fakeSession = {
        access_token: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN,
        expires_at: Date.now() + 3600 * 1000, // 1 hour from now
        expires_in: 3600,
        user: {
          id: userToLogin.id,
          email: userToLogin.email,
          role: userToLogin.role,
          user_metadata: {
            name: userToLogin.name,
            role: userToLogin.role,
            is_admin: !!userToLogin.isAdmin,
            is_group_admin: !!userToLogin.isGroupAdmin,
            dealership_id: userToLogin.dealershipId,
          },
        },
      };

      // 4. Set the session in localStorage
      localStorage.setItem(storageKey, JSON.stringify(fakeSession));

      // 5. Show success message
      setMessage(`Forced login successful for ${userToLogin.email}. You can now go to:`);
      setStatus('success');
    } catch (err) {
      console.error('Force login error:', err);
      setMessage('Error forcing login: ' + String(err));
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      // Clear all localStorage
      localStorage.clear();
      sessionStorage.clear();

      setMessage('All auth data cleared. You are now logged out.');
      setStatus('success');

      // Force reload to clear any cached state
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error('Logout error:', err);
      setMessage('Error logging out: ' + String(err));
      setStatus('error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-2xl text-center">Force Login</CardTitle>
              <Button variant="destructive" size="sm" onClick={handleCompleteReset}>
                Reset All Auth
              </Button>
            </div>
            <p className="text-center text-gray-500 text-sm">
              Force authentication by directly manipulating local storage
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is an emergency bypass. Use only when all other login methods fail.
              </AlertDescription>
            </Alert>

            <div>
              <label className="block text-sm font-medium mb-2">Select Test Account</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedUser}
                onChange={e => setSelectedUser(Number(e.target.value))}
                disabled={loading}
              >
                {TEST_USERS.map((user, index) => (
                  <option key={index} value={index}>
                    {user.name || user.email} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-100 p-3 rounded text-sm">
              <div>
                <strong>Email:</strong> {TEST_USERS[selectedUser].email}
              </div>
              <div>
                <strong>Role:</strong> {TEST_USERS[selectedUser].role}
              </div>
              <div>
                <strong>Redirects to:</strong> {getRedirectPath(TEST_USERS[selectedUser])}
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded text-sm ${
                  status === 'success'
                    ? 'bg-green-100 text-green-800'
                    : status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {message}

                {status === 'success' && (
                  <div className="mt-2">
                    <a
                      href={getRedirectPath(TEST_USERS[selectedUser])}
                      className="inline-block bg-green-600 text-white px-3 py-1 rounded mt-1 hover:bg-green-700"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between gap-2">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full"
              variant="destructive"
            >
              {loading ? 'Forcing login...' : 'Force Login'}
            </Button>

            <Button onClick={handleLogout} variant="outline" className="w-1/3">
              Clear All
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-4 text-center space-y-2">
          <a
            href="/direct-login"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline block"
          >
            Try Regular Direct Login
          </a>
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800 hover:underline block">
            Return to Regular Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForceLoginPage;
