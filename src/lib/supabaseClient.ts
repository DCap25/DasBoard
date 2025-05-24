import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Default Supabase config (Das Board Master)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Dealership1 Supabase config
const dealership1Url = import.meta.env.VITE_DEALERSHIP1_SUPABASE_URL || '';
const dealership1AnonKey = import.meta.env.VITE_DEALERSHIP1_SUPABASE_ANON_KEY || '';

// Create default client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Client instances cache
const clientInstances = new Map<string, ReturnType<typeof createClient<Database>>>();

// Validate main configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Get Supabase client for a specific dealership
export const getDealershipSupabase = (dealershipId?: string | number) => {
  // If no dealershipId or it's 'master', return the master project
  if (!dealershipId || dealershipId === 'master') {
    return supabase;
  }

  // For now, we only have Dealership1 as a separate project
  if (dealershipId === 1 || dealershipId === '1' || dealershipId === 'dealership1') {
    if (!dealership1Url || !dealership1AnonKey) {
      console.warn('Dealership1 Supabase configuration missing, falling back to master project');
      return supabase;
    }

    // Check if we already have an instance
    const cacheKey = `dealership-${dealershipId}`;
    if (clientInstances.has(cacheKey)) {
      return clientInstances.get(cacheKey)!;
    }

    // Create a new instance
    console.log(`Creating new Supabase client for dealership ${dealershipId}`);
    const instance = createClient<Database>(dealership1Url, dealership1AnonKey, {
      auth: {
        persistSession: true,
        storageKey: `dealership-${dealershipId}-auth`,
        storage: window.localStorage,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    });

    // Cache the instance
    clientInstances.set(cacheKey, instance);
    return instance;
  }

  // Default to master project if dealership ID doesn't match
  console.warn(`No specific Supabase project for dealership ${dealershipId}, using master project`);
  return supabase;
};

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Get the default Supabase client (Master project)
export const getSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  console.log('Initializing new Supabase client:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey.length,
    timestamp: new Date().toISOString(),
  });

  // Initialize the Supabase client with explicit session handling
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'dealership-auth',
      storage: window.localStorage,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    },
  });

  // Initialize session handling
  const initializeSession = async () => {
    try {
      // Get initial session
      const {
        data: { session },
        error,
      } = await supabaseInstance!.auth.getSession();

      console.log('Initial session state:', {
        hasSession: !!session,
        error: error?.message,
        userId: session?.user?.id,
        timestamp: new Date().toISOString(),
      });

      if (error) {
        console.error('Error getting initial session:', error);
        return;
      }

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabaseInstance!.auth.onAuthStateChange((event, currentSession) => {
        console.log('Auth state changed:', {
          event,
          hasSession: !!currentSession,
          userId: currentSession?.user?.id,
          timestamp: new Date().toISOString(),
        });
      });

      // Clean up listener on window unload
      window.addEventListener(
        'unload',
        () => {
          console.log('Cleaning up auth listener');
          subscription.unsubscribe();
        },
        { once: true }
      );
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  // Initialize session handling immediately
  initializeSession().catch(error => {
    console.error('Failed to initialize session:', error);
  });

  return supabaseInstance;
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

// Regular expression to check if an email is a test email
export const isTestEmail = (email: string): boolean => {
  return /(@exampletest\.com|@example\.com|test.*@)/.test(email.toLowerCase());
};

// Special login handling for test accounts
export const loginTestUser = async (email: string, password: string) => {
  try {
    console.log(`[supabaseClient] Logging in test user: ${email}`);

    // Check if this is an email that should be handled specially
    if (!isTestEmail(email)) {
      console.warn('[supabaseClient] This is not a test email, should use regular login');
      return { error: new Error('Not a test email') };
    }

    // Check if this user is a group admin based on email
    const isGroupAdminEmail =
      email.toLowerCase().includes('group') && email.toLowerCase().includes('@exampletest.com');

    if (isGroupAdminEmail) {
      console.log(`[supabaseClient] ${email} - detected as a group admin by email pattern`);

      // Force direct redirection for group admin test users, preventing any redirect loops
      localStorage.setItem('force_redirect_after_login', '/group-admin');
      localStorage.setItem('force_redirect_timestamp', Date.now().toString());
    }

    // Try regular sign-in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Keep this session for testing
        persistSession: true,
      },
    });

    // If sign-in worked without errors, return the session data
    if (!signInError && signInData?.user) {
      console.log(`[supabaseClient] Sign-in successful for ${email}, checking group admin status`);

      // For group admin emails, ensure the flag is set regardless of database state
      if (isGroupAdminEmail) {
        console.log(`[supabaseClient] Setting group admin metadata for ${email}`);

        try {
          // First update the user metadata
          const { data: userUpdateData, error: userUpdateError } = await supabase.auth.updateUser({
            data: {
              is_group_admin: true,
              role: 'dealer_group_admin',
            },
          });

          if (userUpdateError) {
            console.warn('[supabaseClient] Could not update user metadata:', userUpdateError);
          } else {
            console.log('[supabaseClient] Updated user metadata for group admin:', userUpdateData);
          }

          // Then update the profile record
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              is_group_admin: true,
              role: 'dealer_group_admin',
            })
            .eq('id', signInData.user.id);

          if (profileError) {
            console.warn('[supabaseClient] Could not update profile:', profileError);
          } else {
            console.log('[supabaseClient] Updated profile for group admin');
          }
        } catch (err) {
          console.error('[supabaseClient] Error setting group admin status:', err);
        }

        // IMMEDIATE REDIRECT: Force direct navigation for group admin test users
        console.log('[supabaseClient] Performing immediate redirect for group admin test user');

        // Set a session flag to indicate this is a valid redirect, not a cross-site one
        sessionStorage.setItem('auth_redirect_authorized', 'true');

        // Short timeout to ensure the session is established before redirect
        setTimeout(() => {
          // Redirect to our special redirect page instead of directly to group-admin
          window.location.href = '/test-login-redirect';
        }, 500);

        // Force direct redirect via custom metadata
        return {
          data: {
            ...signInData,
            user: {
              ...signInData.user,
              user_metadata: {
                ...signInData.user.user_metadata,
                is_group_admin: true,
                role: 'dealer_group_admin',
              },
            },
          },
          isGroupAdmin: true,
          forceRedirect: true,
          redirectPath: '/test-login-redirect',
          message: 'Group admin test user logged in successfully',
        };
      }

      // For non-group admin accounts, proceed with regular checks
      console.log(`[supabaseClient] Checking group admin status for ${email}`);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_group_admin, role, dealership_id')
          .eq('id', signInData.user.id)
          .maybeSingle();

        console.log(`[supabaseClient] Test user profile data:`, data);

        if (data?.is_group_admin) {
          console.log(`[supabaseClient] User ${email} is a group admin`);

          // Add metadata to the test user for easier debugging
          const { data: userUpdateData, error: userUpdateError } = await supabase.auth.updateUser({
            data: {
              is_group_admin: true,
              role: data.role || 'dealer_group_admin',
            },
          });

          if (userUpdateError) {
            console.warn('[supabaseClient] Could not update user metadata:', userUpdateError);
          } else {
            console.log('[supabaseClient] Updated user metadata for group admin');
          }

          // Return with isGroupAdmin flag set
          return {
            data: signInData,
            isGroupAdmin: true,
            message: 'Group admin test user logged in successfully',
          };
        }
      } catch (profileError) {
        console.error('[supabaseClient] Error checking group admin status:', profileError);
      }

      return {
        data: signInData,
        message: 'Test user logged in successfully',
      };
    }

    // If regular sign-in worked, just return the data
    if (signInData?.session) {
      return {
        data: signInData,
        message: 'Test user logged in successfully',
      };
    }

    return { error: signInError, message: 'Failed to log in test user' };
  } catch (error) {
    console.error('[supabaseClient] Exception in loginTestUser:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error during test login'),
    };
  }
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

/**
 * Creates a test user account that doesn't require email verification.
 * Use this for testing purposes only.
 */
export const createTestUser = async (email: string, password: string, userData: any) => {
  try {
    console.log(`[supabaseClient] Creating test user: ${email}`);

    // For test domains, we want to explicitly bypass verification
    const isTestDomain =
      email.endsWith('@exampletest.com') ||
      email.endsWith('@example.com') ||
      email.includes('test');

    if (!isTestDomain) {
      console.warn(
        '[supabaseClient] Warning: Creating account with non-test domain may require email verification'
      );
    }

    // 1. First, sign up the user normally
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        // For test accounts, request no email confirmation
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      console.error('[supabaseClient] Error creating test user:', signUpError);
      return { error: signUpError };
    }

    if (!signUpData.user) {
      console.error('[supabaseClient] No user returned from sign up');
      return { error: new Error('No user returned from sign up') };
    }

    const userId = signUpData.user.id;
    console.log('[supabaseClient] User created with ID:', userId);

    // For test domains, attempt to auto-verify using admin functions
    if (isTestDomain) {
      // 2. Try to directly set email_confirmed_at in auth.users via RPC
      try {
        console.log('[supabaseClient] Attempting to auto-confirm test account');

        // Try force_confirm_email RPC if it exists
        const { data: rpcData, error: rpcError } = await supabase.rpc('force_confirm_email', {
          user_id_param: userId,
        });

        if (rpcError) {
          console.warn('[supabaseClient] RPC confirmation failed:', rpcError);

          // Try a different RPC function name if the first one failed
          try {
            const { data: rpc2Data, error: rpc2Error } = await supabase.rpc('admin_confirm_user', {
              user_id: userId,
            });

            if (rpc2Error) {
              console.warn('[supabaseClient] Second RPC confirmation failed:', rpc2Error);
            } else {
              console.log('[supabaseClient] Second RPC confirmation successful');
            }
          } catch (rpc2Err) {
            console.warn('[supabaseClient] Second RPC exception:', rpc2Err);
          }
        } else {
          console.log('[supabaseClient] RPC confirmation successful');
        }

        // Admin API approach - may not work without proper permissions
        try {
          const { data: adminData, error: adminError } = await supabase.auth.admin.updateUserById(
            userId,
            { email_confirm: true }
          );

          if (adminError) {
            console.warn('[supabaseClient] Admin API confirmation failed:', adminError);
          } else {
            console.log('[supabaseClient] Admin API confirmation successful');
          }
        } catch (adminErr) {
          console.warn('[supabaseClient] Admin API exception:', adminErr);
        }
      } catch (rpcError) {
        console.warn('[supabaseClient] RPC confirmation exception:', rpcError);
      }
    }

    // 3. Try to upsert into the profiles table to ensure profile exists
    try {
      const { error: profileError } = await supabase.from('profiles').upsert([
        {
          id: userId,
          email,
          name: userData.name || email.split('@')[0],
          role: userData.role || 'salesperson',
          dealership_id: userData.dealership_id || 1,
          is_test_account: true,
        },
      ]);

      if (profileError) {
        console.warn('[supabaseClient] Profile creation warning:', profileError);
      } else {
        console.log('[supabaseClient] Profile created successfully');
      }
    } catch (profileError) {
      console.warn('[supabaseClient] Profile creation exception:', profileError);
    }

    // Return the created user with helpful information
    return {
      data: signUpData.user,
      credentials: {
        email,
        password,
        role: userData.role || 'salesperson',
        dealership_id: userData.dealership_id || 1,
      },
      needsConfirmation: !isTestDomain,
      message: isTestDomain
        ? 'Test user created with automatic verification attempted.'
        : 'User created. Email confirmation might still be required.',
    };
  } catch (error) {
    console.error('[supabaseClient] Exception creating test user:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown error creating test user'),
    };
  }
};
