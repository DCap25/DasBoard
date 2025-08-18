import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Building2, Check } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function SignupChoice() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const signupOptions = [
    {
      id: 'single-finance',
      name: 'Single Finance Manager',
      price: '$20/mo limited time',
      originalPrice: '$29.99/mo',
      description:
        'Perfect for individual finance managers who want to track their personal performance',
      icon: User,
      popular: false,
      features: [
        'Personal deal tracking',
        'PVR & product profit analytics',
        'Pay calculator',
        'Performance metrics',
        'May be tax deductible',
        'Try risk free for one calendar month',
      ],
      buttonText: 'Get Started Now!',
      route: '/simple-signup',
    },
    {
      id: 'dealership',
      name: 'Dealership / Dealer Group',
      price: '$250/mo base',
      description:
        'Complete dealership management with role-specific dashboards and team management',
      icon: Building2,
      popular: true,
      features: [
        'All single manager features',
        'Team dashboards for all roles',
        'Multi-location analytics',
        'Flexible admin structures',
        'Advanced reporting',
        'Dedicated support',
      ],
      buttonText: 'Start Dealership Setup',
      route: '/signup/dealership',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
              <span className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Choose Your Plan
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
                onClick={() => navigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.pricing')}
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Choose Your Dashboard Solution</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Select the plan that best fits your needs. Start with our free Single Finance Manager
            option or get the full dealership experience with team management and advanced
            analytics.
          </p>
        </div>

        {/* Pricing Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {signupOptions.map(option => (
            <div
              key={option.id}
              className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 ${
                option.popular
                  ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {option.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div
                    className={`p-3 rounded-full ${option.popular ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{option.name}</h3>
                {option.originalPrice && (
                  <div className="text-lg text-gray-500 line-through mb-1">
                    {option.originalPrice}
                  </div>
                )}
                <div className="text-4xl font-bold text-white mb-2">{option.price}</div>
                <p className="text-gray-300">{option.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(option.route)}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center ${
                  option.popular
                    ? 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-xl hover:shadow-blue-500/30'
                    : 'bg-gray-700 hover:bg-gray-600 text-white hover:shadow-lg'
                }`}
              >
                {option.buttonText}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">
            Need help choosing?{' '}
            <button
              onClick={() => navigate('/pricing')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              View detailed pricing comparison
            </button>
          </p>
          <p className="text-gray-500 text-sm">
            All plans include our standard features and can be upgraded at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
