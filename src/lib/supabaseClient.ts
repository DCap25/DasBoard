import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import {
  handleSupabaseError,
  withErrorHandling,
  SupabaseErrorType,
  isCORSError,
  isNetworkError,
} from './supabaseErrorHandler';

// Main Supabase config (Das Board Master)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced configuration validation with detailed error messages
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  const errorMessage = `Missing required Supabase configuration: ${missingVars.join(
    ', '
  )}. Please check your .env file.`;
  console.error('[SupabaseClient] Configuration Error:', errorMessage);

  // Log additional debugging information
  console.error('[SupabaseClient] Environment Variables Check:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
    allEnvVars: Object.keys(import.meta.env).filter(key => key.includes('SUPABASE')),
    timestamp: new Date().toISOString(),
  });

  throw new Error(errorMessage);
}

// Validate URL format with enhanced error handling
try {
  new URL(supabaseUrl);
  console.log('[SupabaseClient] URL validation passed:', supabaseUrl);
} catch (e) {
  const errorMessage = `Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. Must be a valid URL.`;
  console.error('[SupabaseClient] URL Validation Error:', errorMessage);
  console.error('[SupabaseClient] URL Analysis:', {
    provided: supabaseUrl,
    length: supabaseUrl.length,
    startsWithHttp: supabaseUrl.startsWith('http'),
    containsSupabase: supabaseUrl.includes('supabase'),
    validationError: e.message,
  });
  throw new Error(errorMessage);
}

// Create singleton instance with proper configuration
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const createSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  console.log('Initializing Supabase client:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length,
    timestamp: new Date().toISOString(),
  });

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'dasboard-auth-token',
      flowType: 'pkce',
      debug: import.meta.env.DEV,
      cookieOptions: {
        name: 'dasboard-auth-token',
        lifetime: 60 * 60 * 8, // 8 hours
        domain: window.location.hostname,
        path: '/',
        sameSite: 'lax',
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'dasboard-app',
      },
    },
    db: {
      schema: 'public',
    },
  });

  // Enhanced error event listener with comprehensive logging
  supabaseInstance.auth.onAuthStateChange((event, session) => {
    console.log('[SupabaseClient] Auth state changed:', {
      event,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      hasSession: !!session,
      timestamp: new Date().toISOString(),
    });

    // Handle different auth events
    switch (event) {
      case 'SIGNED_IN':
        console.log('[SupabaseClient] User signed in successfully');
        break;
      case 'SIGNED_OUT':
        console.log('[SupabaseClient] User signed out, clearing cache');
        // Clear any cached data
        userRoleCache.clear();
        pendingRequests.clear();
        break;
      case 'TOKEN_REFRESHED':
        console.log('[SupabaseClient] Token refreshed successfully');
        break;
      case 'USER_UPDATED':
        console.log('[SupabaseClient] User profile updated');
        break;
      case 'PASSWORD_RECOVERY':
        console.log('[SupabaseClient] Password recovery initiated');
        break;
      default:
        console.log('[SupabaseClient] Unknown auth event:', event);
    }
  });

  // Add global error handler for unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', event => {
      if (event.reason && event.reason.message) {
        const error = event.reason;
        if (isCORSError(error) || isNetworkError(error)) {
          console.error('[SupabaseClient] Unhandled Supabase error detected:', error);
          handleSupabaseError(error, 'unhandled_rejection', {
            showToast: true,
            logToConsole: true,
          });
        }
      }
    });
  }

  return supabaseInstance;
};

// Export the main client - this replaces the old direct createClient call
export const supabase = createSupabaseClient();

// Client instances cache
const clientInstances = new Map<string, ReturnType<typeof createClient<Database>>>();

// Get Supabase client for a specific dealership
// Note: All dealerships now use the main project database with RLS policies
export const getDealershipSupabase = (dealershipId?: string | number) => {
  // All dealerships use the same main Supabase project
  // RLS (Row Level Security) policies handle data isolation by dealership_id
  console.log(`Using main Supabase project for dealership ${dealershipId || 'unknown'}`);
  return supabase;
};

// Get the default Supabase client (Master project)
export const getSupabase = () => {
  return supabase;
};

// Enhanced helper function to check if a session exists with comprehensive error handling
export const hasValidSession = async () => {
  const { data, error } = await withErrorHandling(
    async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return !!session;
    },
    'session_check',
    {
      showToast: false, // Don't show toast for session checks
      logToConsole: true,
    }
  );

  if (error) {
    console.error('[SupabaseClient] Session check failed:', error);
    return false;
  }

  return data || false;
};

// Enhanced session getter with comprehensive error handling
export const getUserSession = async () => {
  const { data, error } = await withErrorHandling(
    async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    },
    'get_session',
    {
      showToast: false, // Don't show toast for session gets
      logToConsole: true,
    }
  );

  if (error) {
    console.error('[SupabaseClient] Failed to get session:', error);
    return { data: { session: null }, error: error.technicalDetails?.originalError };
  }

  return { data, error: null };
};

// Cache for user roles to prevent excessive database queries
const userRoleCache = new Map<string, string>();
let pendingRequests = new Set<string>();

// Enhanced current user getter with comprehensive error handling and role fetching
export const getCurrentUser = async () => {
  const { data, error } = await withErrorHandling(
    async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return null;

      // Check cache first to avoid unnecessary database calls
      if (userRoleCache.has(user.id)) {
        const cachedRole = userRoleCache.get(user.id);
        console.log('[SupabaseClient] Using cached role for user:', {
          userId: user.id,
          role: cachedRole,
        });
        return {
          ...user,
          role: cachedRole,
        };
      }

      // Guard against concurrent/repeated calls for the same user ID
      const requestKey = `role-${user.id}`;
      if (pendingRequests.has(requestKey)) {
        console.warn('[SupabaseClient] Avoiding duplicate role request for user:', user.id);
        return {
          ...user,
          role: null, // Return null role, will be filled on next attempt after cache is populated
        };
      }

      // Mark this request as in progress
      pendingRequests.add(requestKey);

      try {
        // Get user's role from profiles table with error handling
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.warn('[SupabaseClient] Error fetching user role from profiles:', profileError);
          handleSupabaseError(profileError, 'profile_fetch', { showToast: false });

          // Try fallback to roles through users table
          const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single();

          if (!userDataError && userData?.role_id) {
            // Get role name from role_id
            const { data: roleData, error: roleError } = await supabase
              .from('roles')
              .select('name')
              .eq('id', userData.role_id)
              .single();

            if (!roleError && roleData?.name) {
              // Cache the role
              userRoleCache.set(user.id, roleData.name);
              console.log('[SupabaseClient] Retrieved role from users table:', roleData.name);
              return {
                ...user,
                role: roleData.name,
              };
            }

            if (roleError) {
              console.warn('[SupabaseClient] Error fetching role name:', roleError);
              handleSupabaseError(roleError, 'role_fetch', { showToast: false });
            }
          }

          if (userDataError) {
            console.warn('[SupabaseClient] Error fetching user data:', userDataError);
            handleSupabaseError(userDataError, 'user_data_fetch', { showToast: false });
          }

          // If no role found in either table, use default
          console.warn('[SupabaseClient] No role found, using default viewer role');
          userRoleCache.set(user.id, 'viewer');
          return {
            ...user,
            role: 'viewer', // Default fallback role
          };
        }

        // Cache the role
        userRoleCache.set(user.id, profile.role);
        console.log('[SupabaseClient] Retrieved role from profiles:', profile.role);

        return {
          ...user,
          role: profile.role,
        };
      } finally {
        // Clean up pending request marker
        pendingRequests.delete(requestKey);
      }
    },
    'get_current_user',
    {
      showToast: false, // Don't show toast for user fetches
      logToConsole: true,
    }
  );

  if (error) {
    console.error('[SupabaseClient] Failed to get current user:', error);
    return null;
  }

  return data;
};

// Get current user's dealership ID
export const getUserDealershipId = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Try to get from users table first (newer schema)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('dealership_id')
      .eq('id', user.id)
      .single();

    if (!userError && userData?.dealership_id) {
      return userData.dealership_id;
    }

    // Fall back to profiles table (older schema)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('dealership_id')
      .eq('id', user.id)
      .single();

    if (!profileError && profile?.dealership_id) {
      return profile.dealership_id;
    }

    console.warn('No dealership ID found for user:', user.id);
    return null;
  } catch (error) {
    console.error('Error getting user dealership ID:', error);
    return null;
  }
};

// Export types
export type { Database } from './database.types';

export type DealType = 'Cash' | 'Finance' | 'Lease';
export type VehicleType = 'N' | 'U' | 'D';
export type DealStatus = 'Pending' | 'Funded' | 'Unwound';

// SECURITY: Test functionality removed for production
export const isTestEmail = (email: string): boolean => {
  return false; // Disabled for production
};

// SECURITY: Test login functionality removed for production
export const loginTestUser = async (email: string, password: string) => {
  return {
    error: new Error('Test functionality disabled in production'),
    message: 'Test user functionality has been disabled for security',
  };
};

// SECURITY: Test user creation disabled for production
export const createTestUser = async (email: string, password: string, userData: any) => {
  return {
    error: new Error('Test functionality disabled in production'),
    message: 'Test user creation has been disabled for security',
  };
};

export interface Deal {
  id?: string;
  stock_number: string;
  vin_last8: string;
  new_or_used: VehicleType;
  customer_last_name: string;
  deal_type: DealType;
  reserve_flat_amount: number | null;
  vsc_profit: number | null;
  ppm_profit: number | null;
  tire_wheel_profit: number | null;
  paint_fabric_profit: number | null;
  other_profit: number | null;
  front_end_gross: number;
  status: DealStatus;
  created_by?: string;
  sales_manager_id?: string | null;
  fi_manager_id?: string;
  salesperson_id?: string;
  salesperson_initials?: string;
  created_at?: string;
  updated_at?: string;
  funded_at?: string | null;
  unwound_at?: string | null;
}

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  created_by: string;
  created_at: string;
};

export type PayPlan = {
  id: string;
  role_id: string;
  front_end_percent: number;
  back_end_percent: number;
  csi_bonus: number;
  demo_allowance: number;
  vsc_bonus: number;
  ppm_bonus: number;
  volume_bonus: Record<string, number>;
  updated_by: string;
  updated_at: string;
};

// Add a debug function to test the Supabase connection
// Enhanced Supabase connection test with comprehensive error handling
export const testSupabaseConnection = async () => {
  console.log('[SupabaseClient] Testing Supabase connection...', {
    url: import.meta.env.VITE_SUPABASE_URL,
    keyFirstChars: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 5) + '...',
    timestamp: new Date().toISOString()
  });
  
  const { data, error } = await withErrorHandling(
    async () => {
      // Test 1: Basic connection to roles table
      const { data, error } = await supabase.from('roles').select('count').limit(1);
      if (error) throw error;
      
      // Test 2: Auth connection
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      
      // Test 3: Try to access profiles table (common RLS test)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      // Note: This might fail due to RLS, which is expected
      
      return {
        rolesTest: { success: true, data },
        authTest: { success: true, hasSession: !!session },
        profilesTest: { success: !profileError, data: profileData, error: profileError?.message }
      };
    },
    'connection_test',
    { 
      showToast: true, // Show toast for connection tests
      logToConsole: true 
    }
  );

  if (error) {
    console.error('[SupabaseClient] Connection test failed:', error);
    
    // Provide specific guidance based on error type
    const suggestions = error.suggestions || [];
    if (error.type === SupabaseErrorType.CORS) {
      suggestions.push('Check your VITE_SUPABASE_URL in .env file');
      suggestions.push('Verify your domain is added to Supabase allowed origins');
    } else if (error.type === SupabaseErrorType.AUTH) {
      suggestions.push('Check your VITE_SUPABASE_ANON_KEY in .env file');
      suggestions.push('Verify your API key has the correct permissions');
    } else if (error.type === SupabaseErrorType.RLS) {
      suggestions.push('RLS policies may be blocking access (this might be expected)');
      suggestions.push('Try logging in first if this is a protected operation');
    }
    
    return {
      success: false,
      error: error.message,
      errorType: error.type,
      suggestions,
      details: error.technicalDetails
    };
  }

  console.log('[SupabaseClient] ✅ Connection test passed:', data);
  return {
    success: true,
    message: 'Connection successful',
    tests: data
  };
};
