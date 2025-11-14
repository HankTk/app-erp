import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { en } from './locales/en';
import { ja } from './locales/ja';

export type Language = 'en' | 'ja';

interface I18nContextType {
  language: Language;
  t: (key: string) => string;
  l10n: (key: string) => string;
  setLanguage: (language: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  storageKey?: string;
}

const translations: Record<Language, Record<string, string>> = {
  en,
  ja,
};

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  storageKey = 'ui-language',
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey) as Language | null;
      if (stored === 'en' || stored === 'ja') {
        return stored;
      }
      // Check browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'ja') {
        return 'ja';
      }
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(storageKey, language);
  }, [language, storageKey]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // l10n is an alias for t
  const l10n = t;

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  return (
    <I18nContext.Provider value={{ language, t, l10n, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Short alias for translation function
export const useT = (): ((key: string) => string) => {
  const { t } = useI18n();
  return t;
};

// Short alias for l10n function
export const useL10n = (): ((key: string) => string) => {
  const { l10n } = useI18n();
  return l10n;
};

// Component wrapper for concise translation
interface I18NProps {
  l10n: string;
}

export const I18N: React.FC<I18NProps> = ({ l10n }) => {
  const { t } = useI18n();
  return <>{t(l10n)}</>;
};

