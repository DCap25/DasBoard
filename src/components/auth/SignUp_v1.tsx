import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Building, Users, Home, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    accountType: 'single-finance',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch for authentication and redirect
  useEffect(() => {
    if (user && isSubmitting) {
      console.log('[SignUp] User authenticated after signup, redirecting...');
      setIsSubmitting(false);
      
      // Navigate based on account type
      if (formData.accountType === 'single-finance') {
        navigate('/welcome/single-finance?newuser=true');
      } else {
        navigate('/auth');
      }
    }
  }, [user, isSubmitting, formData.accountType, navigate]);

  const accountTypes = [
    {
      id: 'single-finance',
      title: 'Single Finance Manager',
      description: 'Perfect for individual finance managers',
      icon: User,
    },
    {
      id: 'small-dealer-group',
      title: 'Small Dealer Groups',
      description: '1-5 Dealerships',
      icon: Building,
    },
    {
      id: 'large-dealer-group',
      title: 'Dealer Groups 6+',
      description: 'Enterprise solution with Area VP Dashboard',
      icon: Users,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    // Import the direct signup service
    const { directSignup } = await import('../../lib/directSignup');

    try {
      console.log('[SignUp] Starting signup with:', formData);
      const response = await directSignup(formData);
      console.log('[SignUp] Signup initiated');

      if (!response.success) {
        setIsSubmitting(false);
        alert(response.message || 'Signup failed. Please try again.');
      }
      // If successful, the useEffect will handle the redirect when user state changes
    } catch (error) {
      console.error('[SignUp] Error during signup:', error);
      setIsSubmitting(false);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div></div> {/* Empty div for spacing */}
            <h1 className="text-4xl font-bold text-white">Create Your Account</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
              title="Back to home"
            >
              <Home className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get started with The DAS Board in just a few simple steps
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose Your Account Type
              </label>
              <div className="space-y-3">
                {accountTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <label
                      key={type.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.accountType === type.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value={type.id}
                        checked={formData.accountType === type.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                          formData.accountType === type.id ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{type.title}</div>
                        <div className="text-gray-400 text-sm">{type.description}</div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          formData.accountType === type.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-400'
                        }`}
                      >
                        {formData.accountType === type.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I agree to the{' '}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
              {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
