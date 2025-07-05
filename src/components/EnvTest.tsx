import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const EnvTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Get environment variables
    const vars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      USE_MOCK_SUPABASE: import.meta.env.USE_MOCK_SUPABASE,
    };
    setEnvVars(vars);

    // Test Supabase connection
    testConnection(vars);
  }, []);

  const testConnection = async (vars: any) => {
    try {
      if (!vars.VITE_SUPABASE_URL || !vars.VITE_SUPABASE_ANON_KEY) {
        setConnectionStatus('❌ Missing environment variables');
        return;
      }

      // Test direct API call
      const url = `${vars.VITE_SUPABASE_URL}/rest/v1/dealerships?select=id,name&limit=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${vars.VITE_SUPABASE_ANON_KEY}`,
          apikey: vars.VITE_SUPABASE_ANON_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(`✅ Connected! Found ${data.length} dealership(s)`);
      } else {
        const errorText = await response.text();
        setConnectionStatus(`❌ API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Connection failed: ${error}`);
    }
  };

  const testSupabaseClient = async () => {
    try {
      if (!envVars.VITE_SUPABASE_URL || !envVars.VITE_SUPABASE_ANON_KEY) {
        setConnectionStatus('❌ Missing environment variables for client test');
        return;
      }

      setConnectionStatus('Testing Supabase client...');

      const testClient = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
        },
      });

      const { data, error } = await testClient.from('dealerships').select('id, name').limit(1);

      if (error) {
        setConnectionStatus(`❌ Client Error: ${error.message}`);
      } else {
        setConnectionStatus(`✅ Client Connected! Found ${data?.length || 0} dealership(s)`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Client failed: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment & Supabase Test</h1>

      <div className="grid gap-6">
        {/* Environment Variables */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>URL:</strong> {envVars.VITE_SUPABASE_URL}
            </div>
            <div>
              <strong>API Key:</strong> {envVars.VITE_SUPABASE_ANON_KEY}
            </div>
            <div>
              <strong>API URL:</strong> {envVars.VITE_API_URL}
            </div>
            <div>
              <strong>Mock Mode:</strong> {envVars.USE_MOCK_SUPABASE}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Connection Status</h2>
          <p className="text-lg">{connectionStatus}</p>
          <button
            onClick={testSupabaseClient}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Supabase Client
          </button>
        </div>

        {/* Quick Login Test */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Quick Login Test</h2>
          <div className="space-y-2">
            <p>
              <strong>Demo User:</strong> demo@thedasboard.com / password
            </p>
            <p>
              <strong>Admin User:</strong> admindan@thedasboard.com / password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;
