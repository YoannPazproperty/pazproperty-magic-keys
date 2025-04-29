
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/translations';

// Types de langues disponibles
export type Language = 'pt' | 'fr' | 'en';

// Type pour le contexte de langue
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Création du contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte de langue
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage doit être utilisé à l'intérieur d'un LanguageProvider');
  }
  return context;
};

// Props pour le Provider
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider de langue
export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Récupération de la langue préférée depuis localStorage ou utilisation du portugais par défaut
  const [language, setLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    return storedLanguage || 'pt';
  });

  // Fonction de traduction qui retourne le texte correspondant à la clé dans la langue actuelle
  const t = (key: string): string => {
    const langData = translations[language] || {};
    return langData[key] || translations.pt[key] || key;
  };

  // Enregistrement de la langue dans localStorage lors du changement
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
