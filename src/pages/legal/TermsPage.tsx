// React import removed as it's not needed in modern React
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
              <strong>{t('legal.terms.lastUpdated')}</strong>
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <p>{t('legal.terms.intro')}</p>
              </section>

              {/* Acceptance */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.acceptance.title')}
                </h2>
                <p>{t('legal.terms.sections.acceptance.content')}</p>
              </section>

              {/* Service */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.service.title')}
                </h2>
                <p>{t('legal.terms.sections.service.content')}</p>
              </section>

              {/* Account */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.account.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.account.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.account.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Subscription */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.subscription.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.subscription.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.subscription.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Usage */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.usage.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.usage.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.usage.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Intellectual */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.intellectual.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.intellectual.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.intellectual.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className="mt-4">{t('legal.terms.sections.intellectual.footer')}</p>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.privacy.title')}
                </h2>
                <p>{t('legal.terms.sections.privacy.content')}</p>
              </section>

              {/* Availability */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.availability.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.availability.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.availability.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.termination.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.termination.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.termination.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Disclaimers */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.disclaimers.title')}
                </h2>
                <p className="mb-4">{t('legal.terms.sections.disclaimers.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.terms.sections.disclaimers.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.indemnification.title')}
                </h2>
                <p>{t('legal.terms.sections.indemnification.content')}</p>
              </section>

              {/* Governing */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.governing.title')}
                </h2>
                <p>{t('legal.terms.sections.governing.content')}</p>
              </section>

              {/* Changes */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.changes.title')}
                </h2>
                <p>{t('legal.terms.sections.changes.content')}</p>
              </section>

              {/* Entire */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.entire.title')}
                </h2>
                <p>{t('legal.terms.sections.entire.content')}</p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.terms.sections.contact.title')}
                </h2>
                <p>{t('legal.terms.sections.contact.content')}</p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {t('legal.terms.sections.contact.email')}
                  </p>
                  <p>
                    <strong>Address:</strong> {t('legal.terms.sections.contact.address')}
                  </p>
                  <p>
                    <strong>Phone:</strong> {t('legal.terms.sections.contact.phone')}
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
