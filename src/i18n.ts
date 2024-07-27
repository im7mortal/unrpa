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
import ko from './locales/ko.json';
import vi from './locales/vi.json';
import ta from './locales/ta.json';
import th from './locales/th.json';
import fa from './locales/fa.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import ur from './locales/ur.json';
import gu from './locales/gu.json';
import ha from './locales/ha.json';

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources: {
            en: {translation: en},
            zh: {translation: zh},
            hi: {translation: hi},
            es: {translation: es},
            fr: {translation: fr},
            ar: {translation: ar},
            bn: {translation: bn},
            pt: {translation: pt},
            ru: {translation: ru},
            ja: {translation: ja},
            pa: {translation: pa},
            de: {translation: de},
            jv: {translation: jv},
            ms: {translation: ms},
            tr: {translation: tr},
            ko: {translation: ko},
            vi: {translation: vi},
            ta: {translation: ta},
            th: {translation: th},
            fa: {translation: fa},
            te: {translation: te},
            mr: {translation: mr},
            ur: {translation: ur},
            gu: {translation: gu},
            ha: {translation: ha},
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
