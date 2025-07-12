/**
 * Centralized Authentication Service
 *
 * This service provides a unified interface for all authentication operations
 * with comprehensive error handling, user-friendly error messages, and logging.
 */

import { supabase } from './supabaseClient';
import type { User, AuthError, Session } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
  errorCode?: string;
  requiresEmailConfirmation?: boolean;
  rateLimited?: boolean;
}

export interface SignInOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

export interface SignUpOptions {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, any>;
  redirectTo?: string;
}

export interface OAuthOptions {
  provider: 'google' | 'github' | 'microsoft' | 'apple';
  redirectTo?: string;
  scopes?: string;
}

export interface MagicLinkOptions {
  email: string;
  redirectTo?: string;
  shouldCreateUser?: boolean;
}

// Error mapping for user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials':
    'Invalid email or password. Please check your credentials and try again.',
  'Email not confirmed': 'Please check your email and confirm your account before signing in.',
  'Too many requests': 'Too many login attempts. Please wait a few minutes and try again.',
  'User not found': 'No account found with this email address.',
  'Invalid email': 'Please enter a valid email address.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
  'Signup requires a valid password': 'Please enter a valid password.',
  'User already registered': 'An account with this email already exists. Please sign in instead.',
  'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another.',
  'Invalid verification code': 'The verification code is invalid or has expired.',
  'Token has expired': 'Your session has expired. Please sign in again.',
  'Invalid refresh token': 'Your session has expired. Please sign in again.',
  'Network error': 'Network connection error. Please check your internet connection and try again.',
  'Database error': 'A server error occurred. Please try again later.',
  'Authentication server error':
    'Authentication service is temporarily unavailable. Please try again later.',
};

// Rate limiting tracking
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

/**
 * Get user-friendly error message from Supabase error
 */
function getErrorMessage(error: AuthError | Error | string): string {
  if (typeof error === 'string') {
    return ERROR_MESSAGES[error] || error;
  }

  const message = error.message || 'An unexpected error occurred';
  return ERROR_MESSAGES[message] || message;
}

/**
 * Get error code from Supabase error
 */
function getErrorCode(error: AuthError | Error): string | undefined {
  if ('status' in error) {
    return error.status?.toString();
  }
  if ('code' in error) {
    return error.code as string;
  }
  return undefined;
}

/**
 * Check if error is rate limiting related
 */
function isRateLimitError(error: AuthError | Error): boolean {
  const message = error.message?.toLowerCase() || '';
  return message.includes('rate limit') || message.includes('too many');
}

/**
 * Log authentication events for debugging and security
 */
function logAuthEvent(event: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(`[AuthService] ${event}:`, {
    ...details,
    timestamp,
  });

  // Store in window for debugging if available
  if (typeof window !== 'undefined') {
    window.authEvents = window.authEvents || [];
    window.authEvents.push({
      event,
      details,
      timestamp,
    });

    // Keep only last 50 events
    if (window.authEvents.length > 50) {
      window.authEvents = window.authEvents.slice(-50);
    }
  }
}

/**
 * Track rate limiting attempts
 */
function trackRateLimit(identifier: string): boolean {
  const now = Date.now();
  const key = `auth_${identifier}`;
  const tracker = rateLimitTracker.get(key);

  if (!tracker || now > tracker.resetTime) {
    rateLimitTracker.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute
    return false;
  }

  tracker.count++;
  if (tracker.count > 5) {
    // Max 5 attempts per minute
    return true;
  }

  return false;
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(options: SignInOptions): Promise<AuthResult> {
  const { email, password, rememberMe = false, captchaToken } = options;

  logAuthEvent('Sign in attempt', { email, rememberMe });

  try {
    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS',
      };
    }

    // Check rate limiting
    if (trackRateLimit(email)) {
      return {
        success: false,
        error: 'Too many login attempts. Please wait a minute and try again.',
        errorCode: 'RATE_LIMITED',
        rateLimited: true,
      };
    }

    // Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
      options: {
        captchaToken,
        persistSession: rememberMe,
      },
    });

    if (error) {
      logAuthEvent('Sign in failed', {
        email,
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: getErrorCode(error),
        rateLimited: isRateLimitError(error),
      };
    }

    if (!data.user) {
      logAuthEvent('Sign in failed - no user returned', { email });
      return {
        success: false,
        error: 'Authentication failed. Please try again.',
        errorCode: 'NO_USER_RETURNED',
      };
    }

    // Check if email confirmation is required
    if (!data.user.email_confirmed_at && data.user.confirmation_sent_at) {
      logAuthEvent('Email confirmation required', { email });
      return {
        success: false,
        error: 'Please check your email and confirm your account before signing in.',
        errorCode: 'EMAIL_NOT_CONFIRMED',
        requiresEmailConfirmation: true,
      };
    }

    logAuthEvent('Sign in successful', {
      email,
      userId: data.user.id,
      sessionId: data.session?.access_token?.substring(0, 10) + '...',
    });

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    logAuthEvent('Sign in error', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : 'An unexpected error occurred',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithPassword(options: SignUpOptions): Promise<AuthResult> {
  const { email, password, firstName, lastName, metadata, redirectTo } = options;

  logAuthEvent('Sign up attempt', { email, firstName, lastName });

  try {
    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long',
        errorCode: 'PASSWORD_TOO_SHORT',
      };
    }

    // Check rate limiting
    if (trackRateLimit(email)) {
      return {
        success: false,
        error: 'Too many signup attempts. Please wait a minute and try again.',
        errorCode: 'RATE_LIMITED',
        rateLimited: true,
      };
    }

    // Prepare user metadata
    const userMetadata = {
      first_name: firstName,
      last_name: lastName,
      full_name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      ...metadata,
    };

    // Attempt registration
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      logAuthEvent('Sign up failed', {
        email,
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: getErrorCode(error),
        rateLimited: isRateLimitError(error),
      };
    }

    logAuthEvent('Sign up successful', {
      email,
      userId: data.user?.id,
      needsConfirmation: !data.user?.email_confirmed_at,
    });

    return {
      success: true,
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: !data.user?.email_confirmed_at,
    };
  } catch (error) {
    logAuthEvent('Sign up error', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : 'An unexpected error occurred',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(options: OAuthOptions): Promise<AuthResult> {
  const { provider, redirectTo, scopes } = options;

  logAuthEvent('OAuth sign in attempt', { provider });

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        scopes,
      },
    });

    if (error) {
      logAuthEvent('OAuth sign in failed', {
        provider,
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: getErrorCode(error),
      };
    }

    logAuthEvent('OAuth sign in initiated', { provider, redirectUrl: data.url });

    // OAuth redirects to provider, so we return success
    return {
      success: true,
    };
  } catch (error) {
    logAuthEvent('OAuth sign in error', {
      provider,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : 'OAuth authentication failed',
      errorCode: 'OAUTH_ERROR',
    };
  }
}

/**
 * Sign in with magic link
 */
export async function signInWithMagicLink(options: MagicLinkOptions): Promise<AuthResult> {
  const { email, redirectTo, shouldCreateUser = true } = options;

  logAuthEvent('Magic link sign in attempt', { email });

  try {
    // Validate email
    if (!email) {
      return {
        success: false,
        error: 'Email address is required',
        errorCode: 'MISSING_EMAIL',
      };
    }

    // Check rate limiting
    if (trackRateLimit(email)) {
      return {
        success: false,
        error: 'Too many magic link requests. Please wait a minute and try again.',
        errorCode: 'RATE_LIMITED',
        rateLimited: true,
      };
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        shouldCreateUser,
      },
    });

    if (error) {
      logAuthEvent('Magic link sign in failed', {
        email,
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: getErrorCode(error),
        rateLimited: isRateLimitError(error),
      };
    }

    logAuthEvent('Magic link sent successfully', { email });

    return {
      success: true,
    };
  } catch (error) {
    logAuthEvent('Magic link sign in error', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : 'Failed to send magic link',
      errorCode: 'MAGIC_LINK_ERROR',
    };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<AuthResult> {
  logAuthEvent('Sign out attempt', {});

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logAuthEvent('Sign out failed', {
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: getErrorCode(error),
      };
    }

    logAuthEvent('Sign out successful', {});

    return {
      success: true,
    };
  } catch (error) {
    logAuthEvent('Sign out error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : 'Failed to sign out',
      errorCode: 'SIGNOUT_ERROR',
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<{ session: Session | null; error?: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logAuthEvent('Get session failed', {
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        session: null,
        error: getErrorMessage(error),
      };
    }

    return {
      session: data.session,
    };
  } catch (error) {
    logAuthEvent('Get session error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      session: null,
      error: error instanceof Error ? getErrorMessage(error) : 'Failed to get session',
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; error?: string }> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      logAuthEvent('Get user failed', {
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        user: null,
        error: getErrorMessage(error),
      };
    }

    return {
      user: data.user,
    };
  } catch (error) {
    logAuthEvent('Get user error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      user: null,
      error: error instanceof Error ? getErrorMessage(error) : 'Failed to get user',
    };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string, redirectTo?: string): Promise<AuthResult> {
  logAuthEvent('Password reset attempt', { email });

  try {
    if (!email) {
      return {
        success: false,
        error: 'Email address is required',
        errorCode: 'MISSING_EMAIL',
      };
    }

    // Check rate limiting
    if (trackRateLimit(`reset_${email}`)) {
      return {
        success: false,
        error: 'Too many password reset requests. Please wait a minute and try again.',
        errorCode: 'RATE_LIMITED',
        rateLimited: true,
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      logAuthEvent('Password reset failed', {
        email,
        error: error.message,
        errorCode: getErrorCode(error),
      });

      return {
        success: false,
        error: getErrorMessage(error),
        errorCode: getErrorCode(error),
        rateLimited: isRateLimitError(error),
      };
    }

    logAuthEvent('Password reset email sent', { email });

    return {
      success: true,
    };
  } catch (error) {
    logAuthEvent('Password reset error', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error:
        error instanceof Error ? getErrorMessage(error) : 'Failed to send password reset email',
      errorCode: 'RESET_PASSWORD_ERROR',
    };
  }
}

/**
 * Clear rate limiting for testing
 */
export function clearRateLimiting(): void {
  rateLimitTracker.clear();
  logAuthEvent('Rate limiting cleared', {});
}

// Export types for external use
export type { AuthError, User, Session };

// Extend window interface for debugging
declare global {
  interface Window {
    authEvents?: Array<{
      event: string;
      details: any;
      timestamp: string;
    }>;
  }
}
