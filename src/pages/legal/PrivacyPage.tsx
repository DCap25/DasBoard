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
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>Last Updated:</strong> 6/28/2025
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <p>
                  This Privacy Policy describes how The DAS Board ("we," "us," or "our") collects,
                  uses, and protects your personal information when you use our dealership
                  management software platform. We are committed to protecting your privacy and
                  handling your data responsibly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p className="mb-4">
                  When you use The DAS Board, we collect several types of information to provide and
                  improve our services:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Account Information:</strong> Name, email address, phone number, company
                    name, job title, and billing information
                  </li>
                  <li>
                    <strong>Dealership Data:</strong> Vehicle inventory, sales records, customer
                    information, and financial transactions
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Features accessed, time spent on platform, user
                    interactions, and performance metrics
                  </li>
                  <li>
                    <strong>Technical Data:</strong> IP address, browser type, device information,
                    operating system, and access logs
                  </li>
                  <li>
                    <strong>Communication Data:</strong> Support requests, feedback, and
                    correspondence with our team
                  </li>
                  <li>
                    <strong>Location Data:</strong> Dealership addresses and, with consent, device
                    location for mobile features
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="mb-4">
                  We use the collected information for legitimate business purposes, including:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>Providing, maintaining, and improving The DAS Board platform and features</li>
                  <li>Processing subscriptions, payments, and managing your account</li>
                  <li>Generating analytics, reports, and business insights for your dealership</li>
                  <li>Providing customer support and responding to your inquiries</li>
                  <li>Sending service updates, security alerts, and administrative messages</li>
                  <li>
                    Detecting, preventing, and addressing technical issues and security threats
                  </li>
                  <li>Complying with legal obligations and industry regulations</li>
                  <li>Improving user experience through product development and research</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  3. Sharing Your Information
                </h2>
                <p className="mb-4">
                  We do not sell, rent, or trade your personal information. We may share your
                  information only in the following circumstances:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Service Providers:</strong> Third-party vendors who help us operate our
                    platform (hosting, analytics, payment processing)
                  </li>
                  <li>
                    <strong>Business Partners:</strong> Authorized integrations and automotive
                    industry partners with your explicit consent
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law, regulation, or valid
                    legal process
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with mergers, acquisitions,
                    or asset sales (with notice to you)
                  </li>
                  <li>
                    <strong>Safety and Security:</strong> To protect the rights, property, or safety
                    of our users or the public
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Data Retention</h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary to provide our
                  services and comply with legal obligations. Specifically:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>
                    Account data is retained while your subscription is active and for 3 years after
                    termination
                  </li>
                  <li>
                    Transaction records are kept for 7 years to comply with financial regulations
                  </li>
                  <li>Usage logs are retained for 2 years for security and performance analysis</li>
                  <li>Communication records are kept for 5 years for customer service purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  5. Your Rights and Choices
                </h2>
                <p className="mb-4">
                  Depending on your location, you may have the following rights regarding your
                  personal information:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal information we hold
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate personal information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal information
                    (subject to legal obligations)
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a machine-readable format
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit how we process your personal information
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing based on legitimate interests
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  6. Cookies and Tracking Technologies
                </h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for platform functionality and
                    security
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how you use our platform
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and customizations
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Used for targeted communications (with your
                    consent)
                  </li>
                </ul>

                <p className="mt-4">
                  You can control cookie preferences through your browser settings or our cookie
                  management tool.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Security Measures</h2>
                <p className="mb-4">
                  We implement industry-standard security measures to protect your information,
                  including:
                </p>

                <ul className="list-disc list-inside space-y-2">
                  <li>Encryption of data in transit and at rest using AES-256 standards</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Multi-factor authentication and access controls</li>
                  <li>SOC 2 Type II compliance and regular security assessments</li>
                  <li>Employee training on data protection and security best practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. International Data Transfers
                </h2>
                <p>
                  Your information may be transferred to and processed in countries other than your
                  own. We ensure appropriate safeguards are in place, including Standard Contractual
                  Clauses and adequacy decisions, to protect your data during international
                  transfers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                <p>
                  The DAS Board is not intended for use by individuals under 18 years of age. We do
                  not knowingly collect personal information from children under 18. If we become
                  aware of such collection, we will delete the information promptly.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  10. Changes to This Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy periodically to reflect changes in our practices
                  or legal requirements. We will notify you of significant changes via email or
                  platform notification at least 30 days before they take effect.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">11. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your rights,
                  please contact us:
                </p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> privacy@thedasboard.com
                  </p>
                  <p>
                    <strong>Address:</strong> [Company Address]
                  </p>
                  <p>
                    <strong>Phone:</strong> [Support Phone Number]
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
