/**
 * Test Helpers for Authentication
 * 
 * These functions test authentication with mock API and live Supabase.
 */

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Mock API test credentials
const mockCredentials = {
  email: 'testsales@example.com',
  password: 'password',
};

// Supabase test credentials
const supabaseCredentials = {
  email: 'testsales@example.com',
  password: 'password',
};

// Supabase connection info
const supabaseUrl = 'https://dijulexxrgfmaiewtavb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTgyNDIzNzksImV4cCI6MjAxMzgxODM3OX0.2CbrPuEklJTJDN_Yx60jnZ-OtQTqmQJwT0X-8dgk--4';

/**
 * Test authentication with the mock API
 */
async function testMockAuth() {
  try {
    console.log(`Testing login with ${mockCredentials.email}...`);
    
    // Test Mock API connection
    const connectionResponse = await fetch('http://localhost:3001/');
    if (!connectionResponse.ok) {
      return {
        success: false,
        error: `Mock API is not running. Status: ${connectionResponse.status}`
      };
    }
    
    console.log('Mock API connection successful');
    
    // Test login
    const loginResponse = await fetch('http://localhost:3001/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockCredentials),
    });
    
    if (!loginResponse.ok) {
      return {
        success: false,
        error: `Login failed with status: ${loginResponse.status}`
      };
    }
    
    const loginData = await loginResponse.json();
    
    if (!loginData.token || !loginData.user) {
      return {
        success: false,
        error: 'Login response missing token or user data'
      };
    }
    
    console.log(`Login successful for user: ${loginData.user.name}`);
    console.log(`Role: ${loginData.user.role}, Dealership: ${loginData.user.dealership_id}`);
    
    // Test getting user profile with token
    const profileResponse = await fetch('http://localhost:3001/auth/profile', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
      },
    });
    
    if (!profileResponse.ok) {
      return {
        success: false,
        error: `Getting profile failed with status: ${profileResponse.status}`
      };
    }
    
    const profileData = await profileResponse.json();
    
    console.log('Profile fetch successful');
    
    return {
      success: true,
      user: profileData,
      token: loginData.token
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error in mock auth test'
    };
  }
}

/**
 * Test authentication with live Supabase
 */
async function testSupabaseAuth() {
  try {
    console.log(`Testing Supabase login with ${supabaseCredentials.email}...`);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test Supabase connection
    const { data: connectionData, error: connectionError } = await supabase
      .from('dealerships')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      return {
        success: false,
        error: `Supabase connection error: ${connectionError.message}`
      };
    }
    
    console.log('Supabase connection successful');
    
    // Test login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword(supabaseCredentials);
    
    if (authError) {
      return {
        success: false,
        error: `Supabase login error: ${authError.message}`
      };
    }
    
    if (!authData.session || !authData.user) {
      return {
        success: false,
        error: 'Supabase login response missing session or user data'
      };
    }
    
    console.log(`Supabase login successful for user ID: ${authData.user.id}`);
    
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      return {
        success: false,
        error: `Getting profile error: ${profileError.message}`
      };
    }
    
    console.log(`Profile found: ${profileData.name}`);
    console.log(`Role: ${profileData.role}, Dealership: ${profileData.dealership_id}`);
    
    // Sign out
    await supabase.auth.signOut();
    
    return {
      success: true,
      user: profileData,
      session: authData.session
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error in Supabase auth test'
    };
  }
}

module.exports = {
  testMockAuth,
  testSupabaseAuth
}; 