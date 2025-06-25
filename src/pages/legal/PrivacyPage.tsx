import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function PrivacyPage() {
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
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">{t('legal.privacy.title')}</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>Effective Date:</strong> January 1, 2025
              <br />
              <strong>Last Updated:</strong> January 1, 2025
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you create an
                  account, use our services, or contact us for support.
                </p>

                <h3 className="text-lg font-medium text-white mt-4 mb-2">Personal Information:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Account credentials and profile information</li>
                  <li>Dealership information and organizational details</li>
                  <li>Payment and billing information</li>
                </ul>

                <h3 className="text-lg font-medium text-white mt-4 mb-2">Usage Information:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Log data and device information</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Performance metrics and analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third
                  parties without your consent, except as described in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who assist in our
                    operations
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our
                    rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with mergers or acquisitions
                  </li>
                  <li>
                    <strong>Consent:</strong> When you have given us explicit permission
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your
                  personal information against unauthorized access, alteration, disclosure, or
                  destruction. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Encryption in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Data Retention</h2>
                <p>
                  We retain your personal information for as long as necessary to provide our
                  services, comply with legal obligations, resolve disputes, and enforce our
                  agreements. Specific retention periods vary based on:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>The type of information and its purpose</li>
                  <li>Legal and regulatory requirements</li>
                  <li>Your relationship with our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
                <p>
                  Depending on your location, you may have certain rights regarding your personal
                  information:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>
                    <strong>Access:</strong> Request information about the data we hold
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct your personal information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request a copy of your data in a portable format
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to certain processing activities
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience,
                  analyze usage patterns, and provide personalized content. You can control cookie
                  preferences through your browser settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. International Transfers
                </h2>
                <p>
                  Your information may be transferred to and processed in countries other than your
                  own. We ensure appropriate safeguards are in place to protect your information
                  during such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13 years of age. We do not
                  knowingly collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  10. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any
                  changes by posting the new policy on this page and updating the "Last Updated"
                  date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> privacy@thedasboard.com
                  </p>
                  <p>
                    <strong>Address:</strong> The DAS Board Privacy Department
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
