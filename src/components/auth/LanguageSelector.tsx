import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import { Language } from '../../lib/translations';

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'cs' as Language, name: 'Čeština', flag: '🇨🇿' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl' as Language, name: 'Polski', flag: '🇵🇱' },
  { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
];

export default function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

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
