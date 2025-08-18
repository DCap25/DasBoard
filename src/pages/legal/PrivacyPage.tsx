// React import removed as it's not needed in modern React
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { SafeText, SafeHtml } from '../../lib/security/safeRendering';

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
              <strong>{t('legal.privacy.lastUpdated')}</strong>
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <p>{t('legal.privacy.intro')}</p>
              </section>

              {/* Information Collection */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.collection.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.collection.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.collection.items') as string[]).map((item, index) => (
                    <li key={index}>
                      <SafeHtml
                        html={item}
                        allowedTags={['strong', 'em', 'code', 'a']}
                        allowedAttributes={['href', 'target', 'rel']}
                        maxLength={500}
                        fallback={<SafeText>{item}</SafeText>}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Information Usage */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.usage.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.usage.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.usage.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.sharing.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.sharing.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.sharing.items') as string[]).map((item, index) => (
                    <li key={index}>
                      <SafeHtml
                        html={item}
                        allowedTags={['strong', 'em', 'code', 'a']}
                        allowedAttributes={['href', 'target', 'rel']}
                        maxLength={500}
                        fallback={<SafeText>{item}</SafeText>}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.retention.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.retention.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.retention.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Rights and Choices */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.rights.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.rights.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.rights.items') as string[]).map((item, index) => (
                    <li key={index}>
                      <SafeHtml
                        html={item}
                        allowedTags={['strong', 'em', 'code', 'a']}
                        allowedAttributes={['href', 'target', 'rel']}
                        maxLength={500}
                        fallback={<SafeText>{item}</SafeText>}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.cookies.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.cookies.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.cookies.items') as string[]).map((item, index) => (
                    <li key={index}>
                      <SafeHtml
                        html={item}
                        allowedTags={['strong', 'em', 'code', 'a']}
                        allowedAttributes={['href', 'target', 'rel']}
                        maxLength={500}
                        fallback={<SafeText>{item}</SafeText>}
                      />
                    </li>
                  ))}
                </ul>
                <p className="mt-4">{t('legal.privacy.sections.cookies.footer')}</p>
              </section>

              {/* Security */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.security.title')}
                </h2>
                <p className="mb-4">{t('legal.privacy.sections.security.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.privacy.sections.security.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* International */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.international.title')}
                </h2>
                <p>{t('legal.privacy.sections.international.content')}</p>
              </section>

              {/* Children */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.children.title')}
                </h2>
                <p>{t('legal.privacy.sections.children.content')}</p>
              </section>

              {/* Changes */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.changes.title')}
                </h2>
                <p>{t('legal.privacy.sections.changes.content')}</p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.privacy.sections.contact.title')}
                </h2>
                <p>{t('legal.privacy.sections.contact.content')}</p>
                <div className="mt-2 bg-gray-700/50 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> {t('legal.privacy.sections.contact.email')}
                  </p>
                  <p>
                    <strong>Address:</strong> {t('legal.privacy.sections.contact.address')}
                  </p>
                  <p>
                    <strong>Phone:</strong> {t('legal.privacy.sections.contact.phone')}
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
