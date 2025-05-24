import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Special component to handle test user redirects
 * This component is used as a bridge for test logins to ensure redirection works properly
 */
const TestLoginRedirect: React.FC = () => {
  const { user, hasSession } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  useEffect(() => {
    // Determine where to redirect based on user info
    const determineRedirectPath = () => {
      if (!user) {
        return '/auth';
      }

      // Check for group admin
      const isGroupAdmin =
        user.user_metadata?.is_group_admin ||
        (user.email?.toLowerCase().includes('group') &&
          user.email?.toLowerCase().includes('@exampletest.com'));

      if (isGroupAdmin) {
        console.log('[TestLoginRedirect] User is a group admin, redirecting to /group-admin');
        return '/group-admin';
      }

      // Check for master admin
      if (user.email === 'testadmin@example.com' || user.email === 'testadmin@exampletest.com') {
        console.log('[TestLoginRedirect] User is master admin, redirecting to /master-admin');
        return '/master-admin';
      }

      // Default dashboard
      return '/dashboard';
    };

    // Get the path
    const path = determineRedirectPath();
    setTargetPath(path);

    // Set up the countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Force redirection using window.location.href for clean reload
          console.log(`[TestLoginRedirect] Redirecting to ${path}`);
          window.location.href = path;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate, hasSession]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Redirecting...</h1>

          <p className="text-center text-gray-600">
            {user ? <>Welcome, {user.email}!</> : <>No user detected, redirecting to login.</>}
          </p>

          {targetPath && (
            <p className="text-center text-gray-600">
              You will be redirected to <span className="font-bold">{targetPath}</span> in{' '}
              {countdown} seconds...
            </p>
          )}

          <div className="mt-4">
            <button
              onClick={() => {
                if (targetPath) window.location.href = targetPath;
              }}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Go Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLoginRedirect;
