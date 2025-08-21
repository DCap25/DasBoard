import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Users,
  Target,
  Calendar,
  Calculator,
  TrendingUp,
  User,
  Building2,
  Check,
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Dashboard images for slideshow
  const dashboardImages = [
    {
      src: '/images/SPDASH.JPG',
      title: 'Sales Dashboard',
      description: 'Track sales performance and metrics'
    },
    {
      src: '/images/FINANCEMNG_DASH.JPG',
      title: 'Finance Manager Dashboard',
      description: 'Manage finance operations and deals'
    },
    {
      src: '/images/SALESMNG_DASH.JPG',
      title: 'Sales Manager Dashboard',
      description: 'Oversee sales team performance'
    },
    {
      src: '/images/GMDASH.JPG',
      title: 'General Manager Dashboard',
      description: 'Complete dealership overview'
    }
  ];

  // Slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance slideshow every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % dashboardImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [dashboardImages.length]);

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
      name: t('home.pricingTiers.singleFinance.name'),
      price: t('home.pricingTiers.singleFinance.price'),
      description: t('home.pricingTiers.singleFinance.description'),
      popular: false,
      icon: User,
      features: t('home.pricingTiers.singleFinance.features') as string[],
    },
    {
      name: t('home.pricingTiers.dealership.name'),
      price: t('home.pricingTiers.dealership.price'),
      description: t('home.pricingTiers.dealership.description'),
      popular: true,
      icon: Building2,
      features: t('home.pricingTiers.dealership.features') as string[],
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
                onClick={() => navigate('/demo')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Demo
              </button>
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
                <div className="aspect-video rounded-lg overflow-hidden relative">
                  <img
                    src={dashboardImages[currentImageIndex].src}
                    alt={`The DAS Board ${dashboardImages[currentImageIndex].title}`}
                    className="w-full h-full object-cover transition-opacity duration-1000"
                    key={currentImageIndex}
                  />
                </div>
                <div className="text-center mt-4">
                  <p className="text-gray-300 text-lg font-semibold">
                    {dashboardImages[currentImageIndex].title}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {dashboardImages[currentImageIndex].description}
                  </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <div
                  key={index}
                  className={`relative bg-gray-800 rounded-xl p-8 border transition-all duration-300 hover:shadow-xl ${
                    tier.popular
                      ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/20'
                      : 'border-gray-700 hover:border-blue-500'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {t('home.pricingTiers.dealership.popular')}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{tier.name}</h3>
                    <p className="text-gray-400 mb-6">{tier.description}</p>
                    <div className="mb-2">
                      {!tier.popular && t('home.pricingTiers.singleFinance.originalPrice') && (
                        <div className="text-lg text-gray-500 line-through mb-1">
                          {t('home.pricingTiers.singleFinance.originalPrice')}
                        </div>
                      )}
                      <div className="text-3xl font-bold text-blue-400">{tier.price}</div>
                    </div>
                    {tier.popular && (
                      <div className="text-sm text-gray-500">
                        {t('home.pricingTiers.priceSubtext')}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/pricing')}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center ${
                      tier.popular
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {tier.popular
                      ? t('home.pricingTiers.dealership.buttonText')
                      : t('home.pricingTiers.singleFinance.buttonText')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>

                  <div className="mt-4 text-center text-sm text-gray-400">
                    {tier.popular
                      ? t('home.pricingTiers.dealership.setupTime')
                      : t('home.pricingTiers.singleFinance.setupTime')}
                  </div>
                </div>
              );
            })}
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
