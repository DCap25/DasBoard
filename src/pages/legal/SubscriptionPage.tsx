import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('nav.home')}</span>
            </button>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <CreditCard className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">{t('legal.subscription.title')}</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>Effective Date:</strong> January 1, 2025
              <br />
              <strong>Last Updated:</strong> January 1, 2025
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Subscription Plans</h2>
                <p>
                  The DAS Board offers various subscription plans designed to meet the needs of
                  different types of automotive dealership operations:
                </p>

                <div className="mt-4 space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Finance Manager Plan</h3>
                    <p>
                      <strong>Price:</strong> Free for limited time (normally $5/month)
                    </p>
                    <p>
                      <strong>Features:</strong> Individual finance manager dashboard, deal
                      tracking, performance analytics
                    </p>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Single Dealership Plan</h3>
                    <p>
                      <strong>Price:</strong> $250/month
                    </p>
                    <p>
                      <strong>Features:</strong> Complete dealership management, unlimited users,
                      advanced analytics
                    </p>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-2">Dealer Group Plan</h3>
                    <p>
                      <strong>Price:</strong> Custom pricing
                    </p>
                    <p>
                      <strong>Features:</strong> Multi-location management, enterprise features,
                      dedicated support
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  2. Billing and Payment Terms
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Billing Cycle:</strong> Subscriptions are billed monthly or annually
                    based on your selection
                  </li>
                  <li>
                    <strong>Payment Due:</strong> Payment is due at the beginning of each billing
                    period
                  </li>
                  <li>
                    <strong>Auto-Renewal:</strong> Subscriptions automatically renew unless
                    cancelled
                  </li>
                  <li>
                    <strong>Payment Methods:</strong> We accept major credit cards and ACH transfers
                  </li>
                  <li>
                    <strong>Currency:</strong> All prices are in USD unless otherwise specified
                  </li>
                  <li>
                    <strong>Taxes:</strong> Applicable taxes will be added to your subscription fee
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Free Trial Terms</h2>
                <p>Free trials are available for eligible plans with the following conditions:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Trial duration varies by plan (typically 30 days)</li>
                  <li>Full access to plan features during trial period</li>
                  <li>Credit card required for trial activation</li>
                  <li>Automatic conversion to paid subscription unless cancelled</li>
                  <li>One trial per customer/organization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Subscription Changes</h2>
                <p>You may upgrade, downgrade, or modify your subscription at any time:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Upgrades:</strong> Take effect immediately with prorated billing
                  </li>
                  <li>
                    <strong>Downgrades:</strong> Take effect at the next billing cycle
                  </li>
                  <li>
                    <strong>Feature Limitations:</strong> Downgrading may result in loss of data or
                    features
                  </li>
                  <li>
                    <strong>Billing Adjustments:</strong> Credits or charges applied as appropriate
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Cancellation Policy</h2>
                <p>You may cancel your subscription at any time with the following terms:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>No refunds for partial billing periods</li>
                  <li>Access continues until the end of the paid period</li>
                  <li>Data export available for 30 days after cancellation</li>
                  <li>Account reactivation possible within 90 days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Refund Policy</h2>
                <p>Refunds are provided under the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Service Issues:</strong> Significant service outages or technical
                    problems
                  </li>
                  <li>
                    <strong>Billing Errors:</strong> Incorrect charges or duplicate billing
                  </li>
                  <li>
                    <strong>Cancellation:</strong> Within 7 days of initial subscription for annual
                    plans
                  </li>
                  <li>
                    <strong>Approval Required:</strong> All refunds subject to review and approval
                  </li>
                  <li>
                    <strong>Processing Time:</strong> Refunds processed within 5-10 business days
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  7. Service Level Agreement
                </h2>
                <p>We strive to provide reliable service with the following commitments:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Uptime:</strong> 99.5% monthly uptime target
                  </li>
                  <li>
                    <strong>Support Response:</strong> Business hours support for paid plans
                  </li>
                  <li>
                    <strong>Data Backup:</strong> Daily automated backups
                  </li>
                  <li>
                    <strong>Maintenance:</strong> Scheduled maintenance with advance notice
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">8. Data and Export</h2>
                <p>Your data management rights and options:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Data Ownership:</strong> You retain ownership of all your data
                  </li>
                  <li>
                    <strong>Export Options:</strong> Standard export formats available
                  </li>
                  <li>
                    <strong>Data Retention:</strong> Data kept for 90 days after cancellation
                  </li>
                  <li>
                    <strong>Deletion:</strong> Permanent deletion available upon request
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Price Changes</h2>
                <p>We may modify subscription prices with the following notice:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Advance Notice:</strong> 30 days notice for price increases
                  </li>
                  <li>
                    <strong>Existing Subscriptions:</strong> Current rates honored through billing
                    cycle
                  </li>
                  <li>
                    <strong>Grandfathering:</strong> Limited-time promotional rates may expire
                  </li>
                  <li>
                    <strong>Cancellation Option:</strong> Right to cancel before price increase
                    takes effect
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  10. Disputes and Resolution
                </h2>
                <p>For billing disputes or subscription issues:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Contact our billing support team first</li>
                  <li>Provide detailed information about the dispute</li>
                  <li>We will investigate and respond within 5 business days</li>
                  <li>Escalation procedures available if needed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">11. Contact Information</h2>
                <p>For subscription-related questions or support:</p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Billing Support:</strong> billing@thedasboard.com
                  </p>
                  <p>
                    <strong>Technical Support:</strong> support@thedasboard.com
                  </p>
                  <p>
                    <strong>Phone:</strong> Available for enterprise customers
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
