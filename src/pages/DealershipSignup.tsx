import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Mail,
  Lock,
  Check,
  Star,
  Users,
  TrendingUp,
  Shield,
  Calculator,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSelector from '../components/auth/LanguageSelector';

export default function DealershipSignup() {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }
    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Navigate to success page or admin dashboard
      navigate('/signup/success', {
        state: {
          organizationName: formData.organizationName,
          planName: 'Dealership Package',
          setupComplete: true,
        },
      });
    }
  };

  const pricingTiers = [
    { dealerships: '1-2', price: 250, popular: false },
    { dealerships: '3-5', price: 225, popular: true },
    { dealerships: '6-10', price: 200, popular: false },
    { dealerships: '11-25', price: 175, popular: false },
    { dealerships: '26+', price: 150, popular: false },
  ];

  const features = [
    'Complete dashboard suite for all roles',
    'Real-time deal tracking & analytics',
    'Multi-location management',
    'Flexible admin structure',
    'Schedule & goal management',
    'Performance reporting',
    'Volume discounts available',
  ];

  const premiumFeatures = [
    'Custom integrations',
    'Dedicated account manager',
    '24/7 phone support',
    'Advanced reporting',
    'API access',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/subscriptions')}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
              <span className="ml-3 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                Dealership Signup
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Pricing Information */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Dealership Management</h1>
              <p className="text-xl text-gray-300">
                Complete solution for managing your dealership or dealer group with volume-based
                pricing.
              </p>
            </div>

            {/* Volume Pricing */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
              <div className="flex items-center mb-4">
                <Calculator className="w-6 h-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Volume-Based Pricing</h2>
              </div>

              <div className="space-y-3">
                {pricingTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      tier.popular ? 'bg-green-600/20 border border-green-500' : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-white font-medium">{tier.dealerships} dealerships</span>
                      {tier.popular && <Star className="w-4 h-4 text-blue-400 ml-2" />}
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-400">${tier.price}</span>
                      <span className="text-gray-400 text-sm ml-1">/mo each</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500">
                <p className="text-blue-300 text-sm">
                  <strong>Central Billing Discount:</strong> Pay for multiple dealerships under one
                  account and receive volume pricing automatically.
                </p>
              </div>
            </div>

            {/* Included Features */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Check className="w-5 h-5 text-blue-400 mr-2" />
                Included Features
              </h3>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Add-ons */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 text-blue-400 mr-2" />
                Premium Add-ons
              </h3>
              <div className="space-y-2 mb-4">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Star className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-white text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-xs">
                Available after signup through your admin dashboard
              </p>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div>
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 relative">
              {/* Compact Language Selector - Upper Right */}
              <div className="absolute top-4 right-4">
                <LanguageSelector variant="compact" />
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Get Started Today</h2>
                <p className="text-gray-400">
                  Create your account and configure your dealerships after signup
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Organization Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.organizationName ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="ABC Auto Group"
                      />
                      {errors.organizationName && (
                        <p className="text-red-400 text-sm mt-1">{errors.organizationName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Business Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="123 Main Street"
                      />
                      {errors.address && (
                        <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="Anytown"
                        />
                        {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="CA"
                        />
                        {errors.state && (
                          <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.zipCode ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="12345"
                      />
                      {errors.zipCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Admin Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Admin Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Admin Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="adminName"
                          value={formData.adminName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.adminName ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="John Smith"
                        />
                      </div>
                      {errors.adminName && (
                        <p className="text-red-400 text-sm mt-1">{errors.adminName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="adminEmail"
                          value={formData.adminEmail}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.adminEmail ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="john@abcautogroup.com"
                        />
                      </div>
                      {errors.adminEmail && (
                        <p className="text-red-400 text-sm mt-1">{errors.adminEmail}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password *
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
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="Confirm your password"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  Create Account & Get Started
                </button>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Configure dealerships and team after signup
                    <br />
                    <span className="text-white">Use code SAVE10 for 10% off first 3 months</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
