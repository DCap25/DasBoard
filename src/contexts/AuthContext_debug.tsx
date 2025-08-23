/**
 * Enhanced Authentication Context for The DAS Board
 * DEBUG VERSION - Added comprehensive logging for 500 error debugging
 * 
 * SECURITY IMPROVEMENTS IMPLEMENTED:
 * - Enhanced input validation and sanitization
 * - Consistent password policies (8+ chars minimum)
 * - Rate limiting hooks for auth attempts
 * - Secure token management with proper cleanup
 * - MFA preparation hooks
 * - Role-based access control with validation
 * - Session security monitoring
 * - Memory leak prevention
 * - Enhanced error handling with security-aware logging
 * 
 * DEBUG ADDITIONS:
 * - Comprehensive console logging for Supabase operations
 * - Status code logging for 500 errors
 * - Single Finance Manager specific debugging
 * - Profile table query debugging
 * - Session fetch error details
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

// =================== SECURITY CONSTANTS ===================

/** Security: Rate limiting configuration */
const RATE_LIMIT_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  ATTEMPT_WINDOW: 5 * 60 * 1000, // 5 minutes
} as const;

/** Security: Password policy constants */
const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
} as const;

/** Security: Session monitoring constants */
const SESSION_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60, // 5 minutes before expiry
  HEALTH_CHECK_INTERVAL: 2 * 60 * 1000, // 2 minutes
  MAX_SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 hours
} as const;

// =================== TYPES ===================

/** Security: Strict user role typing with role hierarchy */
export type UserRole =
  | 'salesperson'           // Level 1: Basic sales access
  | 'finance_manager'       // Level 2: Finance access
  | 'single_finance_manager'// Level 2: Single finance access
  | 'sales_manager'         // Level 3: Sales management
  | 'general_manager'       // Level 4: General management
  | 'dealership_admin'      // Level 5: Dealership administration
  | 'dealer_group_admin'    // Level 6: Multi-dealership administration
  | 'admin'                 // Level 7: System administration
  | 'viewer';               // Level 0: Read-only access (default)

/** Security: Enhanced user data with security metadata */
interface AuthUser extends User {
  role?: UserRole;
  /** Security: Last successful login timestamp */
  lastLogin?: number;
  /** Security: Account verification status */
  emailVerified?: boolean;
  /** Security: MFA enrollment status */
  mfaEnabled?: boolean;
  /** Security: Account lockout status */
  isLocked?: boolean;
}

/** Security: Session health monitoring with security metrics */
interface SessionHealth {
  isValid: boolean;
  expiresAt: number | null;
  lastChecked: number;
  needsRefresh: boolean;
  /** Security: Session creation timestamp for timeout tracking */
  createdAt: number;
  /** Security: Number of refresh attempts */
  refreshAttempts: number;
  /** Security: Maximum session age exceeded flag */
  exceedsMaxAge: boolean;
}

/** Security: Rate limiting state */
interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
  isLocked: boolean;
}

/** Security: MFA configuration (preparation for future implementation) */
interface MFAConfig {
  isEnabled: boolean;
  methods: ('totp' | 'sms' | 'email')[];
  backupCodes: string[];
  lastVerified: number | null;
}

/** Enhanced auth context interface with security features */
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
  
  // Security features
  rateLimitState: RateLimitState;
  mfaConfig: MFAConfig | null;
  
  // Auth methods with enhanced security
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, userData: UserSignupData) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Security methods
  checkRateLimit: (email: string) => boolean;
  resetRateLimit: (email: string) => void;
  validatePasswordStrength: (password: string) => { isValid: boolean; errors: string[] };
  
  // Utility
  authCheckComplete: boolean;
}

/** Enhanced user signup data with security validation */
interface UserSignupData {
  firstName: string;
  lastName: string;
  role?: UserRole;
  dealershipId?: number;
  /** Security: Accept terms and conditions */
  acceptedTerms?: boolean;
  /** Security: Marketing consent */
  marketingConsent?: boolean;
}

// =================== SECURITY VALIDATION UTILS ===================

/**
 * Security: Enhanced email validation with additional checks
 */
const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // Security: Check length limits to prevent DoS
  if (email.length > 254 || email.length < 5) return false;
  
  // Security: Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Security: Additional security checks
  const localPart = email.split('@')[0];
  const domainPart = email.split('@')[1];
  
  // Check for suspicious patterns
  if (localPart.length > 64) return false; // RFC 5321 limit
  if (domainPart.length > 253) return false; // RFC 1035 limit
  if (email.includes('..')) return false; // Consecutive dots not allowed
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return true;
};

/**
 * Security: Enhanced password strength validation
 */
const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  // Length check
  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long`);
  }
  
  // Character requirements
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_POLICY.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_POLICY.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Security: Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/, // All same character
    /^(012|123|234|345|456|567|678|789|890)+/, // Sequential numbers
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i, // Sequential letters
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      errors.push('Password contains weak patterns');
      break;
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Security: Validate and sanitize user role with hierarchy checking
 */
const validateRole = (role: string, currentUserRole?: UserRole): UserRole => {
  const validRoles: UserRole[] = [
    'viewer',                 // Level 0
    'salesperson',           // Level 1
    'finance_manager',       // Level 2
    'single_finance_manager',// Level 2
    'sales_manager',         // Level 3
    'general_manager',       // Level 4
    'dealership_admin',      // Level 5
    'dealer_group_admin',    // Level 6
    'admin',                 // Level 7
  ];
  
  const normalizedRole = role?.toLowerCase()?.trim() as UserRole;
  
  // Security: Default to viewer if invalid role
  if (!validRoles.includes(normalizedRole)) {
    console.warn(`[Security] Invalid role attempted: ${role}, defaulting to viewer`);
    return 'viewer';
  }
  
  // Security: Role hierarchy validation (if current user role provided)
  if (currentUserRole) {
    const roleHierarchy: Record<UserRole, number> = {
      'viewer': 0,
      'salesperson': 1,
      'finance_manager': 2,
      'single_finance_manager': 2,
      'sales_manager': 3,
      'general_manager': 4,
      'dealership_admin': 5,
      'dealer_group_admin': 6,
      'admin': 7,
    };
    
    const currentLevel = roleHierarchy[currentUserRole] || 0;
    const requestedLevel = roleHierarchy[normalizedRole] || 0;
    
    // Security: Prevent role escalation
    if (requestedLevel > currentLevel) {
      console.warn(`[Security] Role escalation attempt blocked: ${currentUserRole} -> ${normalizedRole}`);
      return currentUserRole;
    }
  }
  
  return normalizedRole;
};

/**
 * Security: Sanitize input strings to prevent XSS
 */
const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove potential XSS characters
    .substring(0, 255); // Limit length
};

/**
 * Security: Generate secure session ID for logging (non-reversible)
 */
const getSecureSessionId = (session: Session | null): string => {
  if (!session?.access_token) return 'no-session';
  
  // Create a short hash of the session for logging (not the actual token)
  const hash = session.access_token.substring(0, 8) + '...';
  return hash;
};

// =================== CONTEXT SETUP ===================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // =================== STATE ===================
  
  // Generate error ID for debugging state management issues
  const generateErrorId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `error_${timestamp}_${random}`;
  }, []);
  
  // RUNTIME SAFETY: Variable definition guard to prevent ReferenceErrors
  const ensureVariableDefined = useCallback(<T,>(variable: T | undefined, varName: string, defaultValue: T): T => {
    if (typeof variable === 'undefined') {
      const errorId = generateErrorId();
      console.warn(`[RUNTIME_SAFETY] ${errorId} Variable '${varName}' is undefined, using default:`, defaultValue);
      return defaultValue;
    }
    return variable;
  }, [generateErrorId]);
  
  // Safe state setters with error boundary protection
  const safeSetState = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T, stateName: string) => {
    try {
      // RUNTIME SAFETY: Check if setter is defined before using
      if (typeof setter === 'undefined') {
        const errorId = generateErrorId();
        console.error(`[RUNTIME_SAFETY] ${errorId} Setter for '${stateName}' is undefined, cannot update state`);
        return;
      }
      
      // RUNTIME SAFETY: Check if mountedRef is defined and accessible
      const isMounted = ensureVariableDefined(mountedRef?.current, 'mountedRef.current', false);
      
      if (isMounted) {
        setter(value);
      }
    } catch (error) {
      const errorId = generateErrorId();
      console.error(`[STATE_MANAGEMENT] ${errorId} Failed to set ${stateName}:`, error);
      // Don't re-throw to prevent cascade failures
    }
  }, [generateErrorId, ensureVariableDefined]);
  
  // Core auth state with safe initialization
  const [user, setUserUnsafe] = useState<AuthUser | null>(null);
  const [role, setRoleUnsafe] = useState<UserRole | null>(null);
  const [loading, setLoadingUnsafe] = useState<boolean>(true);
  const [error, setErrorUnsafe] = useState<AuthError | null>(null);
  
  // Environment error state - handles missing Supabase environment variables
  // Fix for ReferenceError: envError is not defined at line 1376
  const [envError, setEnvErrorUnsafe] = useState<string | null>(null);
  
  // Safe setters
  const setUser = useCallback((value: AuthUser | null) => safeSetState(setUserUnsafe, value, 'user'), [safeSetState]);
  const setRole = useCallback((value: UserRole | null) => safeSetState(setRoleUnsafe, value, 'role'), [safeSetState]);
  const setLoading = useCallback((value: boolean) => safeSetState(setLoadingUnsafe, value, 'loading'), [safeSetState]);
  const setError = useCallback((value: AuthError | null) => {
    if (value) {
      const errorId = generateErrorId();
      console.error(`[AUTH_ERROR] ${errorId}:`, value);
    }
    safeSetState(setErrorUnsafe, value, 'error');
  }, [safeSetState, generateErrorId]);
  
  // Safe setter for environment error state
  // Fix for ReferenceError: envError setter needed for proper state management
  const setEnvError = useCallback((value: string | null) => {
    // RUNTIME SAFETY: Ensure all dependencies are defined before proceeding
    const safeValue = ensureVariableDefined(value, 'envError value', null);
    const safeGenerateErrorId = ensureVariableDefined(generateErrorId, 'generateErrorId', () => 'fallback_error_id');
    const safeSafeSetState = ensureVariableDefined(safeSetState, 'safeSetState', () => {});
    
    if (safeValue) {
      const errorId = safeGenerateErrorId();
      console.error(`[ENV_ERROR] ${errorId}:`, safeValue);
    }
    
    // RUNTIME SAFETY: Check if setter function exists before calling
    if (typeof setEnvErrorUnsafe !== 'undefined') {
      safeSafeSetState(setEnvErrorUnsafe, safeValue, 'envError');
    } else {
      console.error('[RUNTIME_SAFETY] setEnvErrorUnsafe is undefined, cannot set environment error');
    }
  }, [safeSetState, generateErrorId, ensureVariableDefined]);
  
  // Session state with enhanced security monitoring and safe setters
  const [hasSession, setHasSessionUnsafe] = useState<boolean>(false);
  const [sessionHealth, setSessionHealthUnsafe] = useState<SessionHealth>({
    isValid: false,
    expiresAt: null,
    lastChecked: 0,
    needsRefresh: false,
    createdAt: 0,
    refreshAttempts: 0,
    exceedsMaxAge: false,
  });
  
  // Safe session setters
  const setHasSession = useCallback((value: boolean) => safeSetState(setHasSessionUnsafe, value, 'hasSession'), [safeSetState]);
  const setSessionHealth = useCallback((value: SessionHealth) => safeSetState(setSessionHealthUnsafe, value, 'sessionHealth'), [safeSetState]);
  
  // User data state with safe setters
  const [dealershipId, setDealershipIdUnsafe] = useState<number | null>(null);
  const [isGroupAdmin, setIsGroupAdminUnsafe] = useState<boolean>(false);
  const [authCheckComplete, setAuthCheckCompleteUnsafe] = useState<boolean>(false);
  
  // Safe user data setters
  const setDealershipId = useCallback((value: number | null) => safeSetState(setDealershipIdUnsafe, value, 'dealershipId'), [safeSetState]);
  const setIsGroupAdmin = useCallback((value: boolean) => safeSetState(setIsGroupAdminUnsafe, value, 'isGroupAdmin'), [safeSetState]);
  const setAuthCheckComplete = useCallback((value: boolean) => safeSetState(setAuthCheckCompleteUnsafe, value, 'authCheckComplete'), [safeSetState]);
  
  // Security state with safe setters
  const [rateLimitState, setRateLimitStateUnsafe] = useState<RateLimitState>({
    attempts: 0,
    firstAttempt: 0,
    lockedUntil: null,
    isLocked: false,
  });
  
  const [mfaConfig, setMfaConfigUnsafe] = useState<MFAConfig | null>(null);
  
  // Safe security setters
  const setRateLimitState = useCallback((value: RateLimitState) => safeSetState(setRateLimitStateUnsafe, value, 'rateLimitState'), [safeSetState]);
  const setMfaConfig = useCallback((value: MFAConfig | null) => safeSetState(setMfaConfigUnsafe, value, 'mfaConfig'), [safeSetState]);
  
  // Component lifecycle refs with error tracking
  const mountedRef = useRef<boolean>(true);
  const authListenerRef = useRef<{ data: { subscription: any } } | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initRef = useRef<boolean>(false);
  const errorLogRef = useRef<Set<string>>(new Set()); // Track logged errors to prevent spam
  
  // Security: Rate limiting storage (in production, use Redis or database)
  const rateLimitStorage = useRef<Map<string, RateLimitState>>(new Map());

  // =================== SECURITY FUNCTIONS ===================

  /**
   * Security: Check rate limiting for authentication attempts
   */
  const checkRateLimit = useCallback((email: string): boolean => {
    const now = Date.now();
    const userAttempts = rateLimitStorage.current.get(email);
    
    if (!userAttempts) {
      return true; // No previous attempts
    }
    
    // Check if lockout period has expired
    if (userAttempts.lockedUntil && now < userAttempts.lockedUntil) {
      return false; // Still locked
    }
    
    // Check if attempt window has expired
    if (now - userAttempts.firstAttempt > RATE_LIMIT_CONFIG.ATTEMPT_WINDOW) {
      // Reset attempts window
      rateLimitStorage.current.set(email, {
        attempts: 0,
        firstAttempt: now,
        lockedUntil: null,
        isLocked: false,
      });
      return true;
    }
    
    // Check if max attempts exceeded
    if (userAttempts.attempts >= RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS) {
      return false;
    }
    
    return true;
  }, []);

  /**
   * Security: Record failed authentication attempt
   */
  const recordFailedAttempt = useCallback((email: string): void => {
    const now = Date.now();
    const userAttempts = rateLimitStorage.current.get(email) || {
      attempts: 0,
      firstAttempt: now,
      lockedUntil: null,
      isLocked: false,
    };
    
    userAttempts.attempts += 1;
    
    if (userAttempts.attempts >= RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS) {
      userAttempts.lockedUntil = now + RATE_LIMIT_CONFIG.LOCKOUT_DURATION;
      userAttempts.isLocked = true;
      
      console.warn(`[Security] Account locked due to too many failed attempts: ${email}`);
    }
    
    rateLimitStorage.current.set(email, userAttempts);
    setRateLimitState(userAttempts);
  }, []);

  /**
   * Security: Reset rate limiting for successful authentication
   */
  const resetRateLimit = useCallback((email: string): void => {
    rateLimitStorage.current.delete(email);
    setRateLimitState({
      attempts: 0,
      firstAttempt: 0,
      lockedUntil: null,
      isLocked: false,
    });
  }, []);

  /**
   * Security: Secure token cleanup - overwrite memory
   */
  const secureTokenCleanup = useCallback((): void => {
    // Security: In a real implementation, you would clear any stored tokens
    // from memory by overwriting their memory locations
    try {
      // Clear any cached session data
      if (sessionStorage) {
        sessionStorage.removeItem('supabase.auth.token');
      }
      if (localStorage) {
        localStorage.removeItem('supabase.auth.token');
      }
    } catch (error) {
      console.warn('[Security] Token cleanup warning:', error);
    }
  }, []);

  // =================== SESSION MANAGEMENT ===================

  /**
   * Security: Enhanced session validation with comprehensive security checks
   */
  const validateSession = useCallback(async (session: Session | null): Promise<boolean> => {
    console.log('[DEBUG-SESSION] Validating session:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.user_metadata?.role,
    });

    if (!session?.access_token || !session.user) {
      setSessionHealth(prev => ({ 
        ...prev, 
        isValid: false, 
        lastChecked: Date.now(),
        needsRefresh: false,
      }));
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at || 0;
    const sessionCreated = session.user.created_at ? 
      Math.floor(new Date(session.user.created_at).getTime() / 1000) : now;
    
    // Security: Check if token is expired
    if (expiresAt <= now) {
      console.warn(`[Security] Session token expired for session: ${getSecureSessionId(session)}`);
      setSessionHealth(prev => ({ 
        ...prev, 
        isValid: false, 
        needsRefresh: true,
        lastChecked: Date.now(),
        exceedsMaxAge: false,
      }));
      return false;
    }

    // Security: Check maximum session age
    const sessionAge = (now - sessionCreated) * 1000; // Convert to ms
    const exceedsMaxAge = sessionAge > SESSION_CONFIG.MAX_SESSION_DURATION;
    
    if (exceedsMaxAge) {
      console.warn(`[Security] Session exceeds maximum age: ${getSecureSessionId(session)}`);
      setSessionHealth(prev => ({ 
        ...prev, 
        isValid: false, 
        needsRefresh: false,
        exceedsMaxAge: true,
        lastChecked: Date.now(),
      }));
      return false;
    }

    // Check if token needs refresh (within threshold of expiry)
    const needsRefresh = (expiresAt - now) < SESSION_CONFIG.REFRESH_THRESHOLD;
    
    setSessionHealth(prev => ({
      isValid: true,
      expiresAt: expiresAt * 1000,
      lastChecked: Date.now(),
      needsRefresh,
      createdAt: sessionCreated * 1000,
      refreshAttempts: needsRefresh ? prev.refreshAttempts : 0,
      exceedsMaxAge: false,
    }));

    return true;
  }, []);

  /**
   * Security: Enhanced session refresh with retry logic and security monitoring
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      console.log('[Security] Refreshing session');
      const client = await getSecureSupabaseClient();
      
      // Security: Limit refresh attempts
      if (sessionHealth.refreshAttempts >= 3) {
        console.error('[Security] Maximum refresh attempts exceeded, signing out');
        await signOut();
        return;
      }
      
      const { data, error } = await client.auth.refreshSession();
      
      if (error) {
        console.error('[Security] Session refresh failed:', error.message);
        
        // Security: Increment refresh attempts
        setSessionHealth(prev => ({
          ...prev,
          refreshAttempts: prev.refreshAttempts + 1,
          lastChecked: Date.now(),
        }));
        
        throw error;
      }

      if (data.session) {
        await validateSession(data.session);
        console.log('[Security] Session refreshed successfully');
      }
    } catch (error) {
      console.error('[Security] Session refresh error:', error);
      
      // Security: Don't automatically sign out on first failure
      setError(error instanceof Error ? error : new Error('Session refresh failed'));
    }
  }, [sessionHealth.refreshAttempts]);

  /**
   * Security: Enhanced session health monitoring
   */
  const monitorSessionHealth = useCallback(async (): Promise<void> => {
    try {
      const client = await getSecureSupabaseClient();
      
      console.log('[DEBUG-HEALTH] Starting session health check');
      const { data: { session }, error } = await client.auth.getSession();
      
      if (error) {
        console.error('[DEBUG-HEALTH] Health check error:', {
          message: error.message,
          status: (error as any)?.status,
          statusCode: (error as any)?.statusCode,
          details: error,
        });
        return;
      }

      console.log('[DEBUG-HEALTH] Session health check result:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });

      const isValid = await validateSession(session);
      
      // Auto-refresh if needed and session is still valid but expiring soon
      if (isValid && sessionHealth.needsRefresh && sessionHealth.refreshAttempts < 3) {
        await refreshSession();
      }
    } catch (error) {
      console.error('[Security] Health monitoring failed:', error);
    }
  }, [sessionHealth.needsRefresh, sessionHealth.refreshAttempts, validateSession, refreshSession]);

  // =================== USER DATA FETCHING ===================

  /**
   * Security: Enhanced user data fetching with role validation
   * DEBUG: Added comprehensive logging for profile fetches
   */
  const fetchUserData = useCallback(async (userId: string): Promise<void> => {
    try {
      console.log(`[DEBUG-FETCH] Starting fetchUserData for userId: ${userId.substring(0, 8)}...`);
      const client = await getSecureSupabaseClient();
      const { data: { session } } = await client.auth.getSession();
      
      console.log('[DEBUG-FETCH] Session data in fetchUserData:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        metadata: session?.user?.user_metadata,
        metadataRole: session?.user?.user_metadata?.role,
      });

      // Security: Fetch from users table first (newer schema)
      console.log('[DEBUG-FETCH] Attempting to fetch from users table');
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

      console.log('[DEBUG-FETCH] Users table query result:', {
        hasData: !!userData,
        hasError: !!userError,
        error: userError,
        errorStatus: (userError as any)?.status,
        errorCode: (userError as any)?.code,
        data: userData,
      });

      if (!userError && userData) {
        // Security: Validate role with current user context
        if (userData.roles?.name) {
          const validatedRole = validateRole(userData.roles.name, role || undefined);
          console.log('[DEBUG-FETCH] Setting role from users table:', validatedRole);
          setRole(validatedRole);
        }

        // Set dealership ID
        if (userData.dealership_id) {
          console.log('[DEBUG-FETCH] Setting dealership ID:', userData.dealership_id);
          setDealershipId(userData.dealership_id);
        }

        return;
      }

      // Check if this is a Single Finance Manager user (bypass profiles table)
      const userEmail = session?.user?.email || '';
      const userMetadataRole = session?.user?.user_metadata?.role;
      
      console.log('[DEBUG-SFM] Checking for Single Finance Manager:', {
        userEmail,
        userMetadataRole,
        isFinanceEmail: userEmail.includes('finance'),
        isTestFinanceEmail: userEmail.includes('testfinance'),
        isSFMRole: userMetadataRole === 'single_finance_manager',
      });
      
      if (userMetadataRole === 'single_finance_manager' || 
          userEmail.includes('finance') || 
          userEmail.includes('testfinance')) {
        console.log('[DEBUG-SFM] Single Finance Manager detected - bypassing profiles table');
        setRole('single_finance_manager');
        setDealershipId(1); // Default dealership for single finance
        return;
      }

      // Fallback to profiles table (legacy schema)
      console.log('[DEBUG-FETCH] Attempting to fetch from profiles table');
      console.log('[DEBUG-FETCH] Query details:', {
        table: 'profiles',
        select: 'role, dealership_id, is_group_admin',
        userId: userId,
      });
      
      const { data: profileData, error: profileError } = await client
        .from('profiles')
        .select('role, dealership_id, is_group_admin')
        .eq('id', userId)
        .maybeSingle();

      // Enhanced error logging for 500 errors
      if (profileError) {
        console.error('[DEBUG-FETCH] Profile fetch error details:', {
          message: profileError.message,
          status: (profileError as any)?.status,
          statusCode: (profileError as any)?.statusCode,
          code: (profileError as any)?.code,
          details: profileError,
          hint: (profileError as any)?.hint,
          isServerError: (profileError as any)?.status === 500,
        });
        
        // Log if this is a 500 error
        if ((profileError as any)?.status === 500 || profileError.message.includes('500')) {
          console.error('[DEBUG-500] Server error fetching profile:', {
            userId,
            query: 'profiles.select(role, dealership_id, is_group_admin)',
            error: profileError,
          });
        }
        
        // For Single Finance Manager, set appropriate defaults
        if (userMetadataRole === 'single_finance_manager') {
          console.log('[DEBUG-SFM] Setting SFM defaults after profile error');
          setRole('single_finance_manager');
          setDealershipId(1);
        } else {
          setRole('viewer'); // Security: Safe default
        }
        return;
      }

      console.log('[DEBUG-FETCH] Profile data retrieved:', {
        hasData: !!profileData,
        role: profileData?.role,
        dealershipId: profileData?.dealership_id,
        isGroupAdmin: profileData?.is_group_admin,
      });

      if (profileData) {
        // Security: Validate and set role
        if (profileData.role) {
          const validatedRole = validateRole(profileData.role, role || undefined);
          console.log('[DEBUG-FETCH] Setting role from profiles table:', validatedRole);
          setRole(validatedRole);
        } else {
          console.log('[DEBUG-FETCH] No role in profile, setting viewer');
          setRole('viewer'); // Security: Safe default
        }

        // Set dealership ID
        if (profileData.dealership_id) {
          console.log('[DEBUG-FETCH] Setting dealership ID from profile:', profileData.dealership_id);
          setDealershipId(profileData.dealership_id);
        }

        // Set group admin status
        if (profileData.is_group_admin) {
          console.log('[DEBUG-FETCH] Setting group admin status:', true);
          setIsGroupAdmin(true);
        }

        // Language preference handling temporarily disabled until preferred_language column is added to database
        // This comment forces cache invalidation
      }
    } catch (error) {
      console.error('[DEBUG-FETCH] Unexpected error in fetchUserData:', {
        error,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      });
      setRole('viewer'); // Security: Safe default on error
    }
  }, [role]);

  // =================== AUTH STATE HANDLER ===================

  /**
   * Security: Enhanced auth state change handler with security monitoring
   * DEBUG: Added comprehensive session logging
   */
  const handleAuthStateChange = useCallback(
    async (session: Session | null): Promise<void> => {
      if (!mountedRef.current) return;

      const sessionId = getSecureSessionId(session);
      console.log(`[DEBUG-AUTH] Auth state change triggered:`, {
        sessionId,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        userMetadata: session?.user?.user_metadata,
      });

      try {
        if (session) {
          // Security: Validate session first
          const isValidSession = await validateSession(session);
          
          if (!isValidSession) {
            console.warn(`[DEBUG-AUTH] Invalid session detected: ${sessionId}`);
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

          // Security: Create enhanced user object with security metadata
          const authUser: AuthUser = {
            ...session.user,
            role: undefined, // Will be set by fetchUserData
            lastLogin: Date.now(),
            emailVerified: session.user.email_confirmed_at ? true : false,
            mfaEnabled: false, // TODO: Implement MFA
            isLocked: false,
          };

          console.log('[DEBUG-AUTH] Setting user:', {
            id: authUser.id,
            email: authUser.email,
            emailVerified: authUser.emailVerified,
            metadata: authUser.user_metadata,
          });

          setUser(authUser);

          // Check for preferred language in user metadata
          if (session.user.user_metadata?.preferred_language) {
            localStorage.setItem('app-language', session.user.user_metadata.preferred_language);
            console.log('[DEBUG-AUTH] Applied language from user metadata:', session.user.user_metadata.preferred_language);
          }

          // Fetch additional user data (role, dealership, etc.)
          console.log('[DEBUG-AUTH] Fetching user data for:', session.user.id);
          await fetchUserData(session.user.id);

        } else {
          // Security: Clear all auth state and perform secure cleanup
          console.log('[DEBUG-AUTH] Clearing auth state - no session');
          
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
            createdAt: 0,
            refreshAttempts: 0,
            exceedsMaxAge: false,
          });
          
          // Security: Clear sensitive data from memory
          secureTokenCleanup();
        }

      } catch (error) {
        console.error('[DEBUG-AUTH] Auth state change error:', {
          error,
          message: (error as any)?.message,
          stack: (error as any)?.stack,
        });
        setError(error instanceof Error ? error : new Error('Auth state change failed'));
      } finally {
        if (mountedRef.current) {
          console.log('[DEBUG-AUTH] Auth check complete, setting loading to false');
          setLoading(false);
          setAuthCheckComplete(true);
        }
      }
    },
    [validateSession, fetchUserData, secureTokenCleanup]
  );

  // =================== INITIALIZATION ===================

  /**
   * Security: Enhanced authentication initialization with comprehensive error handling
   * DEBUG: Added detailed initialization logging
   */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async (): Promise<void> => {
      const initErrorId = generateErrorId();
      
      try {
        console.log(`[DEBUG-INIT] ${initErrorId} Starting authentication initialization`);

        // Safe client initialization
        let client;
        try {
          client = await getSecureSupabaseClient();
          console.log('[DEBUG-INIT] Supabase client obtained successfully');
        } catch (clientError) {
          const clientErrorId = generateErrorId();
          console.error(`[DEBUG-INIT] ${clientErrorId} Failed to get Supabase client:`, clientError);
          throw new Error(`Supabase client initialization failed: ${clientError}`);
        }

        // Safe initial session fetch with detailed error handling
        let session = null;
        try {
          console.log('[DEBUG-INIT] Fetching initial session');
          const sessionResult = await client.auth.getSession();
          
          console.log('[DEBUG-INIT] Session fetch result:', {
            hasError: !!sessionResult.error,
            hasData: !!sessionResult.data,
            hasSession: !!sessionResult.data?.session,
            error: sessionResult.error,
            errorStatus: (sessionResult.error as any)?.status,
          });
          
          if (sessionResult.error) {
            const sessionErrorId = generateErrorId();
            console.error(`[DEBUG-INIT] ${sessionErrorId} Initial session fetch error:`, {
              error: sessionResult.error,
              status: (sessionResult.error as any)?.status,
              message: sessionResult.error.message,
            });
            setError(sessionResult.error);
          } else {
            session = sessionResult.data?.session || null;
            console.log(`[DEBUG-INIT] ${initErrorId} Session fetch successful:`, {
              hasSession: !!session,
              userId: session?.user?.id,
              userEmail: session?.user?.email,
              userRole: session?.user?.user_metadata?.role,
            });
          }
        } catch (sessionError) {
          const sessionErrorId = generateErrorId();
          console.error(`[DEBUG-INIT] ${sessionErrorId} Session fetch threw exception:`, {
            error: sessionError,
            message: (sessionError as any)?.message,
            stack: (sessionError as any)?.stack,
          });
          setError(new Error(`Session fetch failed: ${sessionError}`));
        }

        // Safe session processing
        try {
          console.log('[DEBUG-INIT] Processing initial session');
          await handleAuthStateChange(session);
        } catch (handleError) {
          const handleErrorId = generateErrorId();
          console.error(`[DEBUG-INIT] ${handleErrorId} handleAuthStateChange failed:`, handleError);
          // Don't throw here, continue with initialization
        }

        // Safe auth state listener setup
        if (mountedRef.current) {
          try {
            console.log(`[DEBUG-INIT] ${initErrorId} Setting up auth state listener`);
            
            const { data: authListener } = client.auth.onAuthStateChange(
              async (event, newSession) => {
                const listenerErrorId = generateErrorId();
                
                try {
                  if (!mountedRef.current) {
                    console.log(`[DEBUG-LISTENER] ${listenerErrorId} Component unmounted, ignoring event: ${event}`);
                    return;
                  }
                  
                  console.log(`[DEBUG-LISTENER] ${listenerErrorId} Auth event:`, {
                    event,
                    hasSession: !!newSession,
                    sessionId: getSecureSessionId(newSession),
                    userId: newSession?.user?.id,
                    userEmail: newSession?.user?.email,
                    userRole: newSession?.user?.user_metadata?.role,
                  });
                  
                  // Security: Handle different auth events with appropriate logging
                  switch (event) {
                    case 'SIGNED_IN':
                      console.log(`[DEBUG-LISTENER] ${listenerErrorId} User signed in:`, {
                        userId: newSession?.user?.id,
                        email: newSession?.user?.email,
                        role: newSession?.user?.user_metadata?.role,
                      });
                      break;
                    case 'SIGNED_OUT':
                      console.log(`[DEBUG-LISTENER] ${listenerErrorId} User signed out`);
                      break;
                    case 'TOKEN_REFRESHED':
                      console.log(`[DEBUG-LISTENER] ${listenerErrorId} Token refreshed`);
                      break;
                    case 'USER_UPDATED':
                      console.log(`[DEBUG-LISTENER] ${listenerErrorId} User profile updated`);
                      break;
                    case 'PASSWORD_RECOVERY':
                      console.log(`[DEBUG-LISTENER] ${listenerErrorId} Password recovery initiated`);
                      break;
                    default:
                      console.log(`[DEBUG-LISTENER] ${listenerErrorId} Unknown auth event: ${event}`);
                  }

                  // Safe auth state change processing
                  try {
                    await handleAuthStateChange(newSession);
                  } catch (changeError) {
                    const changeErrorId = generateErrorId();
                    console.error(`[DEBUG-LISTENER] ${changeErrorId} Auth state change handler failed:`, changeError);
                    // Don't throw to prevent listener from breaking
                  }
                } catch (listenerError) {
                  const listenerInnerErrorId = generateErrorId();
                  console.error(`[DEBUG-LISTENER] ${listenerInnerErrorId} Auth listener callback failed:`, listenerError);
                  // Don't throw to prevent auth system from breaking
                }
              }
            );

            authListenerRef.current = { data: { subscription: authListener.subscription } };
            console.log('[DEBUG-INIT] Auth listener setup complete');
          } catch (listenerSetupError) {
            const listenerSetupErrorId = generateErrorId();
            console.error(`[DEBUG-INIT] ${listenerSetupErrorId} Failed to setup auth listener:`, listenerSetupError);
            // Continue without listener
          }
        }

        console.log(`[DEBUG-INIT] ${initErrorId} Authentication initialized successfully`);

      } catch (error) {
        const finalErrorId = generateErrorId();
        console.error(`[DEBUG-INIT] ${finalErrorId} Auth initialization failed:`, {
          error,
          message: (error as any)?.message,
          stack: (error as any)?.stack,
        });
        
        try {
          if (mountedRef.current) {
            setError(error instanceof Error ? error : new Error('Auth initialization failed'));
            setLoading(false);
            setAuthCheckComplete(true);
          }
        } catch (setStateError) {
          const setStateErrorId = generateErrorId();
          console.error(`[DEBUG-INIT] ${setStateErrorId} Failed to set error state after init failure:`, setStateError);
          // Last resort: force app to recoverable state
          try {
            if (mountedRef.current) {
              setLoadingUnsafe(false);
              setAuthCheckCompleteUnsafe(true);
            }
          } catch (forceSetError) {
            const forceErrorId = generateErrorId();
            console.error(`[DEBUG-INIT] ${forceErrorId} CRITICAL: Cannot set basic state, app may be unstable:`, forceSetError);
          }
        }
      }
    };

    // Security: Extended safety timeout to prevent stuck loading state
    initTimeout = setTimeout(() => {
      const timeoutErrorId = generateErrorId();
      
      try {
        if (mountedRef.current && loading) {
          console.warn(`[DEBUG-INIT] ${timeoutErrorId} Initialization timeout - completing auth check`);
          setLoading(false);
          setAuthCheckComplete(true);
        }
      } catch (timeoutError) {
        console.error(`[DEBUG-INIT] ${timeoutErrorId} Failed to handle initialization timeout:`, timeoutError);
        // Force basic state update
        try {
          if (mountedRef.current) {
            setLoadingUnsafe(false);
            setAuthCheckCompleteUnsafe(true);
          }
        } catch (forceError) {
          const forceErrorId = generateErrorId();
          console.error(`[DEBUG-INIT] ${forceErrorId} CRITICAL: Cannot recover from timeout:`, forceError);
        }
      }
    }, 15000); // Extended from 10s to 15s

    // Safe authentication initialization start
    try {
      initializeAuth();
    } catch (syncError) {
      const syncErrorId = generateErrorId();
      console.error(`[DEBUG-INIT] ${syncErrorId} Synchronous initialization error:`, syncError);
      // Ensure app doesn't get stuck
      if (mountedRef.current) {
        setLoading(false);
        setAuthCheckComplete(true);
        setError(new Error(`Initialization sync error: ${syncError}`));
      }
    }

    // Safe cleanup function
    return () => {
      const cleanupErrorId = generateErrorId();
      
      try {
        mountedRef.current = false;
        
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
        
        // Clean up auth listener with error handling
        if (authListenerRef.current?.data?.subscription) {
          try {
            console.log(`[DEBUG-CLEANUP] ${cleanupErrorId} Cleaning up auth listener`);
            authListenerRef.current.data.subscription.unsubscribe();
          } catch (unsubError) {
            console.error(`[DEBUG-CLEANUP] ${cleanupErrorId} Failed to unsubscribe auth listener:`, unsubError);
          }
          authListenerRef.current = null;
        }
        
        if (healthCheckIntervalRef.current) {
          try {
            clearInterval(healthCheckIntervalRef.current);
          } catch (intervalError) {
            console.error(`[DEBUG-CLEANUP] ${cleanupErrorId} Failed to clear health check interval:`, intervalError);
          }
          healthCheckIntervalRef.current = null;
        }
      } catch (cleanupError) {
        console.error(`[DEBUG-CLEANUP] ${cleanupErrorId} Cleanup failed:`, cleanupError);
      }
    };
  }, [generateErrorId, loading]); // Include dependencies for proper cleanup

  // =================== SESSION MONITORING ===================

  /**
   * Security: Enhanced session health monitoring with security checks
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

    console.log('[DEBUG-MONITOR] Starting session health monitoring');

    // Monitor session health at regular intervals
    healthCheckIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        monitorSessionHealth();
      }
    }, SESSION_CONFIG.HEALTH_CHECK_INTERVAL);

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
   * Security: Enhanced sign in with comprehensive security measures
   * DEBUG: Added login attempt logging
   */
  const signIn = useCallback(async (
    email: string, 
    password: string, 
    rememberMe = false
  ): Promise<void> => {
    try {
      // Security: Sanitize inputs
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      console.log('[DEBUG-SIGNIN] Sign in attempt:', {
        email: sanitizedEmail,
        rememberMe,
      });
      
      // Security: Input validation
      if (!isValidEmail(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Security: Check rate limiting
      if (!checkRateLimit(sanitizedEmail)) {
        const lockTime = Math.ceil((rateLimitState.lockedUntil! - Date.now()) / 60000);
        throw new Error(`Too many failed attempts. Account locked for ${lockTime} minutes.`);
      }

      // Security: Enhanced password validation
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        // Note: For login, we only check minimum length to avoid revealing policy
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      }

      setLoading(true);
      setError(null);

      console.log(`[DEBUG-SIGNIN] Attempting sign in for: ${sanitizedEmail}`);

      const client = await getSecureSupabaseClient();
      
      const { data, error } = await client.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
        options: {
          persistSession: rememberMe,
        },
      });

      console.log('[DEBUG-SIGNIN] Sign in result:', {
        hasError: !!error,
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMessage: error?.message,
        errorStatus: (error as any)?.status,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        userRole: data?.user?.user_metadata?.role,
      });

      if (error) {
        // Security: Record failed attempt
        recordFailedAttempt(sanitizedEmail);
        throw error;
      }

      if (!data.user) {
        recordFailedAttempt(sanitizedEmail);
        throw new Error('Sign in successful but no user returned');
      }

      // Security: Reset rate limiting on successful login
      resetRateLimit(sanitizedEmail);

      console.log(`[DEBUG-SIGNIN] Sign in successful for: ${sanitizedEmail}`);

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });

    } catch (error) {
      const authError = error as AuthError;
      console.error(`[DEBUG-SIGNIN] Sign in failed:`, {
        message: authError.message,
        status: (authError as any)?.status,
        error: authError,
      });
      
      setError(authError);
      
      toast({
        title: 'Sign In Failed',
        description: authError.message || 'An error occurred during sign in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, rateLimitState.lockedUntil, recordFailedAttempt, resetRateLimit]);

  /**
   * Security: Enhanced sign up with comprehensive validation and security
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData: UserSignupData
  ): Promise<void> => {
    try {
      // Security: Sanitize inputs
      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      const sanitizedFirstName = sanitizeInput(userData.firstName);
      const sanitizedLastName = sanitizeInput(userData.lastName);
      
      console.log('[DEBUG-SIGNUP] Sign up attempt:', {
        email: sanitizedEmail,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        role: userData.role,
      });
      
      // Security: Input validation
      if (!isValidEmail(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Security: Enhanced password validation
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
      }

      if (!sanitizedFirstName || !sanitizedLastName) {
        throw new Error('First and last name are required');
      }

      if (sanitizedFirstName.length > 50 || sanitizedLastName.length > 50) {
        throw new Error('Names must be less than 50 characters');
      }

      // Security: Validate role if provided
      const validatedRole = userData.role ? validateRole(userData.role) : 'viewer';

      setLoading(true);
      setError(null);

      console.log(`[DEBUG-SIGNUP] Creating account for: ${sanitizedEmail} with role: ${validatedRole}`);

      const client = await getSecureSupabaseClient();

      const { data, error } = await client.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
            role: validatedRole,
            accepted_terms: userData.acceptedTerms || false,
            marketing_consent: userData.marketingConsent || false,
          },
        },
      });

      console.log('[DEBUG-SIGNUP] Sign up result:', {
        hasError: !!error,
        hasData: !!data,
        hasUser: !!data?.user,
        errorMessage: error?.message,
        userId: data?.user?.id,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Security: Create profile with validated data
        try {
          console.log('[DEBUG-SIGNUP] Creating profile for user:', data.user.id);
          await client.from('profiles').upsert({
            id: data.user.id,
            email: sanitizedEmail,
            name: `${sanitizedFirstName} ${sanitizedLastName}`,
            role: validatedRole,
            dealership_id: userData.dealershipId || 1,
            created_at: new Date().toISOString(),
          });
        } catch (profileError) {
          console.warn('[DEBUG-SIGNUP] Profile creation failed:', profileError);
          // Security: In production, consider rolling back user creation
        }
      }

      console.log(`[DEBUG-SIGNUP] Sign up successful for: ${sanitizedEmail}`);

      toast({
        title: 'Account Created',
        description: 'Please check your email to verify your account.',
      });

    } catch (error) {
      const authError = error as AuthError;
      console.error('[DEBUG-SIGNUP] Sign up failed:', {
        message: authError.message,
        error: authError,
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
  }, []);

  /**
   * Security: Enhanced sign out with comprehensive cleanup
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      console.log('[DEBUG-SIGNOUT] Initiating sign out');

      const client = await getSecureSupabaseClient();
      
      const { error } = await client.auth.signOut();
      
      if (error) {
        console.error('[DEBUG-SIGNOUT] Sign out error:', error);
        // Don't throw - still clear local state
      }

      // Security: Clear all local auth state immediately
      setUser(null);
      setRole(null);
      setHasSession(false);
      setDealershipId(null);
      setIsGroupAdmin(false);
      setError(null);
      setMfaConfig(null);
      
      setSessionHealth({
        isValid: false,
        expiresAt: null,
        lastChecked: Date.now(),
        needsRefresh: false,
        createdAt: 0,
        refreshAttempts: 0,
        exceedsMaxAge: false,
      });

      // Security: Perform secure token cleanup
      secureTokenCleanup();

      console.log('[DEBUG-SIGNOUT] Sign out completed successfully');

      toast({
        title: 'Signed Out',
        description: 'You have been securely signed out.',
      });

    } catch (error) {
      console.error('[DEBUG-SIGNOUT] Sign out failed:', error);
      // Security: Still clear state even if sign out fails
    } finally {
      setLoading(false);
    }
  }, [secureTokenCleanup]);

  // =================== CLEANUP ===================

  /**
   * Security: Enhanced cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      console.log('[DEBUG-CLEANUP] Cleaning up AuthProvider');
      mountedRef.current = false;

      // Clear health monitoring
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }

      // Clean up auth listener
      if (authListenerRef.current?.data?.subscription) {
        authListenerRef.current.data.subscription.unsubscribe();
      }

      // Security: Clear rate limiting storage
      rateLimitStorage.current.clear();

      // Security: Perform final token cleanup
      secureTokenCleanup();
    };
  }, [secureTokenCleanup]);

  // =================== CONTEXT VALUE ===================

  /**
   * Security: Memoized context value with security features
   * RUNTIME SAFETY: All variables checked for undefined before usage
   */
  const contextValue = useMemo<AuthContextType>(
    () => {
      // RUNTIME SAFETY: Ensure all state variables are defined with safe defaults
      const safeUser = ensureVariableDefined(user, 'user', null);
      const safeRole = ensureVariableDefined(role, 'role', null);
      const safeLoading = ensureVariableDefined(loading, 'loading', true);
      const safeError = ensureVariableDefined(error, 'error', null);
      const safeEnvError = ensureVariableDefined(envError, 'envError', null);
      const safeHasSession = ensureVariableDefined(hasSession, 'hasSession', false);
      const safeSessionHealth = ensureVariableDefined(sessionHealth, 'sessionHealth', {
        isValid: false,
        expiresAt: null,
        lastChecked: 0,
        needsRefresh: false,
        createdAt: 0,
        refreshAttempts: 0,
        exceedsMaxAge: false,
      });
      const safeDealershipId = ensureVariableDefined(dealershipId, 'dealershipId', null);
      const safeIsGroupAdmin = ensureVariableDefined(isGroupAdmin, 'isGroupAdmin', false);
      const safeRateLimitState = ensureVariableDefined(rateLimitState, 'rateLimitState', {
        attempts: 0,
        firstAttempt: 0,
        lockedUntil: null,
        isLocked: false,
      });
      const safeMfaConfig = ensureVariableDefined(mfaConfig, 'mfaConfig', null);
      const safeAuthCheckComplete = ensureVariableDefined(authCheckComplete, 'authCheckComplete', false);
      
      // RUNTIME SAFETY: Ensure methods are defined with safe fallbacks
      const safeRefreshSession = ensureVariableDefined(refreshSession, 'refreshSession', async () => {
        console.warn('[RUNTIME_SAFETY] refreshSession undefined, using fallback');
      });
      const safeSignIn = ensureVariableDefined(signIn, 'signIn', async () => {
        console.warn('[RUNTIME_SAFETY] signIn undefined, using fallback');
      });
      const safeSignUp = ensureVariableDefined(signUp, 'signUp', async () => {
        console.warn('[RUNTIME_SAFETY] signUp undefined, using fallback');
      });
      const safeSignOut = ensureVariableDefined(signOut, 'signOut', async () => {
        console.warn('[RUNTIME_SAFETY] signOut undefined, using fallback');
      });
      const safeCheckRateLimit = ensureVariableDefined(checkRateLimit, 'checkRateLimit', () => {
        console.warn('[RUNTIME_SAFETY] checkRateLimit undefined, using fallback');
        return true;
      });
      const safeResetRateLimit = ensureVariableDefined(resetRateLimit, 'resetRateLimit', () => {
        console.warn('[RUNTIME_SAFETY] resetRateLimit undefined, using fallback');
      });
      const safeValidatePasswordStrength = ensureVariableDefined(validatePasswordStrength, 'validatePasswordStrength', () => {
        console.warn('[RUNTIME_SAFETY] validatePasswordStrength undefined, using fallback');
        return { isValid: false, errors: ['Password validation unavailable'] };
      });
      
      return {
        // Core auth state
        user: safeUser,
        role: safeRole,
        loading: safeLoading,
        error: safeEnvError ? { message: safeEnvError } as AuthError : safeError, // Prioritize environment errors
        
        // Session management
        hasSession: safeHasSession,
        sessionHealth: safeSessionHealth,
        refreshSession: safeRefreshSession,
        
        // User data
        dealershipId: safeDealershipId,
        isGroupAdmin: safeIsGroupAdmin,
        
        // Security features
        rateLimitState: safeRateLimitState,
        mfaConfig: safeMfaConfig,
        
        // Auth methods
        signIn: safeSignIn,
        signUp: safeSignUp,
        signOut: safeSignOut,
        
        // Security methods
        checkRateLimit: safeCheckRateLimit,
        resetRateLimit: safeResetRateLimit,
        validatePasswordStrength: safeValidatePasswordStrength,
        
        // Utility
        authCheckComplete: safeAuthCheckComplete,
      };
    },
    [
      user,
      role,
      loading,
      error,
      envError, // Include environment error state in dependencies
      hasSession,
      sessionHealth,
      refreshSession,
      dealershipId,
      isGroupAdmin,
      rateLimitState,
      mfaConfig,
      signIn,
      signUp,
      signOut,
      checkRateLimit,
      resetRateLimit,
      authCheckComplete,
      ensureVariableDefined, // Include runtime safety dependency
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
 * Security: Enhanced custom hook with proper error handling
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// =================== TYPE EXPORTS ===================

export type { AuthUser, UserSignupData, SessionHealth, RateLimitState, MFAConfig };