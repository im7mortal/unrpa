import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ElementExtractionChromium from './ElementExtractionChromium';
import FirefoxComponent from './ElementExtractionFirefoxSafari';
import * as bowser from "bowser";
import SyncLoader from 'react-spinners/SyncLoader';
import React, {CSSProperties, useContext} from 'react';
import {css} from '@emotion/react';
import SpinnerContext from "./spinnerContext";
import "./overlay-spinner.css"

const parser = bowser.getParser(window.navigator.userAgent);
const browserName: string = parser.getBrowserName();
const chromium: boolean = !(browserName === "Safari" || browserName === "Firefox");
const isDesktope: boolean = (parser.getPlatform().type === "desktop")


const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;


function UnrpaApp() {


    const spinnerContext = useContext(SpinnerContext);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }
    const {spinner, setSpinnerState} = spinnerContext;

    return (
        <>
            <div className="row justify-content-center relative-overlay-container">
                {spinner && (
                    <div className="overlay">
                        <SyncLoader color={'#123abc'} loading={spinner} size={60} cssOverride={{opacity: 0.5}}/>
                    </div>
                )}
                <div className="col">
                    {isDesktope ? (
                        chromium ? (
                            <ElementExtractionChromium/>
                        ) : (
                            <FirefoxComponent/>
                        )
                    ) : (
                        <div>
                            <h2>🖥️ Desktop View Only! 🖥️</h2>
                            <p>Sorry, but UNRPA extractor is designed for desktop browsers. Please visit
                                this
                                site on your desktop computer to access this feature.</p>
                        </div>
                    )}
                </div>
            </div>
        </>);
}

export default UnrpaApp;
