import React from 'react';
import bowser from 'bowser';

// 2024 only Chromium decided to implement FileSystemApi
const parser = bowser.getParser(window.navigator.userAgent);
const platformType = parser.getPlatform().type;
const isDesktop = platformType === "desktop";

const fileSystemApi = 'showOpenFilePicker' in window;
const serviceWorkerAvailable = 'serviceWorker' in navigator;
const secureContext = window.isSecureContext === true;
const isDevServer = import.meta.env.DEV;
const fileApiWithServiceWorker = !isDevServer && !fileSystemApi && serviceWorkerAvailable && secureContext // FileAPI + Service worker hack
const fileApiOnly = isDevServer || !fileSystemApi && (!serviceWorkerAvailable || !secureContext) // FileAPI supported everywhere


export const defaultApiInfo = {
    fileSystemApi: fileSystemApi,
    isDesktop: isDesktop,
    fileApiWithServiceWorker: fileApiWithServiceWorker,
    fileApiOnly: fileApiOnly
}

const ApiInfoContext = React.createContext(defaultApiInfo);

export const ApiInfoProvider = ApiInfoContext.Provider;

export default ApiInfoContext;
