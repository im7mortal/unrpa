import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';

const LanguageSwitcher: React.FC = () => {
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
                <Dropdown.Item onClick={() => changeLanguage('hi')}>🍶 हिंदी</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('bn')}>🥦 বাংলা</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('te')}>🧄 తెలుగు</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('mr')}>🍋 मराठी</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('gu')}>🍬 ગુજરાતી</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('pa')}>🥕 ਪੰਜਾਬੀ</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ta')}>🍛 தமிழ்</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('th')}>🍲 ไทย</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ur')}>🍛 اردو</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('fa')}>🍉 فارسی</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ar')}>🌡 العربية</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('zh')}>🥢 中文</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ja')}>🍣 日本語</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ko')}>🍚 한국어</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ha')}>🧅 Hausa</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('vi')}>🍜 Tiếng Việt</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('jv')}>🌶 Jawa</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ms')}>🥠 Melayu</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('tr')}>🥘 Türkçe</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('en')}>🍔 English</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('es')}>🧉 Español</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('pt')}>💃 Português</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('fr')}>🍾 Français</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('de')}>🍺 Deutsch</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('pl')}>🥨 Polski</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('uz')}>🥗 O‘zbekcha</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('kz')}>🍵 Қазақша</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ua')}>🥞 Українська</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ru')}>🥟 Русский</Dropdown.Item>

            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;