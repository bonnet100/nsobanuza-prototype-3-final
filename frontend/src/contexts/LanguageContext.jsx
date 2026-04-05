import { createContext, useContext, useMemo, useState } from 'react';
import en from '../i18n/en.json';
import kin from '../i18n/kin.json';
import fr from '../i18n/fr.json';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'nsobanuza_language';
const dictionaries = { en, kin, fr };

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return dictionaries[saved] ? saved : 'en';
  });

  const setLanguage = (value) => {
    if (!dictionaries[value]) return;
    localStorage.setItem(STORAGE_KEY, value);
    setLanguageState(value);
  };

  // All UI copy flows through this translator so the whole interface changes together.
  const value = useMemo(() => {
    const t = (key) => dictionaries[language]?.[key] || dictionaries.en[key] || key;
    const locale = language === 'kin' ? 'rw-RW' : language === 'fr' ? 'fr-FR' : 'en-US';

    return {
      language,
      setLanguage,
      t,
      formatDate: (dateValue) =>
        new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(dateValue)),
      formatDateTime: (dateValue) =>
        new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short'
        }).format(new Date(dateValue))
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
