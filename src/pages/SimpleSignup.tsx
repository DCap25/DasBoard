import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { supabase } from '../lib/supabase';

export default function SimpleSignup() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      [name]: type === 'checkbox' ? checked : value 
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

      // First, create signup request record (using existing schema)
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { data: signupRequestData, error: signupRequestError } = await supabase
        .from('signup_requests')
        .insert({
          email: formData.email,
          first_name: firstName,
          last_name: lastName,
          full_name: formData.fullName,
          dealership_name: `${formData.fullName} - Finance Manager`,
          contact_person: formData.fullName,
          company_name: `${formData.fullName} - Finance Manager`,
          phone: '', // Phone not collected in simple signup
          phone_number: '', // Alternative phone field
          tier: 'finance_manager',
          subscription_tier: 'finance_manager_free_promo',
          account_type: 'single-finance',
          dealer_count: 1,
          add_ons: [],
          promo_applied: true,
          status: 'approved',
          // Removed monthly_rate and setup_fee as they don't exist in schema
        })
        .select()
        .single();

      if (signupRequestError) {
        console.error('Signup request creation error:', signupRequestError);
        throw new Error('Failed to process signup request');
      }

      console.log('[SimpleSignup] Signup request created:', signupRequestData);

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'single_finance_manager',
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message || 'Failed to create account');
      }

      console.log('[SimpleSignup] Auth user created:', authData);

      // Skip profile creation due to RLS policy recursion issue
      // The auth user metadata already contains the necessary information
      if (authData.user) {
        console.log('[SimpleSignup] Auth user created successfully with metadata:', authData.user.user_metadata);
        console.log('[SimpleSignup] Skipping profiles table due to RLS policy issue');
        
        // Note: User information is stored in auth.users.user_metadata and signup_requests table
        // The AuthContext will handle user role and data retrieval
      }

      // Store signup date for tracking
      localStorage.setItem('singleFinanceSignupDate', new Date().toISOString());
      
      // Navigate to welcome page
      navigate('/welcome/single-finance', {
        state: {
          fullName: formData.fullName,
          email: formData.email,
          accountType: 'single-finance',
          justSignedUp: true
        }
      });

    } catch (error: any) {
      console.error('[SimpleSignup] Signup failed:', error);
      setErrors({
        general: error.message || 'Signup failed. Please try again.'
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
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
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

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t('signup.simple.subtitle')}</h2>
            <p className="text-gray-400">
              {t('signup.simple.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.fullName')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.email')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">{t('signup.form.emailNote')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('signup.form.confirmPassword')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  {t('signup.simple.submitButton')}
                  <ArrowRight className="ml-2 w-5 h-5" />
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

        <div className="mt-8 text-center">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
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