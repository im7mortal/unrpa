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
                <Dropdown.Item onClick={() => changeLanguage('en')}>🍔 English</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('es')}>🌮 Español</Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ru')}>🥟 Русский</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;