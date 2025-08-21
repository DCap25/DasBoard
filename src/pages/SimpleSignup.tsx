import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import LanguageSelector from '../components/auth/LanguageSelector';
import { supabase } from '../lib/supabase';

export default function SimpleSignup() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('[SimpleSignup] Starting Supabase user creation for:', formData.email);

      // Try to create signup request directly, handle duplicate email error if it occurs
      console.log('[SimpleSignup] Creating signup request...');
      let signupRequestData;

      const { data: newSignupData, error: signupRequestError } = await supabase
        .from('signup_requests')
        .insert({
          email: formData.email,
          full_name: formData.fullName,
          dealership_name: `${formData.fullName} - Finance Manager`,
          contact_person: formData.fullName,
          tier: 'finance_manager',
          subscription_tier: 'finance_manager_free_promo',
          account_type: 'single-finance',
          dealer_count: 1,
          add_ons: [],
          promo_applied: true,
          status: 'approved',
          stripe_payment_status: 'free_promotional',
        })
        .select()
        .single();

      if (signupRequestError) {
        // If it's a duplicate email error, fetch the existing record instead
        if (
          signupRequestError.code === '23505' ||
          signupRequestError.message?.includes('duplicate')
        ) {
          console.log('[SimpleSignup] Email already exists, fetching existing signup request...');
          const { data: existingData, error: fetchError } = await supabase
            .from('signup_requests')
            .select('*')
            .eq('email', formData.email)
            .single();

          if (fetchError) {
            console.error('[SimpleSignup] Failed to fetch existing signup:', fetchError);
            throw new Error('Failed to process signup request');
          }

          signupRequestData = existingData;
          console.log('[SimpleSignup] Using existing signup request:', signupRequestData);
        } else {
          console.error('[SimpleSignup] Signup request creation error:', signupRequestError);
          console.error('[SimpleSignup] Error details:', {
            message: signupRequestError.message,
            details: signupRequestError.details,
            hint: signupRequestError.hint,
            code: signupRequestError.code,
          });
          throw new Error(`Failed to process signup request: ${signupRequestError.message}`);
        }
      } else {
        signupRequestData = newSignupData;
      }

      console.log('[SimpleSignup] Signup request created:', signupRequestData);

      // Create auth user (or handle if already exists)
      console.log('[SimpleSignup] Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'single_finance_manager',
            preferred_language: language,
          },
        },
      });

      if (authError) {
        console.error('[SimpleSignup] Auth signup error:', authError);
        console.error('[SimpleSignup] Auth error details:', {
          message: authError.message,
          status: authError.status,
        });

        // Handle specific error cases
        if (authError.message?.includes('User already registered')) {
          // Try to sign them in instead
          console.log('[SimpleSignup] User exists, trying to sign them in...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            throw new Error(
              'An account with this email already exists but the password is incorrect. Please try signing in with the correct password.'
            );
          }

          console.log('[SimpleSignup] Successfully signed in existing user');

          // Update the existing user's metadata to ensure they have the Single Finance Manager role
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              full_name: formData.fullName,
              role: 'single_finance_manager',
            },
          });

          if (updateError) {
            console.warn('[SimpleSignup] Failed to update user metadata:', updateError);
          } else {
            console.log(
              '[SimpleSignup] Updated existing user metadata with Single Finance Manager role'
            );
          }
        } else {
          throw new Error(authError.message || 'Failed to create account');
        }
      }

      console.log('[SimpleSignup] Auth user created:', authData);

      // Skip profile creation due to RLS policy recursion issue
      // The auth user metadata already contains the necessary information
      if (authData.user) {
        console.log(
          '[SimpleSignup] Auth user created successfully with metadata:',
          authData.user.user_metadata
        );
        console.log('[SimpleSignup] Skipping profiles table due to RLS policy issue');

        // Note: User information is stored in auth.users.user_metadata and signup_requests table
        // The AuthContext will handle user role and data retrieval
      }

      // Store signup date and user info for tracking and fallback authentication
      localStorage.setItem('singleFinanceSignupDate', new Date().toISOString());
      localStorage.setItem('singleFinanceEmail', formData.email);
      localStorage.setItem('singleFinanceName', formData.fullName);
      localStorage.setItem('app-language', language); // Persist language choice

      // Navigate to welcome page
      navigate('/welcome/single-finance', {
        state: {
          fullName: formData.fullName,
          email: formData.email,
          accountType: 'single-finance',
          justSignedUp: true,
        },
      });
    } catch (error: any) {
      console.error('[SimpleSignup] Signup failed:', error);
      setErrors({
        general: error.message || 'Signup failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
              >
                The DAS Board
              </button>
              <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                {t('signup.simple.title')}
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.home')}
              </button>
              <button
                onClick={() => navigate('/screenshots')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.screenshots')}
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.pricing')}
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.about')}
              </button>
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.login')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-19">
        <div className="bg-gray-800 rounded-xl p-7 border border-gray-700 relative">
          {/* Compact Language Selector - Upper Right */}
          <div className="absolute top-4 right-4">
            <LanguageSelector variant="compact" />
          </div>

          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('signup.simple.subtitle')}</h2>
            <p className="text-gray-400">{t('signup.simple.description')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.fullName')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.email')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              <p className="text-gray-400 text-xs mt-1">{t('signup.form.emailNote')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-11 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.confirmPassword')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-9 pr-11 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-300">
                {t('signup.form.agreePrefix')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/legal/terms')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => navigate('/legal/privacy')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-400 text-sm -mt-4">{errors.agreeToTerms}</p>
            )}

            {errors.general && (
              <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-lg">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-5 rounded-lg font-semibold text-base transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  {t('signup.simple.submitButton')}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                {t('signup.form.alreadyHave')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {t('signup.form.signIn')}
                </button>
              </p>
            </div>
          </form>
        </div>

        <div className="mt-7 text-center">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <h3 className="text-white font-semibold mb-2">{t('signup.simple.whyTitle')}</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              {(t('signup.simple.whyBenefits') as string[]).map((benefit, index) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
