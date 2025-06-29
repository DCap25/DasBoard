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
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>Last Updated:</strong> 6/28/2025
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <p>
                  Welcome to The DAS Board. These Terms of Service ("Terms") govern your access to
                  and use of our dealership management software platform. By accessing or using our
                  services, you agree to be bound by these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By creating an account, accessing, or using The DAS Board, you acknowledge that
                  you have read, understood, and agree to be bound by these Terms and our Privacy
                  Policy. If you do not agree to these Terms, you may not use our services. You must
                  be at least 18 years old and have the authority to enter into these Terms on
                  behalf of your organization.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
                <p>
                  The DAS Board is a cloud-based dealership management software platform that
                  provides tools for inventory management, sales tracking, customer relationship
                  management, financial reporting, and related automotive industry services. We
                  reserve the right to modify, suspend, or discontinue any aspect of our service
                  with reasonable notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  3. Account Registration and Security
                </h2>
                <p className="mb-4">
                  To use our services, you must create an account with accurate and complete
                  information. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information remains current and accurate</li>
                  <li>Complying with our security requirements and best practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  4. Subscription and Payment Terms
                </h2>
                <p className="mb-4">
                  The DAS Board operates on a subscription basis. By subscribing, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Pay all fees associated with your subscription plan</li>
                  <li>Automatic renewal unless cancelled before the renewal date</li>
                  <li>Fee changes with 30 days' advance notice</li>
                  <li>No refunds for partial subscription periods</li>
                  <li>Suspension of service for non-payment after reasonable notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Acceptable Use Policy</h2>
                <p className="mb-4">
                  You agree to use The DAS Board only for lawful purposes and in accordance with
                  these Terms. You may not:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Violate any applicable laws, regulations, or third-party rights</li>
                  <li>Upload harmful, offensive, or inappropriate content</li>
                  <li>
                    Attempt to gain unauthorized access to our systems or other users' accounts
                  </li>
                  <li>Use the service to send spam, malware, or other malicious content</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code</li>
                  <li>Interfere with or disrupt the integrity or performance of our services</li>
                  <li>Use the platform for any fraudulent or illegal activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  6. Intellectual Property Rights
                </h2>
                <p className="mb-4">
                  The DAS Board and all related technology, content, and materials are owned by us
                  or our licensors. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Software, algorithms, and user interfaces</li>
                  <li>Trademarks, logos, and branding materials</li>
                  <li>Documentation, tutorials, and support materials</li>
                  <li>Analytics, reports, and aggregated data insights</li>
                </ul>
                <p className="mt-4">
                  You retain ownership of your data but grant us a license to use it to provide our
                  services. We may use anonymized, aggregated data for industry research and
                  platform improvement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  7. Data Protection and Privacy
                </h2>
                <p>
                  You are responsible for ensuring that any personal data you process through our
                  platform complies with applicable privacy laws. We will process data in accordance
                  with our Privacy Policy and applicable data protection regulations, including GDPR
                  and CCPA where applicable.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  8. Service Availability and Support
                </h2>
                <p className="mb-4">
                  While we strive for high availability, we do not guarantee uninterrupted service.
                  We provide:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>99.9% uptime SLA for paid subscriptions</li>
                  <li>Regular maintenance windows with advance notice</li>
                  <li>Technical support based on your subscription level</li>
                  <li>Security monitoring and incident response</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">9. Termination</h2>
                <p className="mb-4">Either party may terminate these Terms:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    You may cancel your subscription at any time through your account settings
                  </li>
                  <li>We may terminate for breach of these Terms with reasonable notice</li>
                  <li>
                    We may suspend service immediately for serious violations or security threats
                  </li>
                  <li>Upon termination, you will lose access to the platform and your data</li>
                  <li>
                    We will provide a reasonable opportunity to export your data before deletion
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  10. Disclaimers and Limitations of Liability
                </h2>
                <p className="mb-4">
                  THE DAS BOARD IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM
                  EXTENT PERMITTED BY LAW:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    We disclaim all warranties, express or implied, including merchantability and
                    fitness for a particular purpose
                  </li>
                  <li>
                    We are not liable for indirect, incidental, special, or consequential damages
                  </li>
                  <li>
                    Our total liability shall not exceed the fees paid by you in the 12 months
                    preceding the claim
                  </li>
                  <li>
                    You acknowledge that software may contain bugs and agree to report them promptly
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">11. Indemnification</h2>
                <p>
                  You agree to indemnify and hold us harmless from any claims, losses, or damages
                  arising from your use of our services, violation of these Terms, or infringement
                  of any third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  12. Governing Law and Dispute Resolution
                </h2>
                <p>
                  These Terms are governed by the laws of [Jurisdiction] without regard to conflict
                  of law principles. Any disputes will be resolved through binding arbitration,
                  except for injunctive relief claims which may be brought in appropriate courts.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">13. Changes to Terms</h2>
                <p>
                  We may modify these Terms from time to time. We will provide notice of material
                  changes at least 30 days in advance. Continued use of our services after changes
                  take effect constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">14. Entire Agreement</h2>
                <p>
                  These Terms, together with our Privacy Policy and any additional agreements,
                  constitute the entire agreement between you and The DAS Board regarding your use
                  of our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">15. Contact Information</h2>
                <p>If you have questions about these Terms, please contact us:</p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> legal@thedasboard.com
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
