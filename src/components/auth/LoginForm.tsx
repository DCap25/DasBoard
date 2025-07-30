import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Mail, Eye, EyeOff, Bookmark } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../LanguageSwitcher';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use AuthContext signIn which includes demo user detection
      await signIn(email.trim(), password, rememberMe);

      console.log('[LoginForm] Login successful, AuthContext handling redirect');
    } catch (error: any) {
      console.error('[LoginForm] Login error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        const isDevelopment = import.meta.env.MODE === 'development';
        const skipEmailVerification = import.meta.env.VITE_SKIP_EMAIL_VERIFICATION === 'true';
        
        if (isDevelopment || skipEmailVerification) {
          setError('Invalid email or password. Please check your credentials and try again.');
          setShowResendVerification(false);
        } else {
          setError('Invalid email or password. If you just signed up, please check your email and verify your account first.');
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
      } else if (error.message?.includes('401') || error.message?.toLowerCase().includes('unauthorized')) {
        setError('Authentication system is currently disabled. Please use the Dashboard Selector for demo access.');
      } else {
        setError(error.message || 'Login failed. Please use the Dashboard Selector for demo access.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle magic link login
  const handleMagicLinkLogin = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
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
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
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
      alert(`Verification email sent to ${email}. Please check your inbox and spam folder.`);
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
          <p className="text-sm mt-1">Check your email ({email}) for a login link.</p>
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

        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm flex flex-col gap-2">
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

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
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
            className="flex items-center"
          >
            <Mail className="mr-2 h-4 w-4" />
            Magic Link
          </Button>
        </div>

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
