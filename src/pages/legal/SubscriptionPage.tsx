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
            <h1 className="text-3xl font-bold text-white">{t('legal.subscription.title')}</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-sm mb-8">
              <strong>{t('legal.subscription.lastUpdated')}</strong>
            </p>

            <div className="space-y-8 text-gray-300">
              <section>
                <p>{t('legal.subscription.intro')}</p>
              </section>

              {/* Subscription Plans */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.plans.title')}
                </h2>
                <p className="mb-4">{t('legal.subscription.sections.plans.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.subscription.sections.plans.items') as string[]).map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
                <p className="mt-4">{t('legal.subscription.sections.plans.footer')}</p>
              </section>

              {/* Payment Terms */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.payment.title')}
                </h2>
                <p>{t('legal.subscription.sections.payment.content')}</p>
              </section>

              {/* Trial Period */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.trial.title')}
                </h2>
                <p>{t('legal.subscription.sections.trial.content')}</p>
              </section>

              {/* Cancellation */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.cancellation.title')}
                </h2>
                <p className="mb-4">{t('legal.subscription.sections.cancellation.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.subscription.sections.cancellation.items') as string[]).map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </section>

              {/* Service Level Agreement */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.sla.title')}
                </h2>
                <p className="mb-4">{t('legal.subscription.sections.sla.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.subscription.sections.sla.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Data and Security */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.data.title')}
                </h2>
                <p className="mb-4">{t('legal.subscription.sections.data.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.subscription.sections.data.items') as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {/* Support and Training */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.support.title')}
                </h2>
                <p className="mb-4">{t('legal.subscription.sections.support.content')}</p>
                <ul className="list-disc list-inside space-y-2">
                  {(t('legal.subscription.sections.support.items') as string[]).map(
                    (item, index) => (
                      <li key={index}>{item}</li>
                    )
                  )}
                </ul>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {t('legal.subscription.sections.modifications.title')}
                </h2>
                <p>{t('legal.subscription.sections.modifications.content')}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
