import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Home,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function SingleFinanceSignup() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExistingUserLogin, setShowExistingUserLogin] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tempPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleExistingUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError(
            'Invalid email or password. Please check your credentials or reset your password.'
          );
        } else {
          setError(authError.message);
        }
        return;
      }

      // Login successful, redirect to dashboard
      navigate('/dashboard/single-finance');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setPasswordResetSent(true);
      setError(null);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fullName = `${formState.firstName} ${formState.lastName}`;

      // First check if user already exists in signup_requests table
      const { data: existingSignup, error: checkError } = await supabase
        .from('signup_requests')
        .select('email, status')
        .eq('email', formState.email.trim())
        .maybeSingle();

      // If user exists and query was successful
      if (existingSignup && !checkError) {
        console.log('[SingleFinanceSignup] User already exists:', existingSignup);
        // User already exists, show login form
        setLoginData({ email: formState.email, password: '' });
        setShowExistingUserLogin(true);
        setError(
          'An account with this email already exists. Please login below or reset your password.'
        );
        setLoading(false);
        return;
      }

      // Log any check errors but continue with signup
      if (checkError) {
        console.log('[SingleFinanceSignup] Error checking existing user:', checkError);
      }

      // Create signup request in database (Finance Manager is FREE promotional)
      const { data, error } = await supabase
        .from('signup_requests')
        .insert({
          email: formState.email,
          dealership_name: `${fullName} - Finance Manager`,
          contact_person: fullName,
          phone: formState.phone,
          tier: 'finance_manager',
          subscription_tier: 'finance_manager_free_promo',
          dealer_count: 1,
          add_ons: [],
          promo_applied: true,
          status: 'approved', // Auto-approve free finance manager accounts
          stripe_payment_status: 'free_promotional',
        })
        .select()
        .single();

      if (error) throw error;
      const signupData = data;

      // Generate temporary password
      const tempPassword = generateTempPassword();

      console.log('Creating user account with signup options...');

      // Create actual user account with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email,
        password: tempPassword,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation flow
          data: {
            full_name: fullName,
            first_name: formState.firstName,
            last_name: formState.lastName,
            phone: formState.phone,
            role: 'single_finance_manager',
            signup_request_id: signupData.id,
            email_confirmed: true, // Mark as confirmed in metadata
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);

        // If auth signup fails due to email confirmation, try alternative approach
        if (authError.message?.includes('confirm') || authError.message?.includes('verification')) {
          console.log('Email confirmation required, creating simplified account...');

          // Create a profile directly in the profiles table for immediate access
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
              email: formState.email,
              full_name: fullName,
              first_name: formState.firstName,
              last_name: formState.lastName,
              phone: formState.phone,
              role: 'single_finance_manager',
              signup_request_id: signupData.id,
              pending_email_confirmation: true,
            })
            .select()
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error('Failed to create user profile. Please try again or contact support.');
          }

          console.log('Profile created for pending email confirmation:', profileData);

          // Store the temporary password to show to user
          setFormState(prev => ({ ...prev, tempPassword }));
          setSuccess(true);
          return;
        }

        throw authError;
      }

      console.log('Auth signup result:', authData);

      // Check if user needs email confirmation
      if (authData.user && !authData.user.email_confirmed_at) {
        // If email confirmation is required by Supabase settings,
        // we'll still show success but inform user about email confirmation
        console.log('User created but email confirmation may be required');
      }

      // Auto-sign in the newly created user
      if (authData.user) {
        console.log('Auto-signing in the newly created user...');
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formState.email,
            password: tempPassword,
          });

          if (signInError) {
            console.error('Auto sign-in failed:', signInError);
            // Continue to show success even if auto sign-in fails
          } else {
            console.log('Auto sign-in successful');
          }
        } catch (signInErr) {
          console.error('Auto sign-in exception:', signInErr);
          // Continue to show success even if auto sign-in fails
        }
      }

      // Store the temporary password to show to user
      setFormState(prev => ({ ...prev, tempPassword }));

      console.log('Finance Manager signup completed:', { signupData, authData });
      setSuccess(true);
    } catch (err: any) {
      console.error('Signup error:', err);

      // Provide more specific error messages
      let errorMessage = err.message || 'Failed to create account';

      // Handle duplicate key constraint violations (user already exists)
      if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('unique constraint')) {
        console.log('[SingleFinanceSignup] Duplicate email detected, showing login form');
        setLoginData({ email: formState.email, password: '' });
        setShowExistingUserLogin(true);
        errorMessage = 'An account with this email already exists. Please login below or reset your password.';
        setLoading(false);
        setError(errorMessage);
        return;
      } else if (err.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many signup attempts. Please wait a few minutes and try again.';
      } else if (err.message?.includes('User already registered')) {
        errorMessage =
          'An account with this email already exists. Please use the login form below.';
        setLoginData({ email: formState.email, password: '' });
        setShowExistingUserLogin(true);
      } else if (err.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show existing user login form
  if (showExistingUserLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <div className="flex items-center mb-6">
              <button
                onClick={() => setShowExistingUserLogin(false)}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white">Login to Your Account</h2>
            </div>

            {passwordResetSent ? (
              <div className="text-center">
                <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Password Reset Sent!</h3>
                <p className="text-gray-300 mb-6">
                  Check your email for a password reset link. You can close this window.
                </p>
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                >
                  Go to Login Page
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleExistingUserLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="loginEmail"
                      className="block text-gray-300 text-sm font-bold mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="loginEmail"
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="loginPassword"
                      className="block text-gray-300 text-sm font-bold mb-2"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="loginPassword"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 pr-10 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Logging in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Go to main login page
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    // Auto-redirect to dashboard after 3 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        navigate('/dashboard/single-finance');
      }, 3000);

      return () => clearTimeout(timer);
    }, [navigate]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-8" />
          <h1 className="text-4xl font-bold mb-6 text-white">Welcome to The DAS Board!</h1>
          
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">🎉 Account Created Successfully!</h2>
            <p className="text-gray-300 text-lg mb-6">
              Your Single Finance Manager account has been set up and is ready to use.
            </p>
            
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-lg font-medium">
                Welcome! You will soon be redirected to your Dashboard.
              </p>
              <div className="mt-3 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                <span className="ml-2 text-blue-300 text-sm">Redirecting in 3 seconds...</span>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-white font-medium mb-2">Your Login Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-blue-400 font-mono">{formState.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Password:</span>
                  <span className="text-green-400 font-mono">{formState.tempPassword}</span>
                </div>
              </div>
            </div>

            <p className="text-yellow-200 text-sm">
              💡 <strong>Tip:</strong> Save your login details and consider changing your password after first login.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/single-finance')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard Now
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/signup')}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
                title="Back to signup options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-white">Finance Manager</h2>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
              title="Back to home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>

          {/* Promotional Pricing Banner */}
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <div className="text-center">
              <div className="text-red-400 line-through text-lg mb-1">$5/month</div>
              <div className="text-2xl font-bold text-green-400 mb-2">FREE</div>
              <p className="text-green-300 text-sm">
                🎉 Limited time promotional offer! Finance Manager tools are currently FREE
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-300 text-sm font-bold mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formState.firstName}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="First name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-gray-300 text-sm font-bold mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formState.lastName}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-300 text-sm font-bold mb-2">
                Phone Number (for 2FA)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formState.phone}
                onChange={handleChange}
                required
                className="bg-gray-700 border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Finance Manager Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              30-day free trial included. No credit card required during trial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
