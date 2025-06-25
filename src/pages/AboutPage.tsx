import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const teamMembers = [
    {
      name: t('about.team.members.tyler.name') as string,
      role: t('about.team.members.tyler.role') as string,
      bio: t('about.team.members.tyler.bio') as string,
    },
    {
      name: t('about.team.members.sarah.name') as string,
      role: t('about.team.members.sarah.role') as string,
      bio: t('about.team.members.sarah.bio') as string,
    },
    {
      name: t('about.team.members.claude.name') as string,
      role: t('about.team.members.claude.role') as string,
      bio: t('about.team.members.claude.bio') as string,
    },
    {
      name: t('about.team.members.annie.name') as string,
      role: t('about.team.members.annie.role') as string,
      bio: t('about.team.members.annie.bio') as string,
    },
  ];

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
            {t('about.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('about.subtitle')}</p>
        </div>

        {/* Founder's Vision */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            {t('about.founderVision.title')}
          </h2>
          <p className="text-gray-300 text-lg mb-4">{t('about.founderVision.paragraph1')}</p>
          <p className="text-gray-300 text-lg mb-4">{t('about.founderVision.paragraph2')}</p>
          <p className="text-gray-300 text-lg">{t('about.founderVision.paragraph3')}</p>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {t('about.team.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 flex gap-4 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-400/30">
                  <span className="text-2xl text-blue-400">
                    {member.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-blue-400 mb-2">{member.role}</p>
                  <p className="text-gray-300">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Values */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {t('about.values.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: t('about.values.customerFocused.title') as string,
                description: t('about.values.customerFocused.description') as string,
              },
              {
                title: t('about.values.dataDriven.title') as string,
                description: t('about.values.dataDriven.description') as string,
              },
              {
                title: t('about.values.continuousImprovement.title') as string,
                description: t('about.values.continuousImprovement.description') as string,
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
              >
                <h3 className="text-xl font-semibold mb-3 text-blue-400">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto bg-gray-800/30 mt-16 border-t border-b border-blue-400/20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            {t('about.contact.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">{t('about.contact.subtitle')}</p>
          <div className="space-y-4">
            <p className="text-gray-300">
              <span className="font-bold">{t('about.contact.email')}</span>{' '}
              <a
                href="mailto:contact@thedasboard.com"
                className="text-blue-400 hover:underline transition-colors duration-300"
              >
                contact@thedasboard.com
              </a>
            </p>
            <p className="text-gray-300">
              <span className="font-bold">{t('about.contact.phone')}</span> (555) 123-4567
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-8 py-3 rounded-md text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            >
              {t('home.cta.startTrial')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
