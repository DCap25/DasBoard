// React import removed as it's not needed in modern React
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck } from 'lucide-react';
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
            <FileCheck className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Subscription Agreement</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>Last Updated:</strong> 6/28/2025
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <p>
                  This Subscription Agreement governs your subscription to and use of The DAS Board
                  dealership management platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Subscription Plans</h2>
                <p className="mb-4">
                  The DAS Board offers subscription tiers designed for different dealership needs:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>60-Day Free Trial:</strong> Full platform access with no credit card
                    required
                  </li>
                  <li>
                    <strong>Finance Manager:</strong> Individual user access with core financial
                    tools
                  </li>
                  <li>
                    <strong>Dealership:</strong> Multi-user access with full inventory and sales
                    management
                  </li>
                  <li>
                    <strong>Dealer Group:</strong> Enterprise-level access across multiple locations
                  </li>
                </ul>
                <p className="mt-4">
                  Subscriptions are billed monthly in advance. You may upgrade or downgrade your
                  subscription at any time, with changes taking effect at the next billing cycle.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Payment Terms</h2>
                <p>
                  Payment is due upon subscription commencement and on the same day each month
                  thereafter. We accept major credit cards and ACH transfers for enterprise
                  accounts. If payment fails, we may suspend your access to The DAS Board after
                  reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Trial Period</h2>
                <p>
                  The 60-day trial provides full access to The DAS Board platform. No credit card is
                  required to start your trial. At the end of the trial period, you will need to
                  select a paid plan to continue using the platform. Trial data will be preserved
                  for 30 days after trial expiration.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  4. Cancellation and Refunds
                </h2>
                <p className="mb-4">
                  You may cancel your subscription at any time through your account settings or by
                  contacting our support team. Upon cancellation:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You will maintain access until the end of your current billing period</li>
                  <li>No refunds are provided for partial months of service</li>
                  <li>Your data will be available for export for 90 days after cancellation</li>
                  <li>Automatic renewal will be disabled</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  5. Service Level Agreement
                </h2>
                <p className="mb-4">For paid subscriptions, we commit to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>99.9% platform uptime availability</li>
                  <li>Scheduled maintenance windows with 48-hour advance notice</li>
                  <li>Customer support response within 24 hours for standard requests</li>
                  <li>Priority support for Dealer Group subscribers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Data and Security</h2>
                <p className="mb-4">Your dealership data remains your property. We provide:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Daily automated backups with 30-day retention</li>
                  <li>Bank-level encryption and security protocols</li>
                  <li>GDPR and CCPA compliance for data protection</li>
                  <li>Data export capabilities in standard formats</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Support and Training</h2>
                <p className="mb-4">All paid subscriptions include:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Comprehensive onboarding and setup assistance</li>
                  <li>Online training resources and documentation</li>
                  <li>Email and chat support during business hours</li>
                  <li>Regular platform updates and new feature releases</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. Modifications to Service
                </h2>
                <p>
                  We may modify or update The DAS Board platform to improve functionality, security,
                  or compliance. We will provide reasonable notice of significant changes that may
                  affect your usage.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
