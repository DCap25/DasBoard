/**
 * RLS (Row Level Security) Helper Functions
 * Provides utilities for working with Supabase RLS policies and authenticated database operations
 */

import { supabase } from './supabaseClient';
import { getCurrentUser } from './supabaseClient';
import { withErrorHandling, SupabaseErrorType } from './supabaseErrorHandler';

// =============================================
// TYPES AND INTERFACES
// =============================================

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  dealership_id?: number;
  is_group_admin?: boolean;
  phone?: string;
  created_at?: string;
}

export interface RLSQueryOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  requireAuth?: boolean;
}

export interface DealershipAccessCheck {
  canAccess: boolean;
  reason?: string;
  userRole?: string;
  userDealershipId?: number;
}

// =============================================
// AUTHENTICATION HELPERS
// =============================================

/**
 * Ensures user is authenticated and returns user object
 * Throws error if user is not authenticated
 */
export const ensureAuthenticated = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required. Please log in to access this resource.');
  }
  return user;
};

/**
 * Get current user's profile with caching
 */
let profileCache: UserProfile | null = null;
let profileCacheTime = 0;
const PROFILE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCurrentUserProfile = async (forceRefresh = false): Promise<UserProfile | null> => {
  // Check cache first
  if (!forceRefresh && profileCache && Date.now() - profileCacheTime < PROFILE_CACHE_DURATION) {
    return profileCache;
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      profileCache = null;
      return null;
    }

    const { data, error } = await withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        return data;
      },
      'get_user_profile',
      { showToast: false, logToConsole: true }
    );

    if (error) {
      console.error('[RLS] Failed to get user profile:', error);
      profileCache = null;
      return null;
    }

    // Update cache
    profileCache = data;
    profileCacheTime = Date.now();

    return data;
  } catch (error) {
    console.error('[RLS] Error getting user profile:', error);
    profileCache = null;
    return null;
  }
};

/**
 * Clear profile cache (call on logout or profile updates)
 */
export const clearProfileCache = () => {
  profileCache = null;
  profileCacheTime = 0;
};

// =============================================
// ROLE AND PERMISSION HELPERS
// =============================================

/**
 * Check if current user has admin privileges
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === 'admin' || profile?.role === 'master_admin';
  } catch (error) {
    console.error('[RLS] Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if current user is a dealership admin
 */
export const isCurrentUserDealershipAdmin = async (): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === 'dealership_admin';
  } catch (error) {
    console.error('[RLS] Error checking dealership admin status:', error);
    return false;
  }
};

/**
 * Check if current user has a specific role
 */
export const currentUserHasRole = async (role: string): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === role;
  } catch (error) {
    console.error('[RLS] Error checking user role:', error);
    return false;
  }
};

/**
 * Check if current user has any of the specified roles
 */
export const currentUserHasAnyRole = async (roles: string[]): Promise<boolean> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile ? roles.includes(profile.role) : false;
  } catch (error) {
    console.error('[RLS] Error checking user roles:', error);
    return false;
  }
};

/**
 * Get current user's dealership ID
 */
export const getCurrentUserDealershipId = async (): Promise<number | null> => {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.dealership_id || null;
  } catch (error) {
    console.error('[RLS] Error getting user dealership ID:', error);
    return null;
  }
};

// =============================================
// DEALERSHIP ACCESS HELPERS
// =============================================

/**
 * Check if current user can access a specific dealership
 */
export const canAccessDealership = async (dealershipId: number): Promise<DealershipAccessCheck> => {
  try {
    const profile = await getCurrentUserProfile();

    if (!profile) {
      return {
        canAccess: false,
        reason: 'User not authenticated',
      };
    }

    // Admins can access any dealership
    if (profile.role === 'admin' || profile.role === 'master_admin') {
      return {
        canAccess: true,
        reason: 'Admin access',
        userRole: profile.role,
        userDealershipId: profile.dealership_id,
      };
    }

    // Users can only access their own dealership
    if (profile.dealership_id === dealershipId) {
      return {
        canAccess: true,
        reason: 'Own dealership access',
        userRole: profile.role,
        userDealershipId: profile.dealership_id,
      };
    }

    return {
      canAccess: false,
      reason: 'Access denied - different dealership',
      userRole: profile.role,
      userDealershipId: profile.dealership_id,
    };
  } catch (error) {
    console.error('[RLS] Error checking dealership access:', error);
    return {
      canAccess: false,
      reason: 'Error checking access',
    };
  }
};

/**
 * Require dealership access or throw error
 */
export const requireDealershipAccess = async (dealershipId: number): Promise<void> => {
  const accessCheck = await canAccessDealership(dealershipId);
  if (!accessCheck.canAccess) {
    throw new Error(`Access denied: ${accessCheck.reason}`);
  }
};

// =============================================
// QUERY EXECUTION HELPERS
// =============================================

/**
 * Execute a Supabase query with proper error handling and authentication
 */
export const executeRLSQuery = async <T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  operationName: string,
  options: RLSQueryOptions = {}
): Promise<T> => {
  const { showToast = true, logToConsole = true, requireAuth = true } = options;

  // Check authentication if required
  if (requireAuth) {
    await ensureAuthenticated();
  }

  const { data, error } = await withErrorHandling(queryFn, operationName, {
    showToast,
    logToConsole,
  });

  if (error) {
    // Handle RLS errors specifically
    if (error.type === SupabaseErrorType.RLS) {
      throw new Error('Access denied. You do not have permission to access this data.');
    }

    // Handle authentication errors
    if (error.type === SupabaseErrorType.AUTH) {
      throw new Error('Authentication failed. Please log in again.');
    }

    // Generic error
    throw new Error(error.message || 'Database operation failed');
  }

  return data;
};

/**
 * Execute a query that requires admin privileges
 */
export const executeAdminQuery = async <T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  operationName: string,
  options: RLSQueryOptions = {}
): Promise<T> => {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new Error('Admin privileges required for this operation');
  }

  return executeRLSQuery(queryFn, operationName, options);
};

/**
 * Execute a query with dealership access check
 */
export const executeDealershipQuery = async <T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  operationName: string,
  dealershipId: number,
  options: RLSQueryOptions = {}
): Promise<T> => {
  await requireDealershipAccess(dealershipId);
  return executeRLSQuery(queryFn, operationName, options);
};

// =============================================
// COMMON QUERY PATTERNS
// =============================================

/**
 * Get all records from a table with proper RLS handling
 */
export const getAllRecords = async <T>(
  tableName: string,
  options: RLSQueryOptions = {}
): Promise<T[]> => {
  return executeRLSQuery(
    () => supabase.from(tableName).select('*'),
    `get_all_${tableName}`,
    options
  );
};

/**
 * Get records by dealership ID with access check
 */
export const getRecordsByDealership = async <T>(
  tableName: string,
  dealershipId: number,
  options: RLSQueryOptions = {}
): Promise<T[]> => {
  return executeDealershipQuery(
    () => supabase.from(tableName).select('*').eq('dealership_id', dealershipId),
    `get_${tableName}_by_dealership`,
    dealershipId,
    options
  );
};

/**
 * Get a single record by ID with proper RLS handling
 */
export const getRecordById = async <T>(
  tableName: string,
  id: string | number,
  options: RLSQueryOptions = {}
): Promise<T | null> => {
  return executeRLSQuery(
    () => supabase.from(tableName).select('*').eq('id', id).single(),
    `get_${tableName}_by_id`,
    options
  );
};

/**
 * Create a new record with proper RLS handling
 */
export const createRecord = async <T>(
  tableName: string,
  data: Partial<T>,
  options: RLSQueryOptions = {}
): Promise<T> => {
  return executeRLSQuery(
    () => supabase.from(tableName).insert([data]).select().single(),
    `create_${tableName}`,
    options
  );
};

/**
 * Update a record with proper RLS handling
 */
export const updateRecord = async <T>(
  tableName: string,
  id: string | number,
  data: Partial<T>,
  options: RLSQueryOptions = {}
): Promise<T> => {
  return executeRLSQuery(
    () => supabase.from(tableName).update(data).eq('id', id).select().single(),
    `update_${tableName}`,
    options
  );
};

/**
 * Delete a record with proper RLS handling
 */
export const deleteRecord = async (
  tableName: string,
  id: string | number,
  options: RLSQueryOptions = {}
): Promise<void> => {
  return executeRLSQuery(
    () => supabase.from(tableName).delete().eq('id', id),
    `delete_${tableName}`,
    options
  );
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Test RLS policies for a specific table
 */
export const testRLSPolicies = async (tableName: string) => {
  console.log(`[RLS] Testing policies for table: ${tableName}`);

  try {
    // Test basic read access
    const { data: readData, error: readError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    console.log(`[RLS] ${tableName} read test:`, {
      success: !readError,
      error: readError?.message,
      recordCount: readData?.length || 0,
    });

    // Test write access (this might fail, which is expected)
    const testData = { test: true };
    const { data: writeData, error: writeError } = await supabase
      .from(tableName)
      .insert([testData])
      .select()
      .single();

    console.log(`[RLS] ${tableName} write test:`, {
      success: !writeError,
      error: writeError?.message,
    });

    // Clean up test data if write succeeded
    if (writeData && !writeError) {
      await supabase.from(tableName).delete().eq('id', writeData.id);
    }
  } catch (error) {
    console.error(`[RLS] Error testing ${tableName}:`, error);
  }
};

/**
 * Get RLS policy information for debugging
 */
export const getRLSPolicyInfo = async () => {
  try {
    const { data, error } = await supabase.rpc('get_rls_policies');
    if (error) {
      console.error('[RLS] Error getting policy info:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('[RLS] Error getting policy info:', error);
    return null;
  }
};

export default {
  ensureAuthenticated,
  getCurrentUserProfile,
  clearProfileCache,
  isCurrentUserAdmin,
  isCurrentUserDealershipAdmin,
  currentUserHasRole,
  currentUserHasAnyRole,
  getCurrentUserDealershipId,
  canAccessDealership,
  requireDealershipAccess,
  executeRLSQuery,
  executeAdminQuery,
  executeDealershipQuery,
  getAllRecords,
  getRecordsByDealership,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  testRLSPolicies,
  getRLSPolicyInfo,
};
