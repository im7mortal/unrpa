import React from 'react';
import bowser from 'bowser';

// 2024 only Chromium decided to implement FileSystemApi
const parser = bowser.getParser(window.navigator.userAgent);
const browserName = parser.getBrowserName();
const fileSystemApi = !(browserName === "Safari" || browserName === "Firefox");
const isDesktop = (parser.getPlatform().type === "desktop");

export const defaultApiInfo = {
    fileSystemApi: fileSystemApi,
    isDesktop: isDesktop
}

const ApiInfoContext = React.createContext(defaultApiInfo);

export const ApiInfoProvider = ApiInfoContext.Provider;

export default ApiInfoContext;
