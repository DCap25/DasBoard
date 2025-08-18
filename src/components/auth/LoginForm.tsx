import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Mail, Eye, EyeOff, Bookmark } from 'lucide-react';
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

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  
  // Safe email handler with validation
  const handleEmailChange = (value: string) => {
    // Basic sanitization - don't over-sanitize email input while typing
    const sanitized = value.trim().toLowerCase().substring(0, SECURITY_LIMITS.MAX_EMAIL_LENGTH);
    setEmail(sanitized);
  };
  
  // Safe password handler with length limit
  const handlePasswordChange = (value: string) => {
    // Only apply length limit to passwords, no other sanitization
    const sanitized = value.substring(0, 128);
    setPassword(sanitized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[LoginForm] Submit clicked', { email: email.trim() });
    
    // Validate and sanitize email input
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 1) {
      setError('Please enter your password');
      return;
    }
    
    // Additional security check for malicious input
    const hasInvalidInput = [email, password].some(value => {
      return /<script|javascript:|data:text\/html|vbscript:|onload=|onerror=/i.test(value);
    });
    
    if (hasInvalidInput) {
      setError('Invalid characters detected. Please check your input.');
      return;
    }

    // CSRF Protection (skip in development)
    const formData = new FormData(e.target as HTMLFormElement);
    const isProduction = import.meta.env.MODE === 'production';
    if (isProduction && !CSRFProtection.validateFromRequest(formData)) {
      setError('Security validation failed. Please refresh the page and try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[LoginForm] Calling AuthContext.signIn');
      await signIn(sanitizedEmail, password, rememberMe);
      localStorage.setItem('recent_supabase_login', 'true');
      console.log('[LoginForm] AuthContext.signIn resolved');
      // Double-check session; if missing, try direct supabase sign-in fallback
      const supabase = await getSecureSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.warn(
          '[LoginForm] No session after context signIn; attempting direct supabase signIn'
        );
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });
        if (error) throw error;
        if (!data.session) throw new Error('No session returned from fallback sign-in');
      }
      console.log('[LoginForm] Login successful; hard redirecting to /dashboard');
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('[LoginForm] Login error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        const isDevelopment = import.meta.env.MODE === 'development';
        const skipEmailVerification = import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true';

        if (isDevelopment || skipEmailVerification) {
          setError('Invalid email or password. Please check your credentials and try again.');
          setShowResendVerification(false);
        } else {
          setError(
            'Invalid email or password. If you just signed up, please check your email and verify your account first.'
          );
          setShowResendVerification(true);
        }
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the verification link before signing in.');
        setShowResendVerification(true);
      } else if (error.message?.includes('Email link is invalid or has expired')) {
        setError('The verification link has expired. Please request a new one.');
        setShowResendVerification(true);
      } else if (error.message?.includes('Too many requests')) {
        setError('Too many login attempts. Please wait a few minutes and try again.');
      } else if (
        error.message?.includes('401') ||
        error.message?.toLowerCase().includes('unauthorized')
      ) {
        setError(
          'Authentication system is currently disabled. Please use the Dashboard Selector for demo access.'
        );
      } else {
        setError(
          error.message || 'Login failed. Please use the Dashboard Selector for demo access.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle magic link login
  const handleMagicLinkLogin = async () => {
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const supabase = await getSecureSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: sanitizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(`Magic link failed: ${error.message}`);
        return;
      }

      setIsMagicLinkSent(true);
      setError('');
    } catch (error) {
      console.error('[LoginForm] Magic link error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to send magic link';
      setError(`Magic link failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const supabase = await getSecureSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: sanitizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(`Failed to resend verification: ${error.message}`);
        return;
      }

      setError('');
      setShowResendVerification(false);
      alert(`Verification email sent to ${sanitizedEmail}. Please check your inbox and spam folder.`);
    } catch (error) {
      console.error('[LoginForm] Resend verification error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to resend verification';
      setError(`Failed to resend verification: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (isMagicLinkSent) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          <h3 className="font-medium">Magic link sent!</h3>
          <p className="text-sm mt-1">Check your email ({sanitizeUserInput(email, { allowHtml: false, maxLength: 100 })}) for a login link.</p>
        </div>
        <Button variant="outline" onClick={() => setIsMagicLinkSent(false)} className="w-full">
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Bookmark Reminder - mobile optimized */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">Bookmark This Page</h3>
            <p className="text-xs text-blue-700">
              For easy access, bookmark this login page or add it to your home screen. Press Ctrl+D
              (Windows) or Cmd+D (Mac) to bookmark now.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* CSRF Protection */}
        <input type="hidden" name="csrf_token" value={CSRFProtection.getToken()} />

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => handleEmailChange(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="password" className="text-sm sm:text-base font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => handlePasswordChange(e.target.value)}
              disabled={loading}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 -m-1"
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5 sm:h-4 sm:w-4" /> : <Eye className="h-5 w-5 sm:h-4 sm:w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-2 py-1">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300"
            disabled={loading}
          />
          <Label htmlFor="rememberMe" className="text-sm sm:text-base cursor-pointer">
            Remember me
          </Label>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => navigate('/auth/reset-password')}
            className="text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline p-2 -m-2 sm:p-0 sm:m-0"
            disabled={loading}
          >
            Forgot your password?
          </button>
        </div>

        {error && (
          <div className="p-3 sm:p-4 rounded bg-red-50 text-red-600 text-sm flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {showResendVerification && email && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 underline text-sm self-start"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button type="submit" disabled={loading} className="flex-1 order-1 sm:order-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={loading || !email}
            onClick={handleMagicLinkLogin}
            className="flex items-center justify-center order-2 sm:order-2 w-full sm:w-auto"
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
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-800 hover:underline p-2 -m-2 sm:p-0 sm:m-0"
              disabled={loading}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
