import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import hi from './locales/hi.json';
import fr from './locales/fr.json';
import bn from './locales/bn.json';
import ja from './locales/ja.json';
import pa from './locales/pa.json';
import de from './locales/de.json';
import jv from './locales/jv.json';
import ms from './locales/ms.json';
import tr from './locales/tr.json';

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources: {
            en: { translation: en },
            zh: { translation: zh },
            hi: { translation: hi },
            es: { translation: es },
            fr: { translation: fr },
            ar: { translation: ar },
            bn: { translation: bn },
            pt: { translation: pt },
            ru: { translation: ru },
            ja: { translation: ja },
            pa: { translation: pa },
            de: { translation: de },
            jv: { translation: jv },
            ms: { translation: ms },
            tr: { translation: tr },
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
