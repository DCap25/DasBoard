import { useState } from 'react';
import { X, Bug, Database, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

/**
 * Debug panel for development use only
 * Shows authentication information, last API request, and provides helpful debugging tools
 */
export function DebugPanel() {
  const { user, signOut } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [lastError, setLastError] = useState<any>(null);
  const [lastRequest, setLastRequest] = useState<any>(null);

  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Intercept Supabase requests and errors for monitoring
  // This is a simple implementation - for production use, consider more robust approaches
  const monitorRequests = () => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Only track Supabase API calls
        if (args[0] && args[0].toString().includes('supabase')) {
          setLastRequest({
            url: args[0],
            options: args[1],
            status: response.status,
            timestamp: new Date().toISOString(),
          });
        }

        return response;
      } catch (error) {
        setLastError(error);
        throw error;
      }
    };
  };

  // Capture and display authentication information
  const authInfo = user
    ? {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'Not specified',
        lastSignIn: user.last_sign_in_at,
      }
    : { message: 'Not authenticated' };

  const clearLocalStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Local storage and session storage cleared. Refresh to see changes.');
  };

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);

      if (error) {
        setLastError(error);
        alert(`Connection error: ${error.message}`);
      } else {
        alert(`Connection successful: ${data ? 'Data received' : 'No data'}`);
      }
    } catch (err) {
      setLastError(err);
      alert(`Test failed: ${err}`);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 bg-background rounded-full shadow-lg"
        onClick={() => setIsVisible(!isVisible)}
      >
        <Bug className="h-4 w-4" />
      </Button>

      {isVisible && (
        <Card className="fixed bottom-16 right-4 w-96 shadow-lg z-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Debug Panel</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <Tabs defaultValue="auth">
            <TabsList className="w-full">
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="max-h-64 overflow-auto">
              <CardContent className="pt-4 px-4">
                <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                  {JSON.stringify(authInfo, null, 2)}
                </pre>
              </CardContent>
            </TabsContent>

            <TabsContent value="api" className="max-h-64 overflow-auto">
              <CardContent className="pt-4 px-4">
                <h4 className="text-xs font-semibold mb-1">Last Request</h4>
                <pre className="text-xs bg-muted p-2 rounded-md overflow-auto mb-2">
                  {lastRequest ? JSON.stringify(lastRequest, null, 2) : 'No requests captured yet'}
                </pre>

                <h4 className="text-xs font-semibold mb-1">Last Error</h4>
                <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                  {lastError ? JSON.stringify(lastError, null, 2) : 'No errors captured'}
                </pre>
              </CardContent>
            </TabsContent>

            <TabsContent value="tools">
              <CardContent className="pt-4 px-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={clearLocalStorage}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Clear Storage
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={testSupabaseConnection}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test DB Connection
                </Button>

                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-destructive"
                    onClick={() => signOut()}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="text-xs text-muted-foreground pt-2">
            Dev mode only: this panel won't show in production
          </CardFooter>
        </Card>
      )}
    </>
  );
}
