import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface AuthDebugInfoProps {
  show?: boolean;
}

export const AuthDebugger: React.FC<AuthDebugInfoProps> = ({ show = true }) => {
  const [showDebug, setShowDebug] = useState(show);
  const [storedSession, setStoredSession] = useState<any>(null);
  const [rawLocalStorage, setRawLocalStorage] = useState<string>('');
  const [authLog, setAuthLog] = useState<string[]>([]);

  const {
    user,
    role,
    loading,
    hasSession,
    authCheckComplete,
    dealershipId,
    userRole,
    isGroupAdmin,
    error,
  } = useAuth();

  // Fetch session from localStorage on component mount
  useEffect(() => {
    try {
      // Add log entry
      setAuthLog(prev => [...prev, `AuthDebugger initialized at ${new Date().toISOString()}`]);

      // Get raw localStorage content
      const rawContent = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            rawContent[key] = value;
          } catch (err) {
            console.error(`Error reading localStorage key ${key}:`, err);
          }
        }
      }
      setRawLocalStorage(JSON.stringify(rawContent, null, 2));

      // Try to get specific session data
      const sb_session = localStorage.getItem(
        'sb-' + import.meta.env.VITE_SUPABASE_PROJECT_ID + '-auth-token'
      );
      if (sb_session) {
        try {
          setStoredSession(JSON.parse(sb_session));
          setAuthLog(prev => [...prev, `Found session data in localStorage`]);
        } catch (err) {
          console.error('Error parsing session data:', err);
          setAuthLog(prev => [...prev, `Error parsing session data: ${err.message}`]);
        }
      } else {
        setAuthLog(prev => [...prev, `No session found in localStorage`]);
      }
    } catch (err) {
      console.error('Error accessing localStorage:', err);
      setAuthLog(prev => [...prev, `Error accessing localStorage: ${err.message}`]);
    }
  }, []);

  // Log state changes
  useEffect(() => {
    setAuthLog(prev => [
      ...prev,
      `Auth state update at ${new Date().toISOString()} - loading: ${loading}, hasSession: ${hasSession}, authCheckComplete: ${authCheckComplete}`,
    ]);
  }, [loading, hasSession, authCheckComplete]);

  if (!showDebug) {
    return (
      <div
        className="fixed bottom-4 right-4 p-2 bg-yellow-100 rounded shadow cursor-pointer"
        onClick={() => setShowDebug(true)}
      >
        Show Auth Debug
      </div>
    );
  }

  // Function to fix auth issues
  const forceAuthRecheck = async () => {
    setAuthLog(prev => [...prev, `Forcing auth recheck at ${new Date().toISOString()}`]);

    try {
      // Get current session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setAuthLog(prev => [...prev, `Error getting session: ${error.message}`]);
        return;
      }

      if (data?.session) {
        setAuthLog(prev => [
          ...prev,
          `Session exists but not properly recognized by app, fixing...`,
        ]);
        // Manually set localStorage
        const sessionString = JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        });

        // Directly set localStorage
        localStorage.setItem(
          'sb-' + import.meta.env.VITE_SUPABASE_PROJECT_ID + '-auth-token',
          sessionString
        );
        setAuthLog(prev => [...prev, `Session manually updated in localStorage`]);

        // Force reload
        window.location.reload();
      } else {
        setAuthLog(prev => [...prev, `No active session found`]);
      }
    } catch (err) {
      setAuthLog(prev => [...prev, `Error in auth recheck: ${err.message}`]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 text-white p-4 z-50 overflow-auto">
      <div className="max-w-3xl mx-auto bg-gray-900 p-4 rounded-lg">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Authentication Debugger</h2>
          <button
            className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            onClick={() => setShowDebug(false)}
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="font-bold mb-2">Authentication State</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-400">Loading:</span> {loading ? '✓' : '✗'}
              </p>
              <p>
                <span className="text-gray-400">Auth Check Complete:</span>{' '}
                {authCheckComplete ? '✓' : '✗'}
              </p>
              <p>
                <span className="text-gray-400">Has Session:</span> {hasSession ? '✓' : '✗'}
              </p>
              <p>
                <span className="text-gray-400">User:</span> {user ? user.email : 'Not logged in'}
              </p>
              <p>
                <span className="text-gray-400">Role:</span> {role || 'Unknown'}
              </p>
              <p>
                <span className="text-gray-400">User Role:</span> {userRole || 'Unknown'}
              </p>
              <p>
                <span className="text-gray-400">Is Group Admin:</span> {isGroupAdmin ? '✓' : '✗'}
              </p>
              <p>
                <span className="text-gray-400">Dealership ID:</span> {dealershipId || 'None'}
              </p>
              <p>
                <span className="text-gray-400">Error:</span>
                {error ? <span className="text-red-400">{error.message}</span> : 'None'}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h3 className="font-bold mb-2">Session Storage</h3>
            <p className="mb-2 text-sm">
              {storedSession
                ? `Session expires: ${new Date(
                    storedSession.expires_at * 1000
                  ).toLocaleTimeString()}`
                : 'No session in localStorage'}
            </p>
            <button
              className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm"
              onClick={forceAuthRecheck}
            >
              Force Auth Recheck
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-800 p-3 rounded">
            <h3 className="font-bold mb-2">Auth Event Log</h3>
            <div className="h-32 overflow-y-auto text-xs font-mono bg-black/50 p-2 rounded">
              {authLog.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h3 className="font-bold mb-2">Raw Local Storage</h3>
            <pre className="h-32 overflow-auto text-xs bg-black/50 p-2 rounded">
              {rawLocalStorage}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;
