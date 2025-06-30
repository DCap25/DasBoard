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
      features: ['Personal deal tracking', 'Performance analytics', 'PVR & VSC metrics'],
    },
    {
      name: 'Small Dealer Groups',
      price: '$250/mo per Dealership',
      description: '1-5 Dealerships',
      popular: false,
      features: [
        'Role Specific Dashboards for up to 10 Sales People',
        '3 F&I Managers',
        '3 Sales Managers',
        '1 GM',
        'Team management',
        'Sales tracking',
        'Finance oversight',
        'Performance reporting',
        'Dynamic scheduler',
        'Priority support',
      ],
    },
    {
      name: 'Dealer Groups 6+',
      price: '$200/Mo per Dealer*',
      description: 'Everything Single Dealership offers plus Area VP Dashboard',
      popular: false,
      features: [
        'Level 1: 6 - 12 Locations',
        'Level 2: 13-25 Locations',
        'Level 3: Contact for larger groups',
        'Multi-location management',
        'Centralized reporting',
        'Group-wide analytics',
        'Area VP Dashboard',
        'Advanced admin controls',
        'Dedicated account manager',
        'Priority phone support',
      ],
    },
  ];

  const comparisonFeatures = [
    { name: 'Deal Log', finance: true, dealership: true, group: true },
    { name: 'Track Deals', finance: true, dealership: true, group: true },
    { name: 'Track PVR', finance: true, dealership: true, group: true },
    { name: 'Track Gross', finance: true, dealership: true, group: true },
    { name: 'View Schedule', finance: true, dealership: true, group: true },
    { name: 'Pay Calculator', finance: true, dealership: true, group: true },
    { name: 'Daily DAS Board (Leaderboard)', finance: false, dealership: true, group: true },
    { name: 'Team Schedule', finance: false, dealership: true, group: true },
    { name: 'Set Team Goals', finance: false, dealership: true, group: true },
    { name: 'Sales Reports', finance: false, dealership: true, group: true },
    { name: 'General Manager Dashboard', finance: false, dealership: true, group: true },
    { name: 'Finance Director Dashboard', finance: false, dealership: true, group: true },
    { name: 'Sales Director Dashboard', finance: false, dealership: true, group: true },
    { name: 'Dealer Group Overview', finance: false, dealership: false, group: true },
    { name: 'Multi-Location Analytics', finance: false, dealership: false, group: true },
    {
      name: 'Level 1 (6-12 dealerships, $200/mo per dealership): Adds Area Vice President (AVP)',
      finance: false,
      dealership: false,
      group: true,
    },
    {
      name: 'Level 2 (13-25 dealerships, $250/mo per dealership): 2 AVPs',
      finance: false,
      dealership: false,
      group: true,
    },
    {
      name: 'Level 3 (larger dealer groups): Contact for pricing',
      finance: false,
      dealership: false,
      group: true,
    },
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
                    <th className="text-left py-6 px-6 text-white font-semibold">Features</th>
                    <th className="text-center py-6 px-6 text-blue-400 font-semibold">
                      <div className="space-y-2">
                        <div className="text-lg">Finance Manager Only</div>
                        <div className="text-sm text-blue-300">$5/mo FREE for a limited time</div>
                        <div className="text-xs text-gray-400 max-w-48">
                          Log your Deals, Track your PVR, Product Profit, Product Spread, View
                          Schedule, and Pay Calculator.
                        </div>
                      </div>
                    </th>
                    <th className="text-center py-6 px-6 text-white font-semibold">
                      <div className="space-y-2">
                        <div className="text-lg">Small Dealer Groups</div>
                        <div className="text-sm text-green-400">Just $250/mo per Dealership</div>
                        <div className="text-xs text-gray-400 max-w-48">
                          1-5 Dealerships. Role Specific Dashboards for up to 10 Sales People, 3 F&I
                          Managers, 3 Sales Managers and 1 GM.
                        </div>
                      </div>
                    </th>
                    <th className="text-center py-6 px-6 text-white font-semibold">
                      <div className="space-y-2">
                        <div className="text-lg">Dealer Groups 6+</div>
                        <div className="text-sm text-green-400">$200/Mo per Dealer*</div>
                        <div className="text-xs text-gray-400 max-w-48">
                          Everything Single Dealership offers plus Area VP Dashboard. Level 1: 6-12
                          Locations, Level 2: 13-25 Locations, Level 3: Contact for larger groups.
                        </div>
                      </div>
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
                <tfoot>
                  <tr className="border-t border-gray-600 bg-gray-750">
                    <td className="py-6 px-6 text-white font-semibold">Select Plan</td>
                    <td className="py-6 px-6 text-center">
                      <button
                        onClick={() => navigate('/signup')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Select Plan
                      </button>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <button
                        onClick={() => navigate('/signup')}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Select Plan
                      </button>
                    </td>
                    <td className="py-6 px-6 text-center">
                      <button
                        onClick={() => navigate('/signup')}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Select Plan
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Upgrade Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Subscription Upgrades</h2>
            <p className="text-xl text-gray-300">
              Enhance your plan with additional capacity and features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Premium + */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Premium +</h3>
                <div className="text-3xl font-bold text-blue-400 mb-4">+$100/month</div>
                <p className="text-gray-400">
                  Expand your team capacity and unlock additional management features for growing
                  dealerships.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Features:
                </h4>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Adds 10 more Sales People (up to 20 total)</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Adds up to 5 F&I Managers</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Adds Finance Director role</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Adds up to 5 Sales Managers</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">1 GSM and GM</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Dynamic Scheduling</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">More Sales Reports</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Upgrade Plan
              </button>
            </div>

            {/* Premium ++ */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Premium ++</h3>
                <div className="text-3xl font-bold text-purple-400 mb-4">Contact Us</div>
                <p className="text-gray-400">
                  Maximum capacity for large dealerships with extensive teams and comprehensive
                  management needs.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                  Features:
                </h4>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Up to 50 Sales People</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Up to 10 Finance People</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Up to 3 Finance Assistants</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Up to 8 Sales Managers</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">1 GSM and GM</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">Dynamic Scheduling</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">More Sales Reports</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </button>
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
            <div>
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
                    onClick={() => navigate('/pricing')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
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

              <h4 className="text-lg font-semibold text-white mb-4 mt-6">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/legal/terms')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/legal/privacy')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/legal/subscription')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Subscription Agreement
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
