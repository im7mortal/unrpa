import React, { createContext, useState, ReactNode } from 'react';

interface SpinnerContextProps {
    spinner: boolean;
    setSpinnerState: (state: boolean) => void;
}

const SpinnerContext = createContext<SpinnerContextProps | undefined>(undefined);

export const SpinnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [spinner, setSpinner] = useState(false);

    const setSpinnerState = (state: boolean) => {
        setSpinner(state);
    };

    return (
        <SpinnerContext.Provider value={{ spinner, setSpinnerState }}>
            {children}
        </SpinnerContext.Provider>
    );
};

export default SpinnerContext;