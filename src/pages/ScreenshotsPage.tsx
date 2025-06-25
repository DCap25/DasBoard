import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ScreenshotsPage() {
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

      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Dashboard Screenshots
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our different dashboard solutions designed for various roles in your dealership
          </p>
        </div>

        {/* Dashboard Screenshots */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Finance Manager Dashboard */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] relative z-0">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Finance Manager Dashboard</h3>
            <div className="relative overflow-hidden rounded-lg border border-gray-600">
              <img
                src="/images/FINANCEMANAGER_DASH.JPG"
                alt="Finance Manager Dashboard"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <p className="text-gray-300 mt-4">
              Comprehensive financial tracking and deal management for finance managers.
            </p>
          </div>

          {/* Sales Manager Dashboard */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] relative z-0">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Sales Manager Dashboard</h3>
            <div className="relative overflow-hidden rounded-lg border border-gray-600">
              <img
                src="/images/SALESMANAGER_DASH.JPG"
                alt="Sales Manager Dashboard"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <p className="text-gray-300 mt-4">
              Team performance tracking and sales analytics for managers.
            </p>
          </div>

          {/* Salesperson Dashboard 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] relative z-0">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Salesperson Dashboard</h3>
            <div className="relative overflow-hidden rounded-lg border border-gray-600">
              <img
                src="/images/SALESPERSON_DASH1.JPG"
                alt="Salesperson Dashboard"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <p className="text-gray-300 mt-4">
              Individual performance tracking and goal management for sales staff.
            </p>
          </div>

          {/* Salesperson Dashboard 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-[1.01] relative z-0">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Advanced Salesperson View</h3>
            <div className="relative overflow-hidden rounded-lg border border-gray-600">
              <img
                src="/images/SALESPERSON_DASH_2.JPG"
                alt="Advanced Salesperson Dashboard"
                className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <p className="text-gray-300 mt-4">
              Enhanced analytics and detailed performance metrics for experienced sales
              professionals.
            </p>
          </div>
        </div>

        {/* Features Overview */}
        <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-8 text-blue-400">
            Key Dashboard Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h3>
              <p className="text-gray-300">Live performance tracking and metrics updates</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Deal Management</h3>
              <p className="text-gray-300">Comprehensive deal logging and tracking system</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Team Coordination</h3>
              <p className="text-gray-300">Dynamic scheduling and team management tools</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Pay Calculation</h3>
              <p className="text-gray-300">Real-time earnings tracking with pay plans</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Performance Insights</h3>
              <p className="text-gray-300">Detailed analytics for informed decision making</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Multi-role Support</h3>
              <p className="text-gray-300">Customized dashboards for different user roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience these powerful dashboards for yourself. Start your free trial today!
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            {t('home.cta.startTrial')}
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-8 py-3 rounded-md text-lg font-medium transition-all duration-300"
          >
            View Pricing
          </button>
        </div>
      </section>
    </div>
  );
}
