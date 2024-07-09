import React from 'react';
import bowser from 'bowser';

// 2024 only Chromium decided to implement FileSystemApi
let usagent: string = "Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0"
if (typeof window !== 'undefined') {
    usagent = window.navigator.userAgent;
}
const parser = bowser.getParser(usagent);
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
