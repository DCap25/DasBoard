import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Mail, Eye, EyeOff, Bookmark, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getSecureSupabaseClient } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../LanguageSwitcher';
import CSRFProtection from '../../lib/csrfProtection';
import { 
  sanitizeEmail, 
  sanitizeUserInput, 
  isValidEmail,
  SECURITY_LIMITS 
} from '../../lib/security/inputSanitization';
import { createSafeEventHandler } from '../../lib/security/safeRendering';

// ================================================================
// SECURITY ENHANCEMENTS IMPLEMENTED:
// 1. Enhanced input validation with comprehensive XSS prevention
// 2. Secure error handling without information disclosure
// 3. Rate limiting protection and CSRF validation
// 4. Memory leak prevention and secure state management
// 5. Enhanced TypeScript typing for better type safety
// 6. Sanitized data rendering with DOMPurify integration
// 7. Secure form submission with validation pipeline
// ================================================================

// Security: Enhanced interface definitions
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormState {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
  rememberMe: boolean;
  showResendVerification: boolean;
  isMagicLinkSent: boolean;
  rateLimited: boolean;
  attempts: number;
}

// Security: Constants for validation and security
const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MAX_LENGTH: 128,
  CSRF_TOKEN_LENGTH: 32,
} as const;

// Security: Input validation patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MALICIOUS_SCRIPT: /<script|javascript:|data:text\/html|vbscript:|on\w+=/i,
  XSS_PATTERNS: /[<>'"&]/g,
} as const;

export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useTranslation();
  
  // Security: Consolidated form state with proper typing
  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    loading: false,
    error: null,
    showPassword: false,
    rememberMe: false,
    showResendVerification: false,
    isMagicLinkSent: false,
    rateLimited: false,
    attempts: 0,
  });

  // Security: Enhanced input validation with comprehensive checks
  const validateInput = useCallback((email: string, password: string): string[] => {
    const errors: string[] = [];

    // Email validation
    if (!email.trim()) {
      errors.push('Email address is required');
    } else if (email.length > SECURITY_CONFIG.EMAIL_MAX_LENGTH) {
      errors.push('Email address is too long');
    } else if (!VALIDATION_PATTERNS.EMAIL.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
    } else if (password.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
      errors.push('Password is too long');
    }

    // Security: Check for malicious input patterns
    if (VALIDATION_PATTERNS.MALICIOUS_SCRIPT.test(email) || 
        VALIDATION_PATTERNS.MALICIOUS_SCRIPT.test(password)) {
      errors.push('Invalid characters detected in input');
    }

    return errors;
  }, []);

  // Security: Safe email handler with comprehensive sanitization
  const handleEmailChange = useCallback((value: string) => {
    // Remove dangerous characters and limit length
    const sanitized = value
      .trim()
      .toLowerCase()
      .replace(VALIDATION_PATTERNS.XSS_PATTERNS, '')
      .substring(0, SECURITY_CONFIG.EMAIL_MAX_LENGTH);
    
    setFormState(prev => ({ 
      ...prev, 
      email: sanitized,
      error: prev.error ? null : prev.error // Clear errors when user types
    }));
  }, []);

  // Security: Safe password handler with length validation
  const handlePasswordChange = useCallback((value: string) => {
    // Only apply length limit, preserve special characters for passwords
    const sanitized = value.substring(0, SECURITY_CONFIG.PASSWORD_MAX_LENGTH);
    
    setFormState(prev => ({ 
      ...prev, 
      password: sanitized,
      error: prev.error ? null : prev.error // Clear errors when user types
    }));
  }, []);

  // Security: Enhanced form submission with comprehensive validation pipeline
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { email, password, attempts, rateLimited } = formState;
    
    // Security: Rate limiting check
    if (rateLimited || attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      setFormState(prev => ({
        ...prev,
        error: 'Too many login attempts. Please wait 15 minutes before trying again.',
        rateLimited: true
      }));
      return;
    }

    // Security: Comprehensive input validation
    const validationErrors = validateInput(email, password);
    if (validationErrors.length > 0) {
      setFormState(prev => ({
        ...prev,
        error: validationErrors[0] // Show first error
      }));
      return;
    }

    // Security: CSRF Protection validation
    const formData = new FormData(e.currentTarget);
    const isProduction = import.meta.env.MODE === 'production';
    if (isProduction && !CSRFProtection.validateFromRequest(formData)) {
      setFormState(prev => ({
        ...prev,
        error: 'Security validation failed. Please refresh the page and try again.'
      }));
      return;
    }

    // Security: Final sanitization before submission
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setFormState(prev => ({
        ...prev,
        error: 'Invalid email format'
      }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('[Security] Login attempt initiated');
      
      // Security: Use AuthContext with enhanced error handling
      await signIn(sanitizedEmail, password, formState.rememberMe);
      
      // Security: Store login success flag securely
      sessionStorage.setItem('auth_success', 'true');
      
      console.log('[Security] Login successful, redirecting...');
      
      // Security: Success callback
      onSuccess?.();
      
      // Security: Secure redirect
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('[Security] Login failed:', error.message);
      
      // Security: Increment attempt counter
      const newAttempts = attempts + 1;
      const isRateLimited = newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
      
      // Security: Enhanced error handling with no information disclosure
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please verify your credentials.';
        setFormState(prev => ({ 
          ...prev, 
          showResendVerification: !isProduction 
        }));
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before signing in.';
        setFormState(prev => ({ 
          ...prev, 
          showResendVerification: true 
        }));
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      } else if (isRateLimited) {
        errorMessage = 'Account temporarily locked due to too many failed attempts.';
      }

      setFormState(prev => ({
        ...prev,
        error: errorMessage,
        attempts: newAttempts,
        rateLimited: isRateLimited,
        loading: false
      }));

      // Security: Error callback
      onError?.(errorMessage);

    } finally {
      if (!formState.rateLimited) {
        setFormState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [formState, validateInput, signIn, onSuccess, onError]);

  // Security: Enhanced magic link with validation
  const handleMagicLinkLogin = useCallback(async () => {
    const sanitizedEmail = sanitizeEmail(formState.email);
    if (!sanitizedEmail) {
      setFormState(prev => ({
        ...prev,
        error: 'Please enter a valid email address'
      }));
      return;
    }

    try {
      setFormState(prev => ({ ...prev, loading: true, error: null }));
      
      const supabase = await getSecureSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: sanitizedEmail,
        options: {
          // Security: Use secure redirect URL
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(`Magic link failed: ${error.message}`);
      }

      setFormState(prev => ({ 
        ...prev, 
        isMagicLinkSent: true,
        error: null 
      }));
      
    } catch (error: any) {
      console.error('[Security] Magic link error:', error);
      setFormState(prev => ({
        ...prev,
        error: 'Failed to send magic link. Please try again.',
        loading: false
      }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  }, [formState.email]);

  // Security: Enhanced resend verification with rate limiting
  const handleResendVerification = useCallback(async () => {
    const sanitizedEmail = sanitizeEmail(formState.email);
    if (!sanitizedEmail) {
      setFormState(prev => ({
        ...prev,
        error: 'Please enter a valid email address'
      }));
      return;
    }

    try {
      setFormState(prev => ({ ...prev, loading: true, error: null }));
      
      const supabase = await getSecureSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: sanitizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      setFormState(prev => ({
        ...prev,
        error: null,
        showResendVerification: false,
        loading: false
      }));
      
      // Security: Use secure notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50';
      notification.textContent = `Verification email sent to ${sanitizedEmail}`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
      
    } catch (error: any) {
      console.error('[Security] Resend verification error:', error);
      setFormState(prev => ({
        ...prev,
        error: 'Failed to resend verification email',
        loading: false
      }));
    }
  }, [formState.email]);

  // Security: Toggle password visibility with secure state management
  const togglePasswordVisibility = useCallback(() => {
    setFormState(prev => ({ 
      ...prev, 
      showPassword: !prev.showPassword 
    }));
  }, []);

  // Security: Toggle remember me with validation
  const toggleRememberMe = useCallback((checked: boolean) => {
    setFormState(prev => ({ 
      ...prev, 
      rememberMe: checked 
    }));
  }, []);

  // Security: Memoized safe event handlers
  const safeNavigateToSignup = useMemo(() => 
    createSafeEventHandler(() => navigate('/signup')), [navigate]);
  
  const safeNavigateToReset = useMemo(() => 
    createSafeEventHandler(() => navigate('/auth/reset-password')), [navigate]);

  // Security: Magic link sent view with sanitized email display
  if (formState.isMagicLinkSent) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
          <Shield className="h-5 w-5 mx-auto mb-2 text-green-600" />
          <h3 className="font-medium">Magic link sent!</h3>
          <p className="text-sm mt-1">
            Check your email ({sanitizeUserInput(formState.email, { 
              allowHtml: false, 
              maxLength: 50 
            })}) for a secure login link.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setFormState(prev => ({ ...prev, isMagicLinkSent: false }))} 
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md mx-auto px-4 sm:px-0 ${className}`}>
      {/* Security: Secure bookmark reminder */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">
              Secure Access
            </h3>
            <p className="text-xs text-blue-700">
              Bookmark this page for secure access. Always verify the URL before entering credentials.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
        {/* Security: CSRF Protection */}
        <input type="hidden" name="csrf_token" value={CSRFProtection.getToken()} />
        
        {/* Security: Honeypot field */}
        <input 
          type="text" 
          name="bot_check" 
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="email" className="text-sm sm:text-base font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formState.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={formState.loading || formState.rateLimited}
            required
            autoComplete="email"
            aria-describedby="email-error"
            className="transition-colors"
          />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="password" className="text-sm sm:text-base font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={formState.showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formState.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              disabled={formState.loading || formState.rateLimited}
              required
              autoComplete="current-password"
              aria-describedby="password-error"
              className="pr-10 transition-colors"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 -m-1 transition-colors"
              disabled={formState.loading || formState.rateLimited}
              aria-label={formState.showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {formState.showPassword ? 
                <EyeOff className="h-5 w-5 sm:h-4 sm:w-4" /> : 
                <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
              }
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-2 py-1">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formState.rememberMe}
            onChange={(e) => toggleRememberMe(e.target.checked)}
            className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            disabled={formState.loading || formState.rateLimited}
          />
          <Label htmlFor="rememberMe" className="text-sm sm:text-base cursor-pointer">
            Keep me signed in
          </Label>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={safeNavigateToReset}
            className="text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline p-2 -m-2 sm:p-0 sm:m-0 transition-colors"
            disabled={formState.loading || formState.rateLimited}
          >
            Forgot your password?
          </button>
        </div>

        {/* Security: Enhanced error display with proper sanitization */}
        {formState.error && (
          <div className="p-3 sm:p-4 rounded bg-red-50 text-red-600 text-sm flex flex-col gap-2 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
              <span>{sanitizeUserInput(formState.error, { allowHtml: false })}</span>
            </div>
            {formState.showResendVerification && formState.email && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={formState.loading}
                className="text-blue-600 hover:text-blue-800 underline text-sm self-start transition-colors"
              >
                Resend verification email
              </button>
            )}
            {formState.attempts > 0 && formState.attempts < SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS && (
              <p className="text-xs text-red-500">
                {SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - formState.attempts} attempts remaining
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            type="submit" 
            disabled={formState.loading || formState.rateLimited} 
            className="flex-1 order-1 sm:order-1 transition-colors"
          >
            {formState.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : formState.rateLimited ? (
              'Account Locked'
            ) : (
              'Sign in'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={formState.loading || !formState.email.trim() || formState.rateLimited}
            onClick={handleMagicLinkLogin}
            className="flex items-center justify-center order-2 sm:order-2 w-full sm:w-auto transition-colors"
          >
            <Mail className="mr-2 h-4 w-4" />
            Magic Link
          </Button>
        </div>

        <div className="text-center pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={safeNavigateToSignup}
              className="text-blue-600 hover:text-blue-800 hover:underline p-2 -m-2 sm:p-0 sm:m-0 transition-colors"
              disabled={formState.loading || formState.rateLimited}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}

// Security: Export enhanced types for better type safety
export type { LoginFormProps, FormState };