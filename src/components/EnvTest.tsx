import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export const EnvTest: React.FC = () => {
  const [fetchTest, setFetchTest] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [supabaseTest, setSupabaseTest] = useState<any>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const testDirectFetch = async () => {
    setFetchLoading(true);
    setFetchTest(null);

    try {
      const url = `${envVars.VITE_SUPABASE_URL}/rest/v1/dealerships?select=id,name&limit=1`;
      console.log('[FETCH TEST] Testing direct fetch to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${envVars.VITE_SUPABASE_ANON_KEY}`,
          apikey: envVars.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });

      console.log('[FETCH TEST] Response status:', response.status);
      console.log('[FETCH TEST] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        setFetchTest({
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        return;
      }

      const data = await response.json();
      console.log('[FETCH TEST] Response data:', data);

      setFetchTest({
        success: true,
        status: response.status,
        data: data,
      });
    } catch (error) {
      console.error('[FETCH TEST] Fetch error:', error);
      setFetchTest({
        success: false,
        error: error.message,
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const testSupabaseClient = async () => {
    setSupabaseLoading(true);
    setSupabaseTest(null);

    try {
      console.log('[SUPABASE TEST] Creating new Supabase client...');

      // Create a fresh Supabase client instance
      const testClient = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      console.log('[SUPABASE TEST] Client created, testing query...');

      // Add timeout to the Supabase query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase query timeout after 5 seconds')), 5000);
      });

      const queryPromise = testClient.from('dealerships').select('id, name').limit(1);

      console.log('[SUPABASE TEST] Starting query with timeout...');
      const result = await Promise.race([queryPromise, timeoutPromise]);

      console.log('[SUPABASE TEST] Query completed:', result);

      if (result.error) {
        setSupabaseTest({
          success: false,
          error: result.error,
        });
      } else {
        setSupabaseTest({
          success: true,
          data: result.data,
        });
      }
    } catch (error) {
      console.error('[SUPABASE TEST] Error:', error);
      setSupabaseTest({
        success: false,
        error: error.message,
      });
    } finally {
      setSupabaseLoading(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded space-y-4">
      <h3 className="font-semibold mb-2">Environment Variables Test</h3>
      <div className="space-y-2">
        <div>
          <strong>URL:</strong> {envVars.VITE_SUPABASE_URL}
        </div>
        <div>
          <strong>API Key:</strong> {envVars.VITE_SUPABASE_ANON_KEY}
        </div>
        <div>
          <strong>Mode:</strong> {envVars.MODE}
        </div>
        <div>
          <strong>Dev:</strong> {envVars.DEV ? 'true' : 'false'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <button
            onClick={testDirectFetch}
            disabled={fetchLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {fetchLoading ? 'Testing...' : 'Test Direct Fetch'}
          </button>

          {fetchTest && (
            <div className="mt-2 p-2 bg-white border rounded">
              <strong>Direct Fetch Result:</strong>
              <pre className="text-xs mt-1">{JSON.stringify(fetchTest, null, 2)}</pre>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={testSupabaseClient}
            disabled={supabaseLoading}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {supabaseLoading ? 'Testing...' : 'Test Supabase Client'}
          </button>

          {supabaseTest && (
            <div className="mt-2 p-2 bg-white border rounded">
              <strong>Supabase Client Result:</strong>
              <pre className="text-xs mt-1">{JSON.stringify(supabaseTest, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvTest;
