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
  const [showPassword, setShowPassword] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Add login debug mode flag
  const DEBUG_LOGIN = true;

  useEffect(() => {
    if (DEBUG_LOGIN) {
      console.log('[LoginForm] Component mounted/updated:', {
        hasSession,
        userEmail: user?.email,
        role,
        userRole,
        timestamp: new Date().toISOString(),
      });
    }
  }, [hasSession, user, role, userRole]);

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
    setLoading(true);
    setError('');
    setLoginAttempt(prev => prev + 1);

    try {
      // Validate input
      const validationError = validateInput();
      if (validationError) {
        setError(validationError);
        return;
      }

      if (DEBUG_LOGIN) {
        console.log('[LoginForm] Starting login attempt:', {
          email,
          attempt: loginAttempt + 1,
          timestamp: new Date().toISOString(),
        });
      }

      // Use Supabase auth directly for better error handling
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        console.error('[LoginForm] Authentication error:', authError);

        // Handle specific error types
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before logging in.');
        } else if (authError.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          setError(`Login failed: ${authError.message}`);
        }
        return;
      }

      if (!data.user) {
        setError('Login failed: No user data received');
        return;
      }

      console.log('[LoginForm] Login successful:', {
        userId: data.user.id,
        email: data.user.email,
        timestamp: new Date().toISOString(),
      });

      // Fetch user profile to get actual role from database
      console.log('[LoginForm] Fetching user profile to determine role-based redirect');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_group_admin')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('[LoginForm] Error fetching user profile:', profileError);
        // Fall back to basic dashboard if we can't get the role
        navigate('/dashboard', { replace: true });
        return;
      }

      const userRole = profileData?.role;
      const isGroupAdmin = profileData?.is_group_admin;

      console.log('[LoginForm] User role from database:', { userRole, isGroupAdmin, email });

      // Set coordination flag for ProtectedRoute
      localStorage.setItem('recent_supabase_login', 'true');
      console.log('[LoginForm] Set recent_supabase_login flag for ProtectedRoute coordination');
      localStorage.setItem('last_login_email', email); // Track email for bypass

      // Determine redirect path based on user role/email
      let redirectPath = '/dashboard';

      // Special case for testfinance@example.com - redirect to single finance dashboard
      if (email.toLowerCase() === 'testfinance@example.com') {
        redirectPath = '/dashboard/single-finance';
        console.log(
          '[LoginForm] Test finance user detected, redirecting to single finance dashboard'
        );
      }
      // Check for admin roles - more comprehensive admin detection
      else if (
        email.toLowerCase() === 'testadmin@example.com' ||
        email.toLowerCase() === 'admin@thedasboard.com' ||
        email.toLowerCase() === 'admin@example.com' ||
        email.toLowerCase().includes('admin@example.com')
      ) {
        redirectPath = '/master-admin';
        console.log('[LoginForm] Admin user detected, redirecting to master admin');
      } else if (isGroupAdminEmail(email)) {
        redirectPath = '/group-admin';
        console.log('[LoginForm] Group admin detected, redirecting to group admin');
      } else if (email.toLowerCase().includes('admin@exampletest.com')) {
        redirectPath = '/dashboard/admin';
        console.log('[LoginForm] Dealership admin detected, redirecting to dealership admin');
      } else if (email.toLowerCase().includes('finance')) {
        redirectPath = '/dashboard/finance';
      } else if (email.toLowerCase().includes('sales')) {
        redirectPath = '/dashboard/sales';
      }

      // Use navigate for consistent routing
      console.log('[LoginForm] Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('[LoginForm] Login error:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Login failed: ${errorMsg}`);
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

  // Quick test login buttons
  const testUsers = [
    { email: 'testadmin@example.com', password: 'Password123!', label: 'Test Admin' },
    { email: 'group1.admin@exampletest.com', password: 'Password123!', label: 'Group Admin' },
    { email: 'dealer1.admin@exampletest.com', password: 'Password123!', label: 'Dealer Admin' },
    { email: 'finance1@exampletest.com', password: 'Password123!', label: 'Finance Manager' },
    { email: 'sales@exampletest.com', password: 'Password123!', label: 'Sales Person' },
  ];

  const quickLogin = (testUser: { email: string; password: string }) => {
    setEmail(testUser.email);
    setPassword(testUser.password);
  };

  const createTestUser = async (email: string, password: string, role: string, name: string) => {
    try {
      console.log(`[LoginForm] Creating test user: ${email}`);

      // First try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (signUpError && !signUpError.message.includes('already registered')) {
        console.error('[LoginForm] Signup error:', signUpError);
        return { success: false, error: signUpError.message };
      }

      // If signup succeeded or user already exists, try to create/update profile
      if (signUpData.user || signUpError?.message.includes('already registered')) {
        const userId =
          signUpData.user?.id || signUpError?.message.includes('already registered')
            ? 'existing'
            : null;

        if (userId !== 'existing') {
          // Create profile for new user
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email,
            role,
            name,
            dealership_id: role.includes('group') ? null : 1,
            is_group_admin: role.includes('group') || email.includes('group'),
          });

          if (profileError) {
            console.error('[LoginForm] Profile creation error:', profileError);
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('[LoginForm] Create test user error:', error);
      return { success: false, error: (error as Error)?.message || 'Unknown error' };
    }
  };

  const setupTestUsers = async () => {
    setLoading(true);
    setError('Setting up test users...');

    const testUsersToCreate = [
      {
        email: 'testfinance@example.com',
        password: 'Password123!',
        role: 'single_finance_manager',
        name: 'Test Finance Manager',
      },
      {
        email: 'testadmin@example.com',
        password: 'Password123!',
        role: 'admin',
        name: 'Master Admin',
      },
      {
        email: 'group1.admin@exampletest.com',
        password: 'Password123!',
        role: 'admin',
        name: 'Group Admin',
      },
      {
        email: 'dealer1.admin@exampletest.com',
        password: 'Password123!',
        role: 'dealership_admin',
        name: 'Dealer Admin',
      },
      {
        email: 'sales@exampletest.com',
        password: 'Password123!',
        role: 'salesperson',
        name: 'Sales Person',
      },
    ];

    for (const user of testUsersToCreate) {
      await createTestUser(user.email, user.password, user.role, user.name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between requests
    }

    setError('Test users setup complete! Try logging in now.');
    setLoading(false);
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
        </div>

        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2">
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

        {/* Quick Login Buttons for Testing */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Test Login:</h4>
          <div className="grid grid-cols-2 gap-2">
            {testUsers.map(testUser => (
              <Button
                key={testUser.email}
                variant="outline"
                size="sm"
                onClick={() => quickLogin(testUser)}
                className="text-xs"
              >
                {testUser.label}
              </Button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={setupTestUsers}
            className="w-full mt-2"
            disabled={loading}
          >
            Setup Test Users (First Time)
          </Button>
        </div>
      </form>
    </div>
  );
}
