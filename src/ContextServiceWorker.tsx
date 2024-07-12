import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {Workbox} from 'workbox-window';
import ApiInfoContext from "./ContextAPI";

interface ServiceWorkerContextType {
    sendMessage: (message: object) => void;
}

const ServiceWorkerContext = createContext<ServiceWorkerContextType | null>(null);

export const useServiceWorker = (): ServiceWorkerContextType => {
    const context = useContext(ServiceWorkerContext);
    if (!context) {
        throw new Error('useServiceWorker must be used within a ServiceWorkerProvider');
    }
    return context;
};

interface ServiceWorkerProviderProps {
    children: ReactNode;
}

export const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({children}) => {
    const [serviceWorker, setServiceWorker] = useState<ServiceWorker | null>(null);
    const {fileApiWithServiceWorker} = useContext(ApiInfoContext);

    useEffect(() => {
        const registerServiceWorker = async () => {
            try {
                if ('serviceWorker' in navigator) {
                    const wb = new Workbox('/unrpa/service-worker.js');

                    wb.addEventListener('installed', (event) => {
                        if (!navigator.serviceWorker.controller) {
                            window.location.reload();
                        }
                    });

                    wb.addEventListener('activated', (event) => {
                        console.log('Service Worker activated:', event);
                        setServiceWorker(navigator.serviceWorker.controller);
                    });

                    wb.addEventListener('waiting', () => {
                        wb.messageSkipWaiting();
                    });

                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        if (navigator.serviceWorker.controller) {
                            setServiceWorker(navigator.serviceWorker.controller);
                            window.location.reload();
                        }
                    });

                    await wb.register();
                    const registration = await navigator.serviceWorker.ready;

                    if (registration.active) {
                        setServiceWorker(registration.active);
                    } else {
                        navigator.serviceWorker.addEventListener('controllerchange', () => {
                            if (navigator.serviceWorker.controller) {
                                setServiceWorker(navigator.serviceWorker.controller);
                            }
                        });
                    }
                } else {
                    console.error('Service Workers are not supported in this browser.');
                }
            } catch (error) {
                console.error('Service Worker registration or activation failed:', error);
            }
        };

        if (fileApiWithServiceWorker) {
            if (navigator.serviceWorker.controller) {
                setServiceWorker(navigator.serviceWorker.controller);
            } else {
                registerServiceWorker();
            }
        }
    }, [fileApiWithServiceWorker]);

    useEffect(() => {
        if (serviceWorker) {
            const pingInterval = window.setInterval(() => {
                sendMessage({id: "ping"});
            }, 5000);

            return () => {
                clearInterval(pingInterval);
            };
        }
    }, [serviceWorker]);

    const sendMessage = (message: object) => {
        if (serviceWorker) {
            serviceWorker.postMessage(message);
        } else {
            console.error('Service Worker is not active.');
        }
    };

    return (
        <ServiceWorkerContext.Provider value={{sendMessage}}>
            {children}
        </ServiceWorkerContext.Provider>
    );
};
