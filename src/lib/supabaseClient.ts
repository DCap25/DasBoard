import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Main Supabase config (Das Board Master)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate main configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create singleton instance with proper configuration
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const createSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  console.log('Initializing Supabase client:', {
    url: supabaseUrl,
    timestamp: new Date().toISOString(),
  });

  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true, // Enable session persistence
        autoRefreshToken: true, // Enable auto-refresh
      detectSessionInUrl: true, // Enable URL session detection for redirects
      storage: window.localStorage, // Use localStorage for session storage
    },
    global: {
      headers: {
        'X-Client-Info': 'dasboard-app',
      },
    },
  });

  return supabaseInstance;
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error);
    // Return a minimal mock client that won't break the app
    throw new Error(`Failed to initialize Supabase client: ${error}`);
  }
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

// Helper function to check if a session exists
export const hasValidSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return false;
    }
    return !!session;
  } catch (error) {
    console.error('Unexpected error checking session:', error);
    return false;
  }
};

// Get current session with error handling
export const getUserSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserSession:', error);
    return { data: { session: null }, error };
  }
};

// Cache for user roles to prevent excessive database queries
const userRoleCache = new Map<string, string>();
let pendingRequests = new Set<string>();

// Get current user with role
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }

    if (!user) {
      return null;
    }

    // Check cache first to avoid unnecessary database calls
    if (userRoleCache.has(user.id)) {
      const cachedRole = userRoleCache.get(user.id);
      console.log('Using cached role for user:', { userId: user.id, role: cachedRole });
      return {
        ...user,
        role: cachedRole,
      };
    }

    // Guard against concurrent/repeated calls for the same user ID
    const requestKey = `role-${user.id}`;
    if (pendingRequests.has(requestKey)) {
      console.warn('Avoiding duplicate role request for user:', user.id);
      return {
        ...user,
        role: null, // Return null role, will be filled on next attempt after cache is populated
      };
    }

    // Mark this request as in progress
    pendingRequests.add(requestKey);

    try {
      // Get user's role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user role:', profileError);
        // Try fallback to roles through users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('role_id')
          .eq('id', user.id)
          .single();

        if (!userDataError && userData?.role_id) {
          // Get role name from role_id
          const { data: roleData } = await supabase
            .from('roles')
            .select('name')
            .eq('id', userData.role_id)
            .single();

          if (roleData?.name) {
            // Cache the role
            userRoleCache.set(user.id, roleData.name);
            return {
              ...user,
              role: roleData.name,
            };
          }
        }

        // If no role found in either table, use default
        userRoleCache.set(user.id, 'viewer');
        return {
          ...user,
          role: 'viewer', // Default fallback role
        };
      }

      // Cache the role
      userRoleCache.set(user.id, profile.role);

      return {
        ...user,
        role: profile.role,
      };
    } finally {
      // Clean up pending request marker
      pendingRequests.delete(requestKey);
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
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
export const testSupabaseConnection = async () => {
  try {
    console.log('[supabaseClient] Testing Supabase connection', {
      url: import.meta.env.VITE_SUPABASE_URL,
      keyFirstChars: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 5) + '...',
    });

    // Try a simple query
    const { data, error } = await supabase.from('roles').select('count').limit(1);

    if (error) {
      console.error('[supabaseClient] Connection test failed:', error);
      return {
        success: false,
        error: error,
      };
    }

    console.log('[supabaseClient] Connection test successful:', data);
    return {
      success: true,
      data: data,
    };
  } catch (err) {
    console.error('[supabaseClient] Exception in connection test:', err);
    return {
      success: false,
      error: err,
    };
  }
};
