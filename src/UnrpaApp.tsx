import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ElementExtraction from './ElementExtraction';
import SyncLoader from 'react-spinners/SyncLoader';
import React, {useContext} from 'react';
import ContextSpinner from "./ContextSpinner";
import "./overlay-spinner.css"
import ApiInfoContext from "./ContextAPI";
import {useTranslation} from "react-i18next";
import ScanList from "./ScanList";


function UnrpaApp() {


    const spinnerContext = useContext(ContextSpinner);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }


    return (
        <>
            <div className="row justify-content-center relative-overlay-container">
                <div className="col">
                    <ElementExtraction/>
                </div>
            </div>
            <ScanList/>
        </>);
}

export default UnrpaApp;
