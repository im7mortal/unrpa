import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ElementExtraction from './ElementExtraction';
import SyncLoader from 'react-spinners/SyncLoader';
import React, {useContext} from 'react';
import ContextSpinner from "./ContextSpinner";
import "./overlay-spinner.css"
import ApiInfoContext from "./ContextAPI";
import {useTranslation} from "react-i18next";
import ElementLogs from "./ElementLogs";
import Drop from "./ElementFileDrop";


function UnrpaApp() {


    const spinnerContext = useContext(ContextSpinner);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }
    const {spinner} = spinnerContext;
    const {isDesktop} = useContext(ApiInfoContext);
    const {t} = useTranslation();


    return (
        <>
            {isDesktop ? (
                <>
                    <Drop/>
                    <div className="row justify-content-center relative-overlay-container">
                        {spinner && (
                            <div className="overlay">
                                <SyncLoader color={'#123abc'} loading={spinner} size={60} cssOverride={{opacity: 0.5}}/>
                            </div>
                        )}
                        <div className="col">
                            <ElementExtraction/>
                        </div>
                    </div>

                    <ElementLogs/>
                </>
            ) : (
                <>
                    <h2>🖥️ {t('not_supported_header')} 🖥️</h2>
                    <p>{t('not_supported')}</p>
                </>
            )}

        </>);
}

export default UnrpaApp;
