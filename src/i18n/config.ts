import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

i18n
  .use(LanguageDetector) 
  .use(initReactI18next) 
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      fr: {
        translation: frTranslations,
      },
    },
    fallbackLng: 'fr',
    lng: localStorage.getItem('app_language') || 'fr', 
    debug: false,
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app_language',
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app_language', lng);
});

export default i18n;
