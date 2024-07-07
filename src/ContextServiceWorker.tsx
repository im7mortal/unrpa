import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {WorkerUrl} from "worker-url";

interface ServiceWorkerContextType {
    sendMessage: (message: unknown) => void;
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
        const registerServiceWorker = async () => {
            try {
                if ('serviceWorker' in navigator) {
                    const WorkerURL = new WorkerUrl(new URL('./workers/networkWorker.worker.ts', import.meta.url))
                    const registration = await navigator.serviceWorker.register(WorkerURL.toString(),);
                    console.log('Service Worker registered with scope:', registration.scope);
                    const readyRegistration = await navigator.serviceWorker.ready;
                    if (readyRegistration.active === null) {
                        return;
                    }
                    console.log('Service Worker is active:', readyRegistration.active.state);
                    setServiceWorker(readyRegistration.active);
                    console.log(readyRegistration.scope, " SCOPE")
                } else {
                    console.error('Service Workers are not supported in this browser.');
                }
            } catch (error) {
                console.error('Service Worker registration or activation failed:', error);
            }
        };

        registerServiceWorker();
    }, []);

    const sendMessage = (message: unknown) => {

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
