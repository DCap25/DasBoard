import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { ChevronDown, Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [isOpen]);

  return (
    <div className="relative z-[999999]">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen &&
        buttonRect &&
        createPortal(
          <div
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-48"
            style={{
              position: 'fixed',
              zIndex: 2147483647,
              top: buttonRect.bottom + 8,
              left: buttonRect.right - 192, // 192px = w-48
              transform: 'translateZ(0)',
              isolation: 'isolate',
              pointerEvents: 'auto',
            }}
          >
            <div className="py-1">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors flex items-center space-x-3 ${
                    language === lang.code ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}

      {/* Click outside to close */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0"
            style={{ zIndex: 2147483646 }}
            onClick={() => setIsOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}
