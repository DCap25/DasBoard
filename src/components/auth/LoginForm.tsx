import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Key, Mail, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginForm() {
  const { signIn, magicLinkLogin, hasSession, user, role, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [isTestAdmin, setIsTestAdmin] = useState(false);
  const [isDealerGroupAdmin, setIsDealerGroupAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [testEmail, setTestEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [dealershipId, setDealershipId] = useState('');
  const [loginTimeout, setLoginTimeout] = useState<number | null>(null);

  // Add login debug mode flag
  const DEBUG_LOGIN = true;

  // Log component mount and track session state
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log('[AUTH DEBUG][LoginForm] Mounted', {
      timestamp,
      hasSession,
      from: location.state?.from?.pathname || 'direct',
      path: location.pathname,
      userEmail: user?.email,
    });

    return () => {
      console.log('[AUTH DEBUG][LoginForm] Unmounted', {
        timestamp: new Date().toISOString(),
        hasSession,
      });

      // Clear any existing timeout
      if (loginTimeout) {
        clearTimeout(loginTimeout);
      }
    };
  }, [location.state, hasSession, location.pathname, user, loginTimeout]);

  // Handle test admin login specifically
  useEffect(() => {
    if (isTestAdmin && user && hasSession) {
      console.log('[AUTH DEBUG][LoginForm] Test admin account detected and authenticated');

      // Use timeout to ensure auth context is fully updated
      const timer = setTimeout(() => {
        console.log('[AUTH DEBUG][LoginForm] Redirecting test admin to master-admin after delay');
        navigate('/master-admin');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isTestAdmin, user, hasSession, navigate]);

  // Handle dealer group admin login specifically
  useEffect(() => {
    if (isDealerGroupAdmin && user && hasSession) {
      console.log('[AUTH DEBUG][LoginForm] Dealer group admin account detected and authenticated', {
        email: user.email,
        id: user.id,
        hasSession,
        role: role || userRole,
        userData: user.user_metadata,
      });

      // Force immediate redirection for group admin
      console.log('[AUTH DEBUG][LoginForm] Forcing immediate redirection to group-admin');
      window.location.href = '/group-admin';
      return;
    }
  }, [isDealerGroupAdmin, user, hasSession, navigate, role, userRole]);

  const validateInput = () => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  // Special check for group admin emails to ensure redirection
  const isGroupAdminEmail = (emailAddress: string) => {
    return (
      emailAddress.toLowerCase().includes('group') &&
      emailAddress.toLowerCase().includes('@exampletest.com')
    );
  };

  // Special check for test emails
  const isTestEmail = (emailAddress: string) => {
    return (
      emailAddress.toLowerCase().includes('@exampletest.com') ||
      emailAddress.toLowerCase().includes('@example.com')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any existing timeout
    if (loginTimeout) {
      clearTimeout(loginTimeout);
    }

    setLoading(true);
    setError('');
    setLoginAttempt(prev => prev + 1);

    // Check if this is a test email
    const isTest = isTestEmail(email);
    // Check if this is the test admin account
    const testAdmin = email.toLowerCase() === 'testadmin@example.com';
    // Check if this is the dealer admin account
    const isDealerAdmin = email.toLowerCase() === 'dealer1.admin@exampletest.com';
    // Check if this is a dealer group admin account
    const isGroupAdmin = isGroupAdminEmail(email);

    setIsTestAdmin(testAdmin);
    setIsDealerGroupAdmin(isGroupAdmin);

    if (DEBUG_LOGIN) {
      console.log('[AUTH DEBUG][LoginForm] Login attempt details:', {
        email,
        isTestEmail: isTest,
        isTestAdmin: testAdmin,
        isDealerAdmin: isDealerAdmin,
        isGroupAdmin: isGroupAdmin,
        rememberMe,
        timestamp: new Date().toISOString(),
        attempt_number: loginAttempt + 1,
      });
    }

    // Set a safety timeout to prevent indefinite loading state - but shorter
    const timeout = window.setTimeout(() => {
      console.error('[AUTH DEBUG][LoginForm] Login timeout reached after 8 seconds');

      // EMERGENCY REDIRECT - Check if we're actually authenticated despite the timeout
      supabase.auth
        .getSession()
        .then(({ data, error }) => {
          console.log('[AUTH DEBUG][LoginForm] Emergency session check:', {
            hasSession: !!data?.session,
            hasError: !!error,
            error: error?.message,
            timestamp: new Date().toISOString(),
          });

          if (data?.session?.user) {
            console.log(
              '[AUTH DEBUG][LoginForm] Session exists despite timeout - forcing navigation',
              {
                email: data.session.user.email,
                id: data.session.user.id,
                created_at: data.session.user.created_at,
                expires_at: data.session.expires_at,
                last_sign_in_at: data.session.user.last_sign_in_at,
              }
            );

            // Check user type and redirect
            const email = data.session.user.email || '';

            if (isGroupAdminEmail(email)) {
              window.location.href = '/group-admin';
            } else if (email.toLowerCase() === 'testadmin@example.com') {
              window.location.href = '/master-admin';
            } else if (email.toLowerCase().includes('admin@exampletest.com')) {
              window.location.href = '/dashboard/admin';
            } else {
              window.location.href = '/dashboard';
            }
          } else {
            // No session, really timed out
            setLoading(false);
            setError('Login attempt timed out. Please try again.');

            // Check if there were errors from Supabase
            if (error) {
              console.error('[AUTH DEBUG][LoginForm] Supabase session check error:', {
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
              });

              // Add error hint to the UI error message
              if (error.hint) {
                setError(`Login timed out: ${error.hint}. Please try again.`);
              }
            }
          }
        })
        .catch(err => {
          console.error('[AUTH DEBUG][LoginForm] Error checking session during timeout:', {
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
          });
          setLoading(false);
          setError('Login attempt timed out. Please try again.');
        });
    }, 8000); // Reduced timeout from 15s to 8s

    setLoginTimeout(timeout);

    try {
      // Validate input
      const validationError = validateInput();
      if (validationError) {
        console.log('[AUTH DEBUG][LoginForm] Input validation failed:', validationError);
        setError(validationError);
        setLoading(false);
        clearTimeout(timeout);
        return;
      }

      console.log('[AUTH DEBUG][LoginForm] Attempting login for', email);

      // If this is a test user, modify the flow to ensure proper redirection
      if (isTest) {
        console.log('[AUTH DEBUG][LoginForm] Using enhanced test user flow');

        const signInStart = Date.now();
        const signInResult = await signIn(email, password, rememberMe);
        const signInEnd = Date.now();

        console.log('[AUTH DEBUG][LoginForm] signIn call completed', {
          durationMs: signInEnd - signInStart,
          success: !!signInResult?.user,
          error: signInResult?.error?.message,
          timestamp: new Date().toISOString(),
        });

        // Check if login succeeded
        const sessionCheckStart = Date.now();
        const { data, error: sessionError } = await supabase.auth.getSession();
        const sessionCheckEnd = Date.now();

        console.log('[AUTH DEBUG][LoginForm] Session check after login', {
          durationMs: sessionCheckEnd - sessionCheckStart,
          hasSession: !!data?.session,
          sessionError: sessionError?.message,
          timestamp: new Date().toISOString(),
        });

        if (data?.session) {
          console.log('[AUTH DEBUG][LoginForm] Test user authenticated successfully', {
            session_expires_at: data.session.expires_at,
            user_id: data.session.user.id,
            user_email: data.session.user.email,
          });

          // Redirect to our special redirect handler
          console.log('[AUTH DEBUG][LoginForm] Redirecting to test login handler');

          // Clear timeout since we're redirecting
          clearTimeout(timeout);

          // Redirect to the special redirect handler
          setTimeout(() => {
            window.location.href = '/test-login-redirect';
          }, 500);
          return;
        } else if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
      } else {
        // Regular login flow for non-test users
        const signInStart = Date.now();
        const signInResult = await signIn(email, password, rememberMe);
        const signInEnd = Date.now();

        console.log('[AUTH DEBUG][LoginForm] Regular user signIn completed', {
          durationMs: signInEnd - signInStart,
          success: !!signInResult?.user,
          error: signInResult?.error?.message,
          timestamp: new Date().toISOString(),
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error.message);
        }
      }

      // If we get here, login succeeded but redirection didn't happen automatically
      console.log('[AUTH DEBUG][LoginForm] Login successful, checking user type');

      clearTimeout(timeout);
      setLoading(false);
    } catch (err) {
      console.error('[AUTH DEBUG][LoginForm] Login failed:', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : 'No stack trace',
        timestamp: new Date().toISOString(),
      });
      // Clear the timeout since login failed
      clearTimeout(timeout);
      setLoginTimeout(null);

      const errorMsg = err instanceof Error ? err.message : 'Failed to sign in';
      setError(`Login failed: ${errorMsg}`);
      setIsTestAdmin(false); // Reset test admin flag on error
      setIsDealerGroupAdmin(false); // Reset dealer group admin flag on error
    }
  };

  // Add function for quick test login
  const handleTestLogin = async (testCredentials: { email: string; password: string }) => {
    setEmail(testCredentials.email);
    setPassword(testCredentials.password);

    // Wait for state to update
    setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        console.log(`[LoginForm] Attempting test login for ${testCredentials.email}`);

        await signIn(testCredentials.email, testCredentials.password);

        console.log('[LoginForm] Test login successful');

        const isTestAdminEmail = testCredentials.email.toLowerCase() === 'testadmin@example.com';
        const isDealerAdminEmail = testCredentials.email.toLowerCase() === 'jp@exampletest.com';
        const isGroupAdminEmail =
          testCredentials.email.toLowerCase() === 'groupadmin@exampletest.com';

        if (isTestAdminEmail) {
          setIsTestAdmin(true);
          console.log('[LoginForm] Test admin login successful, redirecting to master-admin');
          navigate('/master-admin');
        } else if (isGroupAdminEmail) {
          setIsDealerGroupAdmin(true);
          // Redirect handled by useEffect
        } else if (isDealerAdminEmail) {
          console.log('[LoginForm] Dealer admin login detected, redirecting to admin dashboard');
          navigate('/dashboard/admin');
        } else {
          console.log('[LoginForm] Normal user login, redirecting to role router');
          navigate('/dashboard/role');
        }
      } catch (error) {
        console.error('[LoginForm] Test login failed:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to sign in';
        setError(`Login failed: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  // Handle magic link login
  const handleMagicLinkLogin = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await magicLinkLogin(email);
      setIsMagicLinkSent(true);
      // The toast is shown by the magicLinkLogin function
    } catch (error) {
      console.error('[LoginForm] Magic link login failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to send magic link';
      setError(`Magic link failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value.trim())}
            placeholder="Enter your email"
            required
            disabled={loading}
            className="mt-1"
          />
        </div>

        {!isMagicLinkSent && (
          <>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-[calc(50%-6px)] text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && <div className="p-3 rounded bg-red-50 text-red-600 text-sm">{error}</div>}

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Signing in...' : 'Sign in'}
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

            <div className="text-xs text-gray-500">
              If you're using a test account and get "Email not confirmed" errors, try the Magic
              Link option above.
            </div>

            {/* Quick Login Buttons for Testing */}
            {import.meta.env.DEV && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">Test Account Quick Login:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTestLogin({
                        email: 'testadmin@example.com',
                        password: 'test123',
                      })
                    }
                  >
                    Test Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTestLogin({
                        email: 'jp@exampletest.com',
                        password: 'test123',
                      })
                    }
                  >
                    Dealer Admin
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleTestLogin({
                        email: 'groupadmin@exampletest.com',
                        password: 'test123',
                      })
                    }
                  >
                    Group Admin
                  </Button>
                  <a
                    href="/group-admin-bypass?auto=true"
                    className="flex items-center justify-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 text-sm"
                  >
                    Direct Group Admin Login
                  </a>
                </div>
                <p className="text-xs mt-2 text-gray-500">
                  Note: All test accounts use password "test123"
                </p>
                <div className="mt-3 text-center">
                  <a
                    href="/group-admin-bypass"
                    className="text-xs font-bold text-green-600 hover:text-green-800 hover:underline"
                  >
                    SPECIAL: Group Admin Direct Login
                  </a>
                </div>
              </div>
            )}
          </>
        )}

        {isMagicLinkSent && (
          <div className="p-4 rounded-md bg-blue-50 text-blue-800">
            <h3 className="font-medium mb-1">Magic Link Sent</h3>
            <p className="text-sm">
              Check your email for a login link. For test accounts, the link might appear in console
              logs.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
