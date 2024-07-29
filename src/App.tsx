import React from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import GitHubButton from 'react-github-btn';
import UnrpaApp1 from "./UnrpaApp1";
import ElementLanguageSwitcher from "./ElementLanguageSwitcher";
import {I18nextProvider, useTranslation} from 'react-i18next';
import i18n from './i18n';

function App() {
    const {t} = useTranslation();
    return (
        <Router>
            <>


                <div className="row mx-2 mt-2 d-flex justify-content-between">
                    <div className="col-md-2 col-4 text-left">
                        ITWILLBEREPLACEDWITHVERSION
                    </div>
                    <div className="col-md-2 col-4 text-right">
                        <GitHubButton href="https://github.com/im7mortal/unrpa"
                                      data-color-scheme="no-preference: light; light: light; dark: dark;"
                                      data-icon="octicon-star" data-size="large" data-show-count="true"
                                      aria-label="Star im7mortal/unrpa on GitHub">Star</GitHubButton>
                        <GitHubButton href="https://github.com/im7mortal/unrpa/issues"
                                      data-color-scheme="no-preference: light; light: light; dark: dark;"
                                      data-icon="octicon-issue-opened" data-size="large" data-show-count="true"
                                      aria-label="Issue im7mortal/unrpa on GitHub">Issue</GitHubButton>
                    </div>
                </div>

                <I18nextProvider i18n={i18n}>
                    <div className="row mx-1 mt-2 d-flex justify-content-between">
                        <div className="col-md-2 col-3 text-left">

                        </div>
                        <div className="col-md-2 col-5 text-right">
                            <ElementLanguageSwitcher/>
                        </div>
                    </div>

                    <h1 className="display-1 text-center">{t('nameHeader')}</h1>

                    <Routes>
                        <Route path="/unrpa" element={<UnrpaApp1/>}/>
                        <Route path="*" element={<Navigate to="/unrpa"/>}/>
                    </Routes>

                </I18nextProvider>
            </>
        </Router>
    );
}

export default App;