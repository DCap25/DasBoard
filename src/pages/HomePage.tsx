// React import removed as it's not needed in modern React
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Users,
  Target,
  Calendar,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: BarChart3,
      title: t('features.finance.title'),
      description: t('features.finance.desc'),
    },
    {
      icon: TrendingUp,
      title: t('features.sales.title'),
      description: t('features.sales.desc'),
    },
    {
      icon: Users,
      title: t('features.manager.title'),
      description: t('features.manager.desc'),
    },
    {
      icon: Target,
      title: t('features.info.title'),
      description: t('features.info.desc'),
    },
    {
      icon: Calendar,
      title: t('features.scheduler.title'),
      description: t('features.scheduler.desc'),
    },
    {
      icon: Calculator,
      title: t('features.calculator.title'),
      description: t('features.calculator.desc'),
    },
  ];

  const pricingTiers = [
    {
      name: t('pricing.tiers.finance.name'),
      price: t('pricing.tiers.finance.price'),
      originalPrice: t('pricing.tiers.finance.originalPrice'),
      description: t('pricing.tiers.finance.description'),
      popular: true,
    },
    {
      name: t('pricing.tiers.dealership.name'),
      price: t('pricing.tiers.dealership.price'),
      description: t('pricing.tiers.dealership.description'),
      popular: false,
    },
    {
      name: t('pricing.tiers.group.name'),
      price: t('pricing.tiers.group.price'),
      description: t('pricing.tiers.group.description'),
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">The DAS Board</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => navigate('/screenshots')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.screenshots')}
              </button>
              <button
                onClick={() => navigate('/pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.pricing')}
              </button>
              <button
                onClick={() => navigate('/about')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.about')}
              </button>
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/auth')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('nav.login')}
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t('nav.signup')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">The </span>
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  DAS Board
                </span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">{t('home.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
                >
                  {t('home.startTrial')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/screenshots')}
                  className="border border-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  {t('home.viewScreenshots')}
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">The DAS Board Finance Manager Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-medium text-gray-200 leading-relaxed italic">
            {t('home.mission')}
          </p>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.features.title')}</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.pricing.title')}</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-gray-800 rounded-xl p-8 border transition-all duration-300 hover:shadow-xl ${
                  tier.popular
                    ? 'border-blue-500 shadow-xl shadow-blue-500/20'
                    : 'border-gray-700 hover:border-blue-500'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {t('pricing.popular')}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    {tier.originalPrice && (
                      <span className="text-red-400 line-through text-lg mr-2">
                        {(() => {
                          const currency = t('currency.symbol') as string;
                          const price = tier.originalPrice;
                          if (price.includes('$') && currency !== '$') {
                            return price.replace('$', currency);
                          }
                          return price;
                        })()}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-blue-400">
                      {(() => {
                        const currency = t('currency.symbol') as string;
                        const price = tier.price;
                        if (price.includes('$') && currency !== '$') {
                          return price.replace('$', currency);
                        }
                        return price;
                      })()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-8">{tier.description}</p>
                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      tier.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {t('pricing.getStarted')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/pricing')}
              className="text-blue-400 hover:text-blue-300 font-medium text-lg underline"
            >
              View Full Pricing Details →
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t('home.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8">{t('home.cta.subtitle')}</p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 inline-flex items-center"
          >
            {t('home.startTrial')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">The DAS Board</h3>
              <p className="text-gray-400 mb-4">{t('footer.tagline')}</p>
              <p className="text-gray-400">{t('footer.industry')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.home')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/screenshots')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.screenshots')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.pricing')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/about')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.aboutUs')}
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/legal/terms')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.terms')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/legal/privacy')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.privacy')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/legal/subscription')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t('footer.subscription')}
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">{t('footer.contact')}</h4>
              <p className="text-gray-400 mb-2">{t('footer.support')}</p>
              <p className="text-blue-400">support@thedasboard.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
