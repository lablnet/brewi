import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, TextDirection, LanguageOption, Translations, SUPPORTED_LANGUAGES } from './types';
import { en } from './locales/en';
import { de } from './locales/de';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { ur } from './locales/ur';
import { STORAGE_KEYS } from '../utils/constants';

export const LOCALES: Record<LanguageCode, Translations> = {
  en,
  de,
  fr,
  es,
  ur,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  dir: TextDirection;
  isRTL: boolean;
  t: Translations;
  languages: LanguageOption[];
}

const DEFAULT_LANGUAGE: LanguageCode = 'en';

const defaultContextValue: LanguageContextType = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  dir: 'ltr',
  isRTL: false,
  t: en,
  languages: SUPPORTED_LANGUAGES,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as LanguageCode | null;
    if (saved && LOCALES[saved]) {
      return saved;
    }
    // Check browser language preferences if available
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.slice(0, 2).toLowerCase() as LanguageCode;
      if (LOCALES[browserLang]) {
        return browserLang;
      }
    }
    return DEFAULT_LANGUAGE;
  });

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const dir: TextDirection = currentOption.dir;
  const isRTL = dir === 'rtl';

  const setLanguage = (lang: LanguageCode) => {
    if (LOCALES[lang]) {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
      document.documentElement.setAttribute('data-direction', dir);
      if (isRTL) {
        document.body.classList.add('rtl-layout');
      } else {
        document.body.classList.remove('rtl-layout');
      }
    }
  }, [language, dir, isRTL]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    dir,
    isRTL,
    t: LOCALES[language] || LOCALES.en,
    languages: SUPPORTED_LANGUAGES,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  return context || defaultContextValue;
};
