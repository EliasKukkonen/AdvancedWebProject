import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

//Language component for the translation

i18n
.use(HttpBackend)            
.use(LanguageDetector)  
  .use(initReactI18next) 
  .init({
    fallbackLng: 'en',
    debug: false, 
    interpolation: {
      escapeValue: false, 
    },
    backend: {
      // path where language translations are loaded from.
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;