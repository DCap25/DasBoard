/**
 * Secure User ID Helper for The DAS Board
 * 
 * This module provides secure user identification utilities with proper
 * error handling, input validation, and minimal logging exposure.
 * 
 * Security Features:
 * - Input validation and sanitization
 * - Secure error handling without sensitive data exposure
 * - Minimal logging in production
 * - Type safety with strict TypeScript
 * - No 'any' types allowed
 */

import { User } from '@supabase/supabase-js';

// Type definitions for enhanced security
interface UserLike {
  id?: string;
  user?: {
    id?: string;
  };
  email?: string;
  sub?: string;
}

// Union type for better compatibility
type UserInputType = UserLike | User | null | undefined;

interface SupabaseSession {
  user?: {
    id?: string;
    email?: string;
  };
}

interface LocalStorageToken {
  currentSession?: SupabaseSession;
  user?: {
    id?: string;
    email?: string;
  };
}

// Security: Environment-aware logging
const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

/**
 * Secure logging function that respects environment settings
 */
function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
  // Security: Only log in development or when debug mode is explicitly enabled
  if (!isDevelopment && !isDebugMode) {
    return;
  }

  // Security: Sanitize sensitive data from logs
  const sanitizedData = data ? sanitizeLogData(data) : undefined;
  
  switch (level) {
    case 'info':
      console.log(`[SecureUserIdHelper] ${message}`, sanitizedData);
      break;
    case 'warn':
      console.warn(`[SecureUserIdHelper] ${message}`, sanitizedData);
      break;
    case 'error':
      console.error(`[SecureUserIdHelper] ${message}`, sanitizedData);
      break;
  }
}

/**
 * Security: Sanitize log data to remove sensitive information
 */
function sanitizeLogData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    // Security: Remove sensitive fields from logs
    const sensitiveFields = [
      'password', 'token', 'key', 'secret', 'auth', 'session',
      'email', 'phone', 'ssn', 'credit', 'payment'
    ];
    
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Security: Validate UUID format
 */
function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Security: Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

/**
 * Security: Sanitize string input to prevent injection
 */
function sanitizeString(input: string): string {
  return input
    .replace(/[<>"'&]/g, '') // Remove potential XSS characters
    .replace(/[^\w@.-]/g, '_') // Replace non-alphanumeric chars (except email chars)
    .substring(0, 100); // Limit length
}

/**
 * Security: Check if a value is a non-empty string
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Get a consistent user ID with enhanced security validation
 * @param user - User object from Supabase or auth context
 * @returns Validated user ID or null if invalid
 */
export function getConsistentUserId(user: UserInputType): string | null {
  secureLog('info', 'Starting secure user ID resolution', {
    hasUser: !!user,
    userType: typeof user
  });

  if (!user || typeof user !== 'object') {
    secureLog('warn', 'Invalid user object provided');
    return null;
  }

  // Security: Try direct ID field with validation
  if (isNonEmptyString(user.id)) {
    if (isValidUUID(user.id)) {
      secureLog('info', 'Found valid direct UUID');
      return user.id;
    } else {
      secureLog('warn', 'Direct ID found but not valid UUID format');
    }
  }

  // Security: Try nested user.id with validation
  const userLike = user as UserLike;
  if (userLike.user && isNonEmptyString(userLike.user.id)) {
    if (isValidUUID(userLike.user.id)) {
      secureLog('info', 'Found valid nested UUID');
      return userLike.user.id;
    } else {
      secureLog('warn', 'Nested ID found but not valid UUID format');
    }
  }

  // Security: For demo users, use email as fallback with strict validation
  if (isNonEmptyString(user.email)) {
    if (isValidEmail(user.email)) {
      const sanitizedEmail = sanitizeString(user.email);
      const demoId = `demo_${sanitizedEmail}`;
      secureLog('info', 'Using validated email for demo user');
      return demoId;
    } else {
      secureLog('warn', 'Email found but not valid format');
    }
  }

  // Security: Try sub field with validation (OAuth/JWT sub claim)
  if (isNonEmptyString(userLike.sub)) {
    if (isValidUUID(userLike.sub)) {
      secureLog('info', 'Found valid sub UUID');
      return userLike.sub;
    } else {
      secureLog('warn', 'Sub field found but not valid UUID format');
    }
  }

  secureLog('warn', 'No valid user ID found in user object');
  return null;
}

/**
 * Enhanced getUserId function with secure fallback strategies
 * @param user - User object from auth context
 * @param localUserId - Optional local fallback user ID
 * @returns Promise resolving to validated user ID or null
 */
export async function getUserIdWithFallbacks(
  user: UserInputType,
  localUserId?: string | null
): Promise<string | null> {
  secureLog('info', 'Starting enhanced user ID resolution with fallbacks');

  // Security: First try the standard secure method
  const userId = getConsistentUserId(user);
  if (userId) {
    secureLog('info', 'Standard method returned valid ID');
    return userId;
  }

  // Security: Try validated local fallback
  if (isNonEmptyString(localUserId)) {
    if (isValidUUID(localUserId) || localUserId.startsWith('demo_')) {
      secureLog('info', 'Using validated local fallback ID');
      return localUserId;
    } else {
      secureLog('warn', 'Local fallback ID invalid format');
    }
  }

  // Security: Try to get from Supabase session with secure import
  try {
    if (typeof window !== 'undefined') {
      // Security: Dynamic import to avoid SSR issues and reduce bundle size
      const { supabase } = await import('../lib/supabaseClient');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        secureLog('error', 'Error getting Supabase session');
        return null;
      }
      
      const sessionUserId = data?.session?.user?.id;
      if (isNonEmptyString(sessionUserId) && isValidUUID(sessionUserId)) {
        secureLog('info', 'Retrieved valid ID from Supabase session');
        return sessionUserId;
      }
    }
  } catch (error) {
    secureLog('error', 'Failed to get Supabase session', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }

  secureLog('warn', 'All secure methods failed to resolve user ID');
  return null;
}

/**
 * Synchronous version for cases where async is not possible
 * @param user - User object from auth context
 * @param localUserId - Optional local fallback user ID
 * @returns Validated user ID or null
 */
export function getUserIdSync(
  user: UserInputType,
  localUserId?: string | null
): string | null {
  // Security: Try the standard secure method first
  const userId = getConsistentUserId(user);
  if (userId) {
    return userId;
  }

  // Security: Try validated local fallback
  if (isNonEmptyString(localUserId)) {
    if (isValidUUID(localUserId) || localUserId.startsWith('demo_')) {
      return localUserId;
    }
  }

  return null;
}

/**
 * Secure localStorage access with error handling
 * @param key - Storage key to retrieve
 * @returns Parsed data or null if invalid
 */
function getSecureLocalStorageItem(key: string): LocalStorageToken | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    // Security: Parse with try-catch and validate structure
    const parsed = JSON.parse(raw) as unknown;
    
    // Security: Basic structure validation
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as LocalStorageToken;
    }
    
    return null;
  } catch (error) {
    secureLog('error', 'Error reading from localStorage', {
      key: key.replace(/[a-f0-9]{32,}/g, '[KEY_HASH]'), // Hide sensitive key parts
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Try to recover user ID from localStorage with enhanced security
 * @returns User ID from localStorage or null
 */
export function recoverUserIdFromStorage(): string | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    // Security: Look for Supabase auth token with pattern matching
    const storageKeys = Object.keys(window.localStorage);
    const tokenKey = storageKeys.find(key => 
      key.startsWith('sb-') && key.endsWith('-auth-token')
    );

    if (!tokenKey) {
      secureLog('info', 'No Supabase auth token found in localStorage');
      return null;
    }

    const tokenData = getSecureLocalStorageItem(tokenKey);
    if (!tokenData) {
      return null;
    }

    // Security: Try multiple paths to find user ID
    const possibleUserIds = [
      tokenData.currentSession?.user?.id,
      tokenData.user?.id
    ];

    for (const userId of possibleUserIds) {
      if (isNonEmptyString(userId) && isValidUUID(userId)) {
        secureLog('info', 'Found valid user ID from localStorage');
        return userId;
      }
    }

    secureLog('warn', 'No valid user ID found in localStorage token');
    return null;
  } catch (error) {
    secureLog('error', 'Error recovering user ID from storage', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}

/**
 * Secure debug helper for development only
 * @param context - Context string for logging
 * @param user - User object to debug
 * @param localUserId - Optional local user ID
 */
export function debugUserId(
  context: string,
  user: UserInputType,
  localUserId?: string | null
): void {
  // Security: Only debug in development mode
  if (!isDevelopment && !isDebugMode) {
    return;
  }

  const userId = getConsistentUserId(user);
  const syncUserId = getUserIdSync(user, localUserId);
  const storageUserId = recoverUserIdFromStorage();

  secureLog('info', `Debug context: ${context}`, {
    resolvedId: userId,
    syncResolvedId: syncUserId,
    storageUserId: storageUserId,
    localUserId: localUserId,
    hasUser: !!user,
    userType: typeof user
  });
}

/**
 * Validate user ID format and return boolean
 * @param userId - User ID to validate
 * @returns True if valid format
 */
export function isValidUserId(userId: unknown): userId is string {
  if (!isNonEmptyString(userId)) {
    return false;
  }

  // Security: Accept UUIDs or demo user IDs
  return isValidUUID(userId) || userId.startsWith('demo_');
}

/**
 * Security utility to check if user data is safe to process
 * @param user - User object to validate
 * @returns True if user object is safe
 */
export function isSecureUserObject(user: unknown): user is UserLike {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const userObj = user as Record<string, unknown>;
  
  // Security: Check for common injection patterns
  const dangerousPatterns = ['<script', 'javascript:', 'data:text/html', 'vbscript:'];
  
  for (const [key, value] of Object.entries(userObj)) {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (dangerousPatterns.some(pattern => lowerValue.includes(pattern))) {
        secureLog('warn', `Potentially dangerous pattern found in user.${key}`);
        return false;
      }
    }
  }

  return true;
}

// Export utility object for convenience
export const secureUserUtils = {
  isValidUUID,
  isValidEmail,
  isValidUserId,
  isSecureUserObject,
  sanitizeString,
  secureLog
};