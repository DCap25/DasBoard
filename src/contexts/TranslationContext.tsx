import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation } from '../lib/translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string | string[];
  isLoading: boolean;
  availableLanguages: Language[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

// Available languages with metadata for better UX
const AVAILABLE_LANGUAGES: Language[] = [
  'en',
  'es',
  'fr',
  'de',
  'cs',
  'it',
  'pl',
  'pt',
  'nl',
  'gr',
];

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize client-side only (prevents hydration issues)
  useEffect(() => {
    setIsClient(true);
    setIsLoading(true);

    try {
      const savedLanguage = localStorage.getItem('app-language') as Language;
      if (savedLanguage && AVAILABLE_LANGUAGES.includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      } else {
        // Try to detect browser language
        if (typeof window !== 'undefined' && window.navigator) {
          const browserLang = window.navigator.language.split('-')[0] as Language;
          if (AVAILABLE_LANGUAGES.includes(browserLang)) {
            setLanguageState(browserLang);
            localStorage.setItem('app-language', browserLang);
          }
        }
      }
    } catch (error) {
      console.warn('Error loading language preference:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (!AVAILABLE_LANGUAGES.includes(lang)) {
      console.error(`Unsupported language: ${lang}`);
      return;
    }

    setLanguageState(lang);
    if (isClient) {
      try {
        localStorage.setItem('app-language', lang);
      } catch (error) {
        console.warn('Error saving language preference:', error);
      }
    }
  };

  const t = (key: string): string | string[] => {
    if (!key) {
      console.warn('Translation key is empty');
      return '';
    }

    try {
      const result = getTranslation(language, key);
      if (typeof result === 'string' || Array.isArray(result)) {
        return result;
      }
      return String(result);
    } catch (error) {
      console.error(`Error getting translation for key "${key}":`, error);
      return key;
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isLoading,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Helper hook for type-safe translation keys (optional - for better DX)
export function useTypedTranslation() {
  const { t, ...rest } = useTranslation();

  // Type-safe translation function with autocomplete support
  const typedT = <T extends string>(key: T): string | string[] => {
    return t(key);
  };

  return { t: typedT, ...rest };
}

export type { Language };
