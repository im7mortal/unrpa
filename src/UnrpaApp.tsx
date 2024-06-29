import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ElementExtractionChromium from './ElementExtractionChromium';
import FirefoxComponent from './ElementExtractionFirefoxSafari';
import SyncLoader from 'react-spinners/SyncLoader';
import React, {useContext} from 'react';
import SpinnerContext from "./spinnerContext";
import "./overlay-spinner.css"
import ApiInfoContext from "./ContextAPI";


function UnrpaApp() {


    const spinnerContext = useContext(SpinnerContext);
    if (!spinnerContext) {
        throw new Error('SpinnerContext must be used within a SpinnerProvider');
    }
    // eslint-disable-next-line
    const {spinner, setSpinnerState} = spinnerContext;
    // eslint-disable-next-line
    const {fileSystemApi, isDesktop} = useContext(ApiInfoContext);


    return (
        <>
            <div className="row justify-content-center relative-overlay-container">
                {spinner && (
                    <div className="overlay">
                        <SyncLoader color={'#123abc'} loading={spinner} size={60} cssOverride={{opacity: 0.5}}/>
                    </div>
                )}
                <div className="col">
                    {isDesktop ? (
                        fileSystemApi ? (
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
