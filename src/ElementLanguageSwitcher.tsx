import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';

const ElementLanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        console.log(lng);
        i18n.changeLanguage(lng);
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                🌐 Language
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item data-testid="lang-hi" onClick={() => changeLanguage('hi')}>🍶 हिंदी</Dropdown.Item>
                <Dropdown.Item data-testid="lang-bn" onClick={() => changeLanguage('bn')}>🥦 বাংলা</Dropdown.Item>
                <Dropdown.Item data-testid="lang-te" onClick={() => changeLanguage('te')}>🧄 తెలుగు</Dropdown.Item>
                <Dropdown.Item data-testid="lang-mr" onClick={() => changeLanguage('mr')}>🍋 मराठी</Dropdown.Item>
                <Dropdown.Item data-testid="lang-gu" onClick={() => changeLanguage('gu')}>🍬 ગુજરાતી</Dropdown.Item>
                <Dropdown.Item data-testid="lang-pa" onClick={() => changeLanguage('pa')}>🥕 ਪੰਜਾਬੀ</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ta" onClick={() => changeLanguage('ta')}>🍛 தமிழ்</Dropdown.Item>
                <Dropdown.Item data-testid="lang-th" onClick={() => changeLanguage('th')}>🍲 ไทย</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ur" onClick={() => changeLanguage('ur')}>🍛 اردو</Dropdown.Item>
                <Dropdown.Item data-testid="lang-fa" onClick={() => changeLanguage('fa')}>🍉 فارسی</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ar" onClick={() => changeLanguage('ar')}>🌡 العربية</Dropdown.Item>
                <Dropdown.Item data-testid="lang-zh" onClick={() => changeLanguage('zh')}>🥢 中文</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ja" onClick={() => changeLanguage('ja')}>🍣 日本語</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ko" onClick={() => changeLanguage('ko')}>🍚 한국어</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ha" onClick={() => changeLanguage('ha')}>🧅 Hausa</Dropdown.Item>
                <Dropdown.Item data-testid="lang-vi" onClick={() => changeLanguage('vi')}>🍜 Tiếng Việt</Dropdown.Item>
                <Dropdown.Item data-testid="lang-jv" onClick={() => changeLanguage('jv')}>🌶 Jawa</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ms" onClick={() => changeLanguage('ms')}>🥠 Melayu</Dropdown.Item>
                <Dropdown.Item data-testid="lang-tr" onClick={() => changeLanguage('tr')}>🥘 Türkçe</Dropdown.Item>
                <Dropdown.Item data-testid="lang-en" onClick={() => changeLanguage('en')}>🍔 English</Dropdown.Item>
                <Dropdown.Item data-testid="lang-es" onClick={() => changeLanguage('es')}>🧉 Español</Dropdown.Item>
                <Dropdown.Item data-testid="lang-pt" onClick={() => changeLanguage('pt')}>💃 Português</Dropdown.Item>
                <Dropdown.Item data-testid="lang-fr" onClick={() => changeLanguage('fr')}>🍾 Français</Dropdown.Item>
                <Dropdown.Item data-testid="lang-de" onClick={() => changeLanguage('de')}>🍺 Deutsch</Dropdown.Item>
                <Dropdown.Item data-testid="lang-pl" onClick={() => changeLanguage('pl')}>🥨 Polski</Dropdown.Item>
                <Dropdown.Item data-testid="lang-uz" onClick={() => changeLanguage('uz')}>🥗 O‘zbekcha</Dropdown.Item>
                <Dropdown.Item data-testid="lang-kz" onClick={() => changeLanguage('kz')}>🍵 Қазақша</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ua" onClick={() => changeLanguage('ua')}>🥞 Українська</Dropdown.Item>
                <Dropdown.Item data-testid="lang-ru" onClick={() => changeLanguage('ru')}>🥟 Русский</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default ElementLanguageSwitcher;
