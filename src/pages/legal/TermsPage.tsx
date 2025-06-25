import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function TermsPage() {
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
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">{t('legal.terms.title')}</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>Effective Date:</strong> January 1, 2025
              <br />
              <strong>Last Updated:</strong> January 1, 2025
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using The DAS Board service, you accept and agree to be bound by
                  the terms and provision of this agreement. If you do not agree to abide by the
                  above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Service Description</h2>
                <p>
                  The DAS Board provides dealership management software with real-time dashboards
                  for finance managers, sales teams, and dealership management. Our service includes
                  performance tracking, deal logging, scheduling, and analytics tools designed
                  specifically for automotive dealerships.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account
                  credentials and for all activities that occur under your account. You agree to
                  notify us immediately of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  4. Subscription and Payment
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Subscriptions are billed monthly or annually as selected</li>
                  <li>Free trials are available for eligible plans</li>
                  <li>Payment is due at the beginning of each billing cycle</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>Refunds are provided according to our refund policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Data and Privacy</h2>
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which governs
                  how we collect, use, and protect your information. By using our service, you
                  consent to the collection and use of information in accordance with our Privacy
                  Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Acceptable Use</h2>
                <p>
                  You agree not to use the service for any unlawful purpose or in any way that could
                  damage, disable, overburden, or impair our service. Prohibited activities include
                  but are not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Interfering with other users' ability to use the service</li>
                  <li>Transmitting viruses or malicious code</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Intellectual Property</h2>
                <p>
                  The service and its original content, features, and functionality are owned by The
                  DAS Board and are protected by international copyright, trademark, patent, trade
                  secret, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. Limitation of Liability
                </h2>
                <p>
                  In no event shall The DAS Board be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including without limitation, loss of profits,
                  data, use, goodwill, or other intangible losses, resulting from your use of the
                  service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Termination</h2>
                <p>
                  We may terminate or suspend your account immediately, without prior notice or
                  liability, for any reason whatsoever, including without limitation if you breach
                  the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify or replace these Terms at any time. If a revision
                  is material, we will try to provide at least 30 days' notice prior to any new
                  terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">11. Contact Information</h2>
                <p>If you have any questions about these Terms, please contact us at:</p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> legal@thedasboard.com
                  </p>
                  <p>
                    <strong>Address:</strong> The DAS Board Legal Department
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
