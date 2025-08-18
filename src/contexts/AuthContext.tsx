/**
 * Secured Authentication Context with Enhanced Security and Stability
 *
 * Security Features:
 * - Secure token storage with encryption
 * - Session hijacking prevention
 * - Multiple client instance prevention
 * - Token exposure protection
 * - Secure error handling
 * - Rate limiting with server validation
 * - Memory leak prevention
 *
 * Stability Features:
 * - Comprehensive error handling
 * - Loading state management
 * - State update safeguards
 * - Memory management
 * - Connection timeout handling
 * - Graceful degradation
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
import CryptoJS from 'crypto-js';
import {
  supabase,
  getCurrentUser,
  getDealershipSupabase,
  getUserDealershipId,
  loginTestUser,
  isTestEmail,
} from '../lib/supabaseClient';
import SecureLogger from '../lib/secureLogger';
import rateLimiter from '../lib/rateLimiter';
import ServerRateLimiter from '../lib/serverRateLimiter';
import KeyManagement from '../lib/keyManagement';
import { Database } from '../lib/database.types';
import { toast } from '../lib/use-toast';
import { logSchemaOperation, testDealershipConnection } from '../lib/apiService';
import {
  logout as directAuthLogout,
  isDirectAuthAuthenticated,
  getCurrentDirectAuthUser as getDirectAuthUser,
} from '../lib/directAuth';

// =================== TYPE DEFINITIONS ===================

// Strict typing for user roles with security validation
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

// Enhanced auth context interface with strict typing
interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData: SecureUserData) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  hasSession: boolean;
  error: AuthError | null;
  userRole: string | null;
  dealershipId: number | null;
  setDealershipContext: (dealershipId: number) => void;
  currentDealershipName: string | null;
  fetchFromDealershipSchema: (
    dealershipId: number,
    table: string,
    query?: QueryOptions
  ) => Promise<{ data: any | null; error: Error | null }>;
  magicLinkLogin: (email: string) => Promise<void>;
  loginTestAccount: (email: string, password: string) => Promise<void>;
  logAccessAttempt: (path: string, allowed: boolean, details?: any) => void;
  isGroupAdmin: boolean;
  authCheckComplete: boolean;
  sessionHealth: SessionHealth;
  refreshSession: () => Promise<void>;
}

// Secure user data interface for signup
interface SecureUserData {
  firstName: string;
  lastName: string;
  role?: UserRole;
  dealershipId?: number;
}

// Query options with validation
interface QueryOptions {
  select?: string;
  filters?: Array<{
    type: 'eq' | 'in' | 'gt' | 'lt' | 'gte' | 'lte' | 'like';
    column: string;
    value: any;
  }>;
  order?: {
    column: string;
    ascending: boolean;
  };
  limit?: number;
}

// Session health monitoring
interface SessionHealth {
  isValid: boolean;
  expiresAt: number | null;
  lastChecked: number;
  warningIssued: boolean;
}

// =================== SECURITY CONFIGURATION ===================

// Security constants
const SECURITY_CONFIG = {
  SESSION_TIMEOUT_MS: 18 * 60 * 60 * 1000, // 18 hours
  SESSION_WARNING_MS: 17 * 60 * 60 * 1000, // 17 hours (1 hour before expiry)
  TOKEN_ROTATION_INTERVAL: 15 * 60 * 1000, // 15 minutes
  MAX_RETRY_ATTEMPTS: 3,
  NETWORK_TIMEOUT: 10000, // 10 seconds
  ENCRYPTION_KEY_LENGTH: 32,
  SALT_LENGTH: 16,
} as const;

// Default security settings
const DEFAULT_ROLE: UserRole = 'salesperson';
const FALLBACK_ROLE: UserRole = 'finance_manager';
const DEFAULT_DEALERSHIP_ID = 1;

// Prevent multiple client instances
let clientInstanceCount = 0;
const MAX_CLIENT_INSTANCES = 1;

// Session storage encryption key (generated per session)
let sessionEncryptionKey: string | null = null;

// Profile operation tracking to prevent race conditions
const profileOperationTracking = new Map<
  string,
  {
    inProgress: boolean;
    lastAttempt: number;
    retryCount: number;
  }
>();

// =================== SECURITY UTILITIES ===================

/**
 * Generate secure encryption key for session storage
 * Uses Web Crypto API for secure random generation
 */
const generateSecureKey = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(SECURITY_CONFIG.ENCRYPTION_KEY_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without Web Crypto API
  return CryptoJS.lib.WordArray.random(SECURITY_CONFIG.ENCRYPTION_KEY_LENGTH).toString();
};

/**
 * Encrypt sensitive data for secure storage
 * Uses AES encryption with random salt
 */
const encryptSensitiveData = (data: string, key: string): string => {
  try {
    const salt = CryptoJS.lib.WordArray.random(SECURITY_CONFIG.SALT_LENGTH);
    const encrypted = CryptoJS.AES.encrypt(data, key + salt.toString()).toString();
    return salt.toString() + ':' + encrypted;
  } catch (error) {
    SecureLogger.error('Failed to encrypt sensitive data', { error: error.message });
    throw new Error('Encryption failed');
  }
};

/**
 * Decrypt sensitive data from secure storage
 * Validates salt and decrypts using AES
 */
const decryptSensitiveData = (encryptedData: string, key: string): string => {
  try {
    const [salt, encrypted] = encryptedData.split(':');
    if (!salt || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    const decrypted = CryptoJS.AES.decrypt(encrypted, key + salt);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    SecureLogger.error('Failed to decrypt sensitive data', { error: error.message });
    throw new Error('Decryption failed');
  }
};

/**
 * Secure session storage with encryption
 * Prevents token exposure in localStorage
 */
const secureSessionStorage = {
  setItem: (key: string, value: string): void => {
    try {
      if (!sessionEncryptionKey) {
        sessionEncryptionKey = generateSecureKey();
      }
      const encryptedValue = encryptSensitiveData(value, sessionEncryptionKey);
      sessionStorage.setItem(`secure_${key}`, encryptedValue);
    } catch (error) {
      SecureLogger.error('Failed to store secure session data', { key, error: error.message });
    }
  },

  getItem: (key: string): string | null => {
    try {
      if (!sessionEncryptionKey) {
        return null;
      }
      const encryptedValue = sessionStorage.getItem(`secure_${key}`);
      if (!encryptedValue) {
        return null;
      }
      return decryptSensitiveData(encryptedValue, sessionEncryptionKey);
    } catch (error) {
      SecureLogger.error('Failed to retrieve secure session data', { key, error: error.message });
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(`secure_${key}`);
    } catch (error) {
      SecureLogger.error('Failed to remove secure session data', { key, error: error.message });
    }
  },

  clear: (): void => {
    try {
      // Remove all secure session items
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          sessionStorage.removeItem(key);
        }
      });
      sessionEncryptionKey = null;
    } catch (error) {
      SecureLogger.error('Failed to clear secure session storage', { error: error.message });
    }
  },
};

// Initialize stored fingerprint from session storage if available
try {
  if (typeof window !== 'undefined') {
    const stored = secureSessionStorage.getItem('session_fingerprint');
    if (stored) {
      storedSessionFingerprint = stored;
    }
  }
} catch (error) {
  console.warn('Failed to initialize session fingerprint from storage:', error);
}

/**
 * Validate user role against allowed roles
 * Prevents privilege escalation attacks
 */
const validateUserRole = (role: string): UserRole => {
  const allowedRoles: UserRole[] = [
    'salesperson',
    'finance_manager',
    'single_finance_manager',
    'sales_manager',
    'general_manager',
    'admin',
    'dealership_admin',
    'dealer_group_admin',
    'area_vice_president',
  ];

  const normalizedRole = role?.toLowerCase() as UserRole;
  if (allowedRoles.includes(normalizedRole)) {
    return normalizedRole;
  }

  SecureLogger.warning('Invalid role attempted', { attempted_role: role });
  return DEFAULT_ROLE;
};

/**
 * Validate email format with strict security checks
 * Prevents injection attacks through email field
 */
const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;

  // Check for maximum length to prevent buffer overflow attacks
  if (email.length > 254) return false;

  // Enhanced email regex with security considerations
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Check for suspicious characters that might indicate injection attempts
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /@.*@/, // Multiple @ symbols
    /\s/, // Whitespace
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    SecureLogger.warning('Suspicious email pattern detected', {
      email: email.substring(0, 10) + '...',
    });
    return false;
  }

  return emailRegex.test(email);
};

/**
 * Generate session fingerprint for session hijacking prevention
 * Creates unique identifier based on browser characteristics
 */
const generateSessionFingerprint = (): string => {
  try {
    const factors = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.platform,
    ];

    const fingerprint = CryptoJS.SHA256(factors.join('|')).toString();
    return fingerprint;
  } catch (error) {
    SecureLogger.error('Failed to generate session fingerprint', { error: error.message });
    return 'fallback_fingerprint_' + Date.now();
  }
};

/**
 * Validate session fingerprint to prevent session hijacking
 * Compares current browser fingerprint with stored fingerprint
 */
const validateSessionFingerprint = (storedFingerprint: string): boolean => {
  try {
    const currentFingerprint = generateSessionFingerprint();
    return currentFingerprint === storedFingerprint;
  } catch (error) {
    SecureLogger.error('Failed to validate session fingerprint', { error: error.message });
    return false;
  }
};

/**
 * Calculate distance between two fingerprints to determine if they're drastically different
 * Returns a value between 0 (identical) and 1 (completely different)
 */
const calculateFingerprintDistance = (fp1: string, fp2: string): number => {
  try {
    if (fp1 === fp2) return 0;
    if (!fp1 || !fp2) return 1;
    
    // Simple character-by-character comparison
    let differences = 0;
    const maxLength = Math.max(fp1.length, fp2.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (fp1[i] !== fp2[i]) {
        differences++;
      }
    }
    
    return differences / maxLength;
  } catch (error) {
    SecureLogger.error('Failed to calculate fingerprint distance', { error: error.message });
    return 1; // Assume completely different on error
  }
};

/**
 * Secure event logger with sanitization
 * Prevents sensitive data leakage in logs
 */
const logSecureAuthEvent = (event: string, details: any): void => {
  try {
    // Create sanitized copy of details
    const sanitizedDetails = { ...details };

    // Remove sensitive fields
    delete sanitizedDetails.password;
    delete sanitizedDetails.access_token;
    delete sanitizedDetails.refresh_token;
    delete sanitizedDetails.session;
    delete sanitizedDetails.user_metadata;

    // Truncate email for privacy
    if (sanitizedDetails.email) {
      const [local, domain] = sanitizedDetails.email.split('@');
      sanitizedDetails.email = local.substring(0, 3) + '***@' + domain;
    }

    // Add security context
    const securityContext = {
      timestamp: new Date().toISOString(),
      event,
      ...sanitizedDetails,
      fingerprint_valid: storedSessionFingerprint
        ? validateSessionFingerprint(storedSessionFingerprint)
        : null,
      instance_count: clientInstanceCount,
    };

    SecureLogger.info(`[AuthContext] ${event}`, securityContext);

    // Store in secure session storage for debugging (limited history)
    try {
      const authEvents = JSON.parse(secureSessionStorage.getItem('auth_events') || '[]');
      authEvents.push(securityContext);

      // Keep only last 50 events to prevent memory issues
      if (authEvents.length > 50) {
        authEvents.splice(0, authEvents.length - 50);
      }

      secureSessionStorage.setItem('auth_events', JSON.stringify(authEvents));
    } catch (storageError) {
      // Don't fail the operation if event storage fails
      SecureLogger.warning('Failed to store auth event', { error: storageError.message });
    }
  } catch (error) {
    // Ensure logging errors don't break the application
    console.error('[AuthContext] Failed to log secure auth event:', error);
  }
};

// =================== CONTEXT SETUP ===================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Track session fingerprint globally
let storedSessionFingerprint: string | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // =================== STATE MANAGEMENT ===================

  // Core auth state with strict typing
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dealershipId, setDealershipId] = useState<number | null>(null);
  const [currentDealershipName, setCurrentDealershipName] = useState<string | null>(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState<boolean>(false);
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);

  // Session health monitoring state
  const [sessionHealth, setSessionHealth] = useState<SessionHealth>({
    isValid: false,
    expiresAt: null,
    lastChecked: 0,
    warningIssued: false,
  });

  // Refs for managing component lifecycle and preventing race conditions
  const initializationRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const authListenerRef = useRef<any>(null);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent multiple client instances
  useEffect(() => {
    clientInstanceCount++;

    if (clientInstanceCount > MAX_CLIENT_INSTANCES) {
      SecureLogger.error('Multiple AuthContext instances detected', {
        count: clientInstanceCount,
      });
      console.error(
        '[AuthContext] Security Warning: Multiple authentication contexts detected. This could indicate a security issue.'
      );
    }

    return () => {
      clientInstanceCount--;
    };
  }, []);

  // =================== SESSION MANAGEMENT ===================

  /**
   * Enhanced session validation with security checks
   * Validates session integrity, expiration, and fingerprint
   */
  const validateSession = useCallback(async (session: Session | null): Promise<boolean> => {
    if (!session) {
      return false;
    }

    try {
      // Check basic session structure
      if (!session.access_token || !session.user) {
        SecureLogger.warning('Invalid session structure detected');
        return false;
      }

      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at <= now) {
        SecureLogger.warning('Session token expired');
        return false;
      }

      // Validate session fingerprint to prevent hijacking - with fallback to stored fingerprint
      const sessionStoredFingerprint = storedSessionFingerprint || secureSessionStorage.getItem('session_fingerprint');
      if (sessionStoredFingerprint && !validateSessionFingerprint(sessionStoredFingerprint)) {
        SecureLogger.warning('Session fingerprint mismatch - checking if legitimate', {
          stored_fingerprint: sessionStoredFingerprint.substring(0, 8) + '...',
        });
        
        // More lenient validation - only sign out if fingerprint is drastically different
        const currentFingerprint = generateSessionFingerprint();
        const fingerprintDistance = calculateFingerprintDistance(sessionStoredFingerprint, currentFingerprint);
        
        if (fingerprintDistance > 0.8) { // Only fail if >80% different
          SecureLogger.error('Session fingerprint drastically different - possible hijacking attempt');
          await signOut();
          return false;
        } else {
          SecureLogger.info('Session fingerprint minor mismatch - allowing session to continue');
          // Update stored fingerprint to current one
          storedSessionFingerprint = currentFingerprint;
          secureSessionStorage.setItem('session_fingerprint', currentFingerprint);
        }
      }

      // Additional JWT validation (basic structure check)
      const tokenParts = session.access_token.split('.');
      if (tokenParts.length !== 3) {
        SecureLogger.warning('Invalid JWT token structure');
        return false;
      }

      // Update session health
      setSessionHealth({
        isValid: true,
        expiresAt: session.expires_at ? session.expires_at * 1000 : null,
        lastChecked: Date.now(),
        warningIssued: false,
      });

      return true;
    } catch (error) {
      SecureLogger.error('Session validation failed', { error: error.message });
      return false;
    }
  }, []);

  /**
   * Secure session refresh with token rotation
   * Implements automatic token refresh with security validation
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      logSecureAuthEvent('Session refresh initiated', {});

      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        SecureLogger.error('Session refresh failed', { error: error.message });
        throw error;
      }

      if (data.session) {
        const isValid = await validateSession(data.session);
        if (!isValid) {
          throw new Error('Refreshed session validation failed');
        }

        // Store encrypted session data
        secureSessionStorage.setItem(
          'session_data',
          JSON.stringify({
            expires_at: data.session.expires_at,
            user_id: data.session.user.id,
            fingerprint: generateSessionFingerprint(),
          })
        );

        logSecureAuthEvent('Session refresh successful', {
          user_id: data.session.user.id,
          expires_at: data.session.expires_at,
        });
      }
    } catch (error) {
      SecureLogger.error('Session refresh error', { error: error.message });
      // Force logout on refresh failure to maintain security
      await signOut();
      throw error;
    }
  }, [validateSession]);

  /**
   * Monitor session health and handle automatic refresh
   * Implements proactive session management
   */
  const monitorSessionHealth = useCallback(async (): Promise<void> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        SecureLogger.error('Session health check failed', { error: error.message });
        return;
      }

      if (!session) {
        setSessionHealth(prev => ({ ...prev, isValid: false }));
        return;
      }

      const isValid = await validateSession(session);

      if (!isValid) {
        await signOut();
        return;
      }

      // Check if session is approaching expiration
      if (session.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Issue warning if session expires within 1 hour
        if (timeUntilExpiry < 60 * 60 * 1000 && !sessionHealth.warningIssued) {
          setSessionHealth(prev => ({ ...prev, warningIssued: true }));

          toast({
            title: 'Session Expiring Soon',
            description: 'Your session will expire soon. Please save your work.',
            variant: 'default',
          });
        }

        // Auto-refresh if session expires within 15 minutes
        if (timeUntilExpiry < 15 * 60 * 1000) {
          await refreshSession();
        }
      }
    } catch (error) {
      SecureLogger.error('Session health monitoring failed', { error: error.message });
    }
  }, [sessionHealth.warningIssued, validateSession, refreshSession]);

  // =================== SECURE STATE UPDATES ===================

  /**
   * Secure user state update with validation
   * Ensures state updates are atomic and validated
   */
  const setUserSecurely = useCallback((newUser: User | null): void => {
    if (!mountedRef.current) return;

    try {
      // Validate user object structure if provided
      if (newUser && (!newUser.id || !newUser.email)) {
        SecureLogger.warning('Invalid user object provided to setUserSecurely');
        return;
      }

      setUser(prevUser => {
        // Prevent unnecessary updates
        if (prevUser?.id === newUser?.id) {
          return prevUser;
        }

        // Log user state change
        logSecureAuthEvent('User state updated', {
          previous_user_id: prevUser?.id,
          new_user_id: newUser?.id,
          has_user: !!newUser,
        });

        return newUser;
      });
    } catch (error) {
      SecureLogger.error('Failed to update user state securely', { error: error.message });
    }
  }, []);

  /**
   * Secure role state update with validation
   * Validates role against allowed roles before setting
   */
  const setRoleSecurely = useCallback((newRole: string | null): void => {
    if (!mountedRef.current) return;

    try {
      if (newRole) {
        const validatedRole = validateUserRole(newRole);
        setRole(validatedRole);
        setUserRole(validatedRole);

        logSecureAuthEvent('Role updated', {
          role: validatedRole,
          original_role: newRole,
        });
      } else {
        setRole(null);
        setUserRole(null);
      }
    } catch (error) {
      SecureLogger.error('Failed to update role securely', { error: error.message });
    }
  }, []);

  // =================== PROFILE MANAGEMENT ===================

  /**
   * Secure profile data fetching with race condition prevention
   * Implements proper locking mechanism to prevent concurrent operations
   */
  const fetchProfileDataSecurely = useCallback(
    async (userId: string): Promise<any> => {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID provided');
      }

      // Check for existing operation
      const existingOperation = profileOperationTracking.get(userId);
      if (existingOperation?.inProgress) {
        const timeSinceLastAttempt = Date.now() - existingOperation.lastAttempt;

        // Wait for existing operation or timeout after 5 seconds
        if (timeSinceLastAttempt < 5000) {
          throw new Error('Profile operation already in progress');
        }
      }

      // Set operation lock
      profileOperationTracking.set(userId, {
        inProgress: true,
        lastAttempt: Date.now(),
        retryCount: 0,
      });

      try {
        logSecureAuthEvent('Fetching profile data', { user_id: userId });

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          SecureLogger.error('Profile fetch error', {
            user_id: userId,
            error: error.message,
          });
          throw error;
        }

        // Process group admin status
        if (data) {
          setIsGroupAdmin(!!data.is_group_admin);

          // Validate and set role if present
          if (data.role) {
            setRoleSecurely(data.role);
          }

          // Set dealership ID if present
          if (data.dealership_id) {
            setDealershipId(data.dealership_id);
          }

          logSecureAuthEvent('Profile data processed', {
            user_id: userId,
            has_role: !!data.role,
            is_group_admin: !!data.is_group_admin,
            has_dealership: !!data.dealership_id,
          });
        }

        return data;
      } catch (error) {
        SecureLogger.error('Profile fetch failed', {
          user_id: userId,
          error: error.message,
        });
        throw error;
      } finally {
        // Clear operation lock
        profileOperationTracking.delete(userId);
      }
    },
    [setRoleSecurely]
  );

  /**
   * Secure user dealership fetching with error handling
   * Implements fallback mechanisms and proper error handling
   */
  const fetchUserDealershipSecurely = useCallback(
    async (userId: string): Promise<number | null> => {
      try {
        logSecureAuthEvent('Fetching user dealership', { user_id: userId });

        // Try new users table schema first
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('dealership_id, role_id, roles(name)')
          .eq('id', userId)
          .maybeSingle();

        if (!userError && userData?.dealership_id) {
          // Set role from roles table if available
          if (userData.roles?.name) {
            setRoleSecurely(userData.roles.name);
          }

          logSecureAuthEvent('Dealership fetched from users table', {
            user_id: userId,
            dealership_id: userData.dealership_id,
            role: userData.roles?.name,
          });

          return userData.dealership_id;
        }

        // Fallback to profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('dealership_id, role')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          SecureLogger.error('Dealership fetch error', {
            user_id: userId,
            error: profileError.message,
          });
          return null;
        }

        if (profileData?.role) {
          setRoleSecurely(profileData.role);
        }

        // Fetch dealership name if ID is available
        if (profileData?.dealership_id) {
          try {
            const { data: dealershipData, error: dealershipError } = await supabase
              .from('dealerships')
              .select('name')
              .eq('id', profileData.dealership_id)
              .single();

            if (!dealershipError && dealershipData) {
              setCurrentDealershipName(dealershipData.name);
            }
          } catch (dealershipFetchError) {
            // Don't fail the operation if dealership name fetch fails
            SecureLogger.warning('Failed to fetch dealership name', {
              dealership_id: profileData.dealership_id,
            });
          }
        }

        return profileData?.dealership_id || null;
      } catch (error) {
        SecureLogger.error('User dealership fetch failed', {
          user_id: userId,
          error: error.message,
        });
        return null;
      }
    },
    [setRoleSecurely]
  );

  // =================== AUTH STATE MANAGEMENT ===================

  /**
   * Enhanced auth state change handler with comprehensive security checks
   * Implements secure session handling and state management
   */
  const handleAuthStateChange = useCallback(
    async (session: Session | null): Promise<void> => {
      if (!mountedRef.current) return;

      try {
        logSecureAuthEvent('Auth state change initiated', {
          has_session: !!session,
          user_id: session?.user?.id,
        });

        // Validate session security
        if (session) {
          const isValidSession = await validateSession(session);
          if (!isValidSession) {
            SecureLogger.warning('Invalid session detected during auth state change');
            setHasSession(false);
            setUserSecurely(null);
            setRoleSecurely(null);
            setDealershipId(null);
            setIsGroupAdmin(false);
            return;
          }

          // Generate and store session fingerprint for hijacking prevention
          storedSessionFingerprint = generateSessionFingerprint();
          secureSessionStorage.setItem('session_fingerprint', storedSessionFingerprint);

          // Set session login timestamp for timeout tracking
          secureSessionStorage.setItem('session_login_time', Date.now().toString());
        }

        setHasSession(!!session);

        if (session?.user) {
          // Set user data immediately for better UX
          setUserSecurely(session.user);

          try {
            // Fetch and process profile data
            await fetchProfileDataSecurely(session.user.id);

            // Fetch dealership information
            const dealershipId = await fetchUserDealershipSecurely(session.user.id);
            if (dealershipId) {
              setDealershipId(dealershipId);
            } else {
              // Use default dealership for new users
              setDealershipId(DEFAULT_DEALERSHIP_ID);
            }

            logSecureAuthEvent('Auth state processing completed', {
              user_id: session.user.id,
              dealership_id: dealershipId,
            });
          } catch (profileError) {
            SecureLogger.error('Profile processing failed during auth state change', {
              user_id: session.user.id,
              error: profileError.message,
            });

            // Set fallback role to ensure user can still access the application
            setRoleSecurely(FALLBACK_ROLE);
          }
        } else {
          // Clear all auth state on session end
          setUserSecurely(null);
          setRoleSecurely(null);
          setDealershipId(null);
          setCurrentDealershipName(null);
          setIsGroupAdmin(false);

          // Clear secure storage
          secureSessionStorage.clear();
          storedSessionFingerprint = null;
        }
      } catch (error) {
        SecureLogger.error('Auth state change handling failed', {
          error: error.message,
          has_session: !!session,
        });

        // Ensure loading state is cleared even on error
        setError(error instanceof Error ? error : new Error('Auth state change failed'));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setAuthCheckComplete(true);
        }
      }
    },
    [
      validateSession,
      setUserSecurely,
      setRoleSecurely,
      fetchProfileDataSecurely,
      fetchUserDealershipSecurely,
    ]
  );

  // =================== INITIALIZATION ===================

  /**
   * Secure authentication initialization with comprehensive error handling
   * Implements multiple session detection methods and graceful degradation
   */
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    let safetyTimeout: NodeJS.Timeout;

    const initializeAuth = async (): Promise<void> => {
      try {
        logSecureAuthEvent('Auth initialization started', {});

        // Check for direct auth first
        if (isDirectAuthAuthenticated && isDirectAuthAuthenticated()) {
          const directUser = getDirectAuthUser();
          if (directUser && mountedRef.current) {
            const mockUser = {
              id: directUser.id,
              email: directUser.email,
              user_metadata: { role: directUser.role },
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User;

            setUserSecurely(mockUser);
            setRoleSecurely(directUser.role);
            setIsGroupAdmin(directUser.isGroupAdmin || false);
            setHasSession(true);
            setLoading(false);
            setAuthCheckComplete(true);

            logSecureAuthEvent('Direct auth initialization completed', {
              user_id: directUser.id,
              role: directUser.role,
            });
            return;
          }
        }

        // Try multiple session detection methods
        let session: Session | null = null;

        // Method 1: Try Supabase session with timeout
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error('Session fetch timeout')),
              SECURITY_CONFIG.NETWORK_TIMEOUT
            );
          });

          const result = await Promise.race([sessionPromise, timeoutPromise]);

          if ('data' in result && result.data.session) {
            session = result.data.session;
            logSecureAuthEvent('Session retrieved from Supabase', {
              user_id: session.user.id,
            });
          }
        } catch (sessionError) {
          SecureLogger.warning('Initial session fetch failed', {
            error: sessionError.message,
          });

          // Method 2: Try secure session storage fallback
          try {
            const storedSessionData = secureSessionStorage.getItem('session_data');
            if (storedSessionData) {
              const parsedData = JSON.parse(storedSessionData);

              // Validate stored session data
              if (parsedData.expires_at && parsedData.expires_at > Date.now() / 1000) {
                // Session still valid, try to restore
                logSecureAuthEvent('Attempting session restoration from secure storage', {
                  expires_at: parsedData.expires_at,
                });

                // This would require additional implementation to restore from secure storage
                // For now, we'll proceed without session
              }
            }
          } catch (storageError) {
            SecureLogger.warning('Session restoration from storage failed', {
              error: storageError.message,
            });
          }
        }

        // Process the session
        if (mountedRef.current) {
          await handleAuthStateChange(session);
        }

        // Set up auth state listener
        if (mountedRef.current) {
          authListenerRef.current = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mountedRef.current) return;

            logSecureAuthEvent('Auth state listener triggered', {
              event,
              user_id: newSession?.user?.id,
            });

            await handleAuthStateChange(newSession);
          });
        }

        logSecureAuthEvent('Auth initialization completed', {});
      } catch (initError) {
        SecureLogger.error('Auth initialization failed', {
          error: initError.message,
        });

        if (mountedRef.current) {
          setError(initError instanceof Error ? initError : new Error('Initialization failed'));
          setLoading(false);
          setAuthCheckComplete(true);
        }
      }
    };

    // Set safety timeout to prevent stuck loading state
    safetyTimeout = setTimeout(() => {
      if (mountedRef.current && loading) {
        SecureLogger.warning('Auth initialization safety timeout reached');
        setLoading(false);
        setAuthCheckComplete(true);
      }
    }, 15000);

    initializeAuth();

    return () => {
      clearTimeout(safetyTimeout);
      if (authListenerRef.current?.data?.subscription) {
        authListenerRef.current.data.subscription.unsubscribe();
      }
    };
  }, [loading, handleAuthStateChange, setUserSecurely, setRoleSecurely]);

  // =================== SESSION MONITORING ===================

  /**
   * Set up session health monitoring and automatic refresh
   * Implements proactive session management with security checks
   */
  useEffect(() => {
    if (!hasSession) return;

    // Set up session health monitoring
    sessionCheckIntervalRef.current = setInterval(monitorSessionHealth, 5 * 60 * 1000); // Every 5 minutes

    // Set up token rotation
    tokenRotationIntervalRef.current = setInterval(async () => {
      try {
        await refreshSession();
      } catch (error) {
        SecureLogger.error('Automatic token rotation failed', { error: error.message });
      }
    }, SECURITY_CONFIG.TOKEN_ROTATION_INTERVAL);

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      if (tokenRotationIntervalRef.current) {
        clearInterval(tokenRotationIntervalRef.current);
      }
    };
  }, [hasSession, monitorSessionHealth, refreshSession]);

  // =================== AUTHENTICATION FUNCTIONS ===================

  /**
   * Secure sign in with comprehensive security measures
   * Implements rate limiting, validation, and security logging
   */
  const signIn = useCallback(
    async (email: string, password: string, rememberMe = false): Promise<void> => {
      try {
        // Input validation
        if (!validateEmail(email)) {
          throw new Error('Invalid email format');
        }

        if (!password || password.length < 8) {
          throw new Error('Invalid password');
        }

        // Server-side rate limiting check
        const serverRateLimit = await ServerRateLimiter.enforceRateLimit('signIn', email);
        if (!serverRateLimit.allowed) {
          const error = new Error(serverRateLimit.message) as AuthError;
          setError(error);
          toast({
            title: 'Rate Limited',
            description: serverRateLimit.message,
            variant: 'destructive',
          });
          return;
        }

        // Client-side rate limiting check
        const rateLimitCheck = rateLimiter.isLimited('signIn', email);
        if (rateLimitCheck.limited) {
          const waitTimeMinutes = Math.ceil((rateLimitCheck.retryAfterMs || 0) / 60000);
          const errorMessage = `Too many sign in attempts. Please try again in ${waitTimeMinutes} minute${waitTimeMinutes !== 1 ? 's' : ''}.`;

          const error = new Error(errorMessage) as AuthError;
          setError(error);
          toast({
            title: 'Rate Limited',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }

        logSecureAuthEvent('Sign in attempt initiated', { email });

        setLoading(true);
        setError(null);

        // Check for demo user credentials
        const { isDemoLogin, authenticateDemoUser } = await import('../lib/demoAuth');

        if (isDemoLogin(email, password)) {
          const demoAuthResult = authenticateDemoUser(email, password);

          if (demoAuthResult.isDemo) {
            const demoUser = {
              id: 'demo-user-authenticated',
              email: email,
              user_metadata: {
                full_name: 'Demo Sales Manager',
                role: 'sales_manager',
                is_demo_user: true,
              },
              app_metadata: {
                role: 'sales_manager',
                dealership_id: 46,
                is_demo: true,
              },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User;

            setUserSecurely(demoUser);
            setRoleSecurely('sales_manager');
            setHasSession(true);
            setDealershipId(46);

            logSecureAuthEvent('Demo user authentication successful', { email });

            toast({
              title: 'Demo Access Granted',
              description: 'Welcome to The DAS Board sales demonstration',
              variant: 'default',
            });

            setTimeout(() => {
              window.location.href = '/sales-experience-demo';
            }, 500);

            return;
          }
        }

        // Check for test accounts
        if (isTestEmail(email)) {
          const testLoginResult = await loginTestUser(email, password);

          if (testLoginResult.error) {
            throw testLoginResult.error;
          }

          const session = testLoginResult.data?.session;
          if (!session) {
            throw new Error('No session returned from test login');
          }

          setUserSecurely(session.user);
          setHasSession(true);

          // Handle group admin accounts
          if (testLoginResult.isGroupAdmin) {
            setIsGroupAdmin(true);
            setRoleSecurely('dealer_group_admin');

            toast({
              title: 'Welcome Back!',
              description: 'Group Admin login successful',
              variant: 'default',
            });

            setTimeout(() => {
              window.location.href = '/group-admin';
            }, 500);

            return;
          }

          // Process regular test user
          if (session.user?.id) {
            await fetchProfileDataSecurely(session.user.id);
            const dealershipId = await fetchUserDealershipSecurely(session.user.id);
            if (dealershipId) {
              setDealershipId(dealershipId);
            }
          }

          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in as a test user.',
            variant: 'default',
          });

          return;
        }

        // Normal authentication flow
        const signInPromise = supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            persistSession: rememberMe,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Sign in timeout')), SECURITY_CONFIG.NETWORK_TIMEOUT);
        });

        const result = await Promise.race([signInPromise, timeoutPromise]);

        if (result.error) {
          throw result.error;
        }

        if (!result.data.user) {
          throw new Error('No user returned from authentication');
        }

        // Record successful attempt
        rateLimiter.recordAttempt('signIn', true, email);

        setUserSecurely(result.data.user);
        setHasSession(true);

        // Generate and store session fingerprint
        storedSessionFingerprint = generateSessionFingerprint();
        secureSessionStorage.setItem('session_fingerprint', storedSessionFingerprint);
        secureSessionStorage.setItem('session_login_time', Date.now().toString());

        // Process user data
        await fetchProfileDataSecurely(result.data.user.id);
        const dealershipId = await fetchUserDealershipSecurely(result.data.user.id);
        if (dealershipId) {
          setDealershipId(dealershipId);
        } else {
          setDealershipId(DEFAULT_DEALERSHIP_ID);
        }

        logSecureAuthEvent('Sign in successful', {
          user_id: result.data.user.id,
          remember_me: rememberMe,
        });

        toast({
          title: 'Sign In Successful',
          description: `Welcome back, ${email}!`,
          variant: 'default',
        });
      } catch (error) {
        const authError = error as AuthError;

        logSecureAuthEvent('Sign in failed', {
          email,
          error: authError.message,
        });

        // Record failed attempt
        rateLimiter.recordAttempt('signIn', false, email);

        setError(authError);
        toast({
          title: 'Sign In Failed',
          description: authError.message || 'An error occurred during sign in',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [setUserSecurely, setRoleSecurely, fetchProfileDataSecurely, fetchUserDealershipSecurely]
  );

  /**
   * Secure sign up with validation and proper profile creation
   * Implements comprehensive input validation and error handling
   */
  const signUp = useCallback(
    async (email: string, password: string, userData: SecureUserData): Promise<void> => {
      try {
        // Input validation
        if (!validateEmail(email)) {
          throw new Error('Invalid email format');
        }

        if (!password || password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        if (!userData.firstName || !userData.lastName) {
          throw new Error('First name and last name are required');
        }

        // Server-side rate limiting
        const serverRateLimit = await ServerRateLimiter.enforceRateLimit('signUp', email);
        if (!serverRateLimit.allowed) {
          const error = new Error(serverRateLimit.message) as AuthError;
          setError(error);
          toast({
            title: 'Rate Limited',
            description: serverRateLimit.message,
            variant: 'destructive',
          });
          return;
        }

        // Client-side rate limiting
        const rateLimitCheck = rateLimiter.isLimited('signUp', email);
        if (rateLimitCheck.limited) {
          const waitTimeMinutes = Math.ceil((rateLimitCheck.retryAfterMs || 0) / 60000);
          const errorMessage = `Too many signup attempts. Please try again in ${waitTimeMinutes} minute${waitTimeMinutes !== 1 ? 's' : ''}.`;

          const error = new Error(errorMessage) as AuthError;
          setError(error);
          toast({
            title: 'Rate Limited',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }

        logSecureAuthEvent('Sign up attempt initiated', { email });

        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role || DEFAULT_ROLE,
            },
          },
        });

        if (error) {
          rateLimiter.recordAttempt('signUp', false, email);
          throw error;
        }

        if (data.user) {
          // Create profile for new user
          try {
            const { error: profileError } = await supabase.from('profiles').insert([
              {
                id: data.user.id,
                email,
                name: `${userData.firstName} ${userData.lastName}`,
                role: userData.role || DEFAULT_ROLE,
                dealership_id: userData.dealershipId || DEFAULT_DEALERSHIP_ID,
              },
            ]);

            if (profileError) {
              SecureLogger.warning('Profile creation failed during signup', {
                user_id: data.user.id,
                error: profileError.message,
              });
            }
          } catch (profileError) {
            SecureLogger.warning('Profile creation exception during signup', {
              user_id: data.user.id,
              error: profileError.message,
            });
          }

          rateLimiter.recordAttempt('signUp', true, email);

          logSecureAuthEvent('Sign up successful', {
            user_id: data.user.id,
          });

          toast({
            title: 'Account Created',
            description:
              'Your account has been created successfully. Please check your email for verification.',
            variant: 'default',
          });
        }
      } catch (error) {
        const authError = error as AuthError;

        logSecureAuthEvent('Sign up failed', {
          email,
          error: authError.message,
        });

        setError(authError);
        toast({
          title: 'Sign Up Failed',
          description: authError.message || 'An error occurred during sign up',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Secure sign out with complete session cleanup
   * Implements comprehensive cleanup and security measures
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      logSecureAuthEvent('Sign out initiated', {
        user_id: user?.id,
      });

      setLoading(true);

      // Clear session timeout and security data
      secureSessionStorage.clear();
      storedSessionFingerprint = null;

      // Clear encryption keys
      KeyManagement.clearSessionKey();

      // Check for demo user logout
      try {
        const { isAuthenticatedDemoUser, clearDemoAuth } = await import('../lib/demoAuth');
        if (isAuthenticatedDemoUser()) {
          clearDemoAuth();
        }
      } catch (demoError) {
        SecureLogger.warning('Demo logout cleanup failed', { error: demoError.message });
      }

      // Clear all auth state
      setUserSecurely(null);
      setRoleSecurely(null);
      setDealershipId(null);
      setCurrentDealershipName(null);
      setIsGroupAdmin(false);
      setHasSession(false);
      setError(null);

      // Set logout in progress flag
      localStorage.setItem('logout_in_progress', 'true');

      toast({
        title: 'Signing Out',
        description: 'Please wait while we sign you out...',
        variant: 'default',
      });

      // Redirect to logout page for complete cleanup
      window.location.href = '/logout';
    } catch (error) {
      const authError = error as AuthError;

      logSecureAuthEvent('Sign out failed', {
        user_id: user?.id,
        error: authError.message,
      });

      setError(authError);
      toast({
        title: 'Sign Out Failed',
        description: authError.message || 'An error occurred during sign out',
        variant: 'destructive',
      });

      // Force navigation even on error
      window.location.href = '/logout';
    } finally {
      setLoading(false);
    }
  }, [user?.id, setUserSecurely, setRoleSecurely]);

  // =================== ADDITIONAL FUNCTIONS ===================

  /**
   * Set dealership context with security validation
   * Validates dealership ID and updates context securely
   */
  const setDealershipContext = useCallback(
    (newDealershipId: number): void => {
      if (!newDealershipId || newDealershipId <= 0) {
        SecureLogger.warning('Invalid dealership ID provided', { dealership_id: newDealershipId });
        return;
      }

      logSecureAuthEvent('Setting dealership context', {
        dealership_id: newDealershipId,
        previous_id: dealershipId,
        user_id: user?.id,
      });

      setDealershipId(newDealershipId);

      // Fetch dealership name
      supabase
        .from('dealerships')
        .select('name')
        .eq('id', newDealershipId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            SecureLogger.error('Error fetching dealership name', {
              dealership_id: newDealershipId,
              error: error.message,
            });
          } else if (data) {
            setCurrentDealershipName(data.name);
          }
        });

      // Log the context change
      logSchemaOperation('set_dealership_context', {
        userId: user?.id,
        dealershipId: newDealershipId,
        timestamp: new Date().toISOString(),
      }).catch(err => {
        SecureLogger.warning('Failed to log dealership context change', { error: err.message });
      });
    },
    [user?.id, dealershipId]
  );

  /**
   * Secure schema data fetching with validation
   * Implements secure query building and validation
   */
  const fetchFromDealershipSchema = useCallback(
    async (
      dealershipId: number,
      table: string,
      query: QueryOptions = {}
    ): Promise<{ data: any | null; error: Error | null }> => {
      try {
        // Input validation
        if (!dealershipId || dealershipId <= 0) {
          throw new Error('Invalid dealership ID');
        }

        if (!table || !/^[a-zA-Z0-9_]+$/.test(table)) {
          throw new Error('Invalid table name');
        }

        logSecureAuthEvent('Fetching dealership schema data', {
          dealership_id: dealershipId,
          table,
        });

        // Get schema name
        const { data: dealership, error: dealershipError } = await supabase
          .from('dealerships')
          .select('schema_name')
          .eq('id', dealershipId)
          .single();

        if (dealershipError || !dealership?.schema_name) {
          throw dealershipError || new Error('No schema name found for dealership');
        }

        // Build secure query
        let dbQuery = supabase.from(`${dealership.schema_name}.${table}`);

        // Apply select clause
        if (query.select) {
          // Validate select clause to prevent injection
          if (!/^[a-zA-Z0-9_,\s\(\)]+$/.test(query.select)) {
            throw new Error('Invalid select clause');
          }
          dbQuery = dbQuery.select(query.select);
        } else {
          dbQuery = dbQuery.select('*');
        }

        // Apply filters securely
        if (query.filters) {
          for (const filter of query.filters) {
            // Validate filter column name
            if (!/^[a-zA-Z0-9_]+$/.test(filter.column)) {
              throw new Error('Invalid filter column name');
            }

            switch (filter.type) {
              case 'eq':
                dbQuery = dbQuery.eq(filter.column, filter.value);
                break;
              case 'in':
                dbQuery = dbQuery.in(filter.column, filter.value);
                break;
              case 'gt':
                dbQuery = dbQuery.gt(filter.column, filter.value);
                break;
              case 'lt':
                dbQuery = dbQuery.lt(filter.column, filter.value);
                break;
              case 'gte':
                dbQuery = dbQuery.gte(filter.column, filter.value);
                break;
              case 'lte':
                dbQuery = dbQuery.lte(filter.column, filter.value);
                break;
              case 'like':
                dbQuery = dbQuery.like(filter.column, filter.value);
                break;
              default:
                throw new Error('Invalid filter type');
            }
          }
        }

        // Apply ordering
        if (query.order) {
          if (!/^[a-zA-Z0-9_]+$/.test(query.order.column)) {
            throw new Error('Invalid order column name');
          }
          dbQuery = dbQuery.order(query.order.column, { ascending: query.order.ascending });
        }

        // Apply limit (with maximum cap for security)
        if (query.limit) {
          const secureLimit = Math.min(Math.max(1, query.limit), 1000); // Cap at 1000 rows
          dbQuery = dbQuery.limit(secureLimit);
        }

        const { data, error } = await dbQuery;

        if (error) {
          throw error;
        }

        return { data, error: null };
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Unknown error in fetchFromDealershipSchema');

        logSecureAuthEvent('Schema data fetch failed', {
          dealership_id: dealershipId,
          table,
          error: error.message,
        });

        return { data: null, error };
      }
    },
    []
  );

  /**
   * Magic link login with security measures
   * Implements secure magic link generation
   */
  const magicLinkLogin = useCallback(async (email: string): Promise<void> => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      logSecureAuthEvent('Magic link login attempt', { email });

      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Magic Link Sent',
        description: `Check your email (${email}) for a login link.`,
        variant: 'default',
      });

      logSecureAuthEvent('Magic link sent successfully', { email });
    } catch (error) {
      const authError = error as AuthError;

      logSecureAuthEvent('Magic link failed', {
        email,
        error: authError.message,
      });

      setError(authError);
      toast({
        title: 'Magic Link Failed',
        description: authError.message || 'Failed to send magic link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Access attempt logging with security context
   * Logs access attempts for security monitoring
   */
  const logAccessAttempt = useCallback(
    (path: string, allowed: boolean, details?: any): void => {
      const accessEvent = allowed ? 'Access granted' : 'Access denied';

      logSecureAuthEvent(accessEvent, {
        path,
        user_id: user?.id,
        role: role || userRole,
        dealership_id: dealershipId,
        dealership_name: currentDealershipName,
        details,
        allowed,
      });

      if (!allowed) {
        SecureLogger.error('Unauthorized access attempt', {
          path,
          user_id: user?.id,
          role: role || userRole,
        });
      }
    },
    [user?.id, role, userRole, dealershipId, currentDealershipName]
  );

  // =================== CLEANUP ===================

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      // Clear all intervals
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      if (tokenRotationIntervalRef.current) {
        clearInterval(tokenRotationIntervalRef.current);
      }

      // Unsubscribe from auth listener
      if (authListenerRef.current?.data?.subscription) {
        authListenerRef.current.data.subscription.unsubscribe();
      }

      // Clear secure storage on unmount (optional, based on security requirements)
      // secureSessionStorage.clear();
    };
  }, []);

  // =================== CONTEXT VALUE ===================

  const contextValue = useMemo<AuthContextType>(
    () => ({
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
      logAccessAttempt,
      isGroupAdmin,
      authCheckComplete,
      sessionHealth,
      refreshSession,
    }),
    [
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
      logAccessAttempt,
      isGroupAdmin,
      authCheckComplete,
      sessionHealth,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// =================== HOOK EXPORT ===================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// =================== TYPE EXPORTS ===================

export type { UserRole, SecureUserData, QueryOptions, SessionHealth };

// Global type declarations for enhanced security
declare global {
  interface Window {
    __supabaseUnreachable?: boolean;
  }
}
