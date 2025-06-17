import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import {
  supabase,
  getCurrentUser,
  getDealershipSupabase,
  getUserDealershipId,
  loginTestUser,
  isTestEmail,
} from '../lib/supabaseClient';
import { Database } from '../lib/database.types';
import { toast } from '../lib/use-toast';
import { logSchemaOperation, testDealershipConnection } from '../lib/apiService';
import {
  logout as directAuthLogout,
  isAuthenticated,
  getCurrentUser as getDirectAuthUser,
} from '../lib/directAuth';

// Use lowercase role names to match database
type UserRole =
  | 'salesperson'
  | 'finance_manager'
  | 'single_finance_manager'
  | 'sales_manager'
  | 'general_manager'
  | 'admin'
  | 'dealership_admin'
  | 'dealer_group_admin'
  | 'area_vice_president';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  hasSession: boolean;
  error: Error | null;
  userRole: string | null;
  dealershipId: number | null;
  setDealershipContext: (dealershipId: number) => void;
  currentDealershipName: string | null;
  fetchFromDealershipSchema: (
    dealershipId: number,
    table: string,
    query?: any
  ) => Promise<{ data: any | null; error: Error | null }>;
  magicLinkLogin: (email: string) => Promise<void>;
  loginTestAccount: (email: string, password: string) => Promise<void>;
  logAccessAttempt: (path: string, allowed: boolean, details?: any) => void;
  isGroupAdmin: boolean;
  authCheckComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use these defaults consistently
const DEFAULT_ROLE: UserRole = 'salesperson';
const FALLBACK_ROLE: UserRole = 'finance_manager'; // Fallback role if profile operations fail
const DEFAULT_DEALERSHIP_ID = 1;

// Track profile operations globally to prevent duplicates
const profileOperationAttempted = new Map<string, boolean>();

// Debug logger to track authentication flow
const logAuthEvent = (event: string, details: any) => {
  const timestamp = new Date().toISOString();
  const deploymentVersion = import.meta.env.VITE_DEPLOYMENT_VERSION || '1.0.0';
  const deploymentEnv = import.meta.env.MODE || 'development';

  console.log(`[AuthContext][${timestamp}] ${event}`, {
    ...details,
    app_version: deploymentVersion,
    environment: deploymentEnv,
    timestamp,
  });

  // Add optional analytics tracking here if needed
  try {
    if (typeof window !== 'undefined') {
      if (!window.authEvents) {
        window.authEvents = [];
      }

      // Keep last 100 events
      if (window.authEvents.length > 100) {
        window.authEvents.shift();
      }

      window.authEvents.push({
        event,
        details,
        timestamp,
      });
    }
  } catch (err) {
    console.error('[AuthContext] Error logging auth event to window object:', err);
  }
};

// Improved security event logger
const logSecurityEvent = (event: string, details: any) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SecurityEvent][${timestamp}] ${event}`, {
    ...details,
    user_agent: navigator.userAgent,
    app_url: window.location.href,
    timestamp,
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const retryCountRef = useRef(0);
  const profileOperationInProgressRef = useRef(false);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dealershipId, setDealershipId] = useState<number | null>(null);
  const [currentDealershipName, setCurrentDealershipName] = useState<string | null>(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState<boolean>(false);
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);

  // Fetch profile data to check for is_group_admin flag
  const fetchProfileData = async (userId: string) => {
    try {
      console.warn(`[DEBUG AUTH] Fetching profile data for user ${userId}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[DEBUG AUTH] Error fetching profile:', error);
        return null;
      }

      if (data) {
        console.warn('[DEBUG AUTH] Profile data found:', data);

        // Add more detailed logging for group admin detection
        console.warn('[DEBUG AUTH] Group admin detection:', {
          isGroupAdmin: !!data.is_group_admin,
          userEmail: data.email,
          userRole: data.role,
          userData: data,
          userMetadata: user?.user_metadata,
        });

        // Check user metadata if profile doesn't have the flag
        if (!data.is_group_admin && user?.user_metadata?.is_group_admin) {
          console.warn('[DEBUG AUTH] Group admin flag found in user metadata');
          setIsGroupAdmin(true);
        }

        // Set the isGroupAdmin flag based on profile data
        if (data.is_group_admin) {
          console.warn('[DEBUG AUTH] User is a group admin!');
          setIsGroupAdmin(true);
        } else {
          console.warn('[DEBUG AUTH] User is not a group admin');
          setIsGroupAdmin(false);
        }

        return data;
      }

      console.warn('[DEBUG AUTH] No profile data found');
      return null;
    } catch (err) {
      console.error('[DEBUG AUTH] Error in fetchProfileData:', err);
      return null;
    }
  };

  // Set the current dealership context
  const setDealershipContext = useCallback(
    (newDealershipId: number) => {
      logAuthEvent('Setting dealership context', {
        dealership_id: newDealershipId,
        previous_id: dealershipId,
        user_id: user?.id,
        user_email: user?.email,
      });

      setDealershipId(newDealershipId);

      // Get the dealership name
      supabase
        .from('dealerships')
        .select('name')
        .eq('id', newDealershipId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('[AuthContext] Error fetching dealership name:', error);
          } else if (data) {
            setCurrentDealershipName(data.name);
            logAuthEvent('Dealership name fetched', {
              dealership_id: newDealershipId,
              dealership_name: data.name,
            });
          }
        });

      // Log the context change
      logSchemaOperation('set_dealership_context', {
        userId: user?.id,
        dealershipId: newDealershipId,
        timestamp: new Date().toISOString(),
      }).catch(err => {
        console.error('[AuthContext] Error logging dealership context change:', err);
      });
    },
    [user, dealershipId]
  );

  // Update toast utility functions to use the imported toast function directly
  const showSuccessToast = useCallback((title: string, description: string) => {
    try {
      toast({
        title,
        description,
        variant: 'default',
      });
    } catch (err) {
      console.error('[AuthContext] Error showing success toast:', err);
    }
  }, []);

  const showErrorToast = useCallback((title: string, description: string) => {
    try {
      toast({
        title,
        description,
        variant: 'destructive',
      });
    } catch (err) {
      console.error('[AuthContext] Error showing error toast:', err);
    }
  }, []);

  const showInfoToast = useCallback((title: string, description: string) => {
    try {
      toast({
        title,
        description,
        variant: 'info',
      });
    } catch (err) {
      console.error('[AuthContext] Error showing info toast:', err);
    }
  }, []);

  const MAX_RETRIES = 1; // Limit retries to prevent excessive database calls

  // Debug function to check profile existence
  const checkProfileExists = async (userId: string): Promise<boolean> => {
    try {
      logAuthEvent('Checking profile existence', { user_id: userId });

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logAuthEvent('Profile check error', {
          user_id: userId,
          error: error.message,
          code: error.code,
        });
        return false;
      }

      const exists = !!data;
      logAuthEvent('Profile check result', {
        user_id: userId,
        exists,
        data: data ? 'found' : 'not found',
      });
      return exists;
    } catch (err) {
      logAuthEvent('Profile check exception', {
        user_id: userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  };

  // Get user's dealership
  const fetchUserDealership = useCallback(async (userId: string): Promise<number | null> => {
    try {
      logAuthEvent('Fetching user dealership', { user_id: userId });

      // First try the new users table schema
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('dealership_id, role_id, roles(name)')
        .eq('id', userId)
        .maybeSingle();

      if (!userError && userData?.dealership_id) {
        logAuthEvent('Fetched dealership from users table', {
          user_id: userId,
          dealership_id: userData.dealership_id,
          role_id: userData.role_id,
          role_name: userData.roles?.name,
        });

        // Also set the role from the roles table if available
        if (userData.roles?.name) {
          const roleName = userData.roles.name.toLowerCase() as UserRole;
          setRole(roleName);
          setUserRole(roleName);
          logAuthEvent('Set user role from users table', {
            user_id: userId,
            role: roleName,
          });
        }

        return userData.dealership_id;
      }

      // Fallback to the profiles table (older schema)
      const { data, error } = await supabase
        .from('profiles')
        .select('dealership_id, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logAuthEvent('Error fetching user dealership from profiles', {
          user_id: userId,
          error: error.message,
          code: error.code,
        });
        return null;
      }

      // If we got the role from profiles, set it
      if (data?.role) {
        const roleName = data.role.toLowerCase() as UserRole;
        setRole(roleName);
        setUserRole(roleName);
        logAuthEvent('Set user role from profiles table', {
          user_id: userId,
          role: roleName,
        });
      }

      logAuthEvent('Fetched dealership from profiles table', {
        user_id: userId,
        dealership_id: data?.dealership_id,
      });

      // If we found a dealership ID, get its name
      if (data?.dealership_id) {
        supabase
          .from('dealerships')
          .select('name')
          .eq('id', data.dealership_id)
          .single()
          .then(({ data: dealershipData, error: dealershipError }) => {
            if (dealershipError) {
              logAuthEvent('Error fetching dealership name', {
                dealership_id: data.dealership_id,
                error: dealershipError.message,
              });
            } else if (dealershipData) {
              setCurrentDealershipName(dealershipData.name);
              logAuthEvent('Set dealership name', {
                dealership_id: data.dealership_id,
                dealership_name: dealershipData.name,
              });
            }
          });
      }

      return data?.dealership_id || null;
    } catch (err) {
      logAuthEvent('Exception fetching user dealership', {
        user_id: userId,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }, []);

  // Simplified fetch user role function without recursive calls
  const fetchUserRole = useCallback(
    async (userId: string): Promise<UserRole> => {
      console.log('[AuthContext] fetchUserRole called for userId:', userId, {
        timestamp: new Date().toISOString(),
      });

      // Add detailed logging for role debugging
      console.log('[AuthContext] Role debugging - current states:', {
        currentRole: role,
        hasSession,
        dealershipId,
        userId,
      });

      // Prevent concurrent operations on the same profile
      if (profileOperationInProgressRef.current) {
        console.log('[AuthContext] Profile operation already in progress, waiting...', {
          userId,
          timestamp: new Date().toISOString(),
        });
        // Wait briefly and try again up to 3 times
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchUserRole(userId);
        } else {
          console.warn('[AuthContext] Max retries reached for fetchUserRole, using fallback role', {
            userId,
            timestamp: new Date().toISOString(),
          });
          return FALLBACK_ROLE;
        }
      }

      profileOperationInProgressRef.current = true;
      retryCountRef.current = 0;

      try {
        // First check if profile exists
        const profileExists = await checkProfileExists(userId);

        if (profileExists) {
          // If profile exists, get the role
          console.log('[AuthContext] Profile exists, fetching role', {
            userId,
            timestamp: new Date().toISOString(),
          });

          try {
            const { data: profile, error: roleError } = await supabase
              .from('profiles')
              .select('role, dealership_id')
              .eq('id', userId)
              .maybeSingle();

            if (roleError) {
              console.error('[AuthContext] Error fetching role:', roleError, {
                userId,
                timestamp: new Date().toISOString(),
              });
              return FALLBACK_ROLE;
            }

            // Enhanced logging for dealership_admin role detection
            console.log('[AuthContext] Profile data retrieved:', {
              profileData: profile,
              hasRole: !!profile?.role,
              rawRole: profile?.role,
              normalizedRole: profile?.role?.toLowerCase(),
              isDealershipAdmin: profile?.role?.toLowerCase() === 'dealership_admin',
              timestamp: new Date().toISOString(),
            });

            // Also set the dealership ID if available
            if (profile?.dealership_id) {
              setDealershipId(profile.dealership_id);
              console.log('[AuthContext] Set dealership ID:', profile.dealership_id);
            }

            if (profile?.role) {
              const normalizedRole = profile.role.toLowerCase() as UserRole;
              console.log('[AuthContext] Role found:', profile.role, {
                normalizedRole,
                userId,
                timestamp: new Date().toISOString(),
              });
              return normalizedRole;
            } else {
              console.log('[AuthContext] Profile exists but no role found, using fallback role', {
                userId,
                timestamp: new Date().toISOString(),
              });
              return FALLBACK_ROLE;
            }
          } catch (err) {
            console.error('[AuthContext] Exception fetching role:', err, {
              userId,
              timestamp: new Date().toISOString(),
            });
            return FALLBACK_ROLE;
          }
        }

        // If profile doesn't exist, create it
        console.log('[AuthContext] Creating profile with default role', {
          userId,
          timestamp: new Date().toISOString(),
        });

        // Mark that we've attempted a profile operation for this user
        profileOperationAttempted.set(userId, true);

        try {
          const { data: userData } = await supabase.auth.getUser();

          // Prepare profile data
          const profileData = {
            id: userId,
            role: DEFAULT_ROLE,
            email: userData.user?.email || '',
            name: userData.user?.user_metadata?.name || '',
            dealership_id: DEFAULT_DEALERSHIP_ID,
          };

          console.log('[AuthContext] Inserting profile with data:', JSON.stringify(profileData), {
            timestamp: new Date().toISOString(),
          });

          // Try insertion with a timeout to prevent hanging
          const insertPromise = async () => {
            try {
              const { error } = await supabase.from('profiles').insert([profileData]);

              return { error };
            } catch (err) {
              return { error: err as Error };
            }
          };

          // Add timeout to prevent long-running operations
          const timeoutPromise = new Promise<{ error: Error }>(resolve => {
            setTimeout(() => {
              resolve({ error: new Error('Profile insertion timeout') });
            }, 5000); // 5 second timeout
          });

          const { error: insertError } = await Promise.race([insertPromise(), timeoutPromise]);

          if (insertError) {
            console.error('[AuthContext] Error inserting profile:', insertError, {
              userId,
              timestamp: new Date().toISOString(),
            });

            // Don't attempt further operations if insertion fails
            return FALLBACK_ROLE;
          } else {
            console.log('[AuthContext] Profile insertion successful', {
              userId,
              timestamp: new Date().toISOString(),
            });

            // Set the dealership ID for new users
            setDealershipId(DEFAULT_DEALERSHIP_ID);

            // Log the profile creation
            logSchemaOperation('profile_creation', {
              userId,
              role: DEFAULT_ROLE,
              dealershipId: DEFAULT_DEALERSHIP_ID,
              timestamp: new Date().toISOString(),
            }).catch(err => {
              console.error('[AuthContext] Error logging profile creation:', err);
            });

            return DEFAULT_ROLE;
          }
        } catch (err) {
          console.error('[AuthContext] Error in profile creation:', err, {
            userId,
            timestamp: new Date().toISOString(),
          });
          return FALLBACK_ROLE;
        } finally {
          profileOperationInProgressRef.current = false;
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error in fetchUserRole:', err, {
          userId,
          timestamp: new Date().toISOString(),
        });
        profileOperationInProgressRef.current = false;
        return FALLBACK_ROLE;
      }
    },
    [role]
  );

  // Handle auth state changes (login/logout/session changes)
  const handleAuthStateChange = useCallback(
    async (session: Session | null) => {
      console.log('[AuthContext] Auth state changed, session exists:', !!session, {
        timestamp: new Date().toISOString(),
        userId: session?.user?.id || 'none',
        event: 'auth_state_change',
      });

      try {
        // Update session state immediately
        setHasSession(!!session);

        if (session?.user) {
          // Set user immediately to ensure we have user data regardless of profile operations
          setUser(session.user);
          console.log('[AuthContext] User set from session:', session.user.email, {
            userId: session.user.id,
            timestamp: new Date().toISOString(),
          });

          // Check if group admin flag exists in user metadata first (faster than DB lookup)
          if (session.user.user_metadata?.is_group_admin) {
            console.warn(
              '[AuthContext] Group admin flag found in user metadata, setting isGroupAdmin=true'
            );
            setIsGroupAdmin(true);
            // Set role for group admin
            setRole('dealer_group_admin');
            setUserRole('dealer_group_admin');
          } else {
            // Check if the user is a group admin through profile data
            try {
              console.warn('[DEBUG AUTH] Checking group admin status during auth state change');
              const profileData = await fetchProfileData(session.user.id);

              // If we still don't have group admin status set from profile, check email pattern
              if (!isGroupAdmin && session.user.email) {
                const isGroupAdminEmail =
                  session.user.email.toLowerCase().includes('group') &&
                  session.user.email.toLowerCase().includes('@exampletest.com');

                if (isGroupAdminEmail) {
                  console.warn(
                    '[AuthContext] Email pattern suggests group admin but not set in profile/metadata'
                  );
                  setIsGroupAdmin(true);
                  setRole('dealer_group_admin');
                  setUserRole('dealer_group_admin');

                  // Try to update the profile and metadata
                  try {
                    await supabase
                      .from('profiles')
                      .update({
                        is_group_admin: true,
                        role: 'dealer_group_admin',
                      })
                      .eq('id', session.user.id);

                    await supabase.auth.updateUser({
                      data: {
                        is_group_admin: true,
                        role: 'dealer_group_admin',
                      },
                    });
                    console.warn(
                      '[AuthContext] Updated profile and metadata for detected group admin'
                    );
                  } catch (updateError) {
                    console.error('[AuthContext] Error updating group admin data:', updateError);
                  }
                }
              }
            } catch (profileError) {
              console.error('[DEBUG AUTH] Error checking group admin status:', profileError);
            }
          }

          // Then try to get role - but don't let profile errors affect user state
          try {
            retryCountRef.current = 0;
            const userRole = await fetchUserRole(session.user.id);
            console.log('[AuthContext] Role fetched successfully:', userRole, {
              userId: session.user.id,
              timestamp: new Date().toISOString(),
            });
            setRole(userRole);

            // Also fetch dealership ID if not already set
            if (dealershipId === null) {
              const userDealershipId = await fetchUserDealership(session.user.id);
              if (userDealershipId) {
                setDealershipId(userDealershipId);
                console.log('[AuthContext] Dealership ID set from profile:', userDealershipId);

                // Log the dealership assignment
                logSchemaOperation('dealership_assignment', {
                  userId: session.user.id,
                  dealershipId: userDealershipId,
                  timestamp: new Date().toISOString(),
                }).catch(err => {
                  console.error('[AuthContext] Error logging dealership assignment:', err);
                });
              }
            }
          } catch (error) {
            console.error('[AuthContext] Error fetching role, using fallback:', error, {
              userId: session.user.id,
              timestamp: new Date().toISOString(),
            });
            // Always set a role even on error
            setRole(FALLBACK_ROLE);
          }
        } else {
          // Clear user and role on session end
          console.log('[AuthContext] No session, clearing user and role', {
            timestamp: new Date().toISOString(),
          });
          setUser(null);
          setRole(null);
          setDealershipId(null);
        }
      } catch (error) {
        console.error('[AuthContext] Error in handleAuthStateChange:', error, {
          sessionExists: !!session,
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
        // Mark auth check as complete
        setAuthCheckComplete(true);
      }
    },
    [fetchUserRole, fetchUserDealership, dealershipId, isGroupAdmin]
  );

  // Initialize auth state on component mount
  useEffect(() => {
    let mounted = true;
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const initialize = async () => {
      if (initialized) return;

      try {
        console.log('[AuthContext] Initializing auth context', {
          timestamp: new Date().toISOString(),
        });

        // Check for direct auth first - if active, skip normal Supabase initialization
        if (isAuthenticated && isAuthenticated()) {
          const directUser = getDirectAuthUser();
          if (directUser) {
            console.log(
              '[AuthContext] Direct auth detected during initialization:',
              directUser.email
            );

            // Set user data from direct auth
            if (mounted) {
              // Create a mock Supabase user object from direct auth user
              const mockUser = {
                id: directUser.id,
                email: directUser.email,
                user_metadata: { role: directUser.role },
                app_metadata: {},
                aud: 'authenticated',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              setUser(mockUser as any);
              setRole(directUser.role as any);
              setIsGroupAdmin(directUser.isGroupAdmin || false);
              setLoading(false);
              setAuthCheckComplete(true);
              setHasSession(true); // Direct auth counts as having a session
              console.log('[AuthContext] Direct auth initialization completed with user data', {
                email: directUser.email,
                role: directUser.role,
                isGroupAdmin: directUser.isGroupAdmin,
              });
            }
            return;
          }
        }

        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthContext] Error getting initial session:', sessionError, {
            timestamp: new Date().toISOString(),
          });
          if (mounted) {
            setLoading(false); // Make sure to set loading to false even on error
            setAuthCheckComplete(true); // Mark auth check as complete
            setError(sessionError);
          }
          return;
        }

        // Update session state
        if (mounted) {
          console.log('[AuthContext] Initial session exists:', !!session, {
            userId: session?.user?.id || 'none',
            timestamp: new Date().toISOString(),
          });
          setHasSession(!!session);
        }

        // Process initial session
        if (session?.user && mounted) {
          console.log('[AuthContext] Found initial session for user:', session.user.email, {
            userId: session.user.id,
            timestamp: new Date().toISOString(),
          });

          // Always set user data immediately
          setUser(session.user);

          // Check if the user is a group admin
          try {
            console.warn('[DEBUG AUTH] Checking group admin status during initialization');
            await fetchProfileData(session.user.id);
          } catch (profileError) {
            console.error('[DEBUG AUTH] Error checking group admin status:', profileError);
          }

          try {
            // Then try to get role
            const initialRole = await fetchUserRole(session.user.id);
            if (mounted) {
              console.log('[AuthContext] Setting initial role:', initialRole, {
                userId: session.user.id,
                timestamp: new Date().toISOString(),
              });
              setRole(initialRole);
            }
          } catch (error) {
            console.error('[AuthContext] Error fetching initial role, using fallback:', error, {
              userId: session.user.id,
              timestamp: new Date().toISOString(),
            });
            if (mounted) {
              // Always set a role even on error
              console.log('[AuthContext] Setting fallback role due to error', {
                role: FALLBACK_ROLE,
                timestamp: new Date().toISOString(),
              });
              setRole(FALLBACK_ROLE);
            }
          }
        }

        if (mounted) {
          setLoading(false);
          setAuthCheckComplete(true); // Mark auth check as complete
        }

        // Set up auth state change listener
        if (mounted) {
          authListener = await supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;

            console.log('[AuthContext] Auth event:', event, {
              userId: newSession?.user?.id || 'none',
              email: newSession?.user?.email || 'none',
              timestamp: new Date().toISOString(),
            });

            // Update hasSession immediately
            setHasSession(!!newSession);

            // Skip INITIAL_SESSION if we already have a user
            if (event === 'INITIAL_SESSION' && user && role) {
              console.log('[AuthContext] Skipping INITIAL_SESSION - already initialized', {
                userId: user.id,
                role,
                timestamp: new Date().toISOString(),
              });
              return;
            }

            await handleAuthStateChange(newSession);
          });
        }

        if (mounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('[AuthContext] Error in initialization:', error, {
          timestamp: new Date().toISOString(),
        });
        if (mounted) {
          setLoading(false); // Ensure loading is set to false on any error
          setAuthCheckComplete(true); // Mark auth check as complete
          setError(error instanceof Error ? error : new Error('Unknown initialization error'));
        }
      }
    };

    initialize();

    // Set a safety timeout to ensure loading state isn't stuck
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        // Check if direct auth is active before forcing timeout
        const isDirectAuth = isAuthenticated && isAuthenticated();
        if (isDirectAuth) {
          console.log(
            '[AuthContext] Safety timeout reached but direct auth is active - completing auth state'
          );
          // Complete the auth state for direct auth
          setLoading(false);
          setAuthCheckComplete(true);
          setHasSession(true); // Direct auth counts as having a session
          return;
        }

        console.error('[AuthContext] Safety timeout reached - forcing loading state to false');
        setLoading(false);
        setAuthCheckComplete(true); // Mark auth check as complete even on timeout
      }
    }, 5000); // 5 second safety timeout

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [handleAuthStateChange, initialized, fetchUserRole]);

  // Sign in with email and password
  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      logAuthEvent('Sign in attempt', {
        email,
        remember_me: !!rememberMe,
        timestamp: new Date().toISOString(),
      });

      setLoading(true);
      setError(null);

      console.log('[AuthContext] Signing in user:', email, {
        timestamp: new Date().toISOString(),
        rememberMe: !!rememberMe,
      });

      // Special handling for test accounts with @exampletest.com domain
      if (isTestEmail(email)) {
        console.log('[AuthContext] Test email detected, using special login flow');
        const testLoginResult = await loginTestUser(email, password);

        if (testLoginResult.error) {
          throw testLoginResult.error;
        }

        // If successful, the loginTestUser function returns the session data
        const session = testLoginResult.data?.session;

        if (!session) {
          throw new Error('No session returned from test login');
        }

        console.log('[AuthContext] Test login successful for:', email, testLoginResult);

        // Handle the successful session similar to the normal flow
        setUser(session.user);
        setHasSession(true);

        // Check for force_redirect flag that may have been set by loginTestUser
        const forceRedirectTo = localStorage.getItem('force_redirect_after_login');
        const forceRedirectTimestamp = localStorage.getItem('force_redirect_timestamp');

        // Only use the redirect if it was set in the last 10 seconds
        const isRecentRedirect =
          forceRedirectTimestamp && Date.now() - parseInt(forceRedirectTimestamp) < 10000;

        if (forceRedirectTo && isRecentRedirect) {
          console.log('[AuthContext] Force redirect detected for test user to:', forceRedirectTo);
          // Clear the flags to prevent redirect loops
          localStorage.removeItem('force_redirect_after_login');
          localStorage.removeItem('force_redirect_timestamp');

          setLoading(false);
          showSuccessToast('Welcome Back!', 'Login successful - redirecting...');

          // Use window.location for a full page reload to ensure clean state
          window.location.href = forceRedirectTo;
          return;
        }

        // Force immediate redirection if group admin
        const isGroupAdminByEmail =
          email.toLowerCase().includes('group') && email.toLowerCase().includes('@exampletest.com');

        if (isGroupAdmin || testLoginResult.isGroupAdmin) {
          console.warn(
            '[AuthContext] GROUP ADMIN test account detected, forcing immediate redirect'
          );
          setLoading(false);
          showSuccessToast('Welcome Back!', 'Group Admin login successful');
          window.location.href = '/group-admin';
          return;
        }

        // Check if this user is explicitly marked as a group admin in the result
        if (testLoginResult.isGroupAdmin) {
          console.log('[AuthContext] Direct group admin flag detected, setting isGroupAdmin=true');
          setIsGroupAdmin(true);
          setRole('dealer_group_admin');
          setUserRole('dealer_group_admin');
        } else {
          // Check group admin status
          console.warn('[DEBUG AUTH] Checking group admin status after test login');
          if (session.user?.id) {
            const profileData = await fetchProfileData(session.user.id);

            // Get the user's dealership
            const userDealershipId = await fetchUserDealership(session.user.id);
            if (userDealershipId) {
              setDealershipId(userDealershipId);
            }

            // Set role from profile if available
            if (profileData?.role) {
              const normalizedRole = profileData.role.toLowerCase() as UserRole;
              setRole(normalizedRole);
              setUserRole(normalizedRole);
            }
          }
        }

        showSuccessToast('Welcome back!', 'You have successfully signed in as a test user.');
        setLoading(false);
        return;
      }

      // Normal login flow for non-test accounts
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session persistence based on remember me option
          // Default to false if not specified (session expires when tab is closed)
          persistSession: rememberMe ?? false,
        },
      });

      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        throw error;
      }

      if (!data.user) {
        console.error('[AuthContext] No user returned from authentication');
        throw new Error('No user returned from authentication');
      }

      console.log('[AuthContext] User authenticated successfully:', data.user.id);

      // Update state with user data
      setUser(data.user);
      setHasSession(true);

      // Check group admin status
      console.warn('[DEBUG AUTH] Checking group admin status after login');
      const profileData = await fetchProfileData(data.user.id);

      // Immediate redirection for group admin accounts
      const isGroupAdminByEmail =
        data.user.email?.toLowerCase().includes('group') &&
        data.user.email?.toLowerCase().includes('@exampletest.com');

      if (
        isGroupAdmin ||
        profileData?.is_group_admin ||
        isGroupAdminByEmail ||
        data.user.user_metadata?.is_group_admin
      ) {
        console.warn('[DEBUG AUTH] Group admin detected, forcing immediate redirect');
        setLoading(false); // Ensure loading state is cleared before redirect
        showSuccessToast('Sign In Successful', `Welcome, Group Admin!`);

        // Force immediate browser navigation
        setTimeout(() => {
          window.location.href = '/group-admin';
        }, 100);
        return;
      }

      // Get the user's dealership and role
      const userDealershipId = await fetchUserDealership(data.user.id);
      if (userDealershipId) {
        setDealershipId(userDealershipId);
        console.log(`[AuthContext] User belongs to dealership: ${userDealershipId}`);
      } else {
        console.log('[AuthContext] No dealership found for user, using default');
        setDealershipId(DEFAULT_DEALERSHIP_ID);
      }

      showSuccessToast('Sign In Successful', `Welcome back, ${email}!`);
    } catch (error) {
      logAuthEvent('Sign in error', {
        email,
        error: error instanceof Error ? error.message : String(error),
      });

      logSecurityEvent('Failed login attempt', {
        email,
        error: error instanceof Error ? error.message : String(error),
        ip_address: 'client-side', // Note: Real IP tracking should be done server-side
      });

      setError(error instanceof Error ? error : new Error('Unknown error occurred during sign in'));
      showErrorToast(
        'Sign In Failed',
        error instanceof Error ? error.message : 'Unknown error occurred during sign in'
      );
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: any) => {
    console.log('[AuthContext] Signing up:', email, {
      timestamp: new Date().toISOString(),
    });

    if (!email || !password || !userData) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) {
        console.error('[AuthContext] Sign up error:', error.message, {
          code: error.name,
          timestamp: new Date().toISOString(),
        });
        setError(error);
        showErrorToast('Sign up failed', error.message);
        return;
      }

      if (data.user) {
        // Create profile for new user
        try {
          console.log('[AuthContext] Creating profile for new user:', data.user.id, {
            email,
            timestamp: new Date().toISOString(),
          });

          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: data.user.id,
              email,
              name: `${userData.firstName} ${userData.lastName}`,
              role: DEFAULT_ROLE,
              dealership_id: DEFAULT_DEALERSHIP_ID,
            },
          ]);

          if (profileError) {
            console.error('[AuthContext] Error creating profile during signup:', profileError, {
              userId: data.user.id,
              timestamp: new Date().toISOString(),
            });
            // Don't fail sign up due to profile error
          } else {
            console.log('[AuthContext] Profile successfully created during signup', {
              userId: data.user.id,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (profileError) {
          console.error('[AuthContext] Exception creating profile during signup:', profileError, {
            userId: data.user.id,
            timestamp: new Date().toISOString(),
          });
          // Don't fail sign up due to profile error
        }

        console.log('[AuthContext] Sign up successful for:', email, {
          userId: data.user.id,
          timestamp: new Date().toISOString(),
        });
        showSuccessToast('Account created', 'Your account has been created successfully');
      }
    } catch (error) {
      console.error('[AuthContext] Error in signUp:', error, {
        email,
        timestamp: new Date().toISOString(),
      });
      const errorMsg = error instanceof Error ? error.message : String(error);
      setError(error instanceof Error ? error : new Error(errorMsg));
      showErrorToast('Sign up failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      logAuthEvent('Sign out initiated', {
        user_id: user?.id,
        email: user?.email,
      });

      console.log('[AuthContext] Signing out user:', user?.email, {
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });

      // First try to clean up some state immediately for a smoother experience
      try {
        // Mark that we're in the logout process to prevent redirects
        localStorage.setItem('logout_in_progress', 'true');

        // Start the loading spinner
        setLoading(true);

        // Signal to the UI that we're logging out
        showInfoToast('Signing Out', 'Please wait while we sign you out...');
      } catch (localError) {
        console.error('[AuthContext] Error during pre-logout cleanup:', localError);
      }

      // Redirect to the dedicated logout page to handle the complete logout process
      console.log('[AuthContext] Redirecting to logout page');
      window.location.href = '/logout';

      return; // Early return to skip the rest of the function

      // This code will not run, but is kept for reference
    } catch (error) {
      logAuthEvent('Sign out error', {
        user_id: user?.id,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error('[AuthContext] Error during signOut:', error);

      setError(
        error instanceof Error ? error : new Error('Unknown error occurred during sign out')
      );

      showErrorToast(
        'Sign Out Failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );

      // Even if there's an error, still try to navigate to the logout page
      window.location.href = '/logout';
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch data from the correct schema based on dealership_id
  const fetchFromDealershipSchema = useCallback(
    async (dealershipId: number, table: string, query: any = {}) => {
      try {
        console.log(
          `[AuthContext] Fetching data from schema for dealership: ${dealershipId}, table: ${table}`,
          {
            timestamp: new Date().toISOString(),
            query,
          }
        );

        // Get the schema name for this dealership
        const { data: dealership, error: dealershipError } = await supabase
          .from('dealerships')
          .select('schema_name')
          .eq('id', dealershipId)
          .single();

        if (dealershipError || !dealership?.schema_name) {
          console.error(
            `[AuthContext] Error fetching schema name for dealership ${dealershipId}:`,
            dealershipError
          );
          return {
            data: null,
            error: dealershipError || new Error('No schema name found for dealership'),
          };
        }

        const schemaName = dealership.schema_name;
        console.log(`[AuthContext] Using schema: ${schemaName} for dealership: ${dealershipId}`);

        // Build the query dynamically based on the provided query object
        let dbQuery = supabase.from(`${schemaName}.${table}`);

        // Apply select if provided
        if (query.select) {
          dbQuery = dbQuery.select(query.select);
        } else {
          dbQuery = dbQuery.select('*');
        }

        // Apply filters if provided
        if (query.filters) {
          for (const filter of query.filters) {
            if (filter.type === 'eq') {
              dbQuery = dbQuery.eq(filter.column, filter.value);
            } else if (filter.type === 'in') {
              dbQuery = dbQuery.in(filter.column, filter.value);
            } else if (filter.type === 'gt') {
              dbQuery = dbQuery.gt(filter.column, filter.value);
            } else if (filter.type === 'lt') {
              dbQuery = dbQuery.lt(filter.column, filter.value);
            }
            // Add more filter types as needed
          }
        }

        // Apply order if provided
        if (query.order) {
          dbQuery = dbQuery.order(query.order.column, { ascending: query.order.ascending });
        }

        // Apply limit if provided
        if (query.limit) {
          dbQuery = dbQuery.limit(query.limit);
        }

        // Execute the query
        const { data, error } = await dbQuery;

        if (error) {
          console.error(`[AuthContext] Error fetching data from ${schemaName}.${table}:`, error);
          return { data: null, error };
        }

        console.log(`[AuthContext] Successfully fetched data from ${schemaName}.${table}:`, {
          count: data?.length,
        });
        return { data, error: null };
      } catch (err) {
        console.error(`[AuthContext] Exception in fetchFromDealershipSchema:`, err);
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') };
      }
    },
    []
  );

  // Add a new function for magic link login
  const magicLinkLogin = async (email: string) => {
    console.log(`[AuthContext] Magic link login attempt for ${email}`);
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only send to existing users
        },
      });

      if (error) {
        console.error('[AuthContext] Magic link error:', error);
        throw error;
      }

      console.log('[AuthContext] Magic link sent successfully');
      showSuccessToast(
        'Magic Link Sent',
        `Check your email (${email}) for a login link. For test accounts, you can check the console for the magic link.`
      );
    } catch (error) {
      console.error('[AuthContext] Magic link process failed:', error);

      if (error instanceof Error) {
        setError(error);
        showErrorToast('Magic Link Failed', error.message);
      } else {
        const genericError = new Error('An unknown error occurred during magic link generation');
        setError(genericError);
        showErrorToast('Magic Link Failed', 'An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create value with updated dealership context
  const value = {
    user,
    role,
    signIn,
    signUp,
    signOut,
    loading,
    hasSession,
    error,
    userRole,
    dealershipId,
    setDealershipContext,
    currentDealershipName,
    fetchFromDealershipSchema,
    magicLinkLogin,
    loginTestAccount: loginTestUser,
    logAccessAttempt: (path: string, allowed: boolean, details?: any) => {
      const accessEvent = allowed ? 'Access granted' : 'Access denied';

      logAuthEvent(accessEvent, {
        path,
        user_id: user?.id,
        email: user?.email,
        role: role || userRole,
        dealership_id: dealershipId,
        dealership_name: currentDealershipName,
        details,
        allowed,
      });

      if (!allowed) {
        logSecurityEvent('Unauthorized access attempt', {
          path,
          user_id: user?.id,
          email: user?.email,
          role: role || userRole,
        });
      }
    },
    isGroupAdmin,
    authCheckComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add a global type declaration for auth event tracking
declare global {
  interface Window {
    authEvents?: Array<{
      event: string;
      details: any;
      timestamp: string;
    }>;
  }
}
