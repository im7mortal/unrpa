import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';

import {Workbox} from 'workbox-window';

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

    useEffect(() => {
        return
        const registerServiceWorker = async () => {
            try {
                console.log('registerServiceWorker');
                if ('serviceWorker' in navigator) {
                    try {
                        // Register the service worker
                        const registration = await navigator.serviceWorker.register("/unrpa/service-worker.js");
                        console.log('Service Worker registered with scope:', registration.scope);

                        // Wait for the service worker to be ready
                        const readyRegistration = await navigator.serviceWorker.ready;
                        console.log('Service Worker ready state:', readyRegistration);

                        // Check if the active service worker is available
                        if (readyRegistration.active === null) {
                            console.error('Service Worker active is null. Waiting for it to become active...');

                            // Listen for the 'statechange' event to detect when the service worker becomes active
                            navigator.serviceWorker.addEventListener('controllerchange', () => {
                                if (navigator.serviceWorker.controller) {
                                    console.log('Service Worker has become active:', navigator.serviceWorker.controller.state);
                                    setServiceWorker(navigator.serviceWorker.controller);
                                    console.log(registration.scope, " SCOPE");
                                }
                            });

                            // Exit early since the service worker is not active yet
                            return;
                        }

                        // If the service worker is already active, log its state and set it
                        console.log('Service Worker is active:', readyRegistration.active.state);
                        setServiceWorker(readyRegistration.active);
                        console.log(readyRegistration.scope, " SCOPE");
                    } catch (error) {
                        console.error('Service Worker registration or activation failed:', error);
                    }
                } else {
                    console.error('Service Workers are not supported in this browser.');
                }            } catch (error) {
                console.error('Service Worker registration or activation failed:', error);
            }



            // try {
            //     console.log('FG GH');
            //     if ('serviceWorker' in navigator) {
            //         console.log('FG GH222222222222');
            //         const wb:Workbox = new Workbox('/unrpa/service-worker.js');
            //         console.log('FG GH22222222222211111111111111111');
            //         console.log(wb);
            //
            //         wb.register();
            //         console.log('FG GH222222222222111111111111111113333');
            //
            //
            //     } else {
            //         console.error('Service Workers are not supported in this browser.');
            //     }
            // } catch (error) {
            //     console.error('Service Worker registration or activation failed:', error);
            // }




        };

        registerServiceWorker();
    }, []);

    const sendMessage = (message: object) => {

        console.log(serviceWorker)
        if (serviceWorker) {
            console.log(serviceWorker)
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


//
// if ('serviceWorker' in navigator) {
//     console.log(import.meta.url)
//     // webpack understand from this part that we need compile separate worker file from this .ts
//     const WorkerURL = new WorkerUrl(new URL('./workers/networkWorker.worker.ts', import.meta.url))
//     console.log(WorkerURL.toString())
//     navigator.serviceWorker.register(WorkerURL.toString(), {scope: "/unrpa/static/js/"}).then((registration) => {
//         console.log('Service Worker registered successfully with scope:', registration.scope);
//
//
//         async function pingServiceWorker() {
//             for (let i = 0; i < 3; i++) {
//                 console.log('Start');
//                 if (registration.active) {
//                     registration.active.postMessage('ping');
//                     // if ('backgroundFetch' in registration) {
//                     //     let c: any = registration.backgroundFetch
//                     //     if ('fetch' in c) {
//                     //         console.log(c)
//                     //         console.log(c.fetch)
//                     //         c.fetch("lol","/unrpa/static/js/")
//                     //     }
//                     // }
//                     console.log('Ping sent');
//                 } else {
//                     console.warn('Service Worker is not active yet.');
//                 }
//                 await sleep(1000); // Sleep for 1 second
//                 console.log('1 second later');
//             }
//         }
//
//         // Start pinging the service worker
//         pingServiceWorker();
//     }).catch(error => {
//         console.log('Service Worker registration failed:', error);
//     });
// }
