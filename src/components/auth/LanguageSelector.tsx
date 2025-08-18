import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { Language } from '../../lib/translations';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'cs' as Language, name: 'Čeština', flag: '🇨🇿' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl' as Language, name: 'Polski', flag: '🇵🇱' },
  { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
  { code: 'gr' as Language, name: 'Ελληνικά', flag: '🇬🇷' },
];

interface LanguageSelectorProps {
  variant?: 'nav' | 'form' | 'compact';
  className?: string;
}

export default function LanguageSelector({
  variant = 'nav',
  className = '',
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useTranslation();

  if (variant === 'compact') {
    const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

    return (
      <div className={`relative ${className}`}>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as Language)}
          className="appearance-none bg-transparent border-none text-gray-500 text-xs cursor-pointer hover:text-gray-400 focus:outline-none focus:text-gray-300 pr-3"
          title="Select Language"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-gray-800 text-white text-sm">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
          <span className="text-gray-600 text-[10px]">▼</span>
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          {t('signup.form.language') || 'Preferred Language'}
        </label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as Language)}
          className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code} className="bg-gray-700 text-white">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <p className="text-gray-400 text-xs">
          {t('signup.form.languageNote') || 'This will be your default language for the dashboard'}
        </p>
      </div>
    );
  }

  // Original nav variant
  return (
    <div className="relative">
      <select
        value={language}
        onChange={e => setLanguage(e.target.value as Language)}
        className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-gray-400 transition-colors"
        aria-label={t('common.language') as string}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
