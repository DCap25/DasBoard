import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  TEST_USERS,
  loginWithTestAccount,
  isAuthenticated,
  getCurrentUser,
  getRedirectPath,
  logout,
} from '../lib/directAuth';

const DirectLoginPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user) {
        setMessage(`Already logged in as ${user.email}. Redirecting...`);
        setStatus('success');

        // Redirect after a short delay
        const timer = setTimeout(() => {
          navigate(getRedirectPath(user));
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    setLoading(true);
    setMessage('');
    setStatus('idle');

    const selectedEmail = TEST_USERS[selectedUser].email;
    const result = loginWithTestAccount(selectedEmail);

    if (result.success) {
      setMessage(result.message + ' - Redirecting...');
      setStatus('success');

      // Get the user and find the correct redirect path
      const user = getCurrentUser();
      if (user) {
        setTimeout(() => {
          navigate(getRedirectPath(user));
        }, 1500);
      }
    } else {
      setMessage(result.message);
      setStatus('error');
    }

    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    setMessage('Logged out successfully');
    setStatus('success');
    window.location.reload(); // Reload to clear any cached state
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Direct Login</CardTitle>
            <p className="text-center text-gray-500 text-sm">
              Simplified login without Supabase authentication
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Test Account</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button onClick={handleLogin} disabled={loading} className="w-full mr-2">
              {loading ? 'Logging in...' : 'Login as Selected User'}
            </Button>

            {isAuthenticated() && (
              <Button onClick={handleLogout} variant="outline" className="w-1/3">
                Log Out
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            Return to regular login
          </a>
        </div>
      </div>
    </div>
  );
};

export default DirectLoginPage;
