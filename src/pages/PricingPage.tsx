import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Star } from 'lucide-react';

export default function PricingPage() {
  const navigate = useNavigate();

  const pricingTiers = [
    {
      name: 'Finance Manager',
      price: 'Free for Limited Time!',
      originalPrice: '$5/Month',
      description: 'Perfect for individual finance managers',
      popular: true,
      features: [
        'Personal deal tracking',
        'Performance analytics',
        'Goal management',
        'Commission tracking',
        'PVR & VSC metrics',
        'Real-time earnings calculator',
        '30-day free trial',
        'Email support',
      ],
    },
    {
      name: 'Single Dealership',
      price: '$250/month',
      description: 'For individual dealership locations',
      popular: false,
      features: [
        'Up to 15 users',
        'Team management',
        'Sales tracking',
        'Finance oversight',
        'Performance reporting',
        'Dynamic scheduler',
        'Role-based dashboards',
        'Priority support',
        'Custom pay plans',
        'Advanced analytics',
      ],
    },
    {
      name: 'Dealer Groups',
      price: '$500/month',
      description: 'For multi-location dealership groups',
      popular: false,
      features: [
        'Unlimited users',
        'Multi-location management',
        'Centralized reporting',
        'Group-wide analytics',
        'Scalable team structure',
        'Advanced admin controls',
        'Custom integrations',
        'Dedicated account manager',
        'Priority phone support',
        'Custom training sessions',
      ],
    },
  ];

  const comparisonFeatures = [
    { name: 'Deal Tracking', finance: true, dealership: true, group: true },
    { name: 'Performance Analytics', finance: true, dealership: true, group: true },
    { name: 'Team Management', finance: false, dealership: true, group: true },
    { name: 'Multi-location Support', finance: false, dealership: false, group: true },
    { name: 'Custom Pay Plans', finance: false, dealership: true, group: true },
    { name: 'Advanced Reporting', finance: false, dealership: true, group: true },
    { name: 'Priority Support', finance: false, dealership: true, group: true },
    { name: 'Custom Integrations', finance: false, dealership: false, group: true },
    { name: 'Dedicated Account Manager', finance: false, dealership: false, group: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white mr-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/screenshots')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Screenshots
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Choose the{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start with our free trial for finance managers, or choose the plan that scales with your
            dealership.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-gray-800 rounded-xl p-8 border transition-all duration-300 hover:shadow-xl ${
                  tier.popular
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-105'
                    : 'border-gray-700 hover:border-blue-500'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 mb-6">{tier.description}</p>

                  <div className="mb-6">
                    {tier.originalPrice && (
                      <div className="text-red-400 line-through text-lg mb-2">
                        {tier.originalPrice}
                      </div>
                    )}
                    <div className="text-4xl font-bold text-blue-400">{tier.price}</div>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                      tier.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {tier.popular ? 'Start Free Trial' : 'Get Started'}
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    What's included:
                  </h4>
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Compare Plans</h2>
            <p className="text-xl text-gray-300">See what's included in each plan at a glance</p>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-white font-semibold">Features</th>
                    <th className="text-center py-4 px-6 text-blue-400 font-semibold">
                      Finance Manager
                    </th>
                    <th className="text-center py-4 px-6 text-white font-semibold">
                      Single Dealership
                    </th>
                    <th className="text-center py-4 px-6 text-white font-semibold">
                      Dealer Groups
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-gray-700 last:border-b-0">
                      <td className="py-4 px-6 text-gray-300">{feature.name}</td>
                      <td className="py-4 px-6 text-center">
                        {feature.finance ? (
                          <Check className="w-5 h-5 text-blue-400 mx-auto" />
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {feature.dealership ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {feature.group ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'Is there really a free trial?',
                answer:
                  'Yes! Finance managers can use The DAS Board completely free for 30 days. No credit card required during the trial period.',
              },
              {
                question: 'Can I upgrade or downgrade my plan?',
                answer:
                  'Absolutely. You can change your plan at any time through your account settings. Changes take effect immediately.',
              },
              {
                question: 'What kind of support do you offer?',
                answer:
                  'We provide email support for all plans, with priority phone support for dealership and dealer group plans. Dealer groups also get a dedicated account manager.',
              },
              {
                question: 'Is my data secure?',
                answer:
                  'Yes, we use enterprise-grade security measures including SSL encryption, secure data centers, and regular security audits to protect your data.',
              },
              {
                question: 'Can I cancel anytime?',
                answer:
                  'Yes, there are no long-term contracts. You can cancel your subscription at any time through your account settings.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of dealerships already using The DAS Board to optimize their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={() => navigate('/screenshots')}
              className="border border-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              View Screenshots
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">The DAS Board</h3>
              <p className="text-gray-400 mb-4">
                Modern dealership management software with real-time insights.
              </p>
              <p className="text-gray-400">Dealership Automotive Sales</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/screenshots')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Screenshots
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/about')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">For support or inquiries, please contact us at:</p>
              <p className="text-blue-400">support@thedasboard.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 The DAS Board. All rights reserved. Designed with 🖤
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
