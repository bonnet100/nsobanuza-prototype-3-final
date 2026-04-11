import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../data/en.json';
import fr from '../data/fr.json';
import rw from '../data/rw.json';
import sw from '../data/sw.json';

const LanguageContext = createContext();

const translations = { en, fr, rw, sw };
const defaultLanguage = 'en';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    const saved = localStorage.getItem('nsobanuza_language');
    if (saved && translations[saved]) {
      setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nsobanuza_language', language);
  }, [language]);

  const t = useMemo(() => {
    return (key) => translations[language]?.[key] || translations.en[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
