import React from 'react';

// Quick component to test Supabase environment variables
export function SupabaseTest() {
  const checkEnv = () => {
    console.log('=== Environment Variable Check ===');
    console.log('import.meta.env.VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('import.meta.env.VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    console.log('import.meta.env.MODE:', import.meta.env.MODE);
    console.log('import.meta.env.DEV:', import.meta.env.DEV);
    console.log('import.meta.env.PROD:', import.meta.env.PROD);
    
    // Try to import and check Supabase client
    import('../lib/supabaseClient').then(module => {
      console.log('=== Supabase Client Check ===');
      console.log('Module imported successfully');
      
      try {
        // Test the environment validation
        const validation = module.validateSupabaseEnvironment?.();
        console.log('Environment validation result:', validation);
      } catch (error) {
        console.error('Environment validation error:', error);
      }
      
      try {
        // Test client creation
        const client = module.supabase;
        console.log('Supabase client:', client ? 'CREATED' : 'FAILED');
      } catch (error) {
        console.error('Supabase client creation error:', error);
      }
    }).catch(error => {
      console.error('Failed to import supabaseClient:', error);
    });
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Supabase Environment Test</h3>
      <button onClick={checkEnv} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
        Test Environment Variables
      </button>
      <p style={{ fontSize: '12px', marginTop: '10px' }}>
        Click the button and check the browser console for results.
      </p>
    </div>
  );
}