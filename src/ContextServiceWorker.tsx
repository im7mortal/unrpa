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
                console.log('registerServiceWorker');
                if ('serviceWorker' in navigator) {
                    // Initialize Workbox
                    const wb = new Workbox('/unrpa/service-worker.js');

                    // Event listener for when a new service worker is installed
                    wb.addEventListener('installed', (event) => {
                        if (event.isUpdate) {
                            console.log('New content is available; please refresh.');
                            if (confirm("New version available. Do you want to update?")) {
                                window.location.reload();
                            }
                        } else {
                            console.log('Content is cached for offline use.');
                        }
                    });

                    // Event listener for when the service worker is activated
                    wb.addEventListener('activated', (event) => {
                        console.log('Service Worker activated:', event);
                        setServiceWorker(navigator.serviceWorker.controller);
                    });

                    // Event listener for when a new service worker is waiting to activate
                    wb.addEventListener('waiting', () => {
                        console.log('A new service worker is waiting to activate.');
                        if (confirm("New version available. Do you want to update?")) {
                            wb.messageSkipWaiting();
                        }
                    });

                    // Event listener for when the service worker controlling the page changes
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        console.log('Controller changed');
                        if (navigator.serviceWorker.controller) {
                            setServiceWorker(navigator.serviceWorker.controller);
                            window.location.reload();
                        }
                    });

                    // Register the service worker
                    await wb.register();
                    console.log('Service Worker registered with Workbox');

                    // Wait for the service worker to be ready
                    const readyRegistration = await navigator.serviceWorker.ready;
                    console.log('Service Worker ready state:', readyRegistration);

                    // Check if the active service worker is available
                    if (readyRegistration.active === null) {
                        console.error('Service Worker active is null. Waiting for it to become active...');

                        // Listen for the 'controllerchange' event to detect when the service worker becomes active
                        navigator.serviceWorker.addEventListener('controllerchange', () => {
                            if (navigator.serviceWorker.controller) {
                                console.log('Service Worker has become active:', navigator.serviceWorker.controller.state);
                                setServiceWorker(navigator.serviceWorker.controller);
                            }
                        });

                        // Exit early since the service worker is not active yet
                        return;
                    }

                    // If the service worker is already active, log its state and set it
                    console.log('Service Worker is active:', readyRegistration.active.state);
                    setServiceWorker(readyRegistration.active);
                } else {
                    console.error('Service Workers are not supported in this browser.');
                }
            } catch (error) {
                console.error('Service Worker registration or activation failed:', error);
            }
        };
        if (fileApiWithServiceWorker) {
            registerServiceWorker();
        }
    }, [fileApiWithServiceWorker]);

    useEffect(() => {
        if (serviceWorker) {
            const pingInterval = window.setInterval(() => {
                sendMessage({id: "ping"});
            }, 5000);

            // Cleanup interval on unmount
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
