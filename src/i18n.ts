import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import ru from './locales/ru.json';

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources: {
            en: {translation: en},
            es: {translation: es},
            ru: {translation: ru},
        },
        fallbackLng: {
            'default': ['en'],
            'ru': ['en'],
        },
        interpolation: {
            escapeValue: false, // React already does escaping
        },
    });

export default i18n;
