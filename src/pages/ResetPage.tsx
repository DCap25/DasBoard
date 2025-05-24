import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

/**
 * This page helps resolve redirection loops by providing options to reset
 * auth state and access different parts of the application.
 */
const ResetPage: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const resetEverything = () => {
    try {
      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      setMessage('Authentication data cleared. You may now proceed to any login page.');

      // Reload the page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error clearing data:', err);
      setMessage('Error clearing data: ' + String(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              Auth Reset Center
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                If you're stuck in a redirect loop or can't access certain pages, use the buttons
                below to reset your authentication state.
              </AlertDescription>
            </Alert>

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 mb-4">
                {message}
              </div>
            )}

            <div className="grid gap-4">
              <Button
                onClick={resetEverything}
                className="flex items-center justify-center"
                variant="destructive"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset All Authentication Data
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => (window.location.href = '/?noredirect=true')}
                  variant="outline"
                >
                  Normal Login
                </Button>

                <Button
                  onClick={() => (window.location.href = '/direct-login?noredirect=true')}
                  variant="outline"
                >
                  Direct Login
                </Button>

                <Button
                  onClick={() => (window.location.href = '/debug-auth?noredirect=true')}
                  variant="outline"
                >
                  Debug Login
                </Button>

                <Button
                  onClick={() => (window.location.href = '/force-login?reset=true')}
                  variant="outline"
                >
                  Force Login
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center text-xs text-gray-500">
            Use this page whenever you need to reset your authentication state
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPage;
