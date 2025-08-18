import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  ArrowRight,
  Check,
  Users,
  TrendingUp,
  Shield,
  X,
  Percent,
  Copy,
  Mail,
} from 'lucide-react';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [showDiscountPopup, setShowDiscountPopup] = useState(false);
  const [discountEmail, setDiscountEmail] = useState('');
  const [discountCodeRevealed, setDiscountCodeRevealed] = useState(false);
  const [discountCopied, setDiscountCopied] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Show discount popup after 3 seconds
    const timer = setTimeout(() => {
      setShowDiscountPopup(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleEmailSubmit = () => {
    if (!discountEmail.trim()) {
      setEmailError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(discountEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setDiscountCodeRevealed(true);
  };

  const copyDiscountCode = async () => {
    try {
      await navigator.clipboard.writeText('SAVE10');
      setDiscountCopied(true);
      setTimeout(() => setDiscountCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy discount code');
    }
  };

  const handleSingleFinanceManager = () => {
    navigate('/auth', {
      state: {
        signupType: 'single_finance_manager',
      },
    });
  };

  const handleDealershipGroup = () => {
    navigate('/signup/dealership', {
      state: {
        signupType: 'dealership_group',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
              <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Sign Up
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Select Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Solution
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Select the option that best describes your needs. We'll customize your experience
            accordingly.
          </p>
        </div>
      </section>

      {/* Two Options */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Single Finance Manager Option */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Single Finance Manager</h2>
                <p className="text-gray-400 mb-6">
                  Perfect for individual finance managers who want to track their personal
                  performance and deals.
                </p>
                <div className="text-3xl font-bold text-blue-400 mb-2">FREE</div>
                <div className="text-sm text-gray-500">Limited time offer</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Personal deal tracking</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">PVR & product profit analytics</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Pay calculator</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Performance metrics</span>
                </div>
              </div>

              <button
                onClick={handleSingleFinanceManager}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <div className="mt-4 text-center text-sm text-gray-400">
                Setup takes less than 2 minutes
              </div>
            </div>

            {/* Dealership/Dealer Group Option */}
            <div className="bg-gray-800 rounded-xl p-8 border-2 border-blue-500 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Dealership / Dealer Group</h2>
                <p className="text-gray-400 mb-6">
                  Complete dealership management with role-specific dashboards, team management, and
                  multi-location support.
                </p>
                <div className="text-3xl font-bold text-white mb-2">Starting at $250/mo</div>
                <div className="text-sm text-gray-500">per dealership</div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-white">All single manager features</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-white">Team dashboards for all roles</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-white">Multi-location analytics</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-white">Flexible admin structures</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-white">Volume discounts available</span>
                </div>
              </div>

              <button
                onClick={handleDealershipGroup}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
              >
                Configure Your Package
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              <div className="mt-4 text-center text-sm text-gray-400">Get started today</div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Transform Your Dealership Today</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Increase Performance</h3>
              <p className="text-gray-400 text-sm">
                Real-time insights help teams exceed goals and maximize profitability
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Streamline Operations</h3>
              <p className="text-gray-400 text-sm">
                Centralized management reduces admin time and improves efficiency
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure & Reliable</h3>
              <p className="text-gray-400 text-sm">
                Enterprise-grade security with 99.9% uptime guarantee
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm">
              <strong>Not sure which option to choose?</strong> Start with the single finance
              manager option to try our platform, then easily upgrade to dealership features when
              you're ready to expand your team.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>© 2025 The DAS Board. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Questions? Contact us at{' '}
              <a
                href="mailto:support@thedasboard.com"
                className="text-blue-400 hover:text-blue-300"
              >
                support@thedasboard.com
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Discount Popup */}
      {showDiscountPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full border-2 border-blue-500 relative animate-in fade-in duration-300 shadow-2xl shadow-blue-500/50">
            <button
              onClick={() => setShowDiscountPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                {discountCodeRevealed ? (
                  <Percent className="w-8 h-8 text-white" />
                ) : (
                  <Mail className="w-8 h-8 text-white" />
                )}
              </div>

              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {discountCodeRevealed ? 'Your Discount Code!' : 'Special Launch Offer!'}
              </h3>

              {!discountCodeRevealed ? (
                <>
                  <p className="text-lg text-gray-600 mb-6">
                    Get <span className="text-blue-600 font-bold text-xl">10% off</span> your first
                    3 months with our dealership management solution.
                  </p>

                  <div className="mb-6">
                    <label className="block text-base font-medium text-gray-700 mb-3">
                      Enter your email to receive the discount code:
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500" />
                      <input
                        type="email"
                        value={discountEmail}
                        onChange={e => {
                          setDiscountEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        className={`w-full pl-12 pr-4 py-4 bg-blue-50 border rounded-lg text-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white ${
                          emailError ? 'border-red-500' : 'border-blue-200'
                        }`}
                        placeholder="your@email.com"
                        onKeyPress={e => e.key === 'Enter' && handleEmailSubmit()}
                      />
                    </div>
                    {emailError && <p className="text-red-500 text-base mt-2">{emailError}</p>}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleEmailSubmit}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Get Discount Code
                    </button>
                    <button
                      onClick={() => setShowDiscountPopup(false)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-6 rounded-lg font-semibold text-lg transition-colors border border-blue-200"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you! Here's your{' '}
                    <span className="text-blue-600 font-bold text-xl">10% off</span> discount code:
                  </p>

                  <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-500">
                    <p className="text-base text-gray-600 mb-3">Discount Code:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-blue-600 tracking-wider">
                        SAVE10
                      </span>
                      <button
                        onClick={copyDiscountCode}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base transition-colors shadow-sm hover:shadow-md"
                      >
                        <Copy className="w-5 h-5" />
                        <span>{discountCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDiscountPopup(false);
                        handleDealershipGroup();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Claim Offer
                    </button>
                    <button
                      onClick={() => setShowDiscountPopup(false)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-4 px-6 rounded-lg font-semibold text-lg transition-colors border border-blue-200"
                    >
                      Use Later
                    </button>
                  </div>
                </>
              )}

              <p className="text-sm text-gray-500 mt-4">
                * Valid for new dealership subscriptions only. Expires in 30 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
