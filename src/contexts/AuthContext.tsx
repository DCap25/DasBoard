/**
 * Authentication Context for The DAS Board
 * 
 * FIXES IMPLEMENTED:
 * - Session initialization on mount and app reload
 * - onAuthStateChange listener for real-time session updates  
 * - Token expiration handling with auto-refresh
 * - Proper loading and error states
 * - Secure role-based user data fetching
 * - Memory leak prevention
 * - Enhanced TypeScript typing
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import {
  getSecureSupabaseClient,
  hasValidSession,
  getCurrentUser,
  getUserDealershipId,
  testSupabaseConnection,
} from '../lib/supabaseClient';
import { Database } from '../lib/database.types';
import { toast } from '../lib/use-toast';

// =================== TYPES ===================

// Strict user role typing
export type UserRole =
  | 'salesperson'
  | 'finance_manager'
  | 'single_finance_manager'
  | 'sales_manager'
  | 'general_manager'
  | 'admin'
  | 'dealership_admin'
  | 'dealer_group_admin'
  | 'viewer';

// Enhanced user data with role
interface AuthUser extends User {
  role?: UserRole;
}

// Session health monitoring
interface SessionHealth {
  isValid: boolean;
  expiresAt: number | null;
  lastChecked: number;
  needsRefresh: boolean;
}

// Auth context interface with proper typing
interface AuthContextType {
  // Core auth state
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  error: AuthError | null;
  
  // Session management
  hasSession: boolean;
  sessionHealth: SessionHealth;
  refreshSession: () => Promise<void>;
  
  // User data
  dealershipId: number | null;
  isGroupAdmin: boolean;
  
  // Auth methods
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData: UserSignupData) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Utility
  authCheckComplete: boolean;
}

// User signup data
interface UserSignupData {
  firstName: string;
  lastName: string;
  role?: UserRole;
  dealershipId?: number;
}

// =================== VALIDATION UTILS ===================

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate user role
 */
const validateRole = (role: string): UserRole => {
  const validRoles: UserRole[] = [
    'salesperson',
    'finance_manager', 
    'single_finance_manager',
    'sales_manager',
    'general_manager',
    'admin',
    'dealership_admin',
    'dealer_group_admin',
    'viewer',
  ];
  
  const normalizedRole = role?.toLowerCase() as UserRole;
  return validRoles.includes(normalizedRole) ? normalizedRole : 'viewer';
};

// =================== CONTEXT SETUP ===================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // =================== STATE ===================
  
  // Core auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  
  // Session state
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [sessionHealth, setSessionHealth] = useState<SessionHealth>({
    isValid: false,
    expiresAt: null,
    lastChecked: 0,
    needsRefresh: false,
  });
  
  // User data state
  const [dealershipId, setDealershipId] = useState<number | null>(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState<boolean>(false);
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);
  
  // Component lifecycle refs
  const mountedRef = useRef<boolean>(true);
  const authListenerRef = useRef<{ data: { subscription: any } } | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initRef = useRef<boolean>(false);

  // =================== SESSION MANAGEMENT ===================

  /**
   * Validate session and update health status
   */
  const validateSession = useCallback(async (session: Session | null): Promise<boolean> => {
    if (!session || !session.access_token || !session.user) {
      setSessionHealth(prev => ({ ...prev, isValid: false, lastChecked: Date.now() }));
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    
    // Check if token is expired
    if (expiresAt <= now) {
      console.warn('[Auth] Session token expired');
      setSessionHealth(prev => ({ 
        ...prev, 
        isValid: false, 
        needsRefresh: true,
        lastChecked: Date.now() 
      }));
      return false;
    }

    // Check if token needs refresh (within 5 minutes of expiry)
    const needsRefresh = (expiresAt - now) < 300;
    
    setSessionHealth({
      isValid: true,
      expiresAt: expiresAt * 1000,
      lastChecked: Date.now(),
      needsRefresh,
    });

    return true;
  }, []);

  /**
   * Refresh session token
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      console.log('[Auth] Refreshing session');
      const client = await getSecureSupabaseClient();
      
      const { data, error } = await client.auth.refreshSession();
      
      if (error) {
        console.error('[Auth] Session refresh failed:', error.message);
        throw error;
      }

      if (data.session) {
        await validateSession(data.session);
        console.log('[Auth] Session refreshed successfully');
      }
    } catch (error) {
      console.error('[Auth] Session refresh error:', error);
      // Don't automatically sign out - let the auth state listener handle it
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
    }
  }, [validateSession]);

  /**
   * Monitor session health
   */
  const monitorSessionHealth = useCallback(async (): Promise<void> => {
    try {
      const client = await getSecureSupabaseClient();
      const { data: { session }, error } = await client.auth.getSession();
      
      if (error) {
        console.error('[Auth] Health check error:', error.message);
        return;
      }

      const isValid = await validateSession(session);
      
      // Auto-refresh if needed and session is still valid but expiring soon
      if (isValid && sessionHealth.needsRefresh) {
        await refreshSession();
      }
    } catch (error) {
      console.error('[Auth] Health monitoring failed:', error);
    }
  }, [sessionHealth.needsRefresh, validateSession, refreshSession]);

  // =================== USER DATA FETCHING ===================

  /**
   * Fetch user profile and role data securely
   */
  const fetchUserData = useCallback(async (userId: string): Promise<void> => {
    try {
      console.log('[Auth] Fetching user data for:', userId);
      const client = await getSecureSupabaseClient();

      // Try users table first (newer schema)
      const { data: userData, error: userError } = await client
        .from('users')
        .select(`
          dealership_id,
          role_id,
          roles (
            name
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (!userError && userData) {
        // Set role from roles table
        if (userData.roles?.name) {
          const validatedRole = validateRole(userData.roles.name);
          setRole(validatedRole);
        }

        // Set dealership ID
        if (userData.dealership_id) {
          setDealershipId(userData.dealership_id);
        }

        return;
      }

      // Fallback to profiles table (legacy schema)
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('role, dealership_id, is_group_admin')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.warn('[Auth] Profile fetch failed:', profileError.message);
        setRole('viewer'); // Default role
        return;
      }

      if (profileData) {
        // Set role
        if (profileData.role) {
          const validatedRole = validateRole(profileData.role);
          setRole(validatedRole);
        } else {
          setRole('viewer');
        }

        // Set dealership ID
        if (profileData.dealership_id) {
          setDealershipId(profileData.dealership_id);
        }

        // Set group admin status
        if (profileData.is_group_admin) {
          setIsGroupAdmin(true);
        }
      }
    } catch (error) {
      console.error('[Auth] Error fetching user data:', error);
      setRole('viewer'); // Safe default
    }
  }, []);

  // =================== AUTH STATE HANDLER ===================

  /**
   * Handle authentication state changes with proper session validation
   */
  const handleAuthStateChange = useCallback(
    async (session: Session | null): Promise<void> => {
      if (!mountedRef.current) return;

      console.log('[Auth] Auth state change:', !!session);

      try {
        if (session) {
          // Validate session first
          const isValidSession = await validateSession(session);
          
          if (!isValidSession) {
            console.warn('[Auth] Invalid session detected');
            setHasSession(false);
            setUser(null);
            setRole(null);
            setDealershipId(null);
            setIsGroupAdmin(false);
            return;
          }

          // Set session state
          setHasSession(true);
          setError(null);

          // Create enhanced user object with session data
          const authUser: AuthUser = {
            ...session.user,
            role: undefined, // Will be set by fetchUserData
          };

          setUser(authUser);

          // Fetch additional user data (role, dealership, etc.)
          await fetchUserData(session.user.id);

        } else {
          // Clear all auth state on session end
          setHasSession(false);
          setUser(null);
          setRole(null);
          setDealershipId(null);
          setIsGroupAdmin(false);
          setError(null);
          
          setSessionHealth({
            isValid: false,
            expiresAt: null,
            lastChecked: Date.now(),
            needsRefresh: false,
          });
        }

      } catch (error) {
        console.error('[Auth] Auth state change error:', error);
        setError(error instanceof Error ? error : new Error('Auth state change failed'));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setAuthCheckComplete(true);
        }
      }
    },
    [validateSession, fetchUserData]
  );

  // =================== INITIALIZATION ===================

  /**
   * Initialize authentication - called once on mount and app reload
   * FIXED: Proper session detection and listener setup
   */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async (): Promise<void> => {
      try {
        console.log('[Auth] Initializing authentication');

        const client = await getSecureSupabaseClient();

        // FIXED: Get initial session on mount/reload
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
          console.error('[Auth] Initial session fetch error:', error);
          setError(error);
        }

        // Process initial session
        await handleAuthStateChange(session);

        // FIXED: Set up auth state listener for real-time updates
        if (mountedRef.current) {
          console.log('[Auth] Setting up auth state listener');
          
          const { data: authListener } = client.auth.onAuthStateChange(
            async (event, newSession) => {
              if (!mountedRef.current) return;
              
              console.log('[Auth] Auth event:', event);
              
              // Handle different auth events
              switch (event) {
                case 'SIGNED_IN':
                  console.log('[Auth] User signed in');
                  break;
                case 'SIGNED_OUT':
                  console.log('[Auth] User signed out');
                  break;
                case 'TOKEN_REFRESHED':
                  console.log('[Auth] Token refreshed');
                  break;
                case 'USER_UPDATED':
                  console.log('[Auth] User updated');
                  break;
                case 'PASSWORD_RECOVERY':
                  console.log('[Auth] Password recovery');
                  break;
              }

              // Process the auth state change
              await handleAuthStateChange(newSession);
            }
          );

          authListenerRef.current = { data: { subscription: authListener.subscription } };
        }

        console.log('[Auth] Authentication initialized successfully');

      } catch (error) {
        console.error('[Auth] Auth initialization failed:', error);
        
        if (mountedRef.current) {
          setError(error instanceof Error ? error : new Error('Auth initialization failed'));
          setLoading(false);
          setAuthCheckComplete(true);
        }
      }
    };

    // Set safety timeout to prevent stuck loading state
    initTimeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('[Auth] Initialization timeout - completing auth check');
        setLoading(false);
        setAuthCheckComplete(true);
      }
    }, 10000);

    // Start initialization
    initializeAuth();

    return () => {
      clearTimeout(initTimeout);
      
      // Clean up auth listener
      if (authListenerRef.current?.data?.subscription) {
        console.log('[Auth] Cleaning up auth listener');
        authListenerRef.current.data.subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array - only run once

  // =================== SESSION MONITORING ===================

  /**
   * Set up session health monitoring when user is authenticated
   * FIXED: Proper token expiration monitoring and refresh
   */
  useEffect(() => {
    if (!hasSession) {
      // Clear monitoring when no session
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
      return;
    }

    console.log('[Auth] Starting session health monitoring');

    // Monitor session health every 2 minutes
    healthCheckIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        monitorSessionHealth();
      }
    }, 2 * 60 * 1000);

    // Initial health check
    monitorSessionHealth();

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [hasSession, monitorSessionHealth]);

  // =================== AUTH METHODS ===================

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (
    email: string, 
    password: string, 
    rememberMe = false
  ): Promise<void> => {
    try {
      // Input validation
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      setLoading(true);
      setError(null);

      console.log('[Auth] Signing in user:', email);

      const client = await getSecureSupabaseClient();
      
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: rememberMe,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Sign in successful but no user returned');
      }

      // Auth state change will be handled by the listener
      console.log('[Auth] Sign in successful');

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });

    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Sign in failed:', authError.message);
      
      setError(authError);
      
      toast({
        title: 'Sign In Failed',
        description: authError.message || 'An error occurred during sign in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up with email, password and user data
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData: UserSignupData
  ): Promise<void> => {
    try {
      // Input validation
      if (!isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!userData.firstName || !userData.lastName) {
        throw new Error('First and last name are required');
      }

      setLoading(true);
      setError(null);

      console.log('[Auth] Signing up user:', email);

      const client = await getSecureSupabaseClient();

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'viewer',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile for new user
        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            email,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role || 'viewer',
            dealership_id: userData.dealershipId || 1,
          });
        } catch (profileError) {
          console.warn('[Auth] Profile creation failed:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }

      console.log('[Auth] Sign up successful');

      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account.',
      });

    } catch (error) {
      const authError = error as AuthError;
      console.error('[Auth] Sign up failed:', authError.message);
      
      setError(authError);
      
      toast({
        title: 'Sign Up Failed',
        description: authError.message || 'An error occurred during sign up',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out user and clear all auth state
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('[Auth] Signing out user');

      const client = await getSecureSupabaseClient();
      
      const { error } = await client.auth.signOut();
      
      if (error) {
        console.error('[Auth] Sign out error:', error);
        // Don't throw - still clear local state
      }

      // Clear all local auth state immediately
      setUser(null);
      setRole(null);
      setHasSession(false);
      setDealershipId(null);
      setIsGroupAdmin(false);
      setError(null);
      
      setSessionHealth({
        isValid: false,
        expiresAt: null,
        lastChecked: Date.now(),
        needsRefresh: false,
      });

      console.log('[Auth] Sign out successful');

      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });

    } catch (error) {
      console.error('[Auth] Sign out failed:', error);
      // Still clear state even if sign out fails
    } finally {
      setLoading(false);
    }
  }, []);

  // =================== CLEANUP ===================

  /**
   * Cleanup on component unmount
   * FIXED: Proper memory leak prevention
   */
  useEffect(() => {
    return () => {
      console.log('[Auth] Cleaning up AuthProvider');
      mountedRef.current = false;

      // Clear health monitoring
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }

      // Clean up auth listener
      if (authListenerRef.current?.data?.subscription) {
        authListenerRef.current.data.subscription.unsubscribe();
      }
    };
  }, []);

  // =================== CONTEXT VALUE ===================

  /**
   * Memoized context value to prevent unnecessary re-renders
   * FIXED: Proper dependency management
   */
  const contextValue = useMemo<AuthContextType>(
    () => ({
      // Core auth state
      user,
      role,
      loading,
      error,
      
      // Session management
      hasSession,
      sessionHealth,
      refreshSession,
      
      // User data
      dealershipId,
      isGroupAdmin,
      
      // Auth methods
      signIn,
      signUp,
      signOut,
      
      // Utility
      authCheckComplete,
    }),
    [
      user,
      role,
      loading,
      error,
      hasSession,
      sessionHealth,
      refreshSession,
      dealershipId,
      isGroupAdmin,
      signIn,
      signUp,
      signOut,
      authCheckComplete,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// =================== HOOK ===================

/**
 * Custom hook to use auth context with proper error handling
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// =================== TYPE EXPORTS ===================

export type { AuthUser, UserSignupData, SessionHealth };