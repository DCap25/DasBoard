import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Loader2,
  Mail,
  Eye,
  EyeOff,
  Bookmark,
  CheckCircle,
  Clock,
  Wifi,
  Shield,
  Database,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import {
  signInWithPassword,
  signInWithMagicLink,
  signInWithOAuth,
  type AuthResult,
  type OAuthOptions,
} from '../../lib/authService';
import {
  handleSupabaseError,
  withErrorHandling,
  SupabaseErrorType,
  isCORSError,
  isAuthError,
  isNetworkError,
  isRLSError,
} from '../../lib/supabaseErrorHandler';
import { toast } from '../../lib/use-toast';

export default function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link' | 'oauth'>('password');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [errorDetails, setErrorDetails] = useState<{
    type?: SupabaseErrorType;
    suggestions?: string[];
  }>({});

  // Reset error and success states
  const resetMessages = () => {
    setError(null);
    setSuccess(null);
    setErrorDetails({});
  };

  // Handle rate limiting countdown
  const startRateLimitCountdown = (seconds: number = 60) => {
    setIsRateLimited(true);
    setRateLimitCountdown(seconds);

    const interval = setInterval(() => {
      setRateLimitCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    // Enhanced error handling with comprehensive Supabase error detection
    const { data, error } = await withErrorHandling(
      async () => {
        // Use the new auth service for improved error handling
        const result = await signInWithPassword({
          email: email.trim(),
          password,
          rememberMe,
        });

        if (!result.success) {
          throw new Error(result.error || 'Login failed. Please try again.');
        }

        return result;
      },
      'login_form',
      {
        showToast: false, // We'll handle error display manually
        logToConsole: true,
      }
    );

    if (error) {
      console.error('[LoginForm] Enhanced login error:', error);

      // Set error details for better UI feedback
      setErrorDetails({
        type: error.type,
        suggestions: error.suggestions,
      });

      // Handle specific error types
      if (error.type === SupabaseErrorType.CORS) {
        setError('Connection blocked. Please try refreshing the page or contact support.');
      } else if (error.type === SupabaseErrorType.NETWORK) {
        setError('Network connection problem. Please check your internet connection.');
      } else if (error.type === SupabaseErrorType.AUTH) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.');
          setSuccess('A confirmation email should have been sent to your email address.');
        } else {
          setError(error.message);
        }
      } else if (error.type === SupabaseErrorType.RATE_LIMIT) {
        setError('Too many login attempts. Please wait a moment and try again.');
        startRateLimitCountdown(60);
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }

      // Show toast notification for critical errors
      if (error.type === SupabaseErrorType.CORS || error.type === SupabaseErrorType.NETWORK) {
        toast({
          title: 'Connection Error',
          description: error.message,
          variant: 'destructive',
          duration: 8000,
        });
      }
    } else if (data) {
      try {
        setSuccess('Login successful! Redirecting...');
        console.log('[LoginForm] Login successful via auth service');

        // Use AuthContext signIn for demo user detection and redirect handling
        await signIn(email.trim(), password, rememberMe);
      } catch (contextError: any) {
        console.error('[LoginForm] Context sign in error:', contextError);
        setError(contextError.message || 'Login succeeded but redirect failed. Please try again.');
      }
    }

    setLoading(false);
  };

  // Handle magic link login
  const handleMagicLinkLogin = async () => {
    resetMessages();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithMagicLink({
        email: email.trim(),
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (result.success) {
        setIsMagicLinkSent(true);
        setSuccess(`Magic link sent to ${email}. Please check your email.`);
      } else {
        setError(result.error || 'Failed to send magic link');

        // Handle rate limiting
        if (result.rateLimited) {
          startRateLimitCountdown();
        }
      }
    } catch (error) {
      console.error('[LoginForm] Magic link error:', error);
      setError('An unexpected error occurred while sending the magic link.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth login
  const handleOAuthLogin = async (provider: OAuthOptions['provider']) => {
    resetMessages();
    setLoading(true);

    try {
      const result = await signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (result.success) {
        setSuccess(`Redirecting to ${provider} login...`);
        // OAuth will redirect automatically
      } else {
        setError(result.error || `Failed to authenticate with ${provider}`);
      }
    } catch (error) {
      console.error('[LoginForm] OAuth error:', error);
      setError(`An unexpected error occurred during ${provider} authentication.`);
    } finally {
      setLoading(false);
    }
  };

  if (isMagicLinkSent) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-start gap-3">
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Magic link sent!</h3>
            <p className="text-sm mt-1">Check your email ({email}) for a login link.</p>
            <p className="text-xs mt-2 text-green-600">
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsMagicLinkSent(false)} className="w-full">
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Bookmark Reminder */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Bookmark className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">Bookmark This Page</h3>
            <p className="text-xs text-blue-700">
              For easy access, bookmark this login page or add it to your home screen. Press Ctrl+D
              (Windows) or Cmd+D (Mac) to bookmark now.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Password field - only show for password method */}
        {authMethod === 'password' && (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Remember me and forgot password - only show for password method */}
        {authMethod === 'password' && (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={loading}
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember me
              </Label>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/auth/reset-password')}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm">
            <div className="flex items-start gap-2">
              {errorDetails.type === SupabaseErrorType.CORS ? (
                <Shield size={16} className="mt-0.5 flex-shrink-0" />
              ) : errorDetails.type === SupabaseErrorType.NETWORK ? (
                <Wifi size={16} className="mt-0.5 flex-shrink-0" />
              ) : errorDetails.type === SupabaseErrorType.RLS ? (
                <Database size={16} className="mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <span>{error}</span>
                {isRateLimited && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
                    <Clock size={14} />
                    <span>Try again in {rateLimitCountdown} seconds</span>
                  </div>
                )}
                {errorDetails.suggestions && errorDetails.suggestions.length > 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    <div className="font-medium">Suggestions:</div>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {errorDetails.suggestions.slice(0, 3).map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 rounded bg-green-50 text-green-600 text-sm flex items-start gap-2">
            <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Authentication Method Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              authMethod === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('magic-link')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              authMethod === 'magic-link'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('oauth')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              authMethod === 'oauth'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            OAuth
          </button>
        </div>

        {/* Password Login */}
        {authMethod === 'password' && (
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || isRateLimited} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        )}

        {/* Magic Link Login */}
        {authMethod === 'magic-link' && (
          <Button
            type="button"
            onClick={handleMagicLinkLogin}
            disabled={loading || !email || isRateLimited}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Magic Link
              </>
            )}
          </Button>
        )}

        {/* OAuth Login */}
        {authMethod === 'oauth' && (
          <div className="space-y-3">
            <Button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-800 hover:underline"
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
